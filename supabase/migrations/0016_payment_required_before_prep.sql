-- 0016 - Pedidos só avançam para cozinha após pagamento confirmado
-- ============================================
-- Reverte criar_pedido_online para criar pedidos com status "aguardando_pagamento"
-- em vez de "preparando", garantindo que o cliente pague antes do preparo.
-- O operador confirma o pagamento na tela de delivery com um botão.

-- ============================================
-- Atualizar criar_pedido_online para status "aguardando_pagamento"
-- ============================================

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

  -- Pedido criado com status "aguardando_pagamento" para esperar confirmação
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

-- ============================================
-- Reverte pedidos existentes que estão em "preparando" sem pagamento confirmado
-- para "aguardando_pagamento" (apenas os que não foram aceitos manualmente)
-- ============================================

UPDATE pedidos_online
SET status = 'aguardando_pagamento',
    status_delivery = 'aguardando_pagamento',
    updated_at = NOW()
WHERE status = 'preparando'
  AND status_delivery = 'preparando'
  AND aceito_em IS NULL
  AND pago_em IS NULL
  AND status_pagamento != 'pago';

COMMENT ON MIGRATION IS '0016 - Pedidos só avançam para cozinha após pagamento confirmado';
