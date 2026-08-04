# Snapshot Técnico & Seed de Transição — TalentFlow v2.3.1

> **Documento de continuidade de estado (Seed) para novo chat.**
> Data de emissão: 04 de Agosto de 2026

---

## 1. Identidade & Estado da Versão

| Atributo | Estado Atual |
| :--- | :--- |
| **Versão do Produto** | **2.3.1 (Auditoria Side-by-Side & Proxy PDF Assinado)** |
| **Status dos Testes** | 🟢 12/12 Pytest (API) \| 🟢 6/6 Vitest (Web) \| 🟢 0 erros TypeScript |
| **Repositório GitHub** | `github.com/laurielmesquita/talentflow` (Branch: `main` - Commit `0a59029` / `d09f793`) |
| **Deploy API** | Fly.io — `talentflow-api.fly.dev` (Região `gru`) |
| **Deploy Web** | Vercel — `tlntflow.vercel.app` |
| **Ambiente Local** | API em `localhost:8000` \| Web em `localhost:3000` |

---

## 2. Mapa do Conhecimento (Graphify Engine Status)

A base de grafos de conhecimento em `05-Projetos/graphify-out/` foi **100% atualizada e sincronizada** com todas as alterações recentes de código:

- **Total de Nós (Nodes):** `767`
- **Conexões (Edges):** `1.074`
- **Comunidades Mapeadas:** `76`
- **Arquivos Mapeados:** 138 arquivos de código (`talentflow-api` + `talentflow-web`)
- **Arquivos de Grafo:** `graph.json`, `graph.html` e `GRAPH_REPORT.md`

---

## 3. Principais Alterações Implementadas (v2.3.0 & v2.3.1)

### A. Backend (`talentflow-api`)
1. **Endpoint Proxy Inline de PDF (`GET /api/candidates/{candidate_id}/pdf`):**
   - Consome arquivos privados do Cloudinary gerando URLs assinadas autenticadas via `cloudinary.utils.private_download_url`.
   - Transmite os bytes brutos do PDF com `Content-Type: application/pdf`, `Content-Disposition: inline` e cabeçalhos de CORS liberados.
2. **Autenticação em Subrecursos Cross-Origin ([deps.py](./talentflow-api/app/api/deps.py)):**
   - Função `get_current_user` atualizada para aceitar o token JWT também via parâmetro de consulta (`?token=...`), contornando o bloqueio de cookies de terceiros em iframes no Safari.

### B. Frontend (`talentflow-web`)
1. **Workspace de Auditoria Side-by-Side (`CandidateAuditWorkspace.tsx`):**
   - Layout de 50% split view em tela cheia comparando a análise estrutural da IA (score de 0 a 100, omissões, skills e linha do tempo) com o PDF original do candidato.
2. **Visualizador Resiliente ([PDFViewer.tsx](./talentflow-web/src/components/PDFViewer.tsx)):**
   - Consome a rota proxy da API com injeção do token JWT do cliente (`?token=${authToken}`).
3. **Sintaxe CSS em Globals ([globals.css](./talentflow-web/src/app/globals.css)):**
   - Corrigida a declaração de `@keyframes` em modo escuro para conformidade estrita com o Turbopack/PostCSS no Next.js 16.

---

## 4. Backlog Prioritário para o Novo Chat

1. **Refatoração de Escala do PDF (v2.4.0):**
   - Evoluir o Proxy Pass-Through para **Cloudinary Signed URLs com TTL de 15 minutos**, delegando a entrega de banda para a CDN e reduzindo o consumo de memória RAM do container no Fly.io.
2. **Próximas Features do PO:**
   - Novas funcionalidades e evoluções de produto a serem solicitadas pelo usuário.

---

## 5. Prompt Seed para o Novo Chat (Copiar & Colar)

```text
Olá! Estou iniciando um novo chat para continuar o desenvolvimento do TalentFlow. 
Por favor, consulte o manifesto de arquitetura AGENTS.md em 05-Projetos/ e o Snapshot Técnico v2.3.1 em 05-Projetos/docs/technical-snapshot-v2.3.1.md. 
A base de dados do Graphify em 05-Projetos/graphify-out/graph.json está 100% atualizada (767 nós, 1074 conexões). 
Estou pronto para as próximas demandas!
```
