# TalentFlow API ⚙️

O motor de inteligência e ingestão de dados do **TalentFlow**. Construído sobre o framework assíncrono **FastAPI**, este serviço é responsável por orquestrar a leitura, extração e persistência estruturada de currículos e gerenciamento de vagas.

---

## 🏗 Arquitetura e Engenharia de Dados

### 1. Stack Base
- **FastAPI:** Framework web moderno em Python para construção de APIs REST de alta performance, com suporte nativo a operações assíncronas (`async/await`) e validação de dados automática via Pydantic.
- **Uvicorn:** Servidor ASGI de altíssimo desempenho para execução do FastAPI.
- **Neon.tech (PostgreSQL):** Banco de dados relacional serverless na nuvem com pooling de conexões otimizado.
- **Alembic:** Engine leve de migrações e controle de versão do esquema SQL.
- **Google Gemini 2.5 Flash:** O núcleo de processamento cognitivo multimodal. Utilizado para analisar PDFs escaneados (imagens) e extrair JSON determinístico via *structured outputs* (`response_schema`).
- **Groq API (Llama 3.3 70B):** Responsável por processar e estruturar currículos com texto legível em milissegundos.
- **Fly.io:** Plataforma em nuvem para empacotamento e deploy automatizado da API.

### 2. Ingestão de Dados e IA
- O pipeline de triagem detecta a legibilidade do PDF (pdfplumber) e delega a extração (OCR) ao Gemini 2.5 Flash apenas quando necessário. Currículos de texto puro usam a Groq para máxima velocidade.
- O sistema calcula dinamicamente um *Quality Score* e um *Quality Tier* (High, Medium, Low) baseado na precisão e densidade dos dados vitais do candidato, mapeando "Alertas de Qualidade" para currículos incompletos.
- **Carregamento Otimizado (Eager Loading):** As rotas de listagem de candidatos e triagem de vagas utilizam carregamento antecipado via `selectinload` no SQLAlchemy para erradicar o problema de consultas N+1, reduzindo a latência do banco de dados em mais de 70%.

---

## 🛠 Scripts de Operação Interna

- **`ingest.py`**: O script core de extração em lote. Varre um diretório local contendo arquivos `.pdf`, processa a extração semântica com o modelo LLM e injeta os registros de forma limpa no banco de dados.
- **`measure_performance.py`**: Script de benchmark autônomo. Faz chamadas de teste nos endpoints utilizando o `TestClient` e escuta eventos do SQLAlchemy (`before_cursor_execute`) para monitorar o número de queries disparadas e latências (P50, P95, P99).
- **`backfill_quality_score.py`**: Rotina de *Data Engineering* desenvolvida para varrer a base de dados existente e aplicar a modelagem algorítmica de Scores de Qualidade retrospectivamente em candidatos antigos.
- **`seed_jobs.py`**: Script para popular vagas de teste (ex: Técnico em Eletrônica) na base de dados.
- **`seed.py`**: Script de inicialização rápida para popular tabelas de domínio estático (Categorias).

---

## 🚀 Guia de Desenvolvimento (Setup Local)

### 1. Requisitos
- **Python 3.11+**
- String de conexão ao Neon.tech configurada no `.env`

### 2. Configurando o Ambiente
Copie o template de chaves ambientais e configure as chaves do Neon, Gemini e Groq:
```bash
cp .env.example .env
```

### 3. Engine Python e Dependências
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Executando as Migrações
```bash
alembic upgrade head
```

### 5. Executando o Servidor
```bash
uvicorn app.main:app --reload --port 8000
```
A arquitetura OpenAPI gera documentação Swagger UI automaticamente em `http://localhost:8000/docs`.

---

## 🚢 Setup de Deploy
O projeto está configurado para *deployment* imediato na plataforma **Fly.io** através da integração declarada no arquivo de configuração `fly.toml` em harmonia com o empacotamento definido no `Dockerfile` e automatizado pela GitHub Action `fly-deploy.yml`.
