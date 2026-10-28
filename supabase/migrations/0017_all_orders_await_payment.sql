-- 0017 - Todos os pedidos vão para Aguardando Pagamento primeiro
-- ============================================
-- Garante que todos os pedidos PDV, online e delivery sigam o mesmo fluxo:
-- Pedido criado → 💳 Aguardando Pagamento → Confirmar → 👨‍🍳 Preparando → 📦 Pronto → 🚚 Em Entrega → ✅ Entregue

-- ============================================
-- Atualizar registrar_venda para status "aguardando_pagamento"
-- ============================================

CREATE OR REPLACE FUNCTION public.registrar_venda(
  _itens jsonb, _tipo text default 'balcao', _cliente text default null, _telefone text default null,
  _endereco text default null, _cupom text default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_id uuid; it jsonb; p record; r record; v_sub numeric := 0; v_custo numeric := 0; v_custo_item numeric;
  v_desc numeric := 0; v_taxa numeric := 0; v_pct numeric; v_status text;
begin
  if not public.is_staff(auth.uid()) then raise exception 'Sem permissão'; end if;
  if jsonb_array_length(_itens) = 0 then raise exception 'Carrinho vazio'; end if;
  for it in select * from jsonb_array_elements(_itens) loop
    select * into p from produtos where id = (it->>'produto_id')::uuid and ativo;
    if not found then raise exception 'Produto indisponível'; end if;
    for r in select i.nome, i.validade from receitas rc join ingredientes i on i.id=rc.ingrediente_id where rc.produto_id=p.id for update of i loop
      if r.validade is not null and r.validade < current_date then
        raise exception 'Ingrediente vencido: %', r.nome; end if;
    end loop;
  end loop;
  for r in select i.nome, i.quantidade as estoque, sum(rc.quantidade * (e->>'quantidade')::numeric) as necessario
           from jsonb_array_elements(_itens) e join receitas rc on rc.produto_id=(e->>'produto_id')::uuid
           join ingredientes i on i.id=rc.ingrediente_id group by i.id, i.nome, i.quantidade loop
    if r.necessario > r.estoque then raise exception 'Estoque insuficiente: %', r.nome; end if;
  end loop;

  -- Todos os pedidos agora vão para "aguardando_pagamento" primeiro
  v_status := 'aguardando_pagamento';
  insert into vendas(tipo,status,cliente,telefone,endereco,criado_por) values(_tipo,v_status,_cliente,_telefone,_endereco,auth.uid()) returning id into v_id;
  for it in select * from jsonb_array_elements(_itens) loop
    select * into p from produtos where id=(it->>'produto_id')::uuid;
    select coalesce(sum(rc.quantidade*i.custo_unitario),0) into v_custo_item from receitas rc join ingredientes i on i.id=rc.ingrediente_id where rc.produto_id=p.id;
    insert into venda_itens(venda_id,produto_id,nome,quantidade,preco_unitario,custo_unitario)
      values(v_id,p.id,p.nome,(it->>'quantidade')::int,p.preco,v_custo_item);
    v_sub := v_sub + p.preco*(it->>'quantidade')::int;
    v_custo := v_custo + v_custo_item*(it->>'quantidade')::int;
    update ingredientes i set quantidade = i.quantidade - rc.quantidade*(it->>'quantidade')::numeric
      from receitas rc where rc.produto_id=p.id and rc.ingrediente_id=i.id;
  end loop;
  if _cupom is not null and _cupom <> '' then
    select percentual into v_pct from cupons where upper(codigo)=upper(_cupom) and ativo;
    if not found then raise exception 'Cupom inválido'; end if;
    v_desc := round(v_sub*v_pct/100,2);
  end if;
  if _tipo='delivery' then select taxa_entrega into v_taxa from loja_config where id=1; end if;
  update vendas set subtotal=v_sub, desconto=v_desc, cupom=nullif(_cupom,''), taxa_entrega=coalesce(v_taxa,0),
    total=v_sub-v_desc+coalesce(v_taxa,0), custo=v_custo, lucro=v_sub-v_desc-v_custo where id=v_id;
  return v_id;
end $$;

GRANT EXECUTE ON FUNCTION public.registrar_venda(jsonb,text,text,text,text,text) TO authenticated;

COMMENT ON FUNCTION public.registrar_venda IS 'Registra uma venda - todos os pedidos entram em aguardando_pagamento para seguir o fluxo operacional';

-- ============================================
-- Atualizar pedidos existentes que estão em status errado
-- ============================================

-- Pedidos PDV que estão em "pendente" ou "novo" sem pagamento confirmado
-- vão para "aguardando_pagamento"
UPDATE vendas
SET status = 'aguardando_pagamento',
    updated_at = NOW()
WHERE status IN ('pendente', 'novo')
  AND tipo IN ('delivery', 'balcao')
  AND id NOT IN (
    SELECT DISTINCT venda_id FROM movimentacoes_estoque WHERE tipo = 'saida' AND created_at > NOW() - INTERVAL '1 hour'
  );

-- Pedidos online que estão em "preparando" sem pagamento confirmado
UPDATE pedidos_online
SET status = 'aguardando_pagamento',
    status_delivery = 'aguardando_pagamento',
    updated_at = NOW()
WHERE status = 'preparando'
  AND status_delivery = 'preparando'
  AND aceito_em IS NULL
  AND pago_em IS NULL
  AND status_pagamento != 'pago';

COMMENT ON MIGRATION IS '0017 - Todos os pedidos vão para Aguardando Pagamento primeiro';
