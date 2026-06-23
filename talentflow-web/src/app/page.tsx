import Link from "next/link";
import {
  Sparkles,
  Brain,
  UploadCloud,
  ShieldCheck,
  ArrowRight,
  Activity,
  Zap,
  Clock,
  FolderX,
  Target,
  ChevronDown,
  Code2,
  Building2,
} from "lucide-react";
import SandboxDemoWrapper from "@/components/SandboxDemoWrapper";
import HeroVisual from "@/components/HeroVisual";
import RevealSection from "@/components/RevealSection";
import LandingHeader from "@/components/LandingHeader";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata = {
  title: "TalentFlow — Motor de IA para Triagem de Talentos",
  description:
    "TalentFlow processa, analisa e classifica currículos em PDF com Groq e Gemini — com justificativa detalhada para cada decisão de IA. Pare de ler currículos. Comece a conhecer candidatos.",
};

/* ─────────────────────────────────────────────────────────────────────
   LANDING PAGE — light mode nativo (defaultTheme="light" no layout)
   Footer é gerenciado pelo layout (pathname === "/" → variante simple)
───────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary/20">

      {/* ── Ambient Glows (fixos, atrás de tudo) ───────────────────── */}
      <div className="fixed inset-0 pointer-events-none -z-10" aria-hidden="true">
        <div className="absolute -top-[20%] -left-[10%] w-[700px] h-[700px] bg-primary/8 rounded-full blur-[220px]" />
        <div className="absolute top-[35%] -right-[15%] w-[600px] h-[600px] bg-indigo-500/6 rounded-full blur-[200px]" />
        <div className="absolute bottom-[10%] left-[15%] w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[160px]" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════════════════ */}
      <LandingHeader />

      {/* ═══════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — Copy */}
          <div className="flex flex-col gap-8">
            {/* Badge */}
            <div className="opacity-0-initial animate-fade-in delay-100 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              Motor de IA para Triagem de Talentos
            </div>

            {/* H1 */}
            <h1 className="opacity-0-initial animate-fade-in-up delay-200 text-4xl md:text-5xl xl:text-[3.75rem] font-extrabold tracking-tight leading-[1.1] text-foreground">
              Pare de ler currículos.{" "}
              <span className="animate-gradient bg-gradient-to-r from-primary via-violet-500 to-indigo-500 bg-clip-text text-transparent">
                Comece a conhecer candidatos.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="opacity-0-initial animate-fade-in-up delay-300 text-lg text-muted-foreground leading-relaxed max-w-lg">
              TalentFlow usa Groq e Gemini para processar, estruturar e ranquear CVs em PDF — com uma{" "}
              <span className="text-foreground font-medium">justificativa clara para cada decisão</span>.
              Não apenas um score. Uma conversa sobre cada candidato.
            </p>

            {/* CTAs */}
            <div className="opacity-0-initial animate-fade-in-up delay-400 flex flex-col sm:flex-row items-start gap-3">
              <Link
                href="/login?signup=true"
                id="cta-hero-primary"
                className="group flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] transition-all font-semibold py-3.5 px-7 rounded-xl shadow-lg shadow-primary/20 text-base"
              >
                Solicitar Acesso Antecipado
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#sandbox"
                id="cta-hero-sandbox"
                className="group flex items-center gap-2 text-muted-foreground hover:text-foreground border border-border hover:border-border/80 bg-background hover:bg-secondary/60 transition-all font-semibold py-3.5 px-7 rounded-xl text-base"
              >
                Ver em ação
                <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
              </a>
            </div>

            {/* Social proof micro */}
            <div className="opacity-0-initial animate-fade-in delay-500 flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                {["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"].map((color, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    <span className="text-[9px] font-bold text-white">{String.fromCharCode(65 + i)}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Equipes de R&S já testando a plataforma
              </p>
            </div>
          </div>

          {/* Right — HeroVisual */}
          <div className="opacity-0-initial animate-fade-in delay-300 flex justify-center lg:justify-end">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SANDBOX — "O TalentFlow pensando. Ao vivo."
      ═══════════════════════════════════════════════════════════════ */}
      <section
        id="sandbox"
        className="py-20 md:py-32 border-y border-border/40 bg-secondary/20 relative"
        aria-labelledby="sandbox-title"
      >
        <div className="max-w-5xl mx-auto px-6">
          <RevealSection className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 text-xs font-semibold tracking-wide mb-5">
              <Zap className="w-3.5 h-3.5" />
              Zero cadastro necessário
            </div>
            <h2
              id="sandbox-title"
              className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-foreground"
            >
              O TalentFlow pensando.{" "}
              <span className="text-muted-foreground font-normal">Ao vivo.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Solte um currículo em PDF aqui embaixo e observe o motor de IA estruturar
              o perfil, extrair experiências, identificar skills e calcular o Quality Score —
              tudo em segundos.
            </p>
          </RevealSection>

          <RevealSection delay={0.15}>
            <SandboxDemoWrapper />
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PROBLEMA — "O custo invisível do recrutamento manual"
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-32 max-w-7xl mx-auto px-6" aria-labelledby="problem-title">
        <RevealSection className="text-center mb-16">
          <h2 id="problem-title" className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-foreground">
            O recrutamento manual tem um custo invisível
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Cada hora gasta triando CVs à mão é uma hora que não foi gasta em decisões estratégicas.
          </p>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Clock,
              color: "text-amber-600 dark:text-amber-400",
              bg: "bg-amber-50 dark:bg-amber-500/10",
              border: "border-amber-200 dark:border-amber-500/20",
              title: "Tempo desperdiçado",
              desc: "Horas por semana lendo currículos que não chegam perto do perfil. O tempo mais valioso do RH gasto no trabalho mais repetitivo.",
            },
            {
              icon: FolderX,
              color: "text-rose-600 dark:text-rose-400",
              bg: "bg-rose-50 dark:bg-rose-500/10",
              border: "border-rose-200 dark:border-rose-500/20",
              title: "Desorganização estrutural",
              desc: "Planilhas, e-mails e pastas compartilhadas que mais confundem do que organizam. Nenhuma visão consolidada do banco de talentos.",
            },
            {
              icon: Target,
              color: "text-violet-600 dark:text-violet-400",
              bg: "bg-violet-50 dark:bg-violet-500/10",
              border: "border-violet-200 dark:border-violet-500/20",
              title: "Decisões sem dados",
              desc: "Contratações baseadas em intuição e disponibilidade, não em critérios objetivos. Viés inconsciente no topo do funil.",
            },
          ].map((item, i) => (
            <RevealSection key={item.title} delay={i * 0.1}>
              <div className="group h-full p-6 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-border transition-all duration-300 space-y-4">
                <div className={`w-11 h-11 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURES — Bento Grid assimétrico
      ═══════════════════════════════════════════════════════════════ */}
      <section
        id="features"
        className="py-20 md:py-32 border-y border-border/40 bg-secondary/20 relative"
        aria-labelledby="features-title"
      >
        <div className="max-w-7xl mx-auto px-6">
          <RevealSection className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide mb-5">
              <Brain className="w-3.5 h-3.5" />
              O que muda quando a IA assume a triagem
            </div>
            <h2 id="features-title" className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-foreground">
              Cada funcionalidade,{" "}
              <span className="text-muted-foreground font-normal">um problema resolvido</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Do upload do PDF até a justificativa de compatibilidade — o TalentFlow
              elimina a fricção em cada etapa do funil de R&S.
            </p>
          </RevealSection>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Card GRANDE — Smart Match (col-span-2) */}
            <RevealSection className="md:col-span-2" delay={0}>
              <div className="group h-full p-8 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
                <div className="relative z-10 flex flex-col gap-5">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Brain className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                      Diferencial exclusivo
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Smart Match com Explicabilidade
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Não apenas um score de compatibilidade. Para cada vaga, a IA gera uma{" "}
                      <span className="text-foreground font-medium">justificativa descritiva</span> —
                      o que o candidato tem, o que falta, e por que foi ranqueado onde foi.
                      Decisões de contratação que você consegue explicar.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {["Ranking automático", "Justificativa em texto", "Comparativo de candidatos", "Multi-vaga"].map(tag => (
                      <span key={tag} className="text-xs px-3 py-1 rounded-full bg-primary/8 border border-primary/15 text-primary font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </RevealSection>

            {/* Card — Ingestão em Lote */}
            <RevealSection delay={0.1}>
              <div className="group h-full p-6 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-300 space-y-5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground mb-2">Ingestão em Lote</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Arraste dezenas de PDFs de uma vez. O processamento acontece em background
                    enquanto você continua trabalhando. Nenhum bloqueio de tela.
                  </p>
                </div>
              </div>
            </RevealSection>

            {/* Card — Quality Score */}
            <RevealSection delay={0.1}>
              <div className="group h-full p-6 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-amber-500/30 transition-all duration-300 space-y-5">
                <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                  <Activity className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground mb-2">Quality Score</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Identifica automaticamente perfis mal estruturados ou incompletos.
                    Alertas precisos: dados ausentes, inconsistências e sinais de baixa qualidade.
                  </p>
                </div>
              </div>
            </RevealSection>

            {/* Card — Multi-Tenancy */}
            <RevealSection delay={0.15}>
              <div className="group h-full p-6 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all duration-300 space-y-5">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                  <Building2 className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground mb-2">Multi-Tenancy Isolada</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Cada empresa tem seus dados isolados com precisão cirúrgica. RBAC completo.
                    Ideal para agências de R&S com múltiplos clientes.
                  </p>
                </div>
              </div>
            </RevealSection>

            {/* Card — Engine Híbrido */}
            <RevealSection delay={0.2}>
              <div className="group h-full p-6 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-violet-500/30 transition-all duration-300 space-y-5">
                <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
                  <Code2 className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground mb-2">Engine Híbrido de IA</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Groq (Llama 3.3 70B) para PDFs de texto nativo. Gemini 2.5 Flash para
                    documentos escaneados via OCR. O melhor modelo para cada tipo de arquivo.
                  </p>
                </div>
              </div>
            </RevealSection>

            {/* Card — Auditoria & LGPD */}
            <RevealSection delay={0.25}>
              <div className="group h-full p-6 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-300 space-y-5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground mb-2">Auditoria & LGPD</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Log de auditoria completo de todas as ações. Termos e política de privacidade
                    nativos. Dados de candidatos tratados com conformidade.
                  </p>
                </div>
              </div>
            </RevealSection>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          HOW IT WORKS — 3 passos
      ═══════════════════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="py-20 md:py-32 max-w-7xl mx-auto px-6"
        aria-labelledby="how-title"
      >
        <RevealSection className="text-center max-w-2xl mx-auto mb-16">
          <h2 id="how-title" className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-foreground">
            Três passos. Zero atrito.
          </h2>
          <p className="text-muted-foreground text-lg">
            Do PDF bruto à decisão de contratação — sem formulários, sem templates, sem redigitação.
          </p>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-[2.75rem] left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true" />

          {[
            {
              step: "01",
              icon: UploadCloud,
              color: "text-primary",
              bg: "bg-primary/10",
              border: "border-primary/20",
              title: "Faça o upload",
              desc: "Arraste um ou centenas de CVs em PDF. O TalentFlow processa cada um em paralelo, em background, sem travar sua tela.",
            },
            {
              step: "02",
              icon: Brain,
              color: "text-violet-600 dark:text-violet-400",
              bg: "bg-violet-50 dark:bg-violet-500/10",
              border: "border-violet-200 dark:border-violet-500/20",
              title: "A IA estrutura tudo",
              desc: "Nome, cargo atual, histórico de experiências, skills, educação e Quality Score são extraídos e organizados automaticamente.",
            },
            {
              step: "03",
              icon: Target,
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-50 dark:bg-emerald-500/10",
              border: "border-emerald-200 dark:border-emerald-500/20",
              title: "Decida com confiança",
              desc: "Veja os candidatos mais compatíveis com cada vaga, leia a justificativa de match e avance com clareza — sem achismos.",
            },
          ].map((item, i) => (
            <RevealSection key={item.step} delay={i * 0.15}>
              <div className="flex flex-col items-center text-center gap-5">
                <div className={`relative w-14 h-14 rounded-2xl ${item.bg} border ${item.border} flex items-center justify-center ${item.color} shadow-sm`}>
                  <item.icon className="w-6 h-6" />
                  <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-background border border-border text-[10px] font-black text-muted-foreground flex items-center justify-center shadow-sm">
                    {item.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CTA FINAL — Early Access
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-32 px-6" aria-labelledby="cta-title">
        <RevealSection>
          <div className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-indigo-500/5 p-10 md:p-16 text-center shadow-xl shadow-primary/5">
            {/* Decorative glows */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/8 rounded-full blur-[80px] pointer-events-none" aria-hidden="true" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/6 rounded-full blur-[60px] pointer-events-none" aria-hidden="true" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Acesso Antecipado
              </div>

              <h2 id="cta-title" className="text-3xl md:text-5xl font-extrabold tracking-tight mb-5 text-foreground">
                Pronto para elevar seu{" "}
                <span className="animate-gradient bg-gradient-to-r from-primary via-violet-500 to-indigo-500 bg-clip-text text-transparent">
                  processo seletivo?
                </span>
              </h2>

              <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Junte-se às equipes que já estão transformando sua operação de R&S com
                inteligência artificial. Sem planilhas. Sem achismos.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/login?signup=true"
                  id="cta-final-signup"
                  className="group relative overflow-hidden inline-flex items-center gap-2.5 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.03] active:scale-[0.99] transition-all font-bold py-4 px-9 rounded-xl shadow-lg shadow-primary/20 text-base"
                >
                  <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/15 to-transparent" aria-hidden="true" />
                  <span className="relative">Solicitar Acesso Gratuito</span>
                  <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors py-2 px-4"
                >
                  Já tenho conta → Entrar
                </Link>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10 text-xs text-muted-foreground/70">
                <span>✓ Sem cartão de crédito</span>
                <span>✓ Configuração em minutos</span>
                <span>✓ Dados isolados por empresa</span>
                <span>✓ Em conformidade com a LGPD</span>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* Footer é injetado pelo layout.tsx (variante simple automática em pathname="/") */}
      <ScrollToTop />
    </div>
  );
}
