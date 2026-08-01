# Guia de Troubleshooting: Resolução de Tarefas Travadas e `manage_task`

> **Documentação Operacional — Antigravity & TalentFlow**
> Foco: Resolução de congelamentos na interface do Antigravity e gerenciamento de tarefas em segundo plano.

---

## 1. O Que É o `manage_task`

O **`manage_task`** é a ferramenta nativa de governança e ciclo de vida de processos em segundo plano do **Google Antigravity**. Ela permite mapear, monitorar e interromper tarefas assíncronas geradas por execuções de terminal (`run_command`).

---

## 2. Diagnóstico Técnico do Travamento na UI

### Causa Raiz
Quando uma instrução de terminal é executada em segundo plano, o daemon do Antigravity cria um trabalhador registrado em:
`~/.gemini/antigravity/brain/<session_id>/.system_generated/tasks/`

Se o processo no sistema operacional terminar sem que a camada de interface (web/Electron) capture o evento de encerramento (`exit 0`), ocorre uma **desincronização de estado (State Leak)**:
* A interface congela os cards no widget **"X tasks running"**.
* Novas mensagens enviadas pelo usuário entram em **"Queued Messages"** (modo de espera), exigindo confirmação manual para o envio.

---

## 3. Como Solicitar a Limpeza ao Agente

Caso o painel de tarefas volte a congelar no futuro, utilize qualquer um dos prompts abaixo para instruir o agente a limpar os processos:

### Prompts Recomendados:

```text
"Antigravity, use a ferramenta manage_task para listar e cancelar todas as tarefas em segundo plano ativas."
```

```text
"Force o encerramento de todos os processos travados no gerenciador de tarefas via manage_task kill."
```

```text
"Liste as tarefas com manage_task list e rode manage_task kill em cada ID pendente para limpar a UI."
```

---

## 4. Fluxo de Execução Interno do Agente

Ao receber o pedido de limpeza, o agente executa a seguinte sequência:

1. **Mapeamento de IDs (`manage_task list`):** Identifica todas as tarefas assíncronas registradas na sessão (ex: `task-21`, `task-33`).
2. **Disparo de Cancelamento (`manage_task kill`):** Emite o sinal de interrupção forçada (`kill`) para cada tarefa mapeada.
3. **Drenagem do Loop de Eventos (*Event Loop Drain*):** O barramento de eventos notifica a sessão do cancelamento e destrói o componente visual travado na interface.
