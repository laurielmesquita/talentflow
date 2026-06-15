# TalentFlow

> Motor de triagem inteligente de currículos com ingestão via LLM (Gemini) e Smart Match de vagas.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16 (App Router), TailwindCSS, TypeScript |
| Backend | FastAPI (Python), SQLAlchemy, Uvicorn |
| Banco de dados | PostgreSQL 15 (Docker) |
| IA / Ingestão | Google Gemini 2.0 Flash (Structured Output) |

## Estrutura do Monorepo

```
05-Projetos/
├── talentflow-web/     # Frontend Next.js
└── talentflow-api/     # Backend FastAPI + Ingestor de PDFs
```

## Setup Local

### Pré-requisitos
- Docker Desktop
- Node.js 18+
- Python 3.11+

### 1. Backend

```bash
cd talentflow-api

# Crie o arquivo de variáveis de ambiente
cp .env.example .env
# Edite .env com sua GEMINI_API_KEY

# Suba o banco de dados
docker-compose up -d

# Instale dependências e inicie a API
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API disponível em: `http://localhost:8000`
Documentação interativa: `http://localhost:8000/docs`

### 2. Frontend

```bash
cd talentflow-web
npm install
npm run dev
```

Frontend disponível em: `http://localhost:3000`

### 3. Ingestão de Currículos

```bash
# Com a venv ativa e o banco rodando:
cd talentflow-api
python ingest.py /caminho/para/pasta/com/pdfs
```

## Features (MVP)

- [x] Ingestão de PDFs via Gemini (Structured Output)
- [x] Banco de Talentos com listagem e modal de perfil
- [x] Smart Match — cruza skills do candidato com requisitos da vaga
- [x] Filtro por Categoria (via URL query param)
- [x] Upload em Lote via UI (POST /api/upload com BackgroundTasks)
- [ ] Foto do candidato extraída do PDF
- [ ] Dashboard com métricas e KPIs
