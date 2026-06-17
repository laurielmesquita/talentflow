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
  <img alt="Languages" src="https://img.shields.io/badge/languages-TypeScript%20%2F%20Python-ff79c6?labelColor=282a36">
  <img alt="Code Style" src="https://img.shields.io/static/v1?label=code%20style&message=standard&color=f1fa8c&labelColor=282a36">
  <img alt="Project Type" src="https://img.shields.io/badge/project-monorepo-8be9fd?labelColor=282a36">
  <img alt="License" src="https://img.shields.io/static/v1?label=license&message=MIT&color=50fa7b&labelColor=282a36">
</p>

<p align="center">
  <img alt="Project Hero" src=".gitimg/hero.png" width="100%">
</p>

<br><br><br>

## 🚀 Tecnologias e Arquitetura (Design Engineering)

Este projeto foi estruturado sob o conceito de **Design Engineering**, unindo processamento backend robusto com uma interface visual de performance cirúrgica (60fps). 

### Backend, Infraestrutura & AI (Data Ingestion)
- **[FastAPI](https://fastapi.tiangolo.com)** — Framework web assíncrono em Python, ideal para fluxos pesados de I/O.
- **[Uvicorn](https://www.uvicorn.org)** — Servidor ASGI de altíssimo desempenho para execução local da API.
- **[Google Gemini API (2.5 Flash)](https://ai.google.dev)** — Modelo multimodal inteligente utilizado para OCR e extração estruturada de PDFs digitalizados/escaneados.
- **[Groq API (Llama 3.3 70B)](https://groq.com)** — Extração de dados estruturados em JSON de arquivos PDF com texto legível com baixíssima latência.
- **[Neon.tech (PostgreSQL)](https://neon.tech)** — Banco de dados relacional serverless hospedado em nuvem para persistência ágil.
- **[Alembic](https://alembic.sqlalchemy.org)** — Ferramenta de versionamento e controle de migrações para esquemas SQL.
- **[Fly.io](https://fly.io)** — Hospedagem automatizada e deploy contínuo em servidores distribuídos globalmente.

### Frontend & UI Experience (Camada de Visão)
- **[Next.js v16](https://nextjs.org) & [React v19](https://react.dev)** — Utilizando o *App Router* para isolamento estrito entre server/client components, assegurando performance no *First Contentful Paint*.
- **[Tailwind CSS v4](https://tailwindcss.com) (CSS-First)** — Todo o *Design System* foi refatorado para operar no espaço de cores perceptual **OKLCH**. Isso provê controle matemático sobre Luminância e Croma, blindando a UI contra *Gamut Clipping* no Dark Mode.
- **[Framer Motion](https://www.framer.com/motion/)** — Motor de física de mola (spring) do projeto. Substituímos tabelas estáticas por *Interactive Expandable Lists* usando o atributo `layout`. As tags surgem em *staggered cascates* para facilitar o *scanning* ocular do recrutador.
- **[Next-Themes](https://github.com/pacocoursey/next-themes)** — Gestão de *Dual-Theme* isolada no servidor/cliente sem disparar os temidos erros de *Hydration Mismatch*.

## 💻 Projeto

O **TalentFlow** é uma plataforma de triagem SaaS Tier-1 focada em otimização do pipeline de Recrutamento e Seleção (R&S). A aplicação foca na intersecção perfeita entre inteligência artificial e design fluido:
1. Elimina a triagem analógica ao ingerir currículos via simulação algorítmica e extração por IA.
2. Encanta o usuário através de uma interface tátil, adotando padrões visuais de **Bento UI** e **Glassmorphism**.

Dentro do modelo monorepo da aplicação, o fluxo de dados atua em dois blocos:
- **`talentflow-api/`**: Roda pipelines complexos através de *BackgroundTasks*, liberando o client imediatamente.
- **`talentflow-web/`**: Dashboard interativo. Não há tabelas mortas. O recrutador navega em cards elásticos com *Ambient Glows* de fundo, painéis modais integrados e anéis SVG animados via trigonometria (`ScoreRing`).

## ⚙️ Instalação

Siga os passos abaixo para fazer o *bootstrap* do ambiente local de desenvolvimento.

### Pré-requisitos
- Node.js 18+
- Python 3.11+
- String de conexão ao Neon.tech configurada no ambiente

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
> Edite o arquivo `.env` inserindo a string de conexão do Neon em `DATABASE_URL` e as chaves `GEMINI_API_KEY` e `GROQ_API_KEY`.

Configure o ambiente virtual de Python e instale as dependências:
```bash
python -m venv venv
source venv/bin/activate  # No Windows use: venv\Scripts\activate
pip install -r requirements.txt
```

Execute as migrações para inicializar a estrutura de tabelas do banco de dados:
```bash
alembic upgrade head
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

Com a venv ativa no diretório `talentflow-api`, execute a ingestão automatizada de arquivos PDF:
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
