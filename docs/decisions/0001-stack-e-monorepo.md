# ADR-0001 — Stack e organização do monorepo

- Status: aceito
- Data: 2026-08-27
- Proprietário: Space Square / TalentFlow

## Contexto

O TalentFlow precisa manter uma API multi-tenant e um frontend web evoluindo em conjunto, com documentação e automação próximas do código. A execução também exige contratos claros de autenticação, persistência e deploy.

## Decisão

Manter um monorepo com `talentflow-api/`, `talentflow-web/` e `docs/`. A API usa FastAPI, SQLAlchemy, Alembic e PostgreSQL; o frontend usa Next.js, React, Tailwind e Framer Motion. A documentação versionada permanece próxima do código e organizada por arquitetura, produto, design, operações, decisões e registros de mudança.

## Alternativas consideradas

- Separar API e frontend em repositórios independentes.
- Manter decisões e procedimentos exclusivamente em ferramentas externas ao Git.
- Misturar documentação operacional, comercial e arquitetural em um único README.

## Consequências

- Mudanças de código e documentação podem ser revisadas no mesmo pull request.
- O monorepo exige disciplina de ownership e links relativos para evitar documentação órfã.
- Informações sensíveis ou específicas de ambiente não devem ser versionadas.

## Referências

- [`AGENTS.md`](../../../AGENTS.md)
- [`README.md`](../../README.md)
