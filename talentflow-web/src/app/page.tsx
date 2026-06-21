import Link from 'next/link';
import { 
  Sparkles, 
  Brain, 
  UploadCloud, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Activity, 
  Database,
  Search,
  Users
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-hidden selection:bg-primary/30">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] right-[-10%] w-[700px] h-[700px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none -z-10" />
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

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-semibold hover:text-primary transition-colors py-2 px-3 rounded-lg"
            >
              Entrar
            </Link>
            <Link 
              href="/login?signup=true" 
              className="text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/15 py-2 px-4 rounded-xl flex items-center gap-1.5"
            >
              Criar Conta <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          Triagem Inteligente & OCR Avançado
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto mb-6 bg-gradient-to-b from-foreground to-foreground/80 dark:from-foreground dark:to-muted-foreground bg-clip-text text-transparent leading-[1.15]">
          Acelere sua triagem de currículos com inteligência artificial
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Centralize currículos, processe PDFs em lote e encontre os candidatos ideais instantaneamente através de análises de perfil e justificativas de compatibilidade geradas por IA.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link 
            href="/login" 
            className="w-full sm:w-auto text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/95 hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 group"
          >
            Começar Grátis 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a 
            href="#features" 
            className="w-full sm:w-auto text-base font-semibold border border-border bg-background/50 backdrop-blur-sm hover:bg-secondary/30 transition-all py-3.5 px-8 rounded-xl block"
          >
            Conhecer Funcionalidades
          </a>
        </div>

        {/* Premium UI Mockup */}
        <div className="relative mx-auto max-w-5xl rounded-2xl border border-border/80 bg-card/60 p-4 md:p-6 shadow-2xl backdrop-blur-md">
          {/* Mockup Header Elements */}
          <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-destructive/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs text-muted-foreground ml-3 font-mono">talentflow.app/dashboard</span>
            </div>
            <div className="px-3 py-1 rounded-md bg-secondary/50 text-xs text-muted-foreground">
              Modo Escuro Ativo
            </div>
          </div>

          {/* Mockup Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Column 1: Candidates list */}
            <div className="md:col-span-1 border-r border-border/40 pr-0 md:pr-6 space-y-4">
              <div className="text-xs font-bold text-muted-foreground tracking-wider uppercase mb-2">Candidatos</div>
              {[
                { name: "Ana Beatriz Silva", role: "Engenheira de Software", score: 94, active: true },
                { name: "Carlos Eduardo Souza", role: "Product Manager", score: 81, active: false },
                { name: "Mariana Costa", role: "Designer UX/UI", score: 78, active: false }
              ].map((cand, i) => (
                <div 
                  key={i} 
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    cand.active 
                      ? 'bg-primary/10 border-primary/30 shadow-sm' 
                      : 'bg-background/40 border-border/60'
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold">{cand.name}</div>
                    <div className="text-xs text-muted-foreground">{cand.role}</div>
                  </div>
                  <div className={`text-xs font-bold px-2 py-1 rounded-lg ${
                    cand.active ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {cand.score}%
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2 & 3: Match Details */}
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-bold">Ana Beatriz Silva</h3>
                  <p className="text-sm text-muted-foreground">Candidata a Engenheira de Software Senior</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold">
                    Quality Score: 9.4/10
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-primary/15 border border-primary/30 text-primary text-xs font-bold">
                    Match de Habilidades: 94%
                  </div>
                </div>
              </div>

              {/* Justification Box */}
              <div className="p-4.5 rounded-xl bg-primary/5 border border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 text-primary opacity-20">
                  <Sparkles className="w-12 h-12" />
                </div>
                <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2.5">
                  <Sparkles className="w-4 h-4" />
                  Análise de Compatibilidade da IA
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">
                  A candidata possui sólida experiência de 5+ anos com as tecnologias obrigatórias (React, TypeScript e Node.js). Ela demonstrou liderança técnica no redesenho de microsserviços de alto volume, alinhando-se perfeitamente com os desafios de escalabilidade da vaga.
                </p>
              </div>

              {/* Skills Tags */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-muted-foreground">Habilidades Correspondentes</div>
                <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'].map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-secondary text-xs font-medium border border-border/60">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 md:py-32 bg-secondary/20 border-y border-border/40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Recursos de ponta para empresas que buscam eficiência
            </h2>
            <p className="text-muted-foreground text-lg">
              Substitua ferramentas legadas e planilhas confusas por uma plataforma inteligente de aquisição de talentos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-md hover:border-primary/20 hover:scale-[1.01] transition-all space-y-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <UploadCloud className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-lg font-bold">Ingestão em Lote</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Arraste dezenas de currículos em formato PDF simultaneamente. O processamento assíncrono cadastra todos em background enquanto você continua trabalhando.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-md hover:border-primary/20 hover:scale-[1.01] transition-all space-y-4">
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Activity className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-lg font-bold">Quality Score</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Identifique automaticamente perfis mal estruturados ou incompletos. O motor avalia a qualidade do currículo e sinaliza alertas de dados ausentes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-md hover:border-primary/20 hover:scale-[1.01] transition-all space-y-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <Brain className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-lg font-bold">Explicabilidade por IA</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Além do ranking de compatibilidade, receba uma justificativa descritiva resumindo os pontos fortes e fracos do candidato em relação aos requisitos da vaga.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-md hover:border-primary/20 hover:scale-[1.01] transition-all space-y-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <ShieldCheck className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-lg font-bold">Multi-Tenancy Isolada</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Segurança e isolamento total de dados para diferentes empresas ou filiais. Gerencie permissões de usuários de forma estrita em nível de banco de dados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">99%</div>
            <div className="text-sm text-muted-foreground">Precisão no OCR de PDFs</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">&lt; 3s</div>
            <div className="text-sm text-muted-foreground">Processamento por Currículo</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">100%</div>
            <div className="text-sm text-muted-foreground">Isolamento Multi-tenant</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">50ms</div>
            <div className="text-sm text-muted-foreground">Tempo de Resposta em Cache</div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 md:py-32 max-w-5xl mx-auto px-6 text-center">
        <div className="p-8 md:p-16 rounded-3xl bg-gradient-to-r from-primary/10 to-indigo-500/10 border border-primary/20 shadow-xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
            Eleve o nível do seu recrutamento
          </h2>
          
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Comece a triar candidatos de forma inteligente hoje mesmo. Crie sua conta e veja a mágica acontecer.
          </p>

          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/95 hover:scale-[1.02] transition-all font-semibold py-4 px-8 rounded-xl shadow-lg shadow-primary/15"
          >
            Criar Conta Grátis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-background/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
              TF
            </div>
            <span>© {new Date().getFullYear()} TalentFlow. Todos os direitos reservados.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-foreground transition-colors">Termos de Uso</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacidade</Link>
            <a href="mailto:adm.the@outlook.com" className="hover:text-foreground transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
