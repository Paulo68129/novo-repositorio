# 📋 Guia Passo a Passo — Aplicar Migration no Supabase

Este guia mostra como aplicar a migration SQL consolidada no seu banco de dados Supabase para corrigir o fluxo de pedidos.

---

## 🎯 O que esta migration faz

1. **Cria todas as tabelas** do sistema (se não existirem)
2. **Adiciona colunas faltantes**: `pago_em`, `salvo_em`, `salvo_por` na tabela `pedidos_online`
3. **Configura RLS** (Row Level Security), grants, índices, triggers e realtime
4. **Redefine TODAS as funções SQL** com o fluxo correto de pedidos
5. **Corrige pedidos existentes** com status errado

### Fluxo de pedidos após a migration:

```
🌐 Pedido criado → 💳 Aguardando Pagamento → ✅ Confirmar → 👨‍🍳 Preparando
→ 📦 Pronto → 🚚 Em Entrega → ✅ Entregue
```

---

## 🚀 Passo a Passo — Executar no Supabase

### Passo 1: Acesse o SQL Editor do Supabase

1. Abra o navegador e acesse:
   ```
   https://supabase.com/dashboard/project/lstycewiltrbefrxicdx/sql
   ```

2. Se não estiver logado, faça login com sua conta do Supabase.

3. Clique em **"New Query"** ou **"Novo Script"** para abrir um editor SQL em branco.

---

### Passo 2: Copie o SQL da Migration

1. Abra o arquivo `supabase/migrations/0019_FINAL_CONSOLIDATED.sql` no seu projeto.

2. **Selecione todo o conteúdo** do arquivo (Ctrl+A / Cmd+A).

3. **Copie** o conteúdo (Ctrl+C / Cmd+C).

   > ⚠️ **Importante:** Copie **TUDO** o conteúdo do arquivo, incluindo os comentários. O script tem aproximadamente 1270 linhas.

---

### Passo 3: Cole no SQL Editor

1. Volte para o **SQL Editor** do Supabase.

2. **Cole** todo o conteúdo no editor (Ctrl+V / Cmd+V).

3. Verifique se todo o conteúdo foi colado corretamente:
   - O primeiro comentário deve ser: `-- SCRIPT CONSOLIDADO FINAL — PIZZASTOCKAI`
   - O último comentário deve ser: `-- FIM DO SCRIPT CONSOLIDADO FINAL`

---

### Passo 4: Execute a Migration

1. Clique no botão **"RUN"** (ou pressione Ctrl+Enter / Cmd+Enter).

2. Aguarde a execução completar — pode levar **10 a 30 segundos**.

3. Verifique o resultado:
   - ✅ **Sucesso:** Você verá uma mensagem como `"Query executed successfully"` ou `"0 rows affected"`.
   - ❌ **Erro:** Se aparecer um erro, leia a mensagem e veja a seção "Problemas Comuns" abaixo.

---

### Passo 5: Verifique se Funcionou

Após executar com sucesso, rode estas queries de verificação no SQL Editor:

#### 5.1. Verificar tabelas

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Resultado esperado:** Você deve ver todas estas tabelas:
- `produtos`
- `ingredientes`
- `receitas`
- `vendas`
- `venda_itens`
- `cupons`
- `loja_config`
- `pedidos_online`
- `pagamentos_online`
- `pedidos_online_audit`
- `rastreamento_pedidos`
- `notificacoes_delivery`
- `feedback_clientes`
- `respostas_feedback`

#### 5.2. Verificar funções

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;
```

**Resultado esperado:** Você deve ver estas funções:
- `aceitar_pedido`
- `adicionar_rastreamento`
- `apply_migration_sql`
- `avancar_status_pedido`
- `auto_rastreamento_pedidos`
- `catalogo_online`
- `confirmar_pagamento_online`
- `consultar_pedido_online`
- `criar_notificacao_delivery`
- `criar_pedido_online`
- `is_staff`
- `listar_notificacoes_pendentes`
- `listar_rastreamento`
- `marcar_notificacao_analisada`
- `notify_pedidos_online_change`
- `registrar_venda`
- `salvar_pedido_online`
- `update_updated_at_column`

#### 5.3. Verificar colunas da tabela pedidos_online

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'pedidos_online'
ORDER BY ordinal_position;
```

**Resultado esperado:** Verifique se estas colunas existem:
- `pago_em` (timestamp with time zone)
- `salvo_em` (timestamp with time zone)
- `salvo_por` (text)
- `aceito_em` (timestamp with time zone)
- `recusado_em` (timestamp with time zone)
- `entregue_em` (timestamp with time zone)
- `motivo_recusa` (text)

#### 5.4. Verificar pedidos existentes

```sql
SELECT id, cliente, status, status_delivery, created_at
FROM pedidos_online
ORDER BY created_at DESC
LIMIT 10;
```

Verifique se os pedidos com status errado foram corrigidos para `aguardando_pagamento`.

---

## 🔍 Problemas Comuns e Soluções

### Erro: "relation already exists"

**Causa:** Tentou executar uma migration anterior que já criou as tabelas.

**Solução:** Este script usa `CREATE TABLE IF NOT EXISTS`, então **não deve dar este erro**. Se aparecer, verifique se copiou o SQL correto do arquivo `0019_FINAL_CONSOLIDATED.sql`.

### Erro: "column already exists"

**Causa:** As colunas `pago_em`, `salvo_em`, ou `salvo_por` já foram adicionadas anteriormente.

**Solução:** O script verifica se a coluna existe antes de adicionar (`IF NOT EXISTS`). Se o erro persistir, o script ainda deve completar com sucesso nas outras partes.

### Erro: "permission denied"

**Causa:** Permissões insuficientes no banco de dados.

**Solução:** Certifique-se de estar logado como dono do projeto no Supabase. O SQL Editor do Supabase executa como superuser, então normalmente não há problema.

### Erro: "duplicate_object" no REALTIME

**Causa:** Tabelas já foram adicionadas ao realtime anteriormente.

**Solução:** O script usa `EXCEPTION WHEN duplicate_object THEN NULL` para ignorar este erro. A migration continua normalmente.

### Script demora muito

**Causa:** O banco tem muitos dados e os UPDATEs estão corrigindo muitos pedidos.

**Solução:** Aguarde até 1 minuto. Se ainda assim falhar, execute apenas as seções do script que falharam.

---

## 📊 Resumo do Fluxo de Pedidos

Após aplicar esta migration, o fluxo de pedidos funciona assim:

| Etapa | Status no Banco | Coluna na Tela |
|-------|----------------|----------------|
| 1. Pedido criado | `aguardando_pagamento` | 💳 Aguardando Pagamento |
| 2. Pagamento confirmado | `pago` / `preparando` | 👨‍🍳 Preparando |
| 3. Cozinha finaliza | `pronto` | 📦 Pronto |
| 4. Motoboy sai | `em_entrega` | 🚚 Saiu p/ Entrega |
| 5. Entrega concluída | `finalizado` | ✅ Entregue |

### Tipos de pedido suportados:

- ✅ **Pedidos Online** (Loja Virtual) — criados via `criar_pedido_online`
- ✅ **Pedidos PDV** (Balcão/Delivery) — criados via `registrar_venda`
- ✅ **Confirmação manual** — botão "Confirmar Pagamento" na tela de delivery

---

## 🔄 Executar Novamente?

Este script é **idempotente**, o que significa que pode ser executado novamente sem erros. Se precisar reexecutar:

1. Siga os mesmos passos acima.
2. O script vai apenas atualizar o que precisa, sem duplicar dados.

---

## 🆘 Suporte

Se encontrar problemas após aplicar a migration:

1. Verifique os logs do Supabase em **Database → Logs**.
2. Teste criando um pedido na loja online e veja se aparece na coluna "💳 Aguardando Pagamento".
3. Abra o console do navegador (F12) e verifique se há erros ao criar o pedido.

---

## ✅ Checklist Final

Após aplicar a migration, verifique:

- [ ] Todas as tabelas foram listadas na verificação 5.1
- [ ] Todas as funções foram listadas na verificação 5.2
- [ ] Colunas `pago_em`, `salvo_em`, `salvo_por` existem na verificação 5.3
- [ ] Pedidos existentes foram corrigidos na verificação 5.4
- [ ] Criar um novo pedido na loja online funciona
- [ ] O pedido aparece na coluna "💳 Aguardando Pagamento" na tela de delivery
- [ ] Botão "Confirmar Pagamento" avança o pedido para "👨‍🍳 Preparando"

---

**Boa sorte! 🚀**
