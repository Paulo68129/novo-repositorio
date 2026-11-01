🍕 PizzaStockAI
Gestão Inteligente para Pizzarias

## 📋 Sumário

- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Casos de Uso](#-casos-de-uso)
- [Modelo de Dados](#-modelo-de-dados)
- [Fluxo de Pedidos](#-fluxo-de-pedidos)
- [Pagamentos](#-pagamentos)
- [Controle de Acesso](#-controle-de-acesso)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Scripts](#-scripts)
- [Estrutura do Projeto](#-estrutura-do-projeto)

---

## ✨ Funcionalidades

### 🏪 PDV (Ponto de Venda)
- Registro de vendas no balcão e delivery
- Carrinho de compras com cálculo automático de subtotal, desconto e total
- Aplicação de cupons de desconto
- Impressão de NFC-e
- Atribuição de motoboy para entregas
- Validação de estoque em tempo real antes de registrar a venda
- Bloqueio automático de ingredientes vencidos

### 🛵 Painel de Delivery & Pedidos Unificado
- **Fluxo Unificado (PDV + Delivery + Online):** Entrada direta na coluna **"Preparando"** sem aguardar aceite manual.
- **Salvamento Automático Imediato:** Todos os pedidos são registrados de forma persistente e instantânea no banco de dados.
- **3 Áreas de Visualização:**
  - **Quadro Kanban:** 4 colunas ativas (*Preparando*, *Pronto*, *Saiu p/ Entrega*, *Finalizado*) com botão de avanço rápido e atribuição de motoboy.
  - **Pedidos Recentes:** Feed cronológico em tempo real ordenado pelos mais recentes, com tempo decorrido (*ex: há 3 min*) e status ao vivo.
  - **Pedidos Salvos:** Tabela de consulta de histórico com busca em tempo real (nome, número sequencial, telefone) e filtros combinados por canal e status.
- **Notificações:** Alertas sonoros e visuais destacados para novos pedidos recebidos.
- **Realtime:** Atualização instantânea de contadores e status via Supabase Realtime sem recarregar a página.

### 🌐 Loja Online
- Catálogo público de produtos com fotos e categorias
- Carrinho de compras com interface responsiva
- Finalização de pedido com dados do cliente (nome, telefone, endereço)
- Geração de QR Code PIX para pagamento
- Horário de funcionamento configurável com indicador de aberto/fechado

### 📦 Controle de Estoque
- Gerenciamento de ingredientes com quantidade, unidade, custo e validade
- Receitas vinculadas a produtos (lista de ingredientes por produto)
- Alertas de estoque mínimo e ingredientes próximos do vencimento
- Baixa automática de ingredientes ao registrar vendas
- Sugestões de compra baseadas em previsão de demanda

### 💰 Gestão Financeira
- Dashboard com métricas: faturamento, lucro, margem, ticket médio
- Gráficos de vendas diárias e por produto
- Análise de receita por canal (balcão vs delivery)
- Cálculo automático de custo e lucro por venda

### 🧠 Previsão de Demanda
- Algoritmo de regressão linear para previsão de consumo
- Previsão de demanda por ingrediente para os próximos 7 dias
- Sugestão automática de quantidade a comprar
- Gráficos comparativos: consumo histórico vs previsão

### ⭐ Avaliações de Clientes
- Clientes podem avaliar pedidos entregues (nota 1-5 + comentário)
- Painel administrativo para moderação de avaliações
- Respostas da equipe às avaliações
- Estatísticas: média geral, distribuição por nota
- Página pública de avaliações aprovadas

### 👥 Gestão de Equipe
- Controle de papéis: Admin, Gerente, Atendente
- Gerenciamento de usuários e permissões
- Perfis com nome e email

### ⚙️ Configurações
- Horário de funcionamento da loja
- Taxa de entrega
- Gerenciamento de cupons de desconto
- Cadastro de motoboys
- Controle de som de alerta

---

## 🏗 Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│  React 19 + TanStack Router + TanStack Query + TailwindCSS  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │   PDV    │ │ Delivery │ │  Estoque │ │  Financeiro  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Cardápio │ │Previsões │ │  Equipe  │ │ Configurações │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Loja Online (pública)                   │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Supabase      │
                    │  ┌───────────┐  │
                    │  │ PostgreSQL│  │
                    │  │  (DB)     │  │
                    │  └───────────┘  │
                    │  ┌───────────┐  │
                    │  │   Auth    │  │
                    │  └───────────┘  │
                    │  ┌───────────┐  │
                    │  │  Storage  │  │
                    │  │ (fotos)   │  │
                    │  └───────────┘  │
                    │  ┌───────────┐  │
                    │  │  Realtime │  │
                    │  └───────────┘  │
                    └─────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Enviare API  │
                    │  (PIX Dinâmico) │
                    └─────────────────┘
```

### Camadas da Aplicação

1. **Camada de Apresentação** — Componentes React com UI do Radix UI e TailwindCSS
2. **Camada de Roteamento** — TanStack Router com rotas protegidas por autenticação
3. **Camada de Estado** — TanStack Query para cache e sincronização de dados
4. **Camada de Integração** — Clientes Supabase (auth, database, storage, realtime)
5. **Camada de Negócios** — Funções PL/pgSQL no banco (registrar_venda, criar_pedido_online, etc.)
6. **Camada de Dados** — PostgreSQL com RLS (Row Level Security) e políticas de acesso

---

## 🛠 Tecnologias

| Categoria | Tecnologia |
|-----------|-----------|
| **Frontend** | React 19, TypeScript |
| **Framework** | TanStack Start (SSR) + Vite 8 |
| **Roteamento** | TanStack Router |
| **State Management** | TanStack Query |
| **UI Components** | Radix UI, shadcn/ui, Lucide Icons |
| **Estilização** | TailwindCSS 4, tw-animate-css |
| **Formulários** | React Hook Form + Zod |
| **Gráficos** | Recharts |
| **Backend / BaaS** | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| **ORM / Migrations** | Drizzle ORM + Drizzle Kit |
| **Pagamentos** | PIX Estático (BCB EMV QR Code) + Enviare API (PIX Dinâmico) |
| **QR Code** | qrcode |
| **Testes** | Vitest + Testing Library |
| **Lint/Format** | ESLint + Prettier |
| **Build** | Bun / Node.js |

---

## 🎯 Casos de Uso

### CU-01: Registrar venda no PDV
- **Atores:** Atendente, Gerente, Admin
- **Fluxo:** O atendente adiciona itens ao carrinho → aplica cupom (opcional) → informa dados do cliente (delivery) → registra a venda → sistema valida estoque e ingredientes → baixa ingredientes automaticamente → gera recibo NFC-e
- **Fluxo alternativo:** Se ingrediente estiver vencido, o sistema bloqueia e exibe erro

### CU-02: Gerenciar pedidos de delivery
- **Atores:** Atendente, Gerente, Admin
- **Fluxo:** Novo pedido aparece na coluna "Pendente" → atendente aceita ou recusa → pedido avança para "Preparando" → quando pronto, avança para "Pronto" → motoboy é atribuído e pedido vai para "Em entrega" → pedido é finalizado
- **Regras:** Notificação sonora e visual ao chegar novo pedido; atualização em tempo real para todos os operadores

### CU-03: Fazer pedido pela loja online
- **Atores:** Cliente (não autenticado)
- **Fluxo:** Cliente acessa a loja → navega pelo cardápio → adiciona itens ao carrinho → preenche nome, telefone e endereço → finaliza pedido → recebe QR Code PIX → realiza pagamento → pedido entra no painel de delivery
- **Regras:** Pedido expira após 5 minutos sem pagamento; cupom é validado no momento da criação

### CU-04: Rastrear pedido
- **Atores:** Cliente (não autenticado)
- **Fluxo:** Cliente acessa página de rastreamento → insere token do pedido → visualiza status atual e progresso

### CU-05: Avaliar pedido
- **Atores:** Cliente (não autenticado)
- **Fluxo:** Cliente acessa página de avaliações → insere ID do pedido → dá nota (1-5) e escreve comentário → submete avaliação → gerente aprova para exibição pública

### CU-06: Gerenciar estoque
- **Atores:** Gerente, Admin
- **Fluxo:** Gerente acessa painel de estoque → cadastra/edita ingredientes com quantidade, unidade, custo e validade → sistema exibe alertas para estoque baixo e ingredientes próximos do vencimento

### CU-07: Gerenciar cardápio
- **Atores:** Gerente, Admin
- **Fluxo:** Gerente acessa painel de cardápio → cadastra/edita produtos com nome, categoria, descrição, preço e foto → define disponibilidade → configura receitas (ingredientes e quantidades)

### CU-08: Consultar relatórios financeiros
- **Atores:** Gerente, Admin
- **Fluxo:** Gerente acessa painel financeiro → visualiza dashboard com faturamento, lucro, margem e ticket médio → analisa gráficos de vendas diárias e por produto

### CU-09: Consultar previsões de demanda
- **Atores:** Gerente, Admin
- **Fluxo:** Gerente acessa painel de previsões → visualiza consumo histórico por ingrediente → sistema calcula previsão para 7 dias usando regressão linear → sugere quantidade a comprar

### CU-10: Gerenciar equipe
- **Atores:** Admin
- **Fluxo:** Admin acessa painel de equipe → visualiza lista de usuários → atribui ou altera papéis (admin, gerente, atendente)

### CU-11: Modera avaliações
- **Atores:** Gerente, Admin
- **Fluxo:** Gerente acessa painel de feedback → visualiza todas as avaliações → aprova ou rejeita → responde aos comentários dos clientes

---

## 🗄 Modelo de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfis de usuários (nome, email) |
| `user_roles` | Papéis dos usuários (admin, gerente, atendente) |
| `ingredientes` | Ingredientes do estoque (nome, quantidade, unidade, custo, validade) |
| `produtos` | Produtos do cardápio (nome, categoria, descrição, preço, foto) |
| `receitas` | Composição de produtos (produto_id, ingrediente_id, quantidade) |
| `vendas` | Vendas registradas (número, tipo, status, cliente, totais) |
| `venda_itens` | Itens de cada venda (produto, quantidade, preço, custo) |
| `pedidos_online` | Pedidos da loja online (token, cliente, itens, status, PIX) |
| `pedidos_online_audit` | Auditoria de ações nos pedidos online |
| `feedback_clientes` | Avaliações dos clientes (nota, comentário, aprovação) |
| `respostas_feedback` | Respostas da equipe às avaliações |
| `motoboys` | Cadastro de motoboys |
| `cupons` | Cupons de desconto (código, percentual) |
| `loja_config` | Configurações da loja (horário, taxa de entrega) |

### Funções do Banco (PL/pgSQL)

- `registrar_venda()` — Registra venda completa com validação de estoque e baixa de ingredientes
- `catalogo_online()` — Retorna catálogo público de produtos
- `criar_pedido_online()` — Cria pedido na loja online com validação
- `consultar_pedido_online()` — Consulta pedido pelo token
- `confirmar_pagamento_online()` — Confirma pagamento de pedido online
- `aceitar_pedido()` / `recusar_pedido()` — Gerencia aceitação de pedidos
- `avancar_status_pedido()` — Altera status do pedido no fluxo
- `criar_pedido_pdv()` — Cria pedido a partir do PDV no fluxo de preparo
- `criar_feedback()` — Registra avaliação do cliente
- `modificar_feedback_aprovacao()` — Aprova/rejeita avaliação
- `responder_feedback()` — Responde a uma avaliação
- `listar_feedbacks_aprovados()` — Lista avaliações públicas
- `estatisticas_feedback()` — Retorna estatísticas de avaliações

---

## 🔄 Fluxo de Pedidos Unificado

```
┌────────────────────────────────────────────────────────┐
│  Canais de Entrada: Balcão (PDV), Delivery ou Online   │
└───────────────────────────┬────────────────────────────┘
                            │ (Entrada Direta e Imediata)
                            ▼
┌──────────────┐     ┌─────────────┐     ┌────────────────┐     ┌──────────────┐
│  PREPARANDO  │ ──► │   PRONTO    │ ──► │ SAIU P/ ENTREGA │ ──► │  FINALIZADO  │
└──────────────┘     └─────────────┘     └────────────────┘     └──────────────┘
       │                                                                ▲
       ▼                                                                │
┌──────────────┐                             (ou Retirada no Balcão) ───┘
│  CANCELADO   │
└──────────────┘
```

**Características do Fluxo Unificado:**
- **Entrada Direta:** Novos pedidos de todos os canais entram diretamente na coluna **"Preparando"**, eliminando esperas desnecessárias por aceite manual.
- **Salvamento Automático:** Persistência automática no Supabase imediatamente após a criação do pedido.
- **Deduplicação Inteligente:** Pedidos gerados no PDV vinculados ao fluxo online compartilham a mesma entidade de dados sem duplicações.
- **Identificação por Canal:** Cada pedido exibe claramente sua origem (`🖥️ Balcão`, `🛵 Delivery`, `🌐 Loja Online`) e numeração sequencial única.

---

## 💳 Pagamentos

O sistema suporta dois modos de pagamento PIX:

### PIX Estático (Fallback)
- Gera QR Code PIX EMV conforme padrão do Banco Central do Brasil
- Payload gerado no frontend com dados do beneficiário
- Funciona sem dependência externa

### PIX Dinâmico (Enviare)
- Integração com API Enviare para cobranças PIX dinâmicas
- Geração de QR Code com webhook para confirmação automática
- Fallback automático para PIX Estático se a API estiver indisponível

---

## 🔐 Controle de Acesso

| Recurso | Atendente | Gerente | Admin |
|---------|:---------:|:-------:|:-----:|
| PDV — registrar vendas | ✅ | ✅ | ✅ |
| Delivery — gerenciar pedidos | ✅ | ✅ | ✅ |
| Estoque — visualizar | ✅ | ✅ | ✅ |
| Estoque — editar | ❌ | ✅ | ✅ |
| Cardápio — visualizar | ✅ | ✅ | ✅ |
| Cardápio — editar | ❌ | ✅ | ✅ |
| Financeiro | ❌ | ✅ | ✅ |
| Previsões | ❌ | ✅ | ✅ |
| Equipe — gerenciar | ❌ | ❌ | ✅ |
| Configurações | ❌ | ✅ | ✅ |
| Avaliações — moderar | ❌ | ✅ | ✅ |
| Avaliações — responder | ✅ | ✅ | ✅ |

Implementado via **Row Level Security (RLS)** no PostgreSQL com funções `has_role()`, `is_staff()` e `is_manager()`.

---

## 🚀 Instalação e Configuração

### Pré-requisitos
- **Node.js** 18+ (recomendado via [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- **Bun** (opcional, para desenvolvimento mais rápido)
- **Supabase** — projeto configurado com as migrations aplicadas

### Passos

```sh
# 1. Clone o repositório
git clone <this-repository-url>
cd create-this-project-main

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas chaves do Supabase

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

### Aplicar Migrations

As migrations estão em `drizzle/migrations/` e devem ser aplicadas ao banco Supabase:

```sh
npx drizzle-kit push
```

Ou execute os scripts SQL diretamente no SQL Editor do Supabase, na ordem:
1. `0000_base_pizzaria.sql` — Estrutura base + dados iniciais
2. `0001_catalogo_delivery.sql` — Catálogo online + pedidos
3. `0002_fotos_produtos.sql` — Fotos dos produtos
4. `0003_fluxo_pedidos_avaliacoes.sql` — Fluxo de pedidos + avaliações
5. `0004_remover_pedido_teste.sql` — Limpeza de dados de teste
6. `0005_pdv_pedidos_online.sql` — Integração PDV com pedidos online

---

## 🔑 Variáveis de Ambiente

| Variável | Descrição | Obrigatório? |
|----------|-----------|:------------:|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | ✅ Sim |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave anônima do Supabase | ✅ Sim |
| `SUPABASE_URL` | URL do projeto (server-side) | ✅ Sim |
| `SUPABASE_PUBLISHABLE_KEY` | Chave (server-side) | ✅ Sim |
| `ENVIARE_API_KEY` | Chave de API da Enviare | ❌ Opcional |
| `ENVIARE_MERCHANT_ID` | ID do estabelecimento Enviare | ❌ Opcional |
| `ENVIARE_WEBHOOK_SECRET` | Segredo HMAC do webhook | ❌ Opcional |
| `ENVIARE_WEBHOOK_URL` | URL do webhook (Edge Function) | ❌ Opcional |
| `ENVIARE_BASE_URL` | URL base da API Enviare | ❌ Opcional |

> **Nota:** As variáveis `ENVIARE_*` são opcionais. Sem elas, o sistema usa PIX Estático como fallback.

---

## 📜 Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Compila para produção |
| `npm run build:dev` | Compila em modo development |
| `npm run preview` | Pré-visualiza o build de produção |
| `npm run lint` | Executa o ESLint |
| `npm run format` | Formata o código com Prettier |
| `npm run test` | Executa os testes (Vitest) |
| `npm run test:watch` | Executa os testes em modo watch |

---

## 📁 Estrutura do Projeto

```
create-this-project-main/
├── .env                          # Variáveis de ambiente
├── drizzle.config.ts             # Configuração do Drizzle ORM
├── drizzle/
│   ├── migrations/               # Migrations SQL do banco
│   │   ├── 0000_base_pizzaria.sql
│   │   ├── 0001_catalogo_delivery.sql
│   │   ├── 0002_fotos_produtos.sql
│   │   ├── 0003_fluxo_pedidos_avaliacoes.sql
│   │   ├── 0004_remover_pedido_teste.sql
│   │   └── 0005_pdv_pedidos_online.sql
│   └── schema.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── roadmap.md                    # Roadmap do projeto
└── src/
    ├── components/               # Componentes React
    │   ├── ui/                   # Componentes UI (shadcn/ui)
    │   ├── AppShell.tsx          # Layout principal com navegação
    │   ├── Clock.tsx             # Relógio em tempo real
    │   ├── FeedbackAdminPanel.tsx # Painel de avaliações
    │   ├── MyOrders.tsx          # Meus pedidos
    │   ├── NFCEPrint.tsx         # Impressão NFC-e
    │   ├── OnlineOrders.tsx      # Painel de pedidos online
    │   ├── OrderBell.tsx         # Notificação de pedidos
    │   ├── OrderReceipt.tsx      # Recibo do pedido
    │   ├── OrderStatusBadge.tsx  # Badge de status
    │   ├── OrderSummary.tsx      # Resumo do pedido
    │   ├── OrderTracker.tsx      # Rastreamento de pedido
    │   ├── PixPaymentModal.tsx   # Modal de pagamento PIX
    │   └── PixPaymentSection.tsx # Seção de pagamento PIX
    ├── hooks/                    # Hooks customizados
    │   ├── useRole.ts            # Verificação de papéis
    │   ├── useMyOrders.ts        # Meus pedidos
    │   ├── useNewOrderSound.ts   # Som de novo pedido
    │   └── useOnlineOrdersRealtime.ts # Realtime de pedidos
    ├── integrations/
    │   ├── supabase/             # Clientes e tipos do Supabase
    │   └── lovable/              # Integração Lovable
    ├── lib/                      # Utilitários e lógica de negócio
    │   ├── data.ts               # Queries e chaves de dados
    │   ├── forecast.ts           # Algoritmo de previsão
    │   ├── pix.ts                # Geração de QR Code PIX
    │   ├── enviare.ts            # Integração com API Enviare
    │   ├── online-order-api.ts   # API de pedidos online
    │   ├── online-order.ts       # Utilitários de pedidos
    │   └── utils.ts              # Utilitários gerais
    ├── routes/                   # Rotas TanStack Router
    │   ├── __root.tsx            # Rota raiz
    │   ├── auth.tsx              # Login/Cadastro
    │   ├── loja.tsx              # Loja online (pública)
    │   ├── rastrear.tsx          # Rastreamento (pública)
    │   ├── avaliacoes.tsx        # Avaliações (pública)
    │   ├── pagamento/$vendaId.tsx # Pagamento PIX
    │   └── _authenticated/       # Rotas protegidas
    │       ├── route.tsx         # Guard de autenticação
    │       ├── dashboard.tsx     # Dashboard central
    │       ├── pdv.tsx           # PDV
    │       ├── delivery.tsx      # Painel de delivery
    │       ├── estoque.tsx       # Controle de estoque
    │       ├── cardapio.tsx      # Gerenciamento de cardápio
    │       ├── financeiro.tsx    # Relatórios financeiros
    │       ├── previsoes.tsx     # Previsão de demanda
    │       ├── alertas.tsx       # Alertas do sistema
    │       ├── equipe.tsx        # Gestão de equipe
    │       └── config.tsx        # Configurações
    └── test/                     # Testes unitários
        ├── app-routing.test.tsx
        ├── data.test.ts
        ├── forecast.test.ts
        ├── pix-integration.test.ts
        └── utils.test.ts
```
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

Agradecemos ao **Serratec**, ao **SEBRAE**, ao **UNIFESO** e ao **Professor Rodrigo Braga** pela oportunidade, apoio, orientação e incentivo ao desenvolvimento deste projeto.

O PizzaStockAI representa a união entre **tecnologia, inovação e empreendedorismo**, aplicando conhecimentos de Arquitetura de Software, Desenvolvimento Full Stack, Banco de Dados, UX/UI e Inteligência de Negócios para solucionar desafios reais do mercado.

---

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório ou entre em contato com a equipe de desenvolvimento.
