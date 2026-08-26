# Technical Snapshot — TalentFlow v2.5.0
**Gerado em:** 2026-08-26 · **Sessão:** Migração Render Free concluída após v2.5.0
**Status do Projeto:** v2.5.0 (estável; API no Render e frontend Vercel em produção)

---

## 1. Stack & Arquitetura Atual

```
Frontend:  Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Framer Motion 12 · Vitest & Testing Library
           └── Edge Proxy: src/proxy.ts · Camadas: src/types/ · src/lib/data/ · src/test/
Backend:   FastAPI (Python 3.11) · Uvicorn · uv (PEP 621 — pyproject.toml & uv.lock) · Pytest & httpx
           └── Governança: app/services/features.py (Feature Flags) · Schemas: app/schemas/
DB:        PostgreSQL 15 via Neon.tech (serverless, sa-east-1)
Storage:   Cloudinary (fotos de perfil e PDFs) — proxy autenticado via signed URLs
AI:        Groq API (Llama 3.3 70B) · Google Gemini 2.5 Flash (OCR)
Auth:      PyJWT + Bcrypt · Dual-Cookie (HttpOnly API + Non-HttpOnly Edge) · ?token= cross-origin
Deploy:    Vercel (web: tlntflow.vercel.app) · Render (API: talentflow-api-free.onrender.com) · Fly.io (fallback parado)
Repo:      github.com/laurielmesquita/talentflow.git
Versão:    2.5.0
```

---

## 2. Novas Funcionalidades (desde a v2.4.0)

### 🚀 Serviço Proxy de PDF & Workspace de Auditoria
1. **Endpoint `GET /api/candidates/{id}/pdf`:** Proxy autenticado que consome PDFs do Cloudinary via `cloudinary.utils.private_download_url`, com streaming `Content-Type: application/pdf`, `Content-Disposition: inline`, CORS liberado e Cache-Control de 24h.
2. **Configuração `CLOUDINARY_URL` (`config.py`):** `@model_validator` extrai automaticamente `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` e `CLOUDINARY_API_SECRET` do formato `cloudinary://key:secret@name`.
3. **Autenticação Cross-Origin (`deps.py`):** `get_current_user` aceita token JWT via `?token=` query parameter como terceira fonte de auth, essencial para iframes no Safari.
4. **`PDFViewer.tsx`:** Componente de iframe cross-origin com injeção automática de token, gating anti-race condition (`tokenReady`), leitura de cookie pós-SSR (`useEffect`), e `key={proxyPdfUrl}` para remount seguro.
5. **`CandidateAuditWorkspace.tsx`:** Tela cheia split 50/50 (PDF original vs IA), navegação em lote, ações de approve/flag integradas.
6. **CSP (`next.config.ts`):** `frame-src` atualizado com `http://localhost:8000` para dev local, mantendo `https:` para produção.
7. **Deploy Fly.io:** `primary_region` alterada de `gru` para `dfw` (Dallas) devido a falta de capacidade em São Paulo.
8. **Render Free em produção:** API publicada na `main`, frontend Vercel apontando para o Render e health check respondendo `200 OK`; Fly.io permanece parado como fallback manual.

### 📚 Consolidação Documental
9. **READMEs:** Adicionadas seções de destaque do Workspace de Auditoria e Proxy PDF nos READMEs da API e Web.
10. **Features Docs:** Documentadas 10 seções técnicas anteriormente ausentes: Candidatura Pública com OTP, Billing Stripe, Governança de Feature Flags, Sandbox Rate Limiting, Divergence Detection, Slug Generation, Job Lookup, Audit Log, entre outras.
11. **AGENTS.md:** Reconstruída tabela completa de endpoints (35, não 23), adicionados 6 services + 2 schemas, 16 componentes frontend + 3 rotas + 5 libs/types, removidos 5 phantoms documentais.
12. **CHANGELOG:** Adicionado entry `[2.4.0]` consolidando todas as funcionalidades implementadas desde a v2.3.0.

---

## 3. Backlog Prioritário para v2.5.0

- [ ] **Extração do `CandidateService`:** Decompor `app/api/candidates.py` em serviço dedicado.
- [ ] **Otimização da Árvore de Versões:** Substituir a query `db.query(Candidate).all()` por busca recursiva direcionada por `parent_id`.
- [ ] **Modal de Exclusão Único para Vagas:** Generalizar `DeleteConfirmModal.tsx` para aceitar `itemName` e substituir as implementações inline restantes.

---

## 4. Diretrizes de Governança (`AGENTS.md`)

- **Multi-Tenancy:** Toda query no backend DEVE obrigatoriamente usar `get_scoped_db`.
- **Dual-Cookie Auth:** Manter cookies síncronos (HttpOnly API + Non-HttpOnly Edge).
- **Conventional Commits:** Todas as alterações de repositório devem ser registradas de forma atômica por escopo.
