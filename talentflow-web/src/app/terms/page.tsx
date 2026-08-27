import { Shield } from 'lucide-react';
import PublicLegalShell from '@/components/PublicLegalShell';

export default function TermsPage() {
  return (
    <PublicLegalShell>
      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <article className="glass-panel-strong rounded-3xl p-8 md:p-12 shadow-xl">
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
              Ao acessar ou utilizar a plataforma TalentFlow (&quot;Plataforma&quot;), desenvolvida pela Space Square, você concorda em cumprir e estar legalmente vinculado a estes Termos de Uso. Se você não concordar com qualquer termo aqui descrito, não deverá utilizar nossos serviços.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Descrição dos Serviços</h2>
            <p>
              O TalentFlow é um sistema de banco de talentos e triagem de currículos que utiliza tecnologias de reconhecimento óptico de caracteres (OCR) e algoritmos de processamento de linguagem natural por inteligência artificial (IA) para ler, classificar e analisar a compatibilidade de candidatos em relação a vagas especificadas pelas empresas licenciadas (&quot;Tenants&quot;).
            </p>
            <p>
              <strong>Natureza de Apoio:</strong> A Plataforma é uma ferramenta auxiliar de triagem e recrutamento. Toda decisão final de contratação, descarte de currículos ou seleção de candidatos é de responsabilidade exclusiva dos recrutadores e representantes das empresas usuárias. A IA fornece justificativas e notas de compatibilidade consultivas, não vinculantes e que não constituem decisões automatizadas definitivas sem supervisão humana.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Cadastro de Contas e Segurança</h2>
            <p>
              Para acessar as funcionalidades de triagem, é necessária a criação de uma conta associada a um Tenant. Você concorda em fornecer informações verídicas, completas e atualizadas. Você é integralmente responsável por manter a confidencialidade de suas credenciais de acesso (e-mail ou senha) e por todas as atividades realizadas sob sua conta.
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
              O TalentFlow é disponibilizado &quot;no estado em que se encontra&quot;. Embora nos esforcemos para manter a máxima acurácia do motor de OCR e do modelo de IA (Smart Match), não garantimos que a Plataforma estará livre de erros, que o processamento identificará com 100% de exatidão todas as competências dos candidatos, ou que o serviço operará sem interrupções.
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
        </article>
      </main>

    </PublicLegalShell>
  );
}
