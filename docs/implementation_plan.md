# Plano de Ação: Review Estruturado de Arquitetura (TalentFlow API & Web)

Este plano estabelece a metodologia para a revisão técnica dos dois relatórios de arquitetura convertidos para Markdown em [`05-Projetos/docs/`](file:///Users/laurielmesquita/Space%20Square/02-Customers/TalentFlow/05-Projetos/docs/):
- [`architecture-review-api.md`](file:///Users/laurielmesquita/Space%20Square/02-Customers/TalentFlow/05-Projetos/docs/architecture-review-api.md)
- [`architecture-review-web.md`](file:///Users/laurielmesquita/Space%20Square/02-Customers/TalentFlow/05-Projetos/docs/architecture-review-web.md)

---

## Directriz de Validação
A revisão de arquitetura confrontará as observações do desenvolvedor externo com as premissas arquiteturais fundamentais estabelecidas no `AGENTS.md` (ex: isolamento multi-tenant via `get_scoped_db`, arquitetura dual-cookie de autenticação, ingestão concorrente limitada no Fly.io).

---

## Fases de Execução do Review

### Fase 1: Síntese e Extração de Apontamentos
- **API (`talentflow-api`):** Leitura cirúrgica de `architecture-review-api.md` categorizando críticas sobre rotas, ORM (SQLAlchemy 2.x), falta de testes, acoplamento de serviços e resiliência de infraestrutura.
- **Web (`talentflow-web`):** Leitura de `architecture-review-web.md` levantando pontos sobre Next.js 16 App Router, React 19, componentes de UI, gerenciamento de estado e Edge Middleware.

### Fase 2: Auditoria Cruzada com o Codebase Real
- Confrontar as fraquezas citadas nos documentos com a implementação atual em `05-Projetos/talentflow-api/` e `05-Projetos/talentflow-web/`.
- Identificar se os apontamentos representam:
  1. **Débitos Técnicos Reais** (ex: falta de suíte de testes / CI/CD).
  2. **Decisões de Design Intencionais** (ex: arquitetura Dual-Cookie devido a limitações do Next.js Edge Middleware).

### Fase 3: Matriz de Priorização e ROI Técnico
Classificar todos os pontos identificados em uma matriz de esforço x impacto:
- **P0 (Crítico):** Vulnerabilidades de segurança, falhas no isolamento multi-tenant ou gargalos de concorrência.
- **P1 (Alto Impacto):** Refatorações de código cruciais (separação de rotas/serviços), adição de testes de regressão e pipelines de CI/CD.
- **P2 (Melhoria Contínua):** Ajustes de DX, padronização de logs e pequenas otimizações de bundle frontend.

### Fase 4: Apresentação Executiva & Alinhamento de Decisões
- Apresentar o diagnóstico consolidado item a item ao PO (Lauriel), indicando para cada ponto: *O problema descrito*, *A validação no código real*, *A solução recomendada* e *O esforço estimado*.
- Consolidar as decisões tomadas no roadmap técnico do produto.
