# Guia Completo de Git, Commits & Deploy — TalentFlow

> **Manual de operações Git e pipelines de CI/CD em Produção (Render, Fly.io & Vercel).**
> Data da última atualização: 24 de Agosto de 2026

---

## 1. Visão Geral da Pipeline de CI/CD

O TalentFlow utiliza uma arquitetura de deploy contínuo **baseada em disparos automáticos via GitHub**:

```text
Commit & Push na branch `main` (GitHub)
       │
       ├──► Frontend (Next.js): Vercel Deployment (Automático via webhook Vercel-GitHub)
       └──► Backend (FastAPI): Render Free (`main`) · Fly.io (fallback manual parado)
```

---

## 2. Passo a Passo Completo para Salvar & Subir Alterações (Git Workflow)

### Passo 1: Verificar o Estado dos Arquivos
Navegue até a raiz de projetos (`05-Projetos/`):
```bash
cd "05-Projetos"
git status
```

### Passo 2: Adicionar os Arquivos ao Stage
Você pode adicionar todos os arquivos modificados e os documentos da alteração atual:
```bash
git add .
```
Ou selecionar cirurgicamente:
```bash
git add talentflow-web/next.config.ts talentflow-web/src/components/PDFViewer.tsx docs/architecture/technical-snapshot.md
```

### Passo 3: Criar o Commit Seguindo a Convenção de Nomenclatura
```bash
git commit -m "fix(pdf-viewer): remove race condition em token jwt e atualiza csp para iframe local"
```

### Passo 4: Fazer o Push para o Repositório Remoto (GitHub)
```bash
git push origin main
```

---

## 3. Monitoramento dos Deploys em Produção

Após o merge na `main`, a Vercel inicia o deploy do frontend automaticamente e o Render acompanha a `main` para a API principal. O Fly.io não é acionado automaticamente.

### A. Frontend (Vercel)
- **URL de Produção:** `https://tlntflow.vercel.app`
- **Dashboard de Acompanhamento:** [vercel.com](https://vercel.com)
- **Tempo estimado de build:** ~45 a 60 segundos (Next.js 16 + Turbopack).

### B. Backend principal (Render Free)
- **URL da API:** `https://talentflow-api-free.onrender.com`
- **Branch:** `main`
- **Health check:** `/health`
- **Observação:** o frontend de produção já utiliza esta API; alterações devem ser validadas no preview antes do merge.

### C. Backend fallback manual parado (Fly.io)
- **URL da API:** `https://talentflow-api.fly.dev`
- **Deploy:** somente via `workflow_dispatch` em `.github/workflows/fly-deploy.yml`; o merge na `main` não dispara o Fly.io.
- **Acompanhar Logs em Tempo Real (via CLI):**
  ```bash
  cd talentflow-api
  fly logs
  ```
- **Status da Aplicação no Fly.io:**
  ```bash
  fly status
  ```

---

## 4. Deploys Manuais de Emergência (Se a pipeline falhar)

### A. Deploy Manual do Backend fallback (Fly.io)
Se precisar forçar o deploy da API no fallback sem passar pelo GitHub Actions:
```bash
cd talentflow-api
fly deploy
```

### B. Deploy Manual do Frontend (Vercel)
Se precisar forçar o deploy do Web via CLI:
```bash
cd talentflow-web
vercel --prod
```

---

## 5. Padrão de Mensagens de Commit (Conventional Commits)

| Prefixo | Uso | Exemplo |
| :--- | :--- | :--- |
| `feat(scope):` | Nova funcionalidade de produto | `feat(candidates): adiciona filtro por qualidade de IA` |
| `fix(scope):` | Correção de bug ou falha técnica | `fix(pdf-viewer): corrige iframe em branco e race condition` |
| `perf(scope):` | Otimização de performance ou memória | `perf(api): adiciona selectinload para evitar N+1 queries` |
| `docs:` | Atualização de documentação ou snapshots | `docs: adiciona snapshot v2.3.2 para handover` |
| `chore:` | Manutenção de dependências ou build configs | `chore(deps): atualiza pacotes no pyproject.toml` |
