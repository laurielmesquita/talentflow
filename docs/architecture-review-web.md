TALENTFLOW-WEB

2025-08-02

Architecture Review

Análise do frontend Next.js 16 — App Router, Tailwind v4, Framer Motion, Shadcn/ui. O projeto não possui

CONTEXT.md, ADRs, testes ou CI/CD. As sugestões abaixo focam em criar profundidade nos módulos

existentes: transformar interfaces grandes em interfaces pequenas com muita alavancagem por trás.

25 componentes · 14 rotas · ~5.8K linhas TSX · 2 arquivos lib · 0 testes

Extrair primitivos de UI compartilhados

Strong

locality

JobsDashboard.tsx

JobsListDashboard.tsx

JobDetailView.tsx

CategoriesDashboard.tsx

ANTES — 4 IMPLEMENTAÇÕES IDÊNTICAS

DEPOIS — PRIMITIVO ÚNICO

DeleteModal

×4

Toast

×3

formatListText

×4

JobsDashboard

contém

DeleteModal 'EXCLUIR'

ui/DeleteConfirmDialog

JobsListDashboard

contém

DeleteModal 'EXCLUIR'

usado por

JobsDashboard

usado por

JobsListDashboard

usado por

JobDetailView

usado por

CategoriesDashboard

JobDetailView

contém

DeleteModal 'EXCLUIR'

ui/DeleteConfirmDialog.tsx — modal de confirmação

CategoriesDashboard

contém

DeleteModal 'EXCLUIR'

"Digite EXCLUIR"

ui/Toast.tsx + useToast — feedback efêmero unificado

lib/formatting.ts — formatListText / renderTextOrList

Problema: Três padrões de UI são re-implementados de forma idêntica em 4 componentes. O
modal de exclusão (digitar "EXCLUIR" para confirmar) aparece em  JobsDashboard ,
JobsListDashboard ,  JobDetailView  e  CategoriesDashboard  — 4 cópias da mesma lógica de estado,
confirmação de texto, e UI do modal. O mesmo para o sistema de toast e os helpers de formatação
de texto.

Solução: Extrair  ui/DeleteConfirmDialog.tsx  com props mínimas ( isOpen ,  itemName ,  onConfirm ,
onClose ). Criar  useToast  hook via contexto React. Mover helpers de formatação para
lib/formatting.ts .

deletion test: deletar as 4 cópias do DeleteModal → a complexidade some; extrair para um lugar

→ surge leverage

locality: mudanças no design do modal de exclusão são feitas em 1 arquivo, não 4

depth: interface de 4 props substitui ~80 linhas de estado + JSX em cada consumidor

~320 linhas removidas do código total

Centralizar tipos de domínio

Strong

types

JobsDashboard.tsx

JobFormDrawer.tsx

CandidateTable.tsx

CandidateModal.tsx

+ 5 outros

ANTES — INTERFACES REPETIDAS

DEPOIS — FONTE ÚNICA DE VERDADE

Job (10 campos)
Definido em: JobsDashboard, JobsListDashboard,

types/job.ts

SmartMatchDashboard, JobDetailView, JobFormDrawer

└─ Job, JobFormData, JobStatus

Candidate (~15 campos)
Definido em: CandidateTable, CandidateModal,

CandidateCard — todos como any

Category (2 campos)
Definido em: CategoriesDashboard,

SearchAndFilters — como { id, name }

types/candidate.ts

└─ Candidate, CandidateStats,
CandidateConflictPayload

types/category.ts

└─ Category

types/index.ts

└─ barrel export

Problema: A interface  Job  (10 campos: id, slug?, title, description, location, employment_type,
work_model, responsibilities, requirements, benefits, application_email, etc.) está copiada em 5
arquivos. Qualquer mudança no schema da API exige editar 5 arquivos. Candidatos são tipados
como  any  em todos os componentes que os consomem — o TypeScript não oferece nenhuma
segurança para o domínio central da aplicação.

src/types/ com um arquivo por entidade de domínio. Exportar as interfaces e importá-las nos
componentes. Substituir  any  por tipos reais em CandidateTable, CandidateModal,
CandidateCard.

deletion test: deletar a definição de Job de JobsDashboard — o código quebra até

redefinir localmente

locality: mudança no campo slug de opcional para obrigatório → editar 1 arquivo, não 5

interface profunda: types/ é um módulo com ~80 linhas de definições e 0 complexidade

para o consumidor

testabilidade: tipos centralizados permitem testar mocks de API com confiança de que os

dados batem o contrato

Auditoria de tokens de cor semânticos

Strong

design-system

CandidateModal.tsx

ConflictModal.tsx

JobsDashboard.tsx

globals.css:268

ANTES — CORES QUEBRADAS NO DARK
MODE

DEPOIS — TOKENS QUE FUNCIONAM

slate-900 → preto no dark mode

bg-card → adapta ao tema

slate-200 → branco no dark mode

border-border → adapta ao tema

emerald-550 → não existe no Tailwind

text-emerald-400 → classe válida

--primary
literal

→ keyframes ignoram
tokens

var(--
primary)

→ keyframe referência CSS
var

Problema: O sistema de design define tokens semânticos em  globals.css  (bg-background,
text-foreground, border-border) e proíbe cores literais no AGENTS.md. Mas vários
componentes quebram essa regra:  CandidateModal  usa  slate-900  /  slate-200 ;  ConflictModal
usa classes inexistentes como  emerald-550 ; a animação  new-candidate-glow  hardcoda
oklch(0.42 0.195 280)  em vez de referenciar  var(--primary) . No dark mode, cores literais não
se adaptam — um componente que parece correto no light mode vira ilegível no dark.

Solução: Auditoria mecânica: substituir todas as ocorrências de  slate-* ,  indigo-* ,  rose-*
pelos equivalentes semânticos do design system. Corrigir classes inválidas ( emerald-550  →
emerald-500 ). Substituir cores hardcoded em  @keyframes  por referências a variáveis CSS.

bug visível: usuários de dark mode veem componentes quebrados

locality: o contrato "sempre usar tokens" vive no globals.css; violações são bugs, não

opiniões

leverage: uma mudança na paleta de cores se propaga para todos os componentes que

usam tokens

ferramenta: grep por  slate-  nos arquivos TSX encontra todas as violações de uma vez

Extrair camada de data fetching

Worth exploring

locality

dashboard/page.tsx

candidates/page.tsx

jobs/page.tsx

smart-match/page.tsx

categories/page.tsx

ANTES — FETCH DUPLICADO

// dashboard/page.tsx:28-44

async function getJobs(token) {

  const res = await fetch(`/api/jobs`, {

    headers: { Authorization: ... },

    cache: 'no-store'

  })

}

DEPOIS — MÓDULO ÚNICO

lib/data/jobs.ts

export async function getJobs(token) { ... }

// usado por dashboard, jobs, smart-match

lib/data/candidates.ts

export async function getCandidates(...) { ... }

lib/data/categories.ts

// ↓ idêntico em smart-match/page.tsx:28-44

// ↓ idêntico em jobs/page.tsx

// getCategories idêntico em candidates + categories

export async function getCategories(token) { ... }

Problema: Funções de fetch para a API são copiadas entre múltiplas páginas.  getJobs  é
idêntica em dashboard, jobs, e smart-match (~15 linhas cada).  getCategories  é idêntica em
candidates e categories.  getPublicJob  é chamada duas vezes (page + generateMetadata) na
rota vagas/[slug] sem deduplicação. O tratamento de erro é inconsistente — algumas páginas
redirecionam no 401, outras retornam array vazio.

src/lib/data/ com uma função por endpoint da API. Centralizar leitura de token e
tratamento de 401 em um lugar. Next.js 16 oferece  fetch  com deduplicação automática
no mesmo render — extrair as funções ativa esse comportamento.

deletion test: deletar getJobs de smart-match — o código quebra; extrair para

lib/data/ — a função persiste com 3 consumidores

locality: mudança no header de auth ou na URL base da API → 1 arquivo, não 5

deduplicação: Next.js deduplica fetch calls idênticos no mesmo request — vaga/[slug]

para de fazer 2 chamadas

consistência: todas as páginas tratam 401 da mesma forma

Quebrar componentes monolíticos

Worth exploring

locality

CandidateTable (641L)
+ 4 outros >300L

DashboardClient (537L)

ConflictModal (536L)

JobsDashboard (512L)

ANTES — GOD OBJECTS

CandidateTable

DashboardClient

ConflictModal

JobsDashboard

JobDetailView

JobFormDrawer

DEPOIS — COMPOSIÇÃO

CandidateTable (orquestrador)

CandidateRow

PaginationBar

useCandidates

Interfaces menores por peça, orquestrador enxuto que

compõe

8 componentes com mais de 300 linhas misturando UI,
estado, API calls, formatação, e animações

Problema: Oito componentes ultrapassam 300 linhas e misturam responsabilidades:
renderização de UI, chamadas de API, gerenciamento de estado local, formatação de
texto, animações, e lógica de navegação. O  CandidateTable  (641L) contém paginação,
expansão inline, fetch lazy de detalhes, flag/unflag, deleção, polling de progresso de
upload, e renderização de ScoreRing — tudo em um arquivo.

CandidateRow (linha expansível),  PaginationBar ,  BatchProgressOverlay . Mover chamadas
de API para hooks customizados:  useCandidates ,  useJobs . Manter o componente original
como orquestrador de 80-120 linhas que compõe as peças.

locality: bug na paginação → CandidateTable/PaginationBar.tsx (~60L), não

CandidateTable (641L)

depth: cada subcomponente tem interface de 3-5 props e implementação focada

testabilidade: PaginationBar pode ser testado isoladamente sem mock de API

risco: refator grande — começar pelo CandidateTable e iterar

Substituir window.CustomEvent por mecanismo

Speculative

seam

explícito

BatchUploadButton.tsx

CandidateTable.tsx

ANTES — ACOPLAMENTO IMPLÍCITO

DEPOIS — CONTRATO EXPLÍCITO

BatchUploadButton

window

CandidateTable

dispatchEvent('candidates-processing-progress')

Evento flutuante — ninguém garante que CT está montado

listener recebe evento

atualiza UI de progresso

UploadContext.Provider

dispatch

subscribe

BatchUploadButton

window

CandidateTable

BatchUploadButton

CandidateTable

Se CandidateTable não está montado, eventos disparam
para o vazio.

React Context como barramento — contrato tipado, sem
window global.

Problema:  BatchUploadButton  dispara progresso de upload via  window.dispatchEvent(new
CustomEvent('candidates-processing-progress', ...)) .  CandidateTable  ouve esse evento global
com  window.addEventListener . Esse acoplamento é implícito: não há garantia em tempo de
compilação de que o listener existe, não há tipagem para o payload do evento, e se um
dos componentes não estiver montado, o evento é perdido.

UploadContext com React Context que expõe  { progress, status, errors } .
BatchUploadButton  escreve no contexto;  CandidateTable  lê. O contrato é tipado e a árvore
React garante que ambos compartilham o mesmo provider.

mark as Speculative: o mecanismo atual não causa bugs em produção; a troca adiciona

complexidade

seam: UploadContext criaria uma costura onde o progresso de upload pode ser

injetado em qualquer consumidor

hoje: 1 produtor, 1 consumidor — custo do Context pode não se pagar

gatilho: reavaliar quando houver 3+ consumidores de estado de upload

Tratamento consistente de autenticação

Worth exploring

auth

middleware.ts

api.ts

dashboard/page.tsx

jobs/page.tsx

categories/page.tsx

ANTES — 401 TRATADO DE 3 FORMAS

dashboard

DEPOIS — UM CAMINHO

redirect('/login') ✓

candidates
retorna array vazio ✗

jobs, smart-match, categories
retorna array vazio ✗

api.ts (global)
window.location.href = '/login' (client)

Página Server

fetch

lib/data/*

401

redirect('/login')

Client Component

fetch

apiFetch

401

window.location.href='/login'

Server: lib/data trata 401. Client: apiFetch trata 401.

Consistente em ambos os lados.

Problema: O middleware protege as rotas, mas após o carregamento inicial, páginas
fazem fetch com token do cookie. Se o token expirou entre o middleware e o fetch, o
comportamento do 401 é inconsistente:  dashboard  redireciona para /login, enquanto
candidates ,  jobs ,  smart-match , e  categories  retornam arrays vazios silenciosamente. O
usuário vê uma página sem dados e não sabe que foi deslogado.

lib/data/ (ver card 4) com tratamento uniforme de 401: redirecionar via  next/navigation .
No client-side, o  apiFetch  já trata 401 — garantir que todos os componentes usem
apiFetch em vez de fetch direto.

bug sutil: usuário com token expirado vê página vazia em vez de ser redirecionado

consistência: 401 é sempre tratado da mesma forma, seja server ou client

depende do card 4: a camada lib/data/ é pré-requisito para centralizar o tratamento

server-side

middleware é complementar: protege a primeira carga; lib/data protege os fetches

seguintes

RECOMENDAÇÃO PRINCIPAL

Auditar tokens de cor semânticos

É o problema com maior impacto imediato: usuários de dark mode veem componentes

quebrados. A correção é mecânica e de baixo risco — substituir classes slate-* por

tokens semânticos em ~6 arquivos. Diferente dos outros candidatos, não é um refactor

arquitetural — é um bug de implementação que viola o contrato do próprio design

system documentado no AGENTS.md. Resolver isso primeiro estabelece disciplina de

tokens que facilita todos os refactors seguintes.

Segundo lugar: Extrair primitivos de UI compartilhados — elimina ~320 linhas de
código duplicado e cria os blocos de construção que os refactors de componentes
monolíticos vão precisar.


