🍕 PizzaStockAI
Gestão Inteligente para Pizzarias

Do pedido ao PIX confirmado em segundos.

Pare de perder pedidos, vender produtos sem estoque ou depender de vários sistemas desconectados.

O PizzaStockAI unifica PDV, Delivery, Loja Online, Estoque, Financeiro, PIX e Gestão Operacional em uma única plataforma integrada e em tempo real.

🚀 Pedido recebido → Pagamento PIX → Produção → Entrega → Avaliação do cliente.

Tudo em um único fluxo.

🎯 O Problema

A maioria das pizzarias enfrenta desafios como:

❌ Perda de pedidos recebidos pelo WhatsApp
❌ Falta de controle de estoque
❌ Vendas de produtos sem ingredientes disponíveis
❌ Baixa visibilidade operacional
❌ Demora na confirmação de pagamentos
❌ Falta de indicadores financeiros

O resultado?

Perda de vendas, desperdício de ingredientes e clientes insatisfeitos.

✅ A Solução

O PizzaStockAI centraliza toda a operação da pizzaria em uma única plataforma.

Canais Unificados
🖥️ Balcão
📞 Telefone
🛵 Delivery
🌐 Loja Online

Todos os pedidos entram automaticamente no mesmo fluxo operacional.

📸 Fluxo Completo
Plain Text
Cliente Faz Pedido
│
▼
Loja Online / PDV
│
▼
PIX Gerado
│
▼
Pagamento Confirmado
│
▼
Preparando
│
▼
Pronto
│
▼
Saiu para Entrega
│
▼
Finalizado
✨ Principais Recursos
🏪 PDV Inteligente

Sistema completo de ponto de venda.

Recursos

✅ Carrinho de compras

✅ Aplicação de descontos

✅ Cupons promocionais

✅ Cálculo automático de totais

✅ Validação de estoque em tempo real

✅ Bloqueio de ingredientes vencidos

✅ Associação de entregadores

✅ Emissão de pedidos

✅ Integração com estoque

🛵 Delivery & Gestão de Pedidos

Nova arquitetura unificada (v0.5).

Todos os pedidos entram automaticamente em:
Plain Text
👨‍🍳 Preparando

Sem necessidade de aprovação manual.

Kanban em Tempo Real
Plain Text
👨‍🍳 Preparando
↓
✅ Pronto
↓
🛵 Saiu para Entrega
↓
📦 Finalizado

Também possui:

Notificações sonoras
Atualizações em tempo real
Contadores automáticos
Histórico completo
Busca avançada
🌐 Loja Online

Sua pizzaria vendendo 24 horas por dia.

Funcionalidades

✅ Catálogo digital

✅ Fotos dos produtos

✅ Carrinho responsivo

✅ Checkout simplificado

✅ QR Code PIX automático

✅ Controle de horário de funcionamento

✅ Rastreamento de pedidos

✅ Área de avaliações dos clientes

💳 Pagamentos PIX
PIX Dinâmico

Integração com:

Enviare API

Recursos:

Criação automática da cobrança
Webhook de confirmação
Baixa automática de pagamento
PIX Estático (Fallback)

Se não houver integração ativa:

Geração automática de QR Code EMV
Compatível com padrão Banco Central
Sem dependência de APIs externas
📦 Controle de Estoque

Gerencie ingredientes com precisão.

Cadastro
Quantidade
Unidade
Validade
Custo
Estoque mínimo
Controle Automático

Ao vender uma pizza:

Plain Text
Pizza Camarão Premium
 
↓
 
-200g Camarão
-180g Mussarela
-90g Molho
-10g Azeite

Tudo é descontado automaticamente.

Alertas Inteligentes

✅ Estoque baixo

✅ Produto vencido

✅ Produto próximo do vencimento

✅ Sugestão automática de compras

🧠 Inteligência de Negócio
Dashboard Financeiro

Acompanhe:

Faturamento
Lucro
Margem
Ticket médio
Vendas por canal
Desempenho operacional
Previsão de Demanda

Utilizando regressão linear:

Previsão de consumo
Histórico de vendas
Tendências futuras
Sugestões de compra
Exemplo
Plain Text
Camarão
 
Consumo médio:
15kg/semana
 
Previsão:
18kg próxima semana
 
Sugestão:
Comprar +3kg
⭐ Avaliações de Clientes

Após a entrega:

Nota de 1 a 5 estrelas
Comentários
Página pública de avaliações
Resposta da equipe
Moderação interna
🔄 Fluxo Unificado v0.5
Plain Text
🖥️ PDV
📞 Telefone
🛵 Delivery
🌐 Loja Online
│
▼
┌─────────────────┐
│ 👨‍🍳 PREPARANDO │
└────────┬────────┘
│
▼
┌─────────────────┐
│ ✅ PRONTO │
└────────┬────────┘
│
▼
┌─────────────────┐
│ 🛵 EM ENTREGA │
└────────┬────────┘
│
▼
┌─────────────────┐
│ 📦 FINALIZADO │
└─────────────────┘
 
Opções:
❌ Cancelado
🏪 Retirada no Balcão
🏗️ Arquitetura
Plain Text
Frontend
React
TanStack Router
TanStack Query
TailwindCSS
Radix UI
shadcn/ui
 
│
▼
 
Supabase
 
├── PostgreSQL
├── Auth
├── Realtime
├── Storage
└── Edge Functions
 
│
▼
 
Integrações
 
├── PIX Dinâmico
├── WhatsApp (futuro)
├── NFC-e
└── APIs externas
🗄️ Modelo de Dados
Principais Tabelas
Plain Text
profiles
user_roles
ingredientes
produtos
receitas
vendas
venda_itens
pedidos_online
motoboys
feedback_clientes
cupons
loja_config
🔐 Controle de Acesso
Recurso	Atendente	Gerente	AdminPDV	✅	✅	✅
Delivery	✅	✅	✅
Estoque	❌	✅	✅
Cardápio	❌	✅	✅
Financeiro	❌	✅	✅
Avaliações	❌	✅	✅
Equipe	❌	❌	✅
🚀 Instalação
Pré-requisitos
Node.js 18+
Projeto Supabase
Clonar
Shell
git clone https://github.com/seu-usuario/pizzastockai
cd pizzastockai
Instalar Dependências
Shell
npm install
Variáveis de Ambiente
Shell
cp .env.example .env

Configure:

Shell
env não tem suporte total. O realce de sintaxe é baseado em Shell.
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
Executar Migrações
Shell
npx drizzle-kit push
 

Ou execute manualmente:

Plain Text
0000_base_pizzaria.sql
0001_catalogo_delivery.sql
0002_fotos_produtos.sql
0003_fluxo_pedidos_avaliacoes.sql
0004_remover_pedido_teste.sql
0005_pdv_pedidos_online.sql
Iniciar Projeto
Shell
npm run dev
📁 Estrutura do Projeto
Plain Text
src/
├── components/
├── hooks/
├── lib/
├── routes/
├── integrations/
└── stores/
 
drizzle/
└── migrations/
🔑 Variáveis de Ambiente
Plain Text
env não tem suporte total. O realce de sintaxe é baseado em Plain Text.
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
 
# PIX Dinâmico
ENVIARE_API_KEY=
ENVIARE_MERCHANT_ID=
ENVIARE_WEBHOOK_SECRET=
ENVIARE_BASE_URL=
ENVIARE_WEBHOOK_URL=
🔒 LGPD

O sistema pode armazenar:

Nome
Telefone
Endereço de entrega

Recomendações:

✅ Anonimização automática após 90 dias

✅ Controle de acesso com RLS

✅ Armazenamento mínimo de informações sensíveis

✅ Não armazenar CPF sem necessidade operacional

🍕 PizzaStockAI
Gestão inteligente para pizzarias modernas.

✅ Pedidos unificados
 ✅ PIX automático
 ✅ Estoque inteligente
 ✅ Delivery em tempo real
 ✅ Dashboard financeiro
 ✅ Previsão de demanda
 ✅ Avaliações de clientes

Menos planilhas. Menos erros. Mais vendas. 🚀

inclui a arquitetura

Excelente ideia. A seção de arquitetura pode ficar mais profissional, mostrando claramente os módulos do sistema e como os dados fluem.

Adicione esta seção logo após Fluxo Unificado v0.5.

🏛 Arquitetura do Sistema

O PizzaStockAI foi desenvolvido utilizando uma arquitetura moderna, orientada a serviços e eventos em tempo real, garantindo escalabilidade, segurança e alta disponibilidade.

Plain Text
🌐 CLIENTES
 
┌────────────────────┐
│ Loja Online │
│ (React + PIX) │
└─────────┬──────────┘
│
▼
 
┌────────────────────────────────────────────────────────────┐
│ FRONTEND WEB APP │
├────────────────────────────────────────────────────────────┤
│ │
│ 🏪 PDV │
│ 🛵 Delivery │
│ 📦 Estoque │
│ 💰 Financeiro │
│ 📊 Previsões │
│ ⭐ Avaliações │
│ ⚙ Configurações │
│ │
│ React • TypeScript • TanStack Query • Router │
│ TailwindCSS • Radix UI • shadcn/ui │
│ │
└──────────────────────────┬─────────────────────────────────┘
│
▼
 
┌────────────────────────────────────────────────────────────┐
│ SUPABASE │
├────────────────────────────────────────────────────────────┤
│ │
│ PostgreSQL │
│ Auth │
│ Realtime │
│ Storage │
│ Edge Functions │
│ Row Level Security (RLS) │
│ │
└───────┬────────────┬──────────────┬──────────────┬─────────┘
│ │ │ │
▼ ▼ ▼ ▼
 
┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐
│ Estoque │ │ Pedidos │ │ Financeiro│ │ Usuários │
└──────────┘ └──────────┘ └───────────┘ └──────────┘
 
│
▼
 
┌────────────────────────────────────────────────────────────┐
│ REGRAS DE NEGÓCIO │
├────────────────────────────────────────────────────────────┤
│ │
│ registrar_venda() │
│ criar_pedido_online() │
│ confirmar_pagamento_pix() │
│ baixar_estoque() │
│ avancar_status() │
│ gerar_previsao_demanda() │
│ │
└──────────────────────────┬─────────────────────────────────┘
│
▼
 
┌────────────────────────────────────────────────────────────┐
│ INTEGRAÇÕES EXTERNAS │
├────────────────────────────────────────────────────────────┤
│ │
│ 💳 Enviare PIX │
│ 📱 WhatsApp (roadmap) │
│ 🧾 NFC-e (roadmap) │
│ 📦 APIs Delivery (roadmap) │
│ │
└────────────────────────────────────────────────────────────┘
🔄 Arquitetura de Eventos em Tempo Real

Toda movimentação do sistema utiliza o mecanismo de Supabase Realtime.

Plain Text
Novo Pedido
│
▼
PostgreSQL
│
▼
Supabase Realtime
│
├────────► Painel Delivery
│
├────────► Pedidos Recentes
│
├────────► Contadores
│
├────────► Som de Alerta
│
└────────► Dashboard Operacional

Benefícios:

⚡ Atualização instantânea
🔔 Notificação automática
🚫 Sem necessidade de F5
📈 Escalável para múltiplos atendentes
🛡 Fonte única de dados
🧩 Arquitetura por Módulos
Plain Text
PizzaStockAI
│
├── 🏪 PDV
│ ├── Carrinho
│ ├── Descontos
│ ├── Cupons
│ └── Vendas
│
├── 🛵 Delivery
│ ├── Kanban
│ ├── Pedidos Recentes
│ ├── Pedidos Salvos
│ └── Rastreamento
│
├── 🌐 Loja Online
│ ├── Catálogo
│ ├── Checkout
│ ├── PIX
│ └── Avaliações
│
├── 📦 Estoque
│ ├── Ingredientes
│ ├── Receitas
│ ├── Baixa Automática
│ └── Validade
│
├── 💰 Financeiro
│ ├── Faturamento
│ ├── Lucro
│ ├── Margem
│ └── Ticket Médio
│
├── 🧠 IA e Previsões
│ ├── Histórico
│ ├── Tendências
│ ├── Regressão Linear
│ └── Sugestão de Compras
│
└── 🔐 Segurança
├── Auth
├── RLS
├── Roles
└── Auditoria
⚡ Stack Tecnológica
Camada	TecnologiaFrontend	React + TypeScript
Roteamento	TanStack Router
Cache e Dados	TanStack Query
UI	TailwindCSS + shadcn/ui + Radix
Banco de Dados	PostgreSQL
Backend	Supabase
Tempo Real	Supabase Realtime
Autenticação	Supabase Auth
Storage	Supabase Storage
ORM	Drizzle ORM
Pagamentos	Enviare PIX + PIX EMV
Deploy	Vercel / Netlify
Versionamento	Git + GitHub

Essa seção deixa o README com aparência de projeto SaaS profissional, semelhante aos READMEs de produtos como ERPs, sistemas de delivery e plataformas comerciais.

agora crie a versão final completa com arquitetura , casos de uso ..
🍕 PizzaStockAI
Sistema Inteligente de Gestão para Pizzarias
🚀 Do Pedido ao PIX Confirmado em Segundos

PDV • Delivery • Loja Online • Estoque • Financeiro • IA • PIX

Uma plataforma completa para digitalizar e automatizar a operação da sua pizzaria.

✅ Sem perda de pedidos
 ✅ Sem venda sem estoque
 ✅ PIX automatizado
 ✅ Controle operacional em tempo real
 ✅ Gestão financeira integrada

📖 Sumário
#-visão-geral
#-problema-que-resolvemos
#-casos-de-uso
#-principais-funcionalidades
#-fluxo-operacional
#-arquitetura-do-sistema
#-arquitetura-de-eventos-em-tempo-real
#-módulos-da-plataforma
#-modelo-de-dados
#-segurança-e-controle-de-acesso
#-pagamentos-pix
#-tecnologias-utilizadas
#-instalação
#-estrutura-do-projeto
#-variáveis-de-ambiente
#-roadmap
#-lgpd
🎯 Visão Geral

O PizzaStockAI é uma plataforma completa para gestão operacional de pizzarias, desenvolvida para centralizar todos os processos em um único ambiente.

A aplicação integra:

🏪 Ponto de Venda (PDV)
🛵 Delivery
🌐 Loja Online
📦 Controle de Estoque
💰 Gestão Financeira
📊 Previsão de Demanda
⭐ Avaliações de Clientes
💳 Pagamentos PIX
📱 Atualizações em Tempo Real
❌ Problema que Resolvemos
Cenário Comum

Muitas pizzarias operam utilizando:

WhatsApp
Planilhas
Sistemas separados
Controles manuais

Isso gera:

Problema	ImpactoPedidos perdidos	Redução de faturamento
Estoque desatualizado	Venda sem ingredientes
Pagamentos não identificados	Atraso na produção
Falta de indicadores	Decisões incorretas
Processos manuais	Menor produtividade
✅ Solução

O PizzaStockAI conecta todos os setores da operação.

Plain Text
Cliente
│
▼
Pedido
│
▼
Pagamento PIX
│
▼
Produção
│
▼
Entrega
│
▼
Avaliação

Todo o ciclo acontece dentro de uma única plataforma.

🎭 Casos de Uso
Caso 1 – Pedido Online
Cliente
Acessa a loja online
Escolhe produtos
Finaliza compra
Recebe QR Code PIX
Efetua pagamento
Sistema
Cria pedido automaticamente
Salva no banco
Gera cobrança PIX
Atualiza status em tempo real
Produção

Pedido entra automaticamente em:

Plain Text
👨‍🍳 PREPARANDO

Sem necessidade de aceite manual.

Caso 2 – Venda no Balcão
Atendente
Seleciona produtos
Aplica desconto
Finaliza venda
Sistema
Registra venda
Baixa ingredientes
Atualiza financeiro
Atualiza estoque
Caso 3 – Pedido por Telefone
Atendente
Cadastra pedido rapidamente
Sistema
Salva imediatamente
Direciona para cozinha
Atualiza Kanban
Caso 4 – Controle de Estoque

Ao vender:

Plain Text
Pizza Camarão Premium

Sistema desconta automaticamente:

Plain Text
- 200g Camarão
- 180g Mussarela
- 90g Molho
- 5g Alho
- 10g Azeite
Caso 5 – Previsão de Compras

Com base no histórico:

Plain Text
Consumo médio semanal:
15kg de camarão
 
Previsão IA:
18kg próxima semana
 
Sugestão:
Comprar +3kg
✨ Principais Funcionalidades
🏪 PDV Inteligente
Carrinho de compras
Descontos
Cupons
Cálculo automático
Validação de estoque
Bloqueio de vencidos
Gestão de entregadores
Integração financeira
🛵 Delivery Unificado
Quadro Kanban
Plain Text
👨‍🍳 Preparando
↓
✅ Pronto
↓
🛵 Saiu para Entrega
↓
📦 Finalizado

Recursos:

Tempo real
Drag and Drop
Contadores automáticos
Alertas sonoros
Notificações visuais
🌐 Loja Online
Catálogo público
Fotos dos produtos
Carrinho responsivo
Checkout simplificado
PIX integrado
Controle de horário
Rastreamento de pedidos
📦 Estoque Inteligente
Ingredientes
Receitas
Baixa automática
Controle de validade
Controle mínimo
Alertas automáticos
💰 Financeiro

Indicadores:

Faturamento
Lucro
Ticket Médio
Margem
Vendas por Canal
Produtos Mais Vendidos
🧠 IA e Previsões
Previsão de demanda
Sugestão de compras
Tendências de vendas
Consumo por ingrediente
⭐ Avaliações
1 a 5 estrelas
Comentários
Moderação
Página pública
Respostas da equipe
🔄 Fluxo Operacional
Plain Text
PDV
Telefone
Loja Online
Delivery
│
▼
 
┌─────────────────┐
│ 👨‍🍳 PREPARANDO │
└────────┬────────┘
│
▼
┌─────────────────┐
│ ✅ PRONTO │
└────────┬────────┘
│
▼
┌─────────────────┐
│ 🛵 EM ENTREGA │
└────────┬────────┘
│
▼
┌─────────────────┐
│ 📦 FINALIZADO │
└─────────────────┘

Fluxos alternativos:

Plain Text
❌ Cancelado
 
🏪 Retirada no Balcão
🏛 Arquitetura do Sistema
Plain Text
 
🌐 LOJA ONLINE
│
▼
 
┌────────────────────────────────────────────┐
│ FRONTEND WEB │
├────────────────────────────────────────────┤
│ │
│ 🏪 PDV │
│ 🛵 Delivery │
│ 📦 Estoque │
│ 💰 Financeiro │
│ 📊 Previsões │
│ ⭐ Avaliações │
│ ⚙ Configurações │
│ │
└────────────────────┬───────────────────────┘
│
▼
 
┌────────────────────────────────────────────┐
│ SUPABASE │
├────────────────────────────────────────────┤
│ │
│ PostgreSQL │
│ Auth │
│ Realtime │
│ Storage │
│ Edge Functions │
│ Row Level Security │
│ │
└──────┬───────────┬──────────┬──────────────┘
│ │ │
 
▼ ▼ ▼
 
Pedidos Estoque Financeiro
 
│
▼
 
┌────────────────────────────────────────────┐
│ REGRAS DE NEGÓCIO │
├────────────────────────────────────────────┤
│ registrar_venda() │
│ criar_pedido_online() │
│ avancar_status() │
│ confirmar_pagamento_pix() │
│ baixar_estoque() │
│ gerar_previsao_demanda() │
└────────────────────────────────────────────┘
 
│
▼
 
┌────────────────────────────────────────────┐
│ SERVIÇOS EXTERNOS │
├────────────────────────────────────────────┤
│ 💳 Enviare PIX │
│ 📱 WhatsApp (futuro) │
│ 🧾 NFC-e (futuro) │
│ 🚚 APIs Delivery │
└────────────────────────────────────────────┘
⚡ Arquitetura de Eventos em Tempo Real
Plain Text
NOVO PEDIDO
│
▼
POSTGRESQL
│
▼
SUPABASE REALTIME
│
├── Kanban
├── Pedidos Recentes
├── Dashboard
├── Alertas Sonoros
└── Contadores

Benefícios:

✅ Sem F5

✅ Atualizações instantâneas

✅ Múltiplos atendentes

✅ Sincronização em tempo real

✅ Operação centralizada

🧩 Módulos da Plataforma
Plain Text
PizzaStockAI
│
├── 🏪 PDV
│
├── 🌐 Loja Online
│
├── 🛵 Delivery
│
├── 📦 Estoque
│
├── 💰 Financeiro
│
├── 📊 Previsões
│
├── ⭐ Avaliações
│
├── 👥 Usuários e Perfis
│
└── ⚙ Configurações
🗄 Modelo de Dados
Principais Tabelas
Plain Text
profiles
user_roles
 
ingredientes
produtos
receitas
 
vendas
venda_itens
 
pedidos_online
 
motoboys
cupons
 
feedback_clientes
 
loja_config
Exemplo de Receita
Plain Text
PizzaStockAI
│
├── 🏪 PDV
│
├── 🌐 Loja Online
│
├── 🛵 Delivery
│
├── 📦 Estoque
│
├── 💰 Financeiro
│
├── 📊 Previsões
│
├── ⭐ Avaliações
│
├── 👥 Usuários e Perfis
│
└── ⚙ Configurações
🔐 Segurança e Controle de Acesso
Recurso	Atendente	Gerente	AdminPDV	✅	✅	✅
Delivery	✅	✅	✅
Estoque	❌	✅	✅
Cardápio	❌	✅	✅
Financeiro	❌	✅	✅
Avaliações	❌	✅	✅
Equipe	❌	❌	✅
Configurações	❌	❌	✅
💳 Pagamentos PIX
PIX Dinâmico

Integração com:

Enviare API

Funcionalidades:

Geração de cobrança
QR Code automático
Webhook
Confirmação automática
PIX Estático (Fallback)

Caso não exista integração:

QR Code local
Padrão Banco Central
Sem dependência externa
🚀 Tecnologias Utilizadas
Camada	TecnologiaFrontend	React
Linguagem	TypeScript
Estilização	TailwindCSS
Componentes	shadcn/ui
UI Base	Radix UI
Router	TanStack Router
Data Fetching	TanStack Query
Banco	PostgreSQL
Backend	Supabase
Auth	Supabase Auth
Storage	Supabase Storage
Realtime	Supabase Realtime
ORM	Drizzle ORM
Pagamentos	Enviare PIX
Deploy	Vercel
🚀 Instalação
Clonando
Shell
git clone https://github.com/seu-usuario/pizzastockai
cd pizzastockai
Instalar Dependências
Shell
npm install
Configurar Ambiente
Shell
cp .env.example .env
Executar Migrações
Shell
npx drizzle-kit push

ou

Plain Text
0000_base_pizzaria.sql
0001_catalogo_delivery.sql
0002_fotos_produtos.sql
0003_fluxo_pedidos_avaliacoes.sql
0004_remover_pedido_teste.sql
0005_pdv_pedidos_online.sql
Rodar Projeto
Shell
npm run dev
📁 Estrutura do Projeto
Plain Text
src/
│
├── components/
├── hooks/
├── integrations/
├── lib/
├── routes/
├── stores/
│
└── types/
 
drizzle/
│
└── migrations/
 
public/
 
supabase/
🔑 Variáveis de Ambiente
Plain Text
env não tem suporte total. O realce de sintaxe é baseado em Plain Text.
# Supabase
 
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
 
# PIX
 
ENVIARE_API_KEY=
ENVIARE_MERCHANT_ID=
ENVIARE_WEBHOOK_SECRET=
ENVIARE_BASE_URL=
ENVIARE_WEBHOOK_URL=
🗺 Roadmap
v0.6
WhatsApp Oficial
NFC-e
Cupom Fiscal
Gestão de Motoboys
Cashback
v0.7
Aplicativo Android
Aplicativo iOS
Impressão Automática
Multiunidade
v1.0
IA para Recomendação de Compras
Integração iFood
Integração Rappi
Integração Uber Eats
Business Intelligence Completo
🔒 LGPD

O sistema pode armazenar:

Nome
Telefone
Endereço
Histórico de pedidos

Recomendações:

✅ Anonimização após 90 dias

✅ Controle de acesso por perfil

✅ Auditoria de operações

✅ Criptografia de dados sensíveis

✅ Política de retenção de dados

🍕 PizzaStockAI
Sistema Inteligente para Gestão de Pizzarias

Centralize pedidos, estoque, pagamentos, produção e financeiro em uma única plataforma.

🚀 Mais vendas
 📦 Mais controle
 💳 PIX automatizado
 📊 Decisões inteligentes
 🍕 Operação sem perdas

PizzaStockAI: da venda ao lucro, tudo conectado.

## 👨‍💻 Equipe DEV.CODE

**Projeto desenvolvido durante o curso de ADS na faculdade Unifeso**

### Desenvolvedores

- Paulo Roberto Silva de Oliveira Júnior
- João
- Gabriel
- João Daniel
- Douglas Lopes
- Samuel

### 🎓 Orientação

**Professor Rodrigo Braga**

### 🏫 Instituições


- UNIFESO

---

## 🤝 Agradecimentos

Agradecemos ao **UNIFESO** e ao **Professor Rodrigo Braga** pela oportunidade, apoio, orientação e incentivo ao desenvolvimento deste projeto.

O PizzaStockAI representa a união entre **tecnologia, inovação e empreendedorismo**, aplicando conhecimentos de Arquitetura de Software, Desenvolvimento Full Stack, Banco de Dados, UX/UI e Inteligência de Negócios para solucionar desafios reais do mercado.

---

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório ou entre em contato com a equipe de desenvolvimento.
