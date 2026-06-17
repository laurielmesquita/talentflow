# TalentFlow: Funcionalidades e Arquitetura (Visão Técnica)

Esta documentação detalha a implementação técnica das funcionalidades do **TalentFlow**. A aplicação é estruturada como um monorepo contendo uma API RESTful assíncrona (FastAPI) e um painel de visualização SPA (Next.js v16).

---

## 1. Backend & IA (Data Ingestion Pipeline)
* **Arquitetura Assíncrona (FastAPI + Uvicorn):** Endpoints assíncronos que liberam o client imediatamente, integrando validação estrita e serialização via esquemas Pydantic.
* **Ingestão Híbrida de IA:**
  * **Groq API (Llama 3.3 70B):** Extração estruturada (JSON) em milissegundos para PDFs contendo texto nativo legível.
  * **Google Gemini API (2.5 Flash):** OCR nativo com `response_schema` rigoroso para análise e estruturação de imagens geradas a partir de PDFs escaneados (multimodal).
* **Extração Binária de Imagens (PyMuPDF / fitz):** Varredura no fluxo do PDF para isolar imagens de perfil do candidato e upload direto para o Cloudinary.
* **Controle de Duplicidade:** Checagem de integridade SHA-256 para arquivos idênticos e roteamento de versionamento por `parent_id` e controle de incremento em colisões de nomes.

---

## 2. Interface UI & Gestão de Estado (Frontend Next.js)
* **Interactive Expandable List (Vertical Inline):** Uso do framework **Framer Motion** (atributo `layout` com spring physics) para expansão vertical dinâmica e inline do card de candidato na própria lista (sem uso de drawers laterais ou popups externos).
* **Gestão de Temas OKLCH:** Uso do Tailwind v4 com espaço de cores perceptual OKLCH e `next-themes` para alternância de temas sem Hydration Mismatch no Next.js.
* **SVG Animado:** Componente `ScoreRing` animado via trigonometria (`strokeDashoffset`) para exibição visual do match e nota de qualidade.
* **Modais e Modos de Foco:** Modais integrados de confirmação de exclusão com verificação de texto (`EXCLUIR`) e telas de diff de conflito para resolução de cadastros existentes.

---

## 3. Engine de Match e Relacionamentos SQL
* **Smart Match Algorithm:** Interseção matemática no backend das strings de competências exigidas pela vaga com a tabela associativa de skills dos candidatos.
* **Persistência de Categorias & Exclusão Segura:** Deleção em cascata explícita na tabela associativa many-to-many `candidate_category` antes da remoção física do registro da categoria no banco.

---

## 4. Otimização de Performance
* **Eager Loading (Anti-N+1):** Uso de `selectinload` do SQLAlchemy nas rotas de listagem e de triagem, reduzindo consultas e latência de rede com a nuvem (Neon.tech) em mais de 70%.
* **measure_performance.py:** Utilitário de benchmark autônomo baseado em `TestClient` e escuta de eventos SQL (`before_cursor_execute`) para auditoria ativa de performance de endpoints.
