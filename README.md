<h1 align="center">
    <img alt="Project Logo" title="Project Logo" src=".gitimg/logo.png" width="220px" />
</h1>

<p align="center">
  <a href="#-tecnologias">Tecnologias</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-projeto">Projeto</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-instalação">Instalação</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-licença">Licença</a>
</p>

<p align="center">
  <a href="https://github.com/laurielmesquita">
    <img alt="Made by Space Square" src="https://img.shields.io/static/v1?label=made%20by&message=Space%20Square&color=bd93f9&labelColor=282a36">
  </a>
  <img alt="Top Language" src="https://img.shields.io/github/languages/top/laurielmesquita/talentflow?color=ff79c6&labelColor=282a36">
  <img alt="Code Style" src="https://img.shields.io/static/v1?label=code%20style&message=standard&color=f1fa8c&labelColor=282a36">
  <img alt="Repository Size" src="https://img.shields.io/github/repo-size/laurielmesquita/talentflow?color=8be9fd&labelColor=282a36">
  <img alt="License" src="https://img.shields.io/static/v1?label=license&message=MIT&color=50fa7b&labelColor=282a36">
</p>

<p align="center">
  <img alt="Project Hero" src=".gitimg/hero.png" width="100%">
</p>

<br><br><br>

## 🚀 Tecnologias

Este projeto foi construído sobre uma Stack de alta performance, utilizando as seguintes tecnologias:

- [FastAPI](https://fastapi.tiangolo.com) — Framework web em Python de alto desempenho para APIs modernas.
- [Next.js](https://nextjs.org) — Framework React com suporte a renderização no servidor (SSR) e otimizações nativas.
- [PostgreSQL](https://www.postgresql.org) — Banco de dados relacional robusto para armazenar dados estruturados de candidatos e vagas.
- [Docker](https://www.docker.com) — Conteinerização do banco de dados para garantir portabilidade e reprodutibilidade do ambiente.
- [Google Gemini API](https://ai.google.dev) — Processamento inteligente de documentos não estruturados (PDFs) para extração determinística via `response_schema`.
- [TailwindCSS](https://tailwindcss.com) — Framework CSS utilitário para estilização premium e responsiva.

## 💻 Projeto

O **TalentFlow** é uma plataforma inteligente voltada para otimização do pipeline de recrutamento e seleção (R&S). Ele resolve o gargalo histórico de triagem manual ao extrair dados de arquivos PDF (currículos) de forma estruturada e automatizada através do modelo **Gemini 2.0 Flash**, calculando dinamicamente a aderência do perfil frente aos requisitos das vagas publicadas (*Smart Match*).

Desenvolvido sob uma arquitetura de monorepo estruturado, o TalentFlow possui:
- **`talentflow-api/`**: API de alta performance em Python rodando processos pesados de leitura e upload assíncronos (via FastAPI `BackgroundTasks`).
- **`talentflow-web/`**: Interface administrativa responsiva de altíssimo nível visual (dark mode, glassmorphism e micro-interações) integrada nativamente via rotas dinâmicas do Next.js.

## ⚙️ Instalação

Siga os passos abaixo para fazer o *bootstrap* do ambiente local de desenvolvimento.

### Pré-requisitos
- Docker Desktop rodando
- Node.js 18+
- Python 3.11+

### 📂 Estrutura de Diretórios
```text
talentflow/
├── talentflow-web/     # Frontend Next.js (Porta 3000)
└── talentflow-api/     # Backend FastAPI + DB (Porta 8000)
```

---

### 1️⃣ Inicialização do Backend & Banco de Dados

Navegue até a pasta da API:
```bash
cd talentflow-api
```

Crie o arquivo de variáveis de ambiente:
```bash
cp .env.example .env
```
> [!IMPORTANT]
> Edite o arquivo `.env` inserindo sua `GEMINI_API_KEY` para habilitar a ingestão assistida por IA.

Suba o container do banco de dados PostgreSQL via Docker Compose:
```bash
docker-compose up -d
```

Configure o ambiente virtual de Python e instale as dependências:
```bash
python -m venv venv
source venv/bin/activate  # No Windows use: venv\Scripts\activate
pip install -r requirements.txt
```

Execute o servidor local de desenvolvimento da API:
```bash
uvicorn app.main:app --reload --port 8000
```
- A API estará ativa em `http://localhost:8000`
- Acesse a documentação interativa Swagger UI em `http://localhost:8000/docs`

---

### 2️⃣ Inicialização do Frontend

Em um novo terminal, acesse a pasta do client:
```bash
cd talentflow-web
```

Instale as dependências e inicie o servidor do Next.js:
```bash
npm install
npm run dev
```
- A aplicação web estará disponível no endereço `http://localhost:3000`

---

### 3️⃣ Ingestão Automatizada de Currículos

Com o banco de dados rodando e a venv ativa no diretório `talentflow-api`, execute a ingestão automatizada de arquivos PDF:
```bash
python ingest.py /caminho/para/diretorio/de/curriculos
```

## 🤝 Como Contribuir

1. Faça o *fork* deste repositório
2. Crie uma *branch* para a sua *feature* (`git checkout -b feature/minha-feature`)
3. Faça o *commit* das suas alterações (`git commit -m 'feat: minha nova feature'`)
4. Faça o *push* para a *branch* (`git push origin feature/minha-feature`)
5. Abra um *Pull Request*

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes estruturais.

---
<br>
<p align="center">
  <img alt="May the Code Review be with you" src=".gitimg/code_review.png" />
</p>
