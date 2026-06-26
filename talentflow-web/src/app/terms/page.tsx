import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Shield } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="flex-1 flex flex-col bg-background text-foreground font-sans relative overflow-hidden selection:bg-primary/30">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="border-b border-border/40 bg-background/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden group-hover:scale-105 transition-all flex-shrink-0">
              <Image
                src="/brand/logo-dark.webp"
                alt="TalentFlow Logo"
                fill
                sizes="36px"
                className="object-contain dark:hidden"
                priority
              />
              <Image
                src="/brand/logo-light.webp"
                alt="TalentFlow Logo"
                fill
                sizes="36px"
                className="object-contain hidden dark:block"
                priority
              />
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
          <Shield className="w-6 h-6" />
          <span className="text-sm font-bold tracking-wider uppercase">Políticas da Plataforma</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
          Termos de Uso
        </h1>
        <p className="text-muted-foreground text-sm mb-12">
          Última atualização: 21 de junho de 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground/90 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar ou utilizar a plataforma TalentFlow ("Plataforma"), desenvolvida pela Space Square, você concorda em cumprir e estar legalmente vinculado a estes Termos de Uso. Se você não concordar com qualquer termo aqui descrito, não deverá utilizar nossos serviços.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Descrição dos Serviços</h2>
            <p>
              O TalentFlow é um sistema de banco de talentos e triagem de currículos que utiliza tecnologias de reconhecimento óptico de caracteres (OCR) e algoritmos de processamento de linguagem natural por inteligência artificial (IA) para ler, classificar e analisar a compatibilidade de candidatos em relação a vagas especificadas pelas empresas licenciadas ("Tenants").
            </p>
            <p>
              <strong>Natureza de Apoio:</strong> A Plataforma é uma ferramenta auxiliar de triagem e recrutamento. Toda decisão final de contratação, descarte de currículos ou seleção de candidatos é de responsabilidade exclusiva dos recrutadores e representantes das empresas usuárias. A IA fornece justificativas e notas de compatibilidade consultivas, não vinculantes e que não constituem decisões automatizadas definitivas sem supervisão humana.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Cadastro de Contas e Segurança</h2>
            <p>
              Para acessar as funcionalidades de triagem, é necessária a criação de uma conta associada a um Tenant. Você concorda em fornecer informações verídicas, completas e atualizadas. Você é integralmente responsável por manter a confidencialidade de suas credenciais de acesso (e-mail, senha ou convites) e por todas as atividades realizadas sob sua conta.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Envio de Conteúdo e Licitude de Dados</h2>
            <p>
              Os Tenants realizam o upload de currículos em formato PDF. Ao fazer o upload de qualquer documento contendo dados pessoais de terceiros (candidatos), o Tenant declara e garante que:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Possui base legal válida segundo a Lei Geral de Proteção de Dados (LGPD) para coletar e tratar os referidos dados de currículos.</li>
              <li>Obteve o consentimento ou forneceu os avisos de privacidade apropriados aos candidatos informando que seus currículos seriam processados eletronicamente via sistemas de terceiros (como o TalentFlow).</li>
              <li>Não enviará arquivos corrompidos, maliciosos ou que violem a propriedade intelectual ou privacidade de terceiros.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Limitação de Responsabilidade</h2>
            <p>
              O TalentFlow é disponibilizado "no estado em que se encontra". Embora nos esforcemos para manter a máxima acurácia do motor de OCR e do modelo de IA (Smart Match), não garantimos que a Plataforma estará livre de erros, que o processamento identificará com 100% de exatidão todas as competências dos candidatos, ou que o serviço operará sem interrupções.
            </p>
            <p>
              A Space Square e o TalentFlow não serão responsáveis por danos indiretos, incidentais ou lucros cessantes decorrentes do uso ou da impossibilidade de uso da Plataforma, nem por decisões de contratação equivocadas tomadas com base nas análises geradas pelo sistema.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">6. Propriedade Intelectual</h2>
            <p>
              Todo o código-fonte, elementos visuais, designs, logotipos, marcas e banco de dados associados ao TalentFlow pertencem à Space Square. A licença de uso concedida ao Tenant é temporária, não exclusiva, intransferível e revogável nos termos acordados comercialmente. É proibido qualquer tipo de engenharia reversa, extração de dados automatizada (scraping) não autorizada ou cópia da interface.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">7. Alterações nestes Termos</h2>
            <p>
              Podemos modificar estes Termos de Uso periodicamente para refletir alterações regulatórias, técnicas ou comerciais. Em caso de mudanças materiais que impactem os direitos dos usuários, notificaremos os administradores dos Tenants com antecedência razoável. O uso continuado após a vigência dos novos termos indica aceitação tácita.
            </p>
          </section>

          <section className="space-y-3 pb-8">
            <h2 className="text-xl font-bold text-foreground">8. Contato e Canal de Suporte</h2>
            <p>
              Para esclarecer dúvidas sobre estes Termos de Uso, entre em contato através de nosso e-mail de atendimento: <a href="mailto:plataforma.talentflow@outlook.com" className="text-primary hover:underline">plataforma.talentflow@outlook.com</a>.
            </p>
          </section>
        </div>
      </main>

    </div>
  );
}
