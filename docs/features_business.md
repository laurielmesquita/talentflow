# TalentFlow: Funcionalidades e Diferenciais (Visão Comercial)

O **TalentFlow** é uma plataforma de triagem SaaS Tier-1 desenvolvida para revolucionar o pipeline de Recrutamento e Seleção (R&S). Combinando processamento cognitivo via inteligência artificial e uma interface visual de alta performance, o sistema acelera a tomada de decisão das equipes de recursos humanos enquanto mantém o rigor e o isolamento corporativo de dados.

---

## 1. Ingestão e Processamento Inteligente de Currículos

Elimine a triagem manual exaustiva de arquivos. O TalentFlow possui um pipeline de processamento automatizado capaz de ler, extrair e catalogar currículos de forma instantânea:

* **Ingestão Concorrente em Lote (Multi-Upload):** O recrutador pode arrastar dezenas de currículos simultaneamente. O sistema processa os arquivos de forma paralela e exibe o progresso em tempo real por meio de uma barra de carregamento flutuante construída com tecnologia de portais (React Portals), garantindo que a navegação do usuário não seja travada.
* **Extração Cognitiva Híbrida de Dados:** Identificação imediata de nome, e-mail, telefone, localização (endereço), formação acadêmica, competências técnicas (*skills*) e histórico profissional.
* **Leitura de PDFs Digitalizados e Imagens (OCR Multimodal):** Mesmo se o currículo for uma foto de celular ou um documento escaneado (sem texto selecionável), nossa inteligência artificial processa e extrai o texto com altíssima precisão.
* **Detecção Automática e Gestão de Duplicados:** Filtro por assinatura criptográfica (MD5/SHA-256) de arquivos. Ao subir um currículo já existente no banco de dados, o sistema detecta a colisão de arquivos ou nomes e redireciona o recrutador para uma tela de resolução de conflitos, permitindo atualizar o registro para uma nova versão ou manter ambos com histórico rastreável.
* **Extração Automática de Foto de Perfil:** O motor de processamento isola o rosto do candidato do PDF e realiza o upload seguro para a nuvem, criando um perfil visual elegante na plataforma de forma automática.

---

## 2. Banco de Talentos e Gestão de Candidatos

Uma área de trabalho dinâmica projetada para maximizar a velocidade ocular dos recrutadores:

* **Painel Interativo de Alto Desempenho:** Listagem ultra-rápida de candidatos com expansão inline elástica (movida a física de molas via Framer Motion). O recrutador lê todos os dados do candidato na própria lista, sem abrir novas abas ou modais disruptivos.
* **Pontuação de Qualidade do Currículo (CV Quality Score):** Uma avaliação algorítmica de 0 a 100 baseada no preenchimento de dados essenciais para o recrutamento (como contato, e-mail e experiência). O sistema exibe um anel colorido animado e alertas inteligentes indicando quais informações vitais estão em falta no currículo.
* **Sinalização de Risco e Blacklist (Flagged Candidates):** Capacidade de marcar candidatos específicos que violaram políticas ou não cumprem termos básicos de contratação, com registro da justificativa interna e data da ação para fins de auditoria e conformidade.
* **Histórico de Alterações e Versionamento:** Controle estrito de versões dos currículos. Se um profissional se candidatar novamente ou atualizar seus dados, o recrutador tem acesso a todo o histórico de versões anteriores.

---

## 3. Gestão de Vagas e Compatibilidade (Smart Match com IA)

* **Painel Estruturado de Vagas:** Criação e acompanhamento de oportunidades de emprego com definição de requisitos de habilidades obrigatórias, localização e regime de trabalho.
* **Smart Match com Justificativa Humana:** O sistema realiza a interseção técnica entre os requisitos da vaga e as habilidades do candidato. Para currículos compatíveis, nossa inteligência artificial gera uma **justificativa em linguagem natural** (em português), explicando em até duas frases por que aquele profissional é adequado para a vaga.
* **Warm Path Caching (< 50ms):** Graças à arquitetura de cache inteligente, os rankings de vagas e candidatos mais compatíveis são carregados de forma instantânea para os usuários, trazendo o tempo de resposta subsequente para menos de 50 milissegundos.

---

## 4. Arquitetura SaaS Multi-Tenant (B2B)

* **Isolamento Estrito de Dados:** Cada empresa cliente opera em seu próprio espaço de trabalho corporativo (*tenant*). Currículos, vagas, contatos e usuários de uma empresa são completamente invisíveis e isolados das demais empresas na base de dados.
* **Controle Baseado em Cargos (RBAC):** Hierarquia corporativa configurada na sessão:
  * **SuperAdmin / Manager:** Possui visão total da organização, pode convidar novos membros por e-mail e realizar configurações de sistema.
  * **Recruiter:** Perfil operacional voltado para triagem de candidatos e associação de matches, sem permissões administrativas para novos convites ou exclusões críticas.

---

## 5. Landing Page de Marketing e Captação de Leads

* **Landing Page de Alta Conversão:** Página de apresentação do produto de estética moderna, com glows neon customizados sob o espaço perceptual de cores OKLCH, depoimentos e demonstração visual animada do funcionamento do sistema.
* **Formulário de Leads Integrado:** Captura de dados de novos potenciais clientes e integração direta para triagem de contatos no painel administrativo.
