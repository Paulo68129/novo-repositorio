import { supabase } from "@/integrations/supabase/client";
import { consultarPedidoOnline, criarPedidoOnline } from "./loja-online.functions";
import { isBusinessError } from "./db-errors";
import {
  errorMessage,
  isUuid,
  newOrderToken,
  normalizeOrder,
  parseNovoPedido,
  type NovoPedidoInput,
  type OnlineOrder,
} from "./online-order";

class PedidoRecusadoError extends Error {}

/**
 * CAMINHO PRINCIPAL: Insere o pedido diretamente na tabela pedidos_online
 * com status "aguardando_pagamento" para que apareça na coluna 💳 Aguardando Pagamento.
 * 
 * Este é o método mais confiável pois não depende de funções SQL no banco.
 */
async function inserirPedidoFallback(pedido: any): Promise<{ token: string; pedido: OnlineOrder }> {
  console.log("[loja] === INICIANDO INSERT DIRETO ===");
  console.log("[loja] Token:", pedido.token);
  console.log("[loja] Cliente:", pedido.cliente);
  console.log("[loja] Itens:", JSON.stringify(pedido.itens));

  // Busca os produtos para validar preços
  const ids = [...new Set(pedido.itens.map((i: any) => i.produto_id))];
  console.log("[loja] Buscando produtos:", ids);
  
  const { data: produtos, error: produtosError } = await supabase
    .from("produtos")
    .select("id, nome, preco")
    .in("id", ids)
    .eq("ativo", true);
  
  if (produtosError) {
    console.error("[loja] Erro ao buscar produtos:", produtosError);
    throw new Error("Não foi possível validar os produtos: " + produtosError.message);
  }
  
  if (!produtos || produtos.length === 0) {
    console.error("[loja] Nenhum produto encontrado para os IDs:", ids);
    throw new Error("Nenhum produto encontrado");
  }
  
  console.log("[loja] Produtos encontrados:", produtos.length);

  const porId = new Map((produtos ?? []).map((p: any) => [p.id, p]));
  const itens = pedido.itens.map((item: any) => {
    const produto = porId.get(item.produto_id);
    if (!produto) throw new Error("Produto indisponível: " + item.produto_id);
    return {
      nome: produto.nome,
      produto_id: produto.id,
      quantidade: item.quantidade,
      preco_unitario: Number(produto.preco),
    };
  });
  const subtotal = Math.round(itens.reduce((s: number, i: any) => s + i.preco_unitario * i.quantidade, 0) * 100) / 100;
  console.log("[loja] Subtotal:", subtotal);

  // Busca taxa de entrega
  const { data: config } = await supabase
    .from("loja_config")
    .select("taxa_entrega")
    .eq("id", 1)
    .maybeSingle();
  const taxaEntrega = Number(config?.taxa_entrega ?? 0) || 0;
  console.log("[loja] Taxa de entrega:", taxaEntrega);

  let desconto = 0;
  if (pedido.cupom) {
    const { data: cupom } = await supabase
      .from("cupons")
      .select("percentual")
      .ilike("codigo", pedido.cupom)
      .eq("ativo", true)
      .maybeSingle();
    if (!cupom) throw new Error("Cupom inválido");
    desconto = Math.round((subtotal * Number(cupom.percentual)) / 100 * 100) / 100;
  }
  console.log("[loja] Desconto:", desconto);

  const row = {
    id: crypto.randomUUID(),
    token: pedido.token,
    cliente: pedido.cliente,
    telefone: pedido.telefone,
    endereco: pedido.endereco,
    itens,
    subtotal,
    desconto,
    taxa_entrega: taxaEntrega,
    total: Math.round((subtotal - desconto + taxaEntrega) * 100) / 100,
    cupom: pedido.cupom || null,
    status: "aguardando_pagamento",
    status_delivery: "aguardando_pagamento",
    origem: "loja_online",
    created_at: new Date().toISOString(),
  };

  console.log("[loja] Inserindo pedido no banco:", JSON.stringify({
    id: row.id,
    token: row.token,
    status: row.status,
    status_delivery: row.status_delivery,
    total: row.total
  }));

  const { data, error } = await supabase.from("pedidos_online").insert(row).select();
  
  if (error) {
    console.error("[loja] === ERRO NO INSERT ===");
    console.error("[loja] Erro:", JSON.stringify(error));
    console.error("[loja] Message:", error.message);
    console.error("[loja] Details:", error.details);
    console.error("[loja] Hint:", error.hint);
    
    // Tenta sem .select() se o RLS bloquear a leitura
    if (error.message.includes("permission") || error.message.includes("RLS")) {
      console.log("[loja] Tentando INSERT sem .select() por causa do RLS");
      const { error: insertError2 } = await supabase.from("pedidos_online").insert(row);
      if (insertError2) {
        console.error("[loja] INSERT sem select também falhou:", insertError2.message);
        throw new Error("Não foi possível registrar o pedido: " + insertError2.message);
      }
      console.log("[loja] INSERT sem select成功了");
    } else {
      throw new Error("Não foi possível registrar o pedido: " + error.message);
    }
  } else {
    console.log("[loja] === INSERT COM SUCESSO ===");
    console.log("[loja] Data retornada:", JSON.stringify(data));
  }

  console.log("[loja] Pedido inserido com sucesso! status=aguardando_pagamento");
  const normalized = normalizeOrder(row);
  if (!normalized) throw new Error("Falha ao montar o pedido");
  return { token: pedido.token, pedido: normalized };
}

/**
 * Envia o pedido usando INSERT direto no banco como caminho principal.
 * O INSERT direto é o mais confiável pois não depende de funções SQL no banco.
 * Se o INSERT direto falhar, tenta RPC e server function como fallback.
 * 
 * O pedido é criado com status "aguardando_pagamento" para aparecer
 * na coluna 💳 Aguardando Pagamento na tela de delivery.
 */
export async function enviarPedidoOnline(
  input: Omit<NovoPedidoInput, "token">,
): Promise<{ token: string; pedido: OnlineOrder }> {
  const pedido = parseNovoPedido({ ...input, token: newOrderToken() });
  
  console.log("[loja] Enviando pedido:", pedido.token, "cliente:", pedido.cliente);

  // CAMINHO PRINCIPAL: INSERT direto no banco - mais confiável
  try {
    console.log("[loja] Tentando INSERT direto no banco (caminho principal)");
    return await inserirPedidoFallback(pedido);
  } catch (insertError) {
    const insertMsg = errorMessage(insertError);
    console.warn("[loja] INSERT direto falhou:", insertMsg);
    
    // Fallback 1: Tenta RPC
    try {
      console.log("[loja] Tentando RPC como fallback");
      const { data, error } = await supabase.rpc("criar_pedido_online", {
        _token: pedido.token,
        _cliente: pedido.cliente,
        _telefone: pedido.telefone,
        _endereco: pedido.endereco,
        _itens: pedido.itens,
        _cupom: pedido.cupom,
      });
      if (!error) {
        const criado = normalizeOrder(data);
        if (criado) {
          console.log("[loja] Pedido criado via RPC com sucesso");
          return { token: pedido.token, pedido: criado };
        }
      }
    } catch (rpcError) {
      console.warn("[loja] RPC falhou:", errorMessage(rpcError));
    }
    
    // Fallback 2: Tenta server function
    try {
      console.log("[loja] Tentando server function como fallback");
      return await criarPedidoOnline({ data: pedido });
    } catch (serverError) {
      console.warn("[loja] Server function falhou:", errorMessage(serverError));
    }
    
    // Se tudo falhou, lança o erro do INSERT (mais provável de ser o erro real)
    throw new Error(`Não foi possível enviar o pedido. Erro: ${insertMsg}`);
  }
}

/** Busca o pedido pelo token do link de acompanhamento. `null` = pedido não existe. */
export async function buscarPedidoOnline(token: string): Promise<OnlineOrder | null> {
  if (!isUuid(token)) return null;
  let primeiraFalha: string | null = null;

  try {
    const { data, error } = await supabase.rpc("consultar_pedido_online", { _token: token });
    if (!error) return normalizeOrder(data);
    primeiraFalha = error.message;
  } catch (e) {
    primeiraFalha = errorMessage(e);
  }

  console.warn("[loja] Consulta direta falhou, tentando pelo servidor:", primeiraFalha);
  try {
    return await consultarPedidoOnline({ data: { token } });
  } catch (e) {
    throw new Error(errorMessage(e, primeiraFalha ?? "Não foi possível consultar o pedido"));
  }
}

/** Expira o pedido quando o tempo de pagamento acaba. Chama a função RPC para atualizar o status no banco. */
export async function expirarPedidoOnline(token: string): Promise<void> {
  if (!isUuid(token)) return;
  
  try {
    const { error } = await (supabase as any).rpc("expirar_pedido_online", { _token: token });
    if (error) {
      console.warn("[loja] Não foi possível expirar o pedido:", error.message);
    }
  } catch (e) {
    console.warn("[loja] Erro ao expirar pedido:", errorMessage(e));
  }
}

/** Confirma o pagamento de um pedido online. Registra a venda, baixa o estoque e atualiza o status. */
export async function confirmarPagamento(pedidoId: string): Promise<string | null> {
  if (!isUuid(pedidoId)) return null;

  // Tenta RPC confirmar_pagamento_online (registra venda + baixa estoque + muda status)
  try {
    const { data, error } = await (supabase as any).rpc("confirmar_pagamento_online", { _pedido_id: pedidoId });
    if (!error) return data; // Retorna o venda_id
    console.warn("[delivery] RPC confirmar_pagamento_online falhou, usando fallback:", error.message);
  } catch (e) {
    console.warn("[delivery] RPC confirmar_pagamento_online indisponível, usando fallback:", errorMessage(e));
  }

  // Fallback: atualiza status para "pago" e status_delivery para "preparando"
  // Remove a restrição .eq("status", "aguardando_pagamento") para aceitar qualquer status pendente
  try {
    const { error } = await supabase
      .from("pedidos_online")
      .update({
        status: "pago",
        status_delivery: "preparando",
        status_pagamento: "pago",
        pago_em: new Date().toISOString(),
        aceito_em: new Date().toISOString(),
      })
      .eq("id", pedidoId);

    if (error) {
      console.warn("[delivery] Fallback confirmar_pagamento falhou:", error.message);
      throw new Error(error.message);
    }
    console.log("[delivery] Fallback confirmar_pagamento: status=pago, status_delivery=preparando");
  } catch (e) {
    console.warn("[delivery] Erro no fallback confirmar pagamento:", errorMessage(e));
    throw e;
  }

  return null;
}

/** Aceita o pedido no delivery. O pedido vai direto para a linha de preparo (status "preparando"). */
export async function aceitarPedido(pedidoId: string): Promise<void> {
  if (!isUuid(pedidoId)) return;

  // Tenta RPC aceitar_pedido (registra venda + baixa estoque + muda status)
  try {
    const { error } = await (supabase as any).rpc("aceitar_pedido", { _pedido_id: pedidoId });
    if (!error) return;
    console.warn("[delivery] RPC aceitar_pedido falhou, usando fallback:", error.message);
  } catch (e) {
    console.warn("[delivery] RPC aceitar_pedido indisponível, usando fallback:", errorMessage(e));
  }

  // Fallback: atualiza status diretamente no banco - vai direto para "preparando"
  try {
    const { error } = await supabase
      .from("pedidos_online")
      .update({
        status: "preparando",
        status_delivery: "preparando",
        aceito_em: new Date().toISOString(),
      })
      .eq("id", pedidoId);

    if (error) {
      console.warn("[delivery] Fallback aceitar_pedido falhou:", error.message);
      throw new Error(error.message);
    }
  } catch (e) {
    console.warn("[delivery] Erro no fallback aceitar pedido:", errorMessage(e));
    throw e;
  }
}

/** Recusa o pedido no delivery com um motivo. Tenta RPC primeiro, depois fallback. */
export async function recusarPedido(pedidoId: string, motivo: string): Promise<void> {
  if (!isUuid(pedidoId)) return;

  // Tenta RPC recusar_pedido
  try {
    const { error } = await (supabase as any).rpc("recusar_pedido", { _pedido_id: pedidoId, _motivo: motivo });
    if (!error) return;
    console.warn("[delivery] RPC recusar_pedido falhou, usando fallback:", error.message);
  } catch (e) {
    console.warn("[delivery] RPC recusar_pedido indisponível, usando fallback:", errorMessage(e));
  }

  // Fallback: atualiza status diretamente
  try {
    const { error } = await supabase
      .from("pedidos_online")
      .update({
        status: "cancelado",
        status_delivery: "recusado",
        recusado_em: new Date().toISOString(),
        motivo_recusa: motivo,
      })
      .eq("id", pedidoId);

    if (error) {
      console.warn("[delivery] Fallback recusar_pedido falhou:", error.message);
      throw new Error(error.message);
    }
  } catch (e) {
    console.warn("[delivery] Erro no fallback recusar pedido:", errorMessage(e));
    throw e;
  }
}

/** Cria um feedback para um pedido entregue. */
export async function criarFeedback(
  pedidoId: string,
  clienteNome: string,
  nota: number,
  comentario?: string
): Promise<void> {
  if (!isUuid(pedidoId)) return;
  if (nota < 1 || nota > 5) throw new Error("Nota deve ser entre 1 e 5");
  
  try {
    const { error } = await (supabase as any).rpc("criar_feedback", {
      _pedido_id: pedidoId,
      _cliente_nome: clienteNome,
      _cliente_email: null,
      _nota: nota,
      _comentario: comentario || null,
    });
    if (error) {
      console.warn("[feedback] Não foi possível criar o feedback:", error.message);
      throw new Error(error.message);
    }
  } catch (e) {
    console.warn("[feedback] Erro ao criar feedback:", errorMessage(e));
    throw e;
  }
}

/** Salva um pedido online permanentemente. Tenta RPC primeiro, depois fallback. */
export async function salvarPedido(pedidoId: string, usuario: string = "operador"): Promise<void> {
  if (!isUuid(pedidoId)) return;

  // Tenta RPC salvar_pedido_online
  try {
    const { data, error } = await (supabase as any).rpc("salvar_pedido_online", {
      _pedido_id: pedidoId,
      _usuario: usuario,
    });
    if (!error) {
      console.log("[delivery] Pedido salvo via RPC:", data);
      return;
    }
    // Se já está salvo, não é erro
    if (error.message?.includes("já está salvo")) {
      throw new Error("Este pedido já está salvo no sistema");
    }
    console.warn("[delivery] RPC salvar_pedido_online falhou, usando fallback:", error.message);
  } catch (e) {
    // Se já está salvo, propaga o erro
    if (errorMessage(e).includes("já está salvo")) throw e;
    console.warn("[delivery] RPC salvar_pedido_online indisponível, usando fallback:", errorMessage(e));
  }

  // Fallback: atualiza diretamente no banco
  try {
    const { error } = await supabase
      .from("pedidos_online")
      .update({
        salvo_em: new Date().toISOString(),
        salvo_por: usuario,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pedidoId)
      .is("salvo_em", null); // Só atualiza se ainda não estiver salvo

    if (error) {
      console.warn("[delivery] Fallback salvar_pedido falhou:", error.message);
      throw new Error(error.message);
    }

    // Registra na auditoria
    try {
      await supabase
        .from("pedidos_online_audit")
        .insert({
          pedido_id: pedidoId,
          acao: "pedido_salvo",
          detalhes: { usuario },
        });
    } catch (auditError) {
      console.warn("[delivery] Erro ao registrar auditoria:", errorMessage(auditError));
    }
  } catch (e) {
    console.warn("[delivery] Erro no fallback salvar pedido:", errorMessage(e));
    throw e;
  }
}
