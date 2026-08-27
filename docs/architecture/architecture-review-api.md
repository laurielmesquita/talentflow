Análise Arquitetural — TalentFlow API

talentflow-api · 2 agosto 2026

módulo

seam

vazamento

módulo profundo

Análise focada nos módulos de API do monorepo TalentFlow. Monorepo com  talentflow-web/  (Next.js 16)

e  talentflow-api/  (FastAPI + SQLAlchemy 2.x síncrono). 0% de cobertura de testes, sem CI/CD. As

sugestões abaixo miram aprofundamento: concentrar complexidade atrás de interfaces enxutas.

Extrair módulo de candidato

Strong

in-process

app/api/candidates.py

→

app/services/candidate.py

ANTES — MÓDULO RASO

DEPOIS — MÓDULO PROFUNDO

interface

impl

dict manual 3×

audit log 6×
cloudinary inline
tree traversal
bg tasks session

d d

i

li

interface

impl

CandidateService

Problema: 864 linhas em um route handler — lógica de negócio, auditoria, Cloudinary e deduplicação tudo
exposto na camada HTTP.

Solução: Extrair CandidateService com interface enxuta por trás de uma seam. Rotas passam a orquestrar
chamadas ao módulo, não conter a lógica.

locality: bugs de candidato concentram-se em um módulo

leverage: uma interface para 10 rotas e testes futuros

interface encolhe: 6 blocos de AuditLog → 1 chamada

deletion test: remover o módulo espalha complexidade por 10 rotas

Modelos de resposta Pydantic

Strong

in-process

app/api/candidates.py
app/schemas/job.py

app/api/jobs.py

app/api/public_jobs.py

→

app/schemas/candidate.py

ANTES — 3× O MESMO DICIONÁRIO

DEPOIS — UM SCHEMA

list_jobs

get_job

match

public_jobs

dict(title=..., slug=...,

dict(title=..., slug=...,

dict(title=..., slug=...,

dict(title=..., slug=...,

skills=...)

skills=...)

skills=...)

skills=...)

list_jobs

get_job

match

public_jobs

JobResponse

Problema: Todo endpoint constrói dicionários manualmente. Os mesmos campos de JobPosition são
serializados 4 vezes em 3 arquivos diferentes.

Solução: Definir schemas Pydantic de resposta em  app/schemas/  e usar  response_model= . A interface do
módulo HTTP se reduz a um tipo.

locality: mudança de campo = 1 arquivo, não 3

leverage: OpenAPI auto-gerado, validação de saída gratuita

interface encolhe: 4 blocos de dict → 1 Pydantic model

deletion test: sem o schema, cada rota reinventa serialização

Mover schemas de extração para o local correto

Worth exploring

in-process

ingest.py

→

app/schemas/extraction.py

ANTES — SCHEMAS NO CLI

DEPOIS — SCHEMAS ONDE PERTENCEM

Syntax error in text
Syntax error in text

mermaid version 11.16.0
mermaid version 11.16.0

ingest.py

import

candidates.py

import

public_apply.py

import

quality_score.py

import

app/schemas/extraction.py

define

CandidateExtraction

Problema: CandidateExtraction e ExperienceItem são definidos em  ingest.py  (script CLI de 487 linhas), mas 4
módulos da API importam de lá. O schema vive no lugar errado.

Solução: Mover CandidateExtraction e ExperienceItem para  app/schemas/extraction.py . Ambos CLI e API
importam do local canônico.

locality: schema de domínio no pacote de schemas, não no script

leverage: 5 importadores consomem da mesma interface

TYPE_CHECKING desnecessário — import real sem acoplamento circular

deletion test: sem o schema em schemas/, cada módulo reinventa a estrutura

Extrair orquestração de matching de vagas

Worth exploring

local-substitutable

app/api/jobs.py

→

app/services/job_matcher.py

ANTES — ROTA CONTÉM ORQUESTRAÇÃO

DEPOIS — MÓDULO PROFUNDO

GET /jobs/{id}/match

busca candidatos

cache lookup

LLM Groq → Gemini

Semaphore(3)

monta resposta

200+ linhas inline no route handler

GET /jobs/{id}/match

JobMatcher.match(job, candidates)

rota: ~15 linhas

Problema: Orquestração LLM com Semaphore, cache, fallback chain e montagem de resultado — 200+ linhas
— vive dentro de um route handler. Impossível testar sem subir o servidor.

Solução: Extrair JobMatcher como módulo com interface  match(job, candidates) → list[MatchResult] . A rota
vira 15 linhas de orquestração HTTP.

locality: lógica de matching em um lugar, testável com mocks de LLM

leverage: reutilizável em batch jobs, sandbox, endpoints futuros

seam: LLM adapter por trás da interface, substituível em testes

deletion test: sem o módulo, a orquestração colapsa de volta na rota

Fonte única de verdade para PLAN_LIMITS

Strong

in-process

app/api/auth.py:50

app/api/billing.py:18

→

app/core/config.py

ANTES — DUAS FONTES

DEPOIS — FONTE ÚNICA

auth.py register

billing.py webhook

settings.PLAN_LIMITS

{free: 50, pro: 500,
enterprise: 999999}

{free: 50, pro: 500,
enterprise: 999999}

auth.py register

billing.py webhook

Problema: O dicionário  {free: 50, pro: 500, enterprise: 999999}  está hardcoded em auth.py e billing.py.
Mudar um limite exige editar dois arquivos não relacionados.

Solução: Mover para  app/core/config.py  como  PLAN_LIMITS: dict  no Settings. Ambos os consumidores leem
da mesma fonte.

locality: um lugar para alterar limites de plano

leverage: config como interface para regras de negócio

architecture-as-data: limites viram configuração, não código espalhado

deletion test: sem a config central, cada módulo reinventa os limites

Consolidar resolução slug/UUID

Worth exploring

in-process

app/api/jobs.py:67-73

app/api/public_jobs.py:45-51

→

app/services/job_lookup.py

ANTES — LÓGICA DUPLICADA

jobs.py

public_jobs.py

try: uuid.UUID(id)

try: uuid.UUID(id)

resolve_job_id(db, id)

DEPOIS — UM PONTO

.filter(UUID)

except:

.filter(slug)

.filter(UUID)

except:

.filter(slug)

try: uuid.UUID(id) → filter by UUID

except → filter by slug

Problema: A lógica "tenta UUID, fallback slug" está copiada identicamente em jobs.py e public_jobs.py. Corrigir
um bug nessa resolução exige editar dois lugares.

Solução: Extrair para  resolve_job_id(db, identifier) → JobPosition | None . Um módulo, uma interface, dois
consumidores.

locality: bugfix de resolução = 1 arquivo

leverage: 2 consumidores, 1 implementação

seam: interface oculta o mecanismo UUID/slug dos callers

deletion test: sem o módulo, cada rota implementa sua própria heurística

Corrigir camada de banco de dados

Strong

in-process

app/core/database.py

app/api/public_apply.py:158

AGENTS.md

ANTES — TRÊS PROBLEMAS

1. Vazamento de conexão

bg task

PostgreSQL

db = SessionLocal()

fallback_db = SessionLocal()

db.close()

fallback_db NUNCA fechado!

bg task

PostgreSQL

2. Pool implícito

pool_size = ??? → default 5

max_overflow = ??? → default 10

3. Documentação falsa

AGENTS.md: "async-compatible" ✗

Código real: 100% síncrono ✓

DEPOIS — CAMADA CONFIÁVEL

1. Conexão sempre fechada

finally: fallback_db.close()

2. Pool explícito

pool_size = 5

max_overflow = 10

pool_recycle = 300

3. Documentação real

AGENTS.md: SQLAlchemy 2.x (sync)
com pool_pre_ping + pool_recycle

Problema: Três fragilidades na camada de banco. (1) Vazamento de conexão: em  public_apply.py:158 ,
fallback_db  é aberto dentro do  except  mas nunca fechado — cada erro no pipeline de IA vaza uma conexão.
(2) Pool implícito:  pool_size  e  max_overflow  não são definidos, herdando defaults (5+10) sem documentação.

(3) AGENTS.md mente: diz "async-compatible" mas o código é 100% síncrono — usa  sessionmaker  sync, todas
as rotas são  def .

Solução: (1) Adicionar  finally: fallback_db.close() . (2) Tornar pool explícito:  pool_size=5, max_overflow=10
no  create_engine . (3) Corrigir AGENTS.md para refletir a realidade síncrona.

bug crítico: vazamento de conexão corrói o pool sob erro

locality: config de pool visível e documentada em um lugar

interface real: documentação que não mente evita bugs de novos devs

sync é adequado: LLM domina latência; migrar para async seria refactor prematuro

RECOMENDAÇÃO PRINCIPAL

Extrair módulo de candidato

É o módulo mais raso com o maior impacto. Com 864 linhas e 10 rotas, candidates.py concentra lógica de

negócio, auditoria, Cloudinary, deduplicação e batch processing em um route handler. Cada nova feature de

candidato aumenta a superfície da interface HTTP sem ganho de depth. Um CandidateService por trás de

uma seam enxuta concentraria locality e abriria caminho para testes que não dependem do framework

HTTP.

Segundo lugar: Modelos de resposta Pydantic — elimina a duplicação mais difundida no projeto e gera
OpenAPI automaticamente.


