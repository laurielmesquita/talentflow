# Registro de mudança — Migração da API para Render Free

**Data:** 2026-08-24  
**Branch:** `feat/render-free-migration`  
**Status:** API validada no Render; troca do frontend pendente

## Contexto

O TalentFlow iniciou uma migração controlada da API do Fly.io para o plano gratuito do Render, com o objetivo de reduzir custos durante a fase de validação do produto. O Neon continua como banco PostgreSQL e o Cloudinary como storage.

## Implementação registrada

- Criado o Blueprint [`render.yaml`](../../render.yaml) para o Web Service Docker.
- Criado o script [`talentflow-api/start-render.sh`](../../talentflow-api/start-render.sh), que executa as migrações Alembic e inicia o Uvicorn na porta fornecida pelo Render.
- Adicionado o guia operacional [`DEPLOYMENT_RENDER_FREE.md`](../DEPLOYMENT_RENDER_FREE.md).
- Tornada idempotente a migração de unicidade de e-mail de candidatos, evitando falha quando um dos índices legados não existe.
- Configurado o serviço `talentflow-api-free` no Render, acompanhando a branch `feat/render-free-migration`.
- Preparado o frontend para o novo backend: a CSP aceita o domínio Render e a variável `NEXT_PUBLIC_API_URL` foi configurada na Vercel para Production e Preview.

## Validação realizada

- Deploy concluído com sucesso no Render.
- Migrações Alembic executadas durante a inicialização.
- Endpoint `/health` respondendo `200 OK`.
- Suíte local da API: `24 passed`.

URL temporária de validação: <https://talentflow-api-free.onrender.com>

## Incidentes e correções

1. O primeiro deploy terminou com status 127 porque o comando configurado era interpretado incorretamente pelo ambiente do Render.
2. O segundo deploy terminou com status 2 porque o operador `&&` foi passado como argumento ao Alembic.
3. O script de inicialização foi isolado em `start-render.sh`, eliminando a ambiguidade do comando.
4. A migração de índice foi ajustada para usar `DROP INDEX IF EXISTS`, permitindo a atualização em bases com estados legados diferentes.

## Decisão de rollout

O frontend ainda não aponta para o Render. O Fly.io permanece como fallback até a validação funcional de autenticação, cookies dual, isolamento multi-tenant, upload/PDF, IA, e-mail e Stripe. A troca de `NEXT_PUBLIC_API_URL` será registrada em mudança posterior, após aprovação do PO.

> A variável já está configurada na Vercel, mas a versão de produção só passará a utilizá-la quando a alteração da CSP for promovida para a branch de produção.

## Próximos passos

1. Executar a validação funcional completa da API no Render.
2. Apontar o frontend para a URL do Render e validar o fluxo ponta a ponta.
3. Confirmar estabilidade após o primeiro despertar da instância gratuita.
4. Desativar a máquina do Fly.io somente após aceite do rollout e revisar a situação de billing.
