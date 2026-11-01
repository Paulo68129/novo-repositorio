-- Pedidos online: colunas usadas pelo painel de delivery e pagamento
ALTER TABLE public.pedidos_online
  ADD COLUMN IF NOT EXISTS status_pagamento text NOT NULL DEFAULT 'aguardando',
  ADD COLUMN IF NOT EXISTS status_delivery text NOT NULL DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS origem text NOT NULL DEFAULT 'loja_online',
  ADD COLUMN IF NOT EXISTS qr_code_pix text,
  ADD COLUMN IF NOT EXISTS pix_copia_cola text,
  ADD COLUMN IF NOT EXISTS transaction_id text,
  ADD COLUMN IF NOT EXISTS venda_id uuid REFERENCES public.vendas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS motoboy_id uuid REFERENCES public.motoboys(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS observacoes text,
  ADD COLUMN IF NOT EXISTS aceito_em timestamptz,
  ADD COLUMN IF NOT EXISTS recusado_em timestamptz,
  ADD COLUMN IF NOT EXISTS entregue_em timestamptz,
  ADD COLUMN IF NOT EXISTS motivo_recusa text,
  ADD COLUMN IF NOT EXISTS salvo_em timestamptz,
  ADD COLUMN IF NOT EXISTS salvo_por text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_pedidos_online_status ON public.pedidos_online(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_online_created ON public.pedidos_online(created_at DESC);

ALTER TABLE public.vendas ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER set_updated_at_pedidos_online BEFORE UPDATE ON public.pedidos_online FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_vendas BEFORE UPDATE ON public.vendas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, UPDATE, DELETE ON public.pedidos_online TO authenticated;
CREATE POLICY "staff atualiza pedidos online" ON public.pedidos_online FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "gerente exclui pedidos online" ON public.pedidos_online FOR DELETE TO authenticated
  USING (public.is_manager(auth.uid()));
ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos_online;

-- Auditoria (somente equipe)
CREATE TABLE public.pedidos_online_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id uuid REFERENCES public.pedidos_online(id) ON DELETE CASCADE,
  acao text NOT NULL,
  detalhes jsonb,
  usuario_id uuid,
  criado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.pedidos_online_audit TO authenticated;
GRANT ALL ON public.pedidos_online_audit TO service_role;
ALTER TABLE public.pedidos_online_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff ve auditoria" ON public.pedidos_online_audit FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff registra auditoria" ON public.pedidos_online_audit FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- Avaliações (acesso público só via funções)
CREATE TABLE public.feedback_clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id uuid NOT NULL UNIQUE REFERENCES public.pedidos_online(id) ON DELETE CASCADE,
  cliente_nome text NOT NULL,
  cliente_email text,
  nota integer NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario text,
  aprovado boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.feedback_clientes TO authenticated;
GRANT ALL ON public.feedback_clientes TO service_role;
ALTER TABLE public.feedback_clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff ve avaliacoes" ON public.feedback_clientes FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "gerente modera avaliacoes" ON public.feedback_clientes FOR UPDATE TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));

CREATE TABLE public.respostas_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id uuid NOT NULL UNIQUE REFERENCES public.feedback_clientes(id) ON DELETE CASCADE,
  resposta text NOT NULL,
  respondido_por uuid,
  criado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.respostas_feedback TO authenticated;
GRANT ALL ON public.respostas_feedback TO service_role;
ALTER TABLE public.respostas_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff ve respostas" ON public.respostas_feedback FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- ===== Funções do fluxo de pedidos =====
CREATE OR REPLACE FUNCTION public.expirar_pedido_online(_token uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
  UPDATE pedidos_online SET status = 'expirado', status_pagamento = 'expirado'
   WHERE token = _token AND status = 'aguardando_pagamento' AND status_pagamento = 'aguardando'
     AND created_at < now() - interval '5 minutes'
  RETURNING to_jsonb(pedidos_online) - 'token' INTO result;
  RETURN result;
END $$;
GRANT EXECUTE ON FUNCTION public.expirar_pedido_online(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.limpar_pedidos_expirados() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n int;
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  UPDATE pedidos_online SET status = 'expirado', status_pagamento = 'expirado'
   WHERE status = 'aguardando_pagamento' AND status_pagamento = 'aguardando'
     AND created_at < now() - interval '5 minutes';
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN jsonb_build_object('expirados', n);
END $$;
GRANT EXECUTE ON FUNCTION public.limpar_pedidos_expirados() TO authenticated;

CREATE OR REPLACE FUNCTION public.confirmar_pagamento_online(_pedido_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  UPDATE pedidos_online SET status_pagamento = 'pago',
         status = CASE WHEN status = 'aguardando_pagamento' THEN 'pago' ELSE status END
   WHERE id = _pedido_id AND status NOT IN ('cancelado','expirado')
  RETURNING to_jsonb(pedidos_online) - 'token' INTO result;
  IF result IS NULL THEN RAISE EXCEPTION 'Pedido não encontrado'; END IF;
  INSERT INTO pedidos_online_audit(pedido_id, acao, detalhes, usuario_id)
  VALUES (_pedido_id, 'pagamento_confirmado', jsonb_build_object('timestamp', now()), auth.uid());
  RETURN result;
END $$;
GRANT EXECUTE ON FUNCTION public.confirmar_pagamento_online(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.aceitar_pedido(_pedido_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  UPDATE pedidos_online SET status_delivery = 'aceito', aceito_em = now(), status = 'recebido'
   WHERE id = _pedido_id AND status_delivery = 'pendente' AND status NOT IN ('cancelado','expirado')
  RETURNING to_jsonb(pedidos_online) - 'token' INTO result;
  IF result IS NULL THEN RAISE EXCEPTION 'Pedido não encontrado ou já processado'; END IF;
  INSERT INTO pedidos_online_audit(pedido_id, acao, detalhes, usuario_id)
  VALUES (_pedido_id, 'aceito', jsonb_build_object('timestamp', now()), auth.uid());
  RETURN result;
END $$;
GRANT EXECUTE ON FUNCTION public.aceitar_pedido(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.recusar_pedido(_pedido_id uuid, _motivo text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  UPDATE pedidos_online SET status_delivery = 'recusado', motivo_recusa = left(_motivo, 500), recusado_em = now(), status = 'cancelado'
   WHERE id = _pedido_id AND status_delivery = 'pendente'
  RETURNING to_jsonb(pedidos_online) - 'token' INTO result;
  IF result IS NULL THEN RAISE EXCEPTION 'Pedido não encontrado ou já processado'; END IF;
  INSERT INTO pedidos_online_audit(pedido_id, acao, detalhes, usuario_id)
  VALUES (_pedido_id, 'recusado', jsonb_build_object('motivo', _motivo), auth.uid());
  RETURN result;
END $$;
GRANT EXECUTE ON FUNCTION public.recusar_pedido(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.avancar_status_pedido(_pedido_id uuid, _novo_status text, _motivo text DEFAULT NULL) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb; old_status text;
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  IF _novo_status NOT IN ('pendente','pago','recebido','preparando','pronto','em_entrega','finalizado','cancelado') THEN
    RAISE EXCEPTION 'Status inválido: %', _novo_status;
  END IF;
  SELECT status INTO old_status FROM pedidos_online WHERE id = _pedido_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pedido online não encontrado'; END IF;
  UPDATE pedidos_online SET status = _novo_status,
         entregue_em = CASE WHEN _novo_status = 'finalizado' THEN now() ELSE entregue_em END
   WHERE id = _pedido_id
  RETURNING to_jsonb(pedidos_online) - 'token' INTO result;
  INSERT INTO pedidos_online_audit(pedido_id, acao, detalhes, usuario_id)
  VALUES (_pedido_id, 'status_alterado', jsonb_build_object('status_anterior', old_status, 'status_novo', _novo_status), auth.uid());
  RETURN result;
END $$;
GRANT EXECUTE ON FUNCTION public.avancar_status_pedido(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.salvar_pedido_online(_pedido_id uuid, _usuario text DEFAULT 'operador') RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb; audit_id uuid;
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  IF EXISTS (SELECT 1 FROM pedidos_online WHERE id = _pedido_id AND salvo_em IS NOT NULL) THEN
    RAISE EXCEPTION 'Este pedido já está salvo no sistema';
  END IF;
  UPDATE pedidos_online SET salvo_em = now(), salvo_por = left(_usuario, 120) WHERE id = _pedido_id
  RETURNING to_jsonb(pedidos_online) - 'token' INTO result;
  IF result IS NULL THEN RAISE EXCEPTION 'Pedido não encontrado'; END IF;
  INSERT INTO pedidos_online_audit(pedido_id, acao, detalhes, usuario_id)
  VALUES (_pedido_id, 'pedido_salvo', jsonb_build_object('usuario', _usuario), auth.uid()) RETURNING id INTO audit_id;
  RETURN jsonb_build_object('pedido', result, 'audit_id', audit_id);
END $$;
GRANT EXECUTE ON FUNCTION public.salvar_pedido_online(uuid, text) TO authenticated;

-- ===== Funções de avaliações =====
CREATE OR REPLACE FUNCTION public.criar_feedback(_pedido_id uuid, _cliente_nome text, _cliente_email text DEFAULT NULL, _nota integer DEFAULT NULL, _comentario text DEFAULT NULL) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
  IF _nota IS NULL OR _nota NOT BETWEEN 1 AND 5 THEN RAISE EXCEPTION 'Nota deve ser entre 1 e 5'; END IF;
  IF length(trim(coalesce(_cliente_nome,''))) < 2 OR length(_cliente_nome) > 120 THEN RAISE EXCEPTION 'Nome inválido'; END IF;
  IF length(coalesce(_comentario,'')) > 1000 THEN RAISE EXCEPTION 'Comentário muito longo'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pedidos_online WHERE id = _pedido_id AND status IN ('finalizado','entregue')) THEN
    RAISE EXCEPTION 'Apenas pedidos entregues podem ser avaliados';
  END IF;
  IF EXISTS (SELECT 1 FROM feedback_clientes WHERE pedido_id = _pedido_id) THEN
    RAISE EXCEPTION 'Este pedido já foi avaliado';
  END IF;
  INSERT INTO feedback_clientes(pedido_id, cliente_nome, cliente_email, nota, comentario)
  VALUES (_pedido_id, trim(_cliente_nome), _cliente_email, _nota, nullif(trim(_comentario),''))
  RETURNING jsonb_build_object('id', id, 'nota', nota) INTO result;
  RETURN result;
END $$;
GRANT EXECUTE ON FUNCTION public.criar_feedback(uuid, text, text, integer, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.modificar_feedback_aprovacao(_feedback_id uuid, _aprovado boolean) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.is_manager(auth.uid()) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  UPDATE feedback_clientes SET aprovado = _aprovado, atualizado_em = now() WHERE id = _feedback_id
  RETURNING to_jsonb(feedback_clientes) INTO result;
  IF result IS NULL THEN RAISE EXCEPTION 'Avaliação não encontrada'; END IF;
  RETURN result;
END $$;
GRANT EXECUTE ON FUNCTION public.modificar_feedback_aprovacao(uuid, boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.responder_feedback(_feedback_id uuid, _resposta text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  IF length(trim(coalesce(_resposta,''))) < 1 OR length(_resposta) > 1000 THEN RAISE EXCEPTION 'Resposta inválida'; END IF;
  INSERT INTO respostas_feedback(feedback_id, resposta, respondido_por) VALUES (_feedback_id, trim(_resposta), auth.uid())
  ON CONFLICT (feedback_id) DO UPDATE SET resposta = excluded.resposta, respondido_por = excluded.respondido_por, criado_em = now()
  RETURNING to_jsonb(respostas_feedback) INTO result;
  RETURN result;
END $$;
GRANT EXECUTE ON FUNCTION public.responder_feedback(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.listar_feedbacks_aprovados(_limite integer DEFAULT 50, _offset integer DEFAULT 0, _nota_filtro integer DEFAULT NULL)
RETURNS TABLE(id uuid, pedido_id uuid, cliente_nome text, nota integer, comentario text, resposta text, criado_em timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT f.id, f.pedido_id, f.cliente_nome, f.nota, f.comentario, r.resposta, f.criado_em
  FROM feedback_clientes f LEFT JOIN respostas_feedback r ON r.feedback_id = f.id
  WHERE f.aprovado AND (_nota_filtro IS NULL OR f.nota = _nota_filtro)
  ORDER BY f.criado_em DESC LIMIT least(coalesce(_limite,50),100) OFFSET greatest(coalesce(_offset,0),0);
$$;
GRANT EXECUTE ON FUNCTION public.listar_feedbacks_aprovados(integer, integer, integer) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.listar_todos_feedbacks(_limite integer DEFAULT 50, _offset integer DEFAULT 0, _nota_filtro integer DEFAULT NULL, _aprovado_filtro boolean DEFAULT NULL)
RETURNS TABLE(id uuid, pedido_id uuid, cliente_nome text, cliente_email text, nota integer, comentario text, aprovado boolean, resposta text, criado_em timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT f.id, f.pedido_id, f.cliente_nome, f.cliente_email, f.nota, f.comentario, f.aprovado, r.resposta, f.criado_em
  FROM feedback_clientes f LEFT JOIN respostas_feedback r ON r.feedback_id = f.id
  WHERE public.is_staff(auth.uid())
    AND (_nota_filtro IS NULL OR f.nota = _nota_filtro)
    AND (_aprovado_filtro IS NULL OR f.aprovado = _aprovado_filtro)
  ORDER BY f.criado_em DESC LIMIT least(coalesce(_limite,50),200) OFFSET greatest(coalesce(_offset,0),0);
$$;
GRANT EXECUTE ON FUNCTION public.listar_todos_feedbacks(integer, integer, integer, boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.estatisticas_feedback() RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'total_feedbacks', (SELECT count(*) FROM feedback_clientes),
    'total_aprovados', (SELECT count(*) FROM feedback_clientes WHERE aprovado),
    'media_geral', coalesce((SELECT round(avg(nota)::numeric, 1) FROM feedback_clientes WHERE aprovado), 0),
    'media_por_nota', coalesce((SELECT jsonb_object_agg(nota::text, c) FROM (SELECT nota, count(*) c FROM feedback_clientes WHERE aprovado GROUP BY nota) s), '{}'::jsonb)
  );
$$;
GRANT EXECUTE ON FUNCTION public.estatisticas_feedback() TO anon, authenticated;