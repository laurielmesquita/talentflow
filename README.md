# TalentFlow — SaaS Tier-1 de Triagem Inteligente

<p align="center">
  <a href="https://github.com/laurielmesquita">
    <img alt="Made by Space Square" src="https://img.shields.io/static/v1?label=made%20by&message=Space%20Square&color=bd93f9&labelColor=282a36">
  </a>
  <img alt="Languages" src="https://img.shields.io/badge/languages-TypeScript%20%2F%20Python-ff79c6?labelColor=282a36">
  <img alt="Code Style" src="https://img.shields.io/static/v1?label=code%20style&message=standard&color=f1fa8c&labelColor=282a36">
  <img alt="Project Type" src="https://img.shields.io/badge/project-monorepo-8be9fd?labelColor=282a36">
  <img alt="License" src="https://img.shields.io/static/v1?label=license&message=MIT&color=50fa7b&labelColor=282a36">
</p>

O **TalentFlow** é uma plataforma de triagem SaaS Tier-1 desenhada para otimizar o fluxo de Recrutamento e Seleção (R&S). A aplicação une inteligência artificial de ponta, processamento de dados robusto e design visual de alta performance baseada em conceitos de **Design Engineering**.

---

## 🚀 Tecnologias e Arquitetura (Design Engineering)

### Backend, Infraestrutura & IA (Data Ingestion Pipeline)
* **[FastAPI](https://fastapi.tiangolo.com)** — Framework web assíncrono de altíssimo desempenho em Python, ideal para fluxos pesados de I/O de arquivos.
* **[Uvicorn](https://www.uvicorn.org)** — Servidor ASGI de alta performance para execução local da API.
* **[Google Gemini API (2.5 Flash)](https://ai.google.dev)** — Modelo multimodal inteligente utilizado para OCR estruturado e análise de PDFs escaneados ou imagens.
* **[Groq API (Llama 3.3 70B)](https://groq.com)** — Modelo de LLM com baixíssima latência para extração estruturada de dados textuais e geração de justificativas em português.
* **[Neon.tech (PostgreSQL)](https://neon.tech)** — Banco de dados relacional serverless hospedado em nuvem com alta escalabilidade.
* **[Cloudinary](https://cloudinary.com)** — Armazenamento seguro e processamento de imagens faciais de perfil dos candidatos.
* **[Alembic](https://alembic.sqlalchemy.org)** — Ferramenta para versionamento e migrações estruturais do banco de dados relacional.
* **[Fly.io](https://fly.io)** — Plataforma para hosting e deploy automatizado do backend em servidores globais.
* **[Bcrypt & PyJWT](https://pyjwt.readthedocs.io)** — Cifragem de credenciais (bcrypt) e controle de sessões JWT criptografados com HMAC-SHA256.
* **[Brevo SMTP](https://www.brevo.com)** — Servidor SMTP transacional integrado para disparos de e-mails de onboarding (expiração de 7 dias) e redefinição de senha (expiração de 2 horas) com criptografia TLS.

### Frontend & UI Experience (Camada de Visão)
* **[Next.js v16](https://nextjs.org) & [React v19](https://react.dev)** — Utilização do *App Router* para isolamento estrito entre Server e Client Components.
* **[Tailwind CSS v4](https://tailwindcss.com) (CSS-First)** — Design System baseado no espaço de cores perceptual **OKLCH**, eliminando gamut clipping em gradientes no Dark Mode.
* **[Framer Motion](https://www.framer.com/motion/)** — Motor de física de molas (spring) do projeto, alimentando transições e expansão inline elástica de cards.
* **[21st.dev](https://21st.dev)** — Referência e inspiração principal para injeção de componentes e micro-interações na UI.
* **[Base UI](https://base-ui.com)** — Componentes headless focados em acessibilidade (WAI-ARIA).
* **[Next-Themes](https://github.com/pacocoursey/next-themes)** — Gestão de dual-theme no servidor/cliente sem disparar erros de Hydration Mismatch.

---

## ⚙️ Arquitetura de Destaque no Repositório

1. **SaaS Multi-Tenant (B2B):**
   * Isolamento lógico rigoroso de dados corporativos em todas as tabelas baseado em chave estrangeira `tenant_id`.
   * Prevenção de vazamento de dados via dependência `get_scoped_db` no FastAPI, que injeta queries pré-filtradas por tenant no SQLAlchemy.
   * Suporte a tags e competências homônimas entre clientes através de uma restrição de unicidade composta do PostgreSQL: `UniqueConstraint('tenant_id', 'name')`.
2. **Ingestão Concorrente Segura:**
   * Envio assíncrono controlado por `BackgroundTasks` no FastAPI.
   * Controle de concorrência com semáforo (`asyncio.Semaphore(3)`) para proteger os 512MB de memória da máquina de produção da Fly.io contra estouros.
3. **Smart Match & Warm Path Cache:**
   * Interseção matemática rápida de competências e justificativa em português via IA (Llama 3.3 com fallback Gemini).
   * Persistência de resultados na tabela `job_matches` atuando como cache, reduzindo o tempo de consulta subsequente para menos de 50ms (*Warm Path*).
   * Invalidação inteligente de cache ao atualizar vagas ou candidatos.
4. **Segurança e RBAC na Edge:**
   * Proteção de rotas privadas via middleware de borda do Next.js (Edge Middleware).
   * Decodificação e filtragem de perfil baseadas no payload JWT na borda sem bater no banco de dados.

---

## 📂 Estrutura do Monorepo

```text
talentflow/
├── talentflow-web/     # Frontend Next.js v16 & Tailwind v4 (Porta 3000)
└── talentflow-api/     # Backend FastAPI & SQLAlchemy (Porta 8000)
```

Para uma documentação detalhada sobre regras e conceitos, consulte:
* [Funcionalidades & Diferenciais (Visão Comercial)](./docs/features_business.md)
* [Funcionalidades & Arquitetura (Visão Técnica)](./docs/features_technical.md)
* [Resumo de Funcionalidades](./docs/features_summary.md)
* [Technical Snapshot & Post-Mortem](./docs/technical-snapshot.md)

---

## ⚙️ Instalação e Execução Local

### 1️⃣ Inicialização do Backend & Banco de Dados
Acesse o diretório da API:
```bash
cd talentflow-api
```

Copie as variáveis de ambiente de exemplo:
```bash
cp .env.example .env
```

> [!IMPORTANT]
> Configure as variáveis no `.env` com a string do banco de dados Neon (`DATABASE_URL`), as chaves de API (`GEMINI_API_KEY`, `GROQ_API_KEY`), chaves Cloudinary (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`), e credenciais SMTP Brevo (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`).

Ative o ambiente virtual e instale as dependências:
```bash
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Rode as migrações do banco de dados:
```bash
alembic upgrade head
```

Inicialize o servidor FastAPI de desenvolvimento local:
```bash
uvicorn app.main:app --reload --port 8000
```
* API ativa em: `http://localhost:8000`
* Documentação interativa Swagger UI em: `http://localhost:8000/docs`

---

### 2️⃣ Inicialização do Frontend
Em um novo terminal, acesse a pasta web:
```bash
cd talentflow-web
```

Instale as dependências e rode o servidor local de desenvolvimento (Turbopack):
```bash
npm install
npm run dev
```
* Dashboard ativo em: `http://localhost:3000`

---

### 3️⃣ Ingestão Automatizada por Script CLI
Com o backend rodando e ambiente virtual ativo em `talentflow-api`, execute a ingestão em lote via linha de comando:
```bash
python ingest.py /caminho/para/diretorio/de/curriculos
```
