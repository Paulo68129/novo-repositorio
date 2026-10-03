# novo-pizzaStockAI
# 🍕 PizzaStockAI

> **AI-Powered Inventory, Sales Analytics & Demand Forecasting Platform for Pizzerias**

O **PizzaStockAI** é uma plataforma inteligente de gestão desenvolvida para pizzarias que desejam modernizar seus processos operacionais, reduzir desperdícios e tomar decisões orientadas por dados.

A solução integra **controle de estoque**, **gestão de vendas**, **análise financeira**, **dashboards executivos** e **previsão de demanda utilizando Machine Learning**, proporcionando uma visão completa do negócio em tempo real.

---

## 🚀 Visão Geral

Administrar uma pizzaria envolve diversos desafios operacionais:

- Ruptura de estoque durante horários de pico
- Compras sem planejamento
- Desperdício de ingredientes
- Falta de indicadores gerenciais
- Controle financeiro descentralizado
- Ausência de previsibilidade da demanda

O **PizzaStockAI** foi desenvolvido para resolver esses problemas por meio da integração entre dados operacionais, inteligência analítica e automação de processos.

---

## 🎯 Objetivos do Projeto

- Automatizar o controle de estoque
- Melhorar o planejamento de compras
- Reduzir desperdícios de insumos
- Centralizar a gestão operacional
- Apoiar a tomada de decisão com indicadores de negócio
- Aplicar Machine Learning para previsão de demanda

---

# ✨ Principais Funcionalidades

## 📦 Gestão Inteligente de Estoque

- Cadastro de ingredientes e insumos
- Controle de estoque mínimo
- Monitoramento de quantidades disponíveis
- Controle de validade dos produtos
- Registro de custos unitários
- Atualização automática após vendas
- Alertas de estoque crítico
- Análise de risco de ruptura

---

## 🍕 Cadastro de Pizzas e Receitas

Cada pizza cadastrada possui sua receita técnica vinculada.

### Recursos

- Cadastro de pizzas
- Cadastro de ingredientes por receita
- Controle de consumo por produto
- Cálculo automático de insumos utilizados
- Integração direta com o estoque

---

## 💰 Gestão de Vendas

O módulo de vendas registra e processa pedidos automaticamente.

### Funcionalidades

- Registro de vendas
- Histórico completo de pedidos
- Baixa automática dos ingredientes utilizados
- Controle de faturamento
- Apuração de custos
- Análise de lucratividade

---

## 📊 Dashboard Executivo

Dashboard analítico desenvolvido com Streamlit.

### Indicadores Monitorados

- Faturamento diário
- Faturamento semanal
- Faturamento mensal
- Faturamento anual
- Ticket médio
- Quantidade de pedidos
- Lucro operacional
- CMV (Custo da Mercadoria Vendida)
- Estoque crítico
- Produtos próximos ao vencimento

---

## ⚠️ Sistema Inteligente de Alertas

Motor de monitoramento responsável por identificar situações críticas no negócio.

### Alertas Disponíveis

#### Estoque Crítico

```text
Mussarela abaixo do estoque mínimo
Molho de tomate em nível crítico
```

#### Produtos Próximos ao Vencimento

```text
Tomate vence em 2 dias
Calabresa vence em 3 dias
```

#### Crescimento de Demanda

```text
Aumento significativo nas vendas da Pizza Calabresa
Necessidade de reposição antecipada
```

---

## 🤖 Inteligência Artificial

Um dos principais diferenciais do PizzaStockAI é seu módulo de análise preditiva.

### Capacidades do Modelo

- Previsão de vendas futuras
- Estimativa de demanda
- Planejamento de compras
- Sugestão de reposição de estoque
- Identificação de tendências de consumo
- Apoio à tomada de decisão baseada em dados

### Tecnologias Utilizadas

```text
Scikit-Learn
Linear Regression
NumPy
Pandas
```

---

# 👥 Controle de Usuários

O sistema possui autenticação JWT e controle de acesso baseado em perfis.

### Administrador

- Acesso total ao sistema
- Gestão de usuários
- Configurações gerais
- Relatórios completos

### Gerente

- Controle operacional
- Indicadores gerenciais
- Estoque e vendas
- Relatórios

### Atendente

- Registro de vendas
- Consulta de produtos
- Consulta de estoque

---

# 🏗 Arquitetura da Solução

```text
PizzaStockAI
│
├── backend/
│   ├── routers/
│   ├── services/
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   └── app.py
│
├── frontend/
│   ├── app_pages/
│   ├── assets/
│   ├── dashboard.py
│   ├── data.py
│   └── clock.py
│
├── ml/
│   ├── forecast.py
│   └── recommendation.py
│
├── database/
│   └── pizzastock.db
│
├── tests/
│
├── seed.py
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

---

# 🔄 Fluxo de Operação

```text
Venda Realizada
       │
       ▼
Consumo da Receita
       │
       ▼
Baixa Automática do Estoque
       │
       ▼
Atualização dos Indicadores
       │
 ┌─────┼─────────────┐
 ▼     ▼             ▼
KPIs Alertas     Machine Learning
 │     │             │
 ▼     ▼             ▼
Dashboard Executivo
```

---

# 🛠 Stack Tecnológica

## Backend

- Python 3.13+
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- Uvicorn

---

## Frontend

- Streamlit
- Plotly
- Pandas

---

## Machine Learning

- Scikit-Learn
- NumPy
- Pandas
- Linear Regression

---

## Banco de Dados

### Desenvolvimento

```text
SQLite
```

### Produção

```text
PostgreSQL
```

---

## DevOps

- Docker
- Docker Compose

---

# ⚙️ Instalação

## Clonando o Repositório

```bash
git clone https://github.com/Paulo68129/novo-repositorio.git

```

```bash
cd PizzaStockAI
```

---

## Criando Ambiente Virtual

### Windows

```powershell
python -m venv .venv
```

```powershell
.\.venv\Scripts\Activate.ps1
```

### Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

## Instalando Dependências

```powershell
pip install -r requirements.txt
```

---

## Carregando Dados Iniciais

```powershell
python seed.py
```

---

# ▶️ Executando o Sistema

## Iniciar Backend

```powershell
python -m uvicorn backend.app:app --reload --port 8000
```

### Endereços

```text
API:
http://localhost:8000
```

```text
Swagger:
http://localhost:8000/docs
```

```text
ReDoc:
http://localhost:8000/redoc
```

---

## Iniciar Dashboard

Abra um segundo terminal:

```powershell
streamlit run frontend/dashboard.py
```

A aplicação estará disponível em:

```text
http://localhost:8501
```

---

# 🔐 Usuários de Demonstração

## Administrador

```text
E-mail: admin@pizzastock.local
Senha: 123456
```

---

## Gerente

```text
E-mail: gerente@pizzastock.local
Senha: 123456
```

---

## Atendente

```text
E-mail: atendente@pizzastock.local
Senha: 123456
```

---

# 📡 API REST

## Autenticação

### Login

```http
POST /login
```

ou

```http
POST /auth/login
```

---

## Ingredientes

```http
GET    /ingredientes
POST   /ingredientes
PUT    /ingredientes/{id}
DELETE /ingredientes/{id}
```

---

## Pizzas

```http
GET  /pizzas
POST /pizzas
```

---

## Vendas

```http
GET  /vendas
POST /vendas
```

---

## Analytics

```http
GET /analytics
GET /analytics/completo
GET /analytics/previsoes
GET /analytics/recomendacoes
```

---

## Alertas

```http
GET /alertas
GET /analytics/alertas
```

---

## Health Check

```http
GET /health
```

Resposta:

```json
{
  "status": "ok",
  "service": "PizzaStockAI"
}
```

---

# 🧪 Testes

Executar todos os testes:

```powershell
pytest
```

Executar testes com mais detalhes:

```powershell
pytest -v
```

Estrutura atual:

```text
tests/
├── test_api.py
├── test_ml.py
└── test_sales_service.py
```

---

# 🐳 Docker

Subir todos os serviços utilizando Docker:

```powershell
docker compose up --build
```

Serviços disponíveis:

| Serviço | Porta |
|----------|---------|
| API | 8000 |
| Dashboard | 8501 |
| PostgreSQL | 5432 |

---

# 📈 Roadmap

## Curto Prazo

- [ ] Dashboard responsivo para dispositivos móveis
- [ ] Exportação PDF
- [ ] Exportação Excel
- [ ] Relatórios avançados
- [ ] Controle refinado de permissões

---

## Médio Prazo

- [ ] PostgreSQL como banco padrão
- [ ] Docker Compose completo
- [ ] API pública
- [ ] Integrações com ERPs

---

## Longo Prazo

- [ ] Aplicativo Mobile (Flutter)
- [ ] Integração com iFood
- [ ] Integração com WhatsApp Business
- [ ] Multi-Tenant SaaS
- [ ] IA Generativa para recomendações
- [ ] Modelos avançados de previsão

---

# 💡 Diferenciais Competitivos

✅ Gestão operacional centralizada

✅ Controle automático de estoque

✅ Indicadores financeiros em tempo real

✅ Sistema inteligente de alertas

✅ Dashboard executivo interativo

✅ Previsão de demanda baseada em Machine Learning

✅ API REST documentada com Swagger

✅ Pronto para PostgreSQL

✅ Pronto para Docker

✅ Arquitetura modular escalável

✅ Aplicação prática de IA para Food Service

---

# 👨‍💻 Autores

## Paulo Roberto Silva de Oliveira Júnior
## Samuel 
## João Daniel 
## Douglas Lopes 
## João 
## Gabriel 

**Desenvolvedor Full Stack**

🎓 Análise e Desenvolvimento de Sistemas

🔗 GitHub: https://github.com/Paulo68129/novo-repositorio.git

### Áreas de Interesse

- Desenvolvimento Backend
- Desenvolvimento Full Stack
- Inteligência Artificial
- Machine Learning
- Análise de Dados
- Sistemas de Gestão Empresarial

---

# 📄 Licença

Este projeto está licenciado sob a licença **MIT**.

Sinta-se livre para utilizar, estudar e contribuir para sua evolução.

---
