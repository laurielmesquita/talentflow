# TalentFlow API ⚙️

O motor de inteligência e ingestão de dados do **TalentFlow**. Construído sobre o framework assíncrono **FastAPI**, este serviço é responsável por orquestrar a leitura, extração e persistência estruturada de dezenas de currículos simultaneamente através da **Gemini API**.

---

## 🏗 Arquitetura e Engenharia de Dados

### 1. Stack Base
- **FastAPI:** Framework web moderno para construção de APIs REST de alta performance, com suporte nativo a operações assíncronas (`async/await`) e validação de dados automática via Pydantic.
- **PostgreSQL:** Persistência relacional estruturada e robusta.
- **SQLAlchemy & Alembic:** ORM de alta flexibilidade para consultas e engine de migrações estruturais do banco de dados.
- **Google Gemini 2.0 Flash:** O núcleo de processamento cognitivo. Utilizado para analisar arquivos PDF não-estruturados e extrair JSON determinístico via *structured outputs* (`response_schema`).

### 2. Ingestão de Dados e IA
- O pipeline principal de triagem delega a extração pesada (leitura de texto e estruturação via Gemini) para evitar sobrecarga.
- O sistema calcula dinamicamente um *Quality Score* e um *Quality Tier* (High, Medium, Low) baseado na precisão e densidade dos dados vitais do candidato, mapeando automaticamente "Alertas de Qualidade" para currículos incompletos.

---

## 🛠 Scripts de Operação Interna

- **`ingest.py`**: O script core de extração em lote. Varre um diretório local contendo arquivos `.pdf`, processa a extração semântica com o modelo LLM e injeta os registros de forma limpa no banco de dados.
- **`backfill_quality_score.py`**: Rotina de *Data Engineering* desenvolvida para varrer a base de dados existente e aplicar a modelagem algorítmica de Scores de Qualidade retrospectivamente em candidatos antigos.
- **`seed.py`**: Script de inicialização rápida para popular tabelas de domínio estático (Categorias).

---

## 🚀 Guia de Desenvolvimento (Setup Local)

### 1. Requisitos
- **Python 3.11+**
- **Docker e Docker Compose** (para provisionar o Postgres isolado).

### 2. Configurando o Ambiente
Copie o template de chaves ambientais e injete sua `GEMINI_API_KEY`:
```bash
cp .env.example .env
```

### 3. Provisionando o Banco de Dados
Levante o container via Docker Compose (operação em detached mode):
```bash
docker-compose up -d
```

### 4. Engine Python e Dependências
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 5. Executando o Servidor Fast
```bash
uvicorn app.main:app --reload --port 8000
```
A arquitetura OpenAPI gera documentação tátil automaticamente em `http://localhost:8000/docs`.

---

## 🚢 Setup de Deploy
O projeto está configurado (*Infrastructure as Code*) para *deployment* imediato na plataforma **Fly.io** através da integração declarada no arquivo de configuração `fly.toml` em harmonia com o empacotamento definido no `Dockerfile`.
