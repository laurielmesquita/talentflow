# Documentação do TalentFlow

Esta pasta contém a documentação versionada que acompanha o código do monorepo. Ela é fonte de referência para engenharia, produto, design e operações; não substitui a documentação pública de uso do produto nem deve armazenar segredos.

## Mapa rápido

| Área | Conteúdo |
| --- | --- |
| [`architecture/`](./architecture/) | Revisões, visão técnica e comportamento estrutural do sistema |
| [`product/`](./product/) | Funcionalidades, regras e visão comercial |
| [`design/`](./design/) | Sistema visual, moodboards e presets de interface |
| [`operations/`](./operations/) | Deploy, workflow Git e procedimentos operacionais |
| [`decisions/`](./decisions/) | Decisões arquiteturais permanentes (ADRs) |
| [`change-records/`](./change-records/) | Registros datados de mudanças e incidentes |

## Regras de manutenção

- Toda documentação nova deve pertencer a uma dessas áreas e ser ligada a partir desta página.
- Cada documento deve declarar seu propósito, público, proprietário e data da última revisão.
- Alterações de código que mudem comportamento, contrato, operação ou decisão arquitetural devem atualizar a documentação no mesmo pull request.
- Documentos de decisão aprovados são imutáveis; uma nova decisão deve registrar a substituição da anterior.
- Conteúdo temporário, rascunhos e notas de trabalho ficam fora desta pasta ou em uma branch, não na documentação oficial.
- Nunca versionar segredos, tokens, credenciais, dumps de dados ou instruções que dependam de valores sensíveis.
- Relatórios de auditoria devem indicar escopo, data e status (aberto, mitigado ou encerrado).

## Convenção de revisão

Documentos vivos devem manter no início um bloco simples:

```text
Proprietário: equipe ou pessoa responsável
Status: ativo | obsoleto | arquivado
Última revisão: AAAA-MM-DD
Próxima revisão: AAAA-MM-DD (quando aplicável)
```

O README do monorepo aponta os documentos essenciais; esta página é o índice completo da documentação técnica versionada.

## Inventário e responsabilidade

| Área | Proprietário padrão | Status | Revisão |
| --- | --- | --- | --- |
| Arquitetura | Engenharia | Ativo; revisar a cada mudança estrutural | Pull request que altera arquitetura |
| Produto | Produto/PO | Ativo; revisar a cada mudança de comportamento | Pull request de funcionalidade |
| Design | Design/Frontend | Ativo; revisar a cada mudança visual | Pull request de UI |
| Operações | DevOps/Engenharia | Ativo; revisar a cada alteração de infraestrutura | Antes de cada deploy |
| Decisões | Engenharia + PO | Imutável após aprovação | Novo ADR quando a decisão mudar |
| Change records | Autor da mudança | Histórico | No momento da entrega |
