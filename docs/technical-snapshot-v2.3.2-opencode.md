# Snapshot Técnico & Seed de Transição — TalentFlow v2.3.2 (Handover OpenCode)

> **Documento de continuidade de estado (Seed) para transição para o OpenCode.**
> Data de emissão: 04 de Agosto de 2026

---

## 1. Identidade & Estado da Versão

| Atributo | Estado Atual |
| :--- | :--- |
| **Versão do Produto** | **2.3.2 (Debug do PDF Viewer & Handover OpenCode)** |
| **Status dos Testes** | 🟢 12/12 Pytest (API) \| 🟢 6/6 Vitest (Web) \| 🟢 0 erros TypeScript |
| **Repositório GitHub** | `github.com/laurielmesquita/talentflow` (Branch: `main`) |
| **Deploy API** | Fly.io — `talentflow-api.fly.dev` (Região `gru`) |
| **Deploy Web** | Vercel — `tlntflow.vercel.app` |
| **Ambiente Local** | API em `localhost:8000` \| Web em `localhost:3000` |

---

## 2. Mapa do Conhecimento (Graphify Engine Status)

A base de grafos de conhecimento em `05-Projetos/graphify-out/` está **100% sincronizada**:

- **Total de Nós (Nodes):** `767`
- **Conexões (Edges):** `1.074`
- **Comunidades Mapeadas:** `76`
- **Arquivos Mapeados:** 138 arquivos de código (`talentflow-api` + `talentflow-web`)
- **Arquivos de Grafo:** `graph.json`, `graph.html` e `GRAPH_REPORT.md`

---

## 3. Diagnóstico em Andamento: Falha na Exibição do PDF (Iframe em Branco)

### A. Sintoma Observado
No componente `CandidateAuditWorkspace.tsx` (`/candidates/:id/audit` ou modal side-by-side), o painel esquerdo "Documento Original" carrega o container do `PDFViewer.tsx`, mas a área do `iframe` permanece **totalmente em branco**.

### B. Mapeamento da Arquitetura Envolvida
1. **Frontend (`talentflow-web`):**
   - File: [`src/components/PDFViewer.tsx`](./talentflow-web/src/components/PDFViewer.tsx)
   - Monta a URL: `${API_URL}/api/candidates/${candidateId}/pdf?token=${authToken}`
   - Lê o token via `getCookie("token")`.
2. **Backend (`talentflow-api`):**
   - File: [`app/api/candidates.py`](./talentflow-api/app/api/candidates.py) (endpoint `GET /api/candidates/{candidate_id}/pdf`)
   - File: [`app/api/deps.py`](./talentflow-api/app/api/deps.py) (`get_current_user` aceita `?token=`)
   - Consome Cloudinary via `cloudinary.utils.private_download_url` e faz streaming do buffer do PDF.

### C. Hipóteses de Causa Raiz a Auditar no OpenCode
1. **CSP / X-Frame-Options (`next.config.ts`):** O header de Content Security Policy ou `X-Frame-Options` no Next.js pode estar bloqueando a renderização de subrecursos da API dentro do `iframe`.
2. **Token Race Condition / Hydration (`PDFViewer.tsx`):** `getCookie("token")` é executado no `useEffect`, gerando renderização inicial do `iframe` com a URL sem o parâmetro `?token=`, o que dispara 401/403 na API antes do token ser injetado.
3. **CORS / Range Headers na FastAPI:** Resposta do endpoint `/pdf` sem cabeçalhos `Access-Control-Allow-Origin` ou suporte a `Accept-Ranges: bytes` exigidos pelos renderizadores nativos de PDF dos navegadores (PDF.js / Chromium PDF Viewer).

---

## 4. Backlog Prioritário para a Sessão no OpenCode

1. **Resolver o PDF Viewer:** Investigar os logs do console do navegador e da FastAPI (`localhost:8000`), ajustando a renderização no `PDFViewer.tsx` e permissões de iframe no `next.config.ts`.
2. **Refatoração de Escala do PDF (v2.4.0):** Evoluir o Proxy Pass-Through para **Cloudinary Signed URLs com TTL de 15 minutos**, delegando a entrega de banda para a CDN e reduzindo o consumo de RAM do container no Fly.io.

---

## 5. Prompt Seed para o OpenCode (Copiar & Colar)

```text
Olá! Estou continuando o desenvolvimento do TalentFlow no OpenCode. 
Por favor, consulte o manifesto de arquitetura AGENTS.md em 05-Projetos/ e o Snapshot Técnico v2.3.2 em 05-Projetos/docs/technical-snapshot-v2.3.2-opencode.md. 
A base de dados do Graphify em 05-Projetos/graphify-out/graph.json está 100% atualizada. 

Estamos investigando um bug onde o iframe do PDFViewer.tsx fica em branco no painel side-by-side ao tentar consumir /api/candidates/{id}/pdf.
Vamos analisar os logs, a política de CSP/cookies e resolver esse problema!
```
