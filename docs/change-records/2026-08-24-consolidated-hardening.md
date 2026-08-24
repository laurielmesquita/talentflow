# Registro de evolução — Hardening e consolidação

**Data:** 2026-08-24
**Escopo:** API e Web
**Status:** pronto para validação em PR

## Objetivo

Consolidar correções que já estavam implementadas localmente e apresentavam maturidade suficiente para seguir como uma segunda linha de evolução após a fundação de qualidade da v2.5.0.

## API — segurança e confiabilidade

- Restringe filtros por categoria ao `tenant_id` atual nas consultas de candidatos.
- Impede o acesso ao PDF de candidatos arquivados ou excluídos.
- Sanitiza o nome usado no header `Content-Disposition` do PDF para evitar quebra de header.
- Remove cache público do PDF autenticado e utiliza headers privados/no-store.
- Garante filtro de tenant também na agregação de categorias do dashboard.
- Limita uploads públicos de candidatura a 10 MB, reduzindo risco de exaustão de memória no Fly.io.
- Adiciona idempotência em webhooks Stripe por `event_id`, com cache LRU limitado a 1.000 eventos.

## Web — consolidação estrutural

- Reutiliza os tipos canônicos de candidato, resposta de candidatos e categoria na página de candidatos.
- Remove componentes legados que não possuem referências ativas no código-fonte: cards/modais antigos, dashboard legado, logout standalone e providers de preset/design.

## Decisões e limites

- As alterações foram separadas da fundação de qualidade já integrada na `main`.
- Artefatos gerados pelo Graphify devem ser atualizados em uma etapa própria, caso o time decida versioná-los; não são tratados como código funcional neste registro.
- A idempotência em memória protege reentregas dentro do processo atual; não substitui uma deduplicação persistente caso a API passe a operar em múltiplas réplicas.

## Validação prevista

- Suíte API completa.
- Testes Web e build de produção.
- Busca de referências aos componentes removidos.
- Revisão do diff e checks do GitHub Actions antes do merge.
