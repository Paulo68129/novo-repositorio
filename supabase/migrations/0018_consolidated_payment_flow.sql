-- ============================================
-- MIGRATION CONSOLIDADA — FLUXO DE PEDIDOS
-- ============================================
-- Execute este SQL COMPLETO no Supabase Dashboard:
-- https://supabase.com/dashboard/project/lstycewiltrbefrxicdx/sql
--
-- O que esta migration faz:
-- 1. criar_pedido_online → cria pedidos com status "aguardando_pagamento"
-- 2. registrar_venda → cria vendas com status "aguardando_pagamento"
-- 3. Corrigir pedidos existentes com status errado
-- ============================================

-- ============================================
-- 1. FUNÇÃO: criar_pedido_online
-- ============================================
-- Cria pedidos online com status "aguardando_pagamento"
-- para que fiquem na coluna 💳 Aguardando Pagamento

CREATE OR REPLACE FUNCTION public.criar_pedido_online(
  _token uuid,
  _cliente text,
  _telefone text,
  _endereco text,
  _itens jsonb,
  _cupom text DEFAULT ''
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  p record;
  e jsonb;
  snap jsonb := '[]';
  sub numeric := 0;
  pct numeric := 0;
  fee numeric;
  disc numeric;
  result jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(_token::text));
  SELECT to_jsonb(o) - 'token' INTO result
  FROM pedidos_online o WHERE token = _token;
  IF result IS NOT NULL THEN
    RETURN result;
  END IF;

  IF length(trim(_cliente)) < 2 OR length(_cliente) > 120 THEN
    RAISE EXCEPTION 'Nome do cliente inválido';
  END IF;
  IF length(trim(_telefone)) < 8 OR length(_telefone) > 30 THEN
    RAISE EXCEPTION 'Telefone inválido';
  END IF;
  IF length(trim(_endereco)) < 8 OR length(_endereco) > 500 THEN
    RAISE EXCEPTION 'Endereço inválido';
  END IF;

  IF jsonb_typeof(_itens) != 'array'
     OR jsonb_array_length(_itens) < 1
     OR jsonb_array_length(_itens) > 50 THEN
    RAISE EXCEPTION 'Carrinho inválido';
  END IF;

  FOR e IN SELECT * FROM jsonb_array_elements(_itens) LOOP
    IF (e->>'quantidade')::int NOT BETWEEN 1 AND 99 THEN
      RAISE EXCEPTION 'Quantidade inválida';
    END IF;
    SELECT * INTO p FROM produtos
    WHERE id = (e->>'produto_id')::uuid AND ativo;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produto indisponível';
    END IF;
    sub := sub + p.preco * (e->>'quantidade')::int;
    snap := snap || jsonb_build_array(
      jsonb_build_object(
        'nome', p.nome,
        'descricao', p.descricao,
        'produto_id', p.id,
        'quantidade', (e->>'quantidade')::int,
        'preco_unitario', p.preco
      )
    );
  END LOOP;

  IF trim(_cupom) <> '' THEN
    SELECT percentual INTO pct FROM cupons
    WHERE upper(codigo) = upper(trim(_cupom)) AND ativo;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Cupom inválido';
    END IF;
  END IF;

  SELECT taxa_entrega INTO fee FROM loja_config WHERE id = 1;
  disc := round(sub * pct / 100, 2);

  -- Pedido criado com status "aguardando_pagamento"
  INSERT INTO pedidos_online (
    token, cliente, telefone, endereco, itens,
    subtotal, desconto, taxa_entrega, total, cupom, origem, status, status_delivery
  ) VALUES (
    _token, trim(_cliente), trim(_telefone), trim(_endereco), snap,
    sub, disc, coalesce(fee, 0), sub - disc + coalesce(fee, 0),
    nullif(trim(_cupom), ''), 'loja_online', 'aguardando_pagamento', 'aguardando_pagamento'
  ) RETURNING to_jsonb(pedidos_online) - 'token' INTO result;

  RETURN result;
END
$func$;

GRANT EXECUTE ON FUNCTION public.criar_pedido_online(uuid, text, text, text, jsonb, text)
  TO anon, authenticated;

COMMENT ON FUNCTION public.criar_pedido_online IS 'Cria pedido online com status aguardando_pagamento';


-- ============================================
-- 2. FUNÇÃO: registrar_venda (PDV)
-- ============================================
-- Cria vendas com status "aguardando_pagamento"
-- para que fiquem na coluna 💳 Aguardando Pagamento

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

  -- Todos os pedidos vão para "aguardando_pagamento" primeiro
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

COMMENT ON FUNCTION public.registrar_venda IS 'Registra venda com status aguardando_pagamento';


-- ============================================
-- 3. CORRIGIR PEDIDOS EXISTENTES
-- ============================================

-- Pedidos PDV com status errado vão para "aguardando_pagamento"
UPDATE vendas
SET status = 'aguardando_pagamento',
    updated_at = NOW()
WHERE status IN ('pendente', 'novo')
  AND tipo IN ('delivery', 'balcao');

-- Pedidos online com status errado vão para "aguardando_pagamento"
UPDATE pedidos_online
SET status = 'aguardando_pagamento',
    status_delivery = 'aguardando_pagamento',
    updated_at = NOW()
WHERE status IN ('pendente', 'novo', 'preparando')
  AND aceito_em IS NULL
  AND pago_em IS NULL
  AND status_pagamento != 'pago';


-- ============================================
-- 4. FUNÇÃO: confirmar_pagamento_online
-- ============================================
-- Confirma pagamento e avança o pedido para "pago"

CREATE OR REPLACE FUNCTION public.confirmar_pagamento_online(_pedido_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $func$
DECLARE
  v_id uuid; p record; it jsonb;
  v_sub numeric := 0; v_custo numeric := 0; v_custo_item numeric;
begin
  select * into p from pedidos_online where id = _pedido_id;
  if not found then raise exception 'Pedido não encontrado'; end if;
  if p.status != 'aguardando_pagamento' then raise exception 'Pedido não está aguardando pagamento'; end if;

  -- Registra a venda no financeiro
  v_sub := p.subtotal - p.desconto + coalesce(p.taxa_entrega, 0);
  insert into vendas(tipo, status, cliente, telefone, endereco, subtotal, desconto, taxa_entrega, total, criado_por)
  values('delivery', 'pago', p.cliente, p.telefone, p.endereco, p.subtotal, p.desconto, p.taxa_entrega, v_sub, auth.uid())
  returning id into v_id;

  -- Insere os itens da venda
  for it in select * from jsonb_array_elements(p.itens) loop
    select * into p from produtos where id = (it->>'produto_id')::uuid;
    if found then
      select coalesce(sum(rc.quantidade*i.custo_unitario),0) into v_custo_item from receitas rc join ingredientes i on i.id=rc.ingrediente_id where rc.produto_id=p.id;
      insert into venda_itens(venda_id, produto_id, nome, quantidade, preco_unitario, custo_unitario)
        values(v_id, p.id, it->>'nome', (it->>'quantidade')::int, (it->>'preco_unitario')::numeric, v_custo_item);
      v_custo := v_custo + v_custo_item * (it->>'quantidade')::int;
    end if;
  end loop;

  update vendas set custo = v_custo, lucro = v_sub - v_custo where id = v_id;

  -- Atualiza o pedido online
  update pedidos_online set
    status = 'pago',
    status_delivery = 'pago',
    status_pagamento = 'pago',
    pago_em = NOW(),
    updated_at = NOW()
  where id = _pedido_id;

  return v_id;
end $func$;

GRANT EXECUTE ON FUNCTION public.confirmar_pagamento_online(uuid) TO authenticated;

COMMENT ON FUNCTION public.confirmar_pagamento_online IS 'Confirma pagamento e registra venda no financeiro';


-- ============================================
-- RESUMO
-- ============================================
-- Fluxo: Pedido criado → 💳 Aguardando Pagamento → Confirmar → 👨‍🍳 Preparando → 📦 Pronto → 🚚 Em Entrega → ✅ Entregue
-- ============================================
