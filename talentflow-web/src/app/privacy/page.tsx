import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="flex-1 flex flex-col bg-background text-foreground font-sans relative overflow-hidden selection:bg-primary/30">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="border-b border-border/40 bg-background/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-bold text-primary-foreground shadow-lg shadow-primary/25 group-hover:scale-105 transition-all">
              TF
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              TalentFlow
            </span>
          </Link>

          <Link 
            href="/" 
            className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors py-2 px-3 rounded-lg border border-border bg-background/50"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <div className="flex items-center gap-3 mb-6 text-primary">
          <Lock className="w-6 h-6" />
          <span className="text-sm font-bold tracking-wider uppercase">Privacidade e Proteção</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
          Política de Privacidade
        </h1>
        <p className="text-muted-foreground text-sm mb-12">
          Última atualização: 21 de junho de 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground/90 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Visão Geral e Compromisso LGPD</h2>
            <p>
              Esta Política de Privacidade descreve como a plataforma TalentFlow ("Plataforma"), de propriedade e operada pela Space Square, coleta, armazena, processa, utiliza e protege as informações e dados pessoais de seus usuários e dos candidatos cujos currículos são triados no sistema, em conformidade estrita com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Agentes de Tratamento e Papéis</h2>
            <p>
              De acordo com os conceitos da LGPD, os papéis de tratamento no ecossistema TalentFlow são definidos da seguinte forma:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Controlador:</strong> A empresa cliente ("Tenant") que contrata o TalentFlow e realiza o upload dos currículos e informações de vagas. O Tenant decide quais currículos processar, de quais fontes obtê-los, os prazos de retenção e as decisões finais de recrutamento.</li>
              <li><strong>Operador:</strong> A Space Square (TalentFlow), que atua estritamente seguindo as diretrizes e instruções técnicas do Tenant para fornecer as funcionalidades de OCR, extração de dados e pontuação de compatibilidade baseada em Inteligência Artificial.</li>
              <li><strong>Encarregado de Dados (DPO):</strong> O canal oficial para comunicação sobre privacidade com o Operador é o e-mail: <a href="mailto:adm.the@outlook.com" className="text-primary hover:underline">adm.the@outlook.com</a>.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Dados Pessoais Coletados e Tratados</h2>
            <p>
              Dividimos a coleta e o tratamento em duas categorias principais:
            </p>
            <div className="border border-border/60 bg-muted/20 p-4 rounded-xl space-y-3">
              <p className="font-semibold text-foreground">A. Dados dos Usuários do Sistema (Recrutadores/Administradores):</p>
              <ul className="list-disc pl-6 space-y-1.5 text-sm">
                <li>Dados de cadastro: Nome, e-mail corporativo, senha hash de acesso.</li>
                <li>Metadados e registros de acesso: IP, logs de auditoria de visualização, edição ou exclusão de registros (soft-delete), e ações executadas no painel administrativo.</li>
              </ul>
              
              <p className="font-semibold text-foreground pt-2">B. Dados dos Candidatos (Extraídos de Currículos):</p>
              <ul className="list-disc pl-6 space-y-1.5 text-sm">
                <li>Identificação e contato: Nome completo, e-mail, telefone, links de redes profissionais (LinkedIn/GitHub).</li>
                <li>Histórico profissional: Cargos anteriores, empresas em que atuou, períodos de trabalho, projetos relevantes.</li>
                <li>Qualificações e Escolaridade: Cursos, certificações, graduações, idiomas, competências técnicas e comportamentais identificadas.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Finalidades do Tratamento</h2>
            <p>
              Tratamos os dados pessoais para finalidades específicas e legítimas vinculadas ao escopo da Plataforma:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Permitir o gerenciamento do banco de talentos e a organização de vagas de emprego pelo Tenant.</li>
              <li>Processar documentos PDF por meio de OCR para estruturar dados textuais desorganizados.</li>
              <li>Calcular a compatibilidade de habilidades (Match Score) e gerar explicações textuais da IA sobre o fit do candidato com a vaga.</li>
              <li>Garantir a segurança e integridade do sistema, incluindo auditorias de logs e proteção contra acessos não autorizados.</li>
            </ul>
            <p>
              <strong>Treinamento de Modelos:</strong> Garantimos que os dados pessoais de candidatos extraídos de seus currículos <strong>não</strong> são utilizados para treinar modelos públicos de inteligência artificial de terceiros. As chamadas de IA para provedores externos (ex. Groq, Gemini) são protegidas por termos de uso comerciais que vedam o uso do payload de requisição para fins de treinamento desses modelos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Segurança e Isolamento Multi-Tenancy</h2>
            <p>
              Implementamos medidas rígidas de segurança técnica e organizacional para mitigar riscos de vazamento ou acesso indevido:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Isolamento Multi-tenant:</strong> O sistema adota controle estrito de contexto em nível de banco de dados e de infraestrutura. Cada Tenant acessa exclusivamente seus próprios registros. Filtros automatizados por ID de Tenant impedem vazamento de dados cruzado.</li>
              <li><strong>Criptografia:</strong> Dados de tráfego são protegidos via HTTPS/TLS, e credenciais críticas e senhas são armazenadas em hash seguro unilateral.</li>
              <li><strong>Soft Delete:</strong> A exclusão de candidatos opera inicialmente em exclusão lógica (soft delete) para fins de integridade e histórico contra exclusões acidentais, permitindo a purga completa se solicitado expressamente pelo Tenant.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">6. Compartilhamento de Dados</h2>
            <p>
              Não comercializamos nem compartilhamos dados com fins lucrativos ou de marketing de terceiros. Os dados pessoais são transmitidos apenas para provedores de infraestrutura estritamente necessários para o funcionamento do SaaS:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provedores de Nuvem e Banco de Dados (Neon DB, Fly.io) para hospedagem física do sistema e dados.</li>
              <li>Provedor de IA (Groq, Google Gemini) para a execução do processamento linguístico do Match Score e Justificativas.</li>
              <li>Provedores de armazenamento de arquivos (Cloudinary) para guarda dos currículos originais em formato PDF criptografado em repouso.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">7. Direitos dos Titulares de Dados</h2>
            <p>
              Nos termos da LGPD, os titulares de dados pessoais (candidatos e usuários do sistema) possuem direitos que podem ser exercidos diretamente perante o Controlador (Tenant) ou, subsidiariamente, perante a Plataforma (Operadora) para encaminhamento:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Confirmação da existência de tratamento e acesso facilitado aos dados coletados.</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
              <li>Eliminação ou anonimização de dados desnecessários ou tratados em desconformidade.</li>
              <li>Revogação do consentimento (quando aplicável) e exclusão definitiva do currículo da base do sistema.</li>
            </ul>
            <p>
              Para requisições e dúvidas sobre privacidade, envie um e-mail com sua solicitação para <a href="mailto:adm.the@outlook.com" className="text-primary hover:underline">adm.the@outlook.com</a>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-background/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
              TF
            </div>
            <span>© {new Date().getFullYear()} TalentFlow. Desenvolvido por Space Square.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Termos de Uso</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
