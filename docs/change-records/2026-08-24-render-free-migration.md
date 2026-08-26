# Registro de mudança — Migração da API para Render Free

**Data:** 2026-08-24  
**Branch:** `feat/render-free-migration`  
**Status:** Migração concluída; API Render e frontend Vercel em produção

## Contexto

O TalentFlow migrou a API do Fly.io para o plano gratuito do Render, com o objetivo de reduzir custos durante a fase de validação do produto. O Neon continua como banco PostgreSQL e o Cloudinary como storage.

## Implementação registrada

- Criado o Blueprint [`render.yaml`](../../render.yaml) para o Web Service Docker.
- Criado o script [`talentflow-api/start-render.sh`](../../talentflow-api/start-render.sh), que executa as migrações Alembic e inicia o Uvicorn na porta fornecida pelo Render.
- Adicionado o guia operacional [`DEPLOYMENT_RENDER_FREE.md`](../DEPLOYMENT_RENDER_FREE.md).
- Tornada idempotente a migração de unicidade de e-mail de candidatos, evitando falha quando um dos índices legados não existe.
- Configurado o serviço `talentflow-api-free` no Render, acompanhando a branch `main`.
- Preparado o frontend para o novo backend: a CSP aceita o domínio Render e a variável `NEXT_PUBLIC_API_URL` foi configurada na Vercel para Production e Preview.
- Desativado o disparo automático do workflow de deploy do Fly.io; o fallback permanece disponível apenas por execução manual.

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

O frontend de produção aponta para o Render, com CSP compatível e variáveis configuradas na Vercel. O Fly.io está parado e permanece apenas como fallback manual. A validação autenticada completa continua como melhoria operacional, sem bloquear a operação pública atual.

> O workflow do Fly.io foi mantido como fallback manual para impedir que o merge acione novos deploys ou reabra a cobrança operacional automaticamente.

## Próximos passos

1. Executar a validação funcional autenticada com uma conta de teste controlada.
2. Monitorar o primeiro despertar da instância gratuita após inatividade.
3. Regenerar os artefatos do Graphify quando o executável estiver disponível.
