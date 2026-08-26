# TalentFlow API ⚙️

O motor de inteligência e ingestão de dados do **TalentFlow**. Construído sobre o framework assíncrono **FastAPI**, este serviço é responsável por orquestrar a leitura, extração e persistência estruturada de currículos e gerenciamento de vagas.

---

## 📦 Serviço Proxy de PDF

O endpoint `GET /api/candidates/{candidate_id}/pdf` permite que o frontend exiba currículos originais diretamente no navegador via iframe, sem expor URLs privadas do Cloudinary:

1. **Recuperação Autenticada:** Extrai o `public_id` do Cloudinary da URL armazenada no banco e gera uma **URL assinada** via `cloudinary.utils.private_download_url`
2. **Streaming Seguro:** Transmite os bytes brutos do PDF com `Content-Type: application/pdf`, `Content-Disposition: inline` e `Access-Control-Allow-Origin: *`
3. **Cache de 24h:** Resposta com `Cache-Control: public, max-age=86400, stale-while-revalidate=3600`
4. **Autenticação Cross-Origin:** Suporte a `?token=` query parameter para iframes em domínios diferentes (contorna bloqueio de cookies de terceiros no Safari)
5. **Fallback Robusto:** Se a URL assinada falhar, tenta download direto com User-Agent de navegador

---

## 🏗 Arquitetura e Engenharia de Dados

### 1. Stack Base
- **FastAPI:** Framework web moderno em Python para construção de APIs REST de alta performance, com suporte nativo a operações assíncronas (`async/await`) e validação de dados automática via Pydantic.
- **Uvicorn:** Servidor ASGI de altíssimo desempenho para execução do FastAPI.
- **Neon.tech (PostgreSQL):** Banco de dados relacional serverless na nuvem com pooling de conexões otimizado.
- **Alembic:** Engine leve de migrações e controle de versão do esquema SQL.
- **Google Gemini 2.5 Flash:** O núcleo de processamento cognitivo multimodal. Utilizado para analisar PDFs escaneados (imagens) e extrair JSON determinístico via *structured outputs* (`response_schema`).
- **Groq API (Llama 3.3 70B):** Responsável por processar e estruturar currículos com texto legível em milissegundos.
- **Render Free:** Ambiente principal da API durante a fase de maturação do produto.
- **Fly.io:** Ambiente anterior, parado e reservado apenas para fallback manual.

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
- **`purge_tenants.py`**: Executor manual da purga permanente de tenants cuja carência venceu; aceita `--dry-run` e exige `--confirm` para apagar.

### Organização e encerramento

- `POST /api/tenant/owner`: Owner transfere a titularidade para outro Manager ou Super Admin ativo, mediante senha atual.
- `GET /api/tenant/closure`: consulta o estado e informa se o usuário autenticado é o Owner.
- `POST /api/tenant/closure`: Owner agenda o encerramento com senha atual e a confirmação literal `ENCERRAR ORGANIZAÇÃO`.
- `DELETE /api/tenant/closure`: Owner cancela um encerramento pendente dentro da carência de 30 dias.

Organizações legadas sem Owner são reparadas pela migração `6c1d2e3f4a50`, que prioriza um `Manager` ativo e, quando não existe Manager, associa o único `SuperAdmin` ativo.

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

### 3. Gerenciamento com `uv` (PEP 621)
```bash
# Sincronizar o ambiente e criar venv automaticamente com uv:
uv sync

# Para adicionar novos pacotes:
uv add <nome-do-pacote>
```

### 4. Executando a Bateria de Testes Automatizados (`pytest`)
```bash
# Executar a suíte de testes unitários e de integração:
uv run pytest
```

### 5. Executando as Migrações
```bash
uv run alembic upgrade head
```

### 6. Executando o Servidor Localmente
```bash
uv run uvicorn app.main:app --reload --port 8000
```
A arquitetura OpenAPI gera documentação Swagger UI automaticamente em `http://localhost:8000/docs`.

---

## 🚢 Setup de Deploy

O ambiente principal usa o Render Free, configurado por [`render.yaml`](../render.yaml), com raiz `talentflow-api`, Dockerfile existente, health check em `/health` e inicialização por [`start-render.sh`](./start-render.sh). Consulte [`docs/DEPLOYMENT_RENDER_FREE.md`](../docs/DEPLOYMENT_RENDER_FREE.md) para o procedimento operacional.

O Fly.io permanece parado como fallback operacional manual, descrito em `fly.toml` e na GitHub Action `fly-deploy.yml`. O merge na `main` não dispara o Fly.io.
