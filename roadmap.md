# Roadmap

## Concluído
- [x] Edição de preço/disponibilidade no Cardápio — já existia e foi testada de ponta a ponta (painel → loja)

## Novo pedido (arquivo enviado 31/10)
- [ ] Unificar fluxo de pedidos PDV + Delivery + Online:
  - Salvamento automático imediato no banco (sem botão "Salvar")
  - Mesma estrutura de dados, numeração sequencial única e status para os 3 canais
  - Entrada automática na coluna "Preparando" (sem aguardar aceite)
  - Área "Pedidos Salvos" (número, cliente, canal, data/hora, total, status)
  - Área "Pedidos Recentes" em tempo real, mais recente primeiro
  - Realtime atualizando listas e contadores instantaneamente
  - Validação: sem perda nem duplicação de pedidos

## Pendente (de antes)
- [ ] CSVs de dados antigos (produtos, ingredientes, receitas, cupons, motoboys, vendas, venda_itens, pedidos_online) — aguardando o usuário enviar
- [ ] Lista de usuários antigos (email + papéis) — aguardando o usuário enviar
- [ ] Decisão: criar produto "Camarão" com a foto órfã — aguardando preço
- [ ] Secrets ENVIARE_* (chave API, webhook) — necessários para ir ao ar
