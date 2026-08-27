import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Brain,
  UploadCloud,
  ArrowRight,
  Zap,
  Target,
  ChevronDown,
} from "lucide-react";
import SandboxDemoWrapper from "@/components/SandboxDemoWrapper";
import HeroVisual from "@/components/HeroVisual";
import RevealSection from "@/components/RevealSection";
import LandingHeader from "@/components/LandingHeader";
import ScrollToTop from "@/components/ScrollToTop";
import ThreeOrbBackdrop from "@/components/ThreeOrbBackdropDynamic";

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
    <>
      <LandingHeader />
      <div className="dashboard-atmosphere flex-1 flex flex-col bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary/20">

        {/* ── Ambient Glows (fixos, atrás de tudo) ───────────────────── */}
        <div className="fixed inset-0 pointer-events-none -z-10" aria-hidden="true">
          <div className="absolute -top-[20%] -left-[10%] w-[700px] h-[700px] bg-primary/8 rounded-full blur-[220px]" />
          <div className="absolute top-[35%] -right-[15%] w-[600px] h-[600px] bg-secondary/35 rounded-full blur-[200px]" />
          <div className="absolute bottom-[10%] left-[15%] w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[160px]" />
        </div>

      {/* ═══════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — Copy */}
          <div className="flex flex-col gap-8">
            {/* Badge */}
            <div className="opacity-0-initial animate-fade-in delay-100 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide w-fit shadow-[0_0_24px_color-mix(in_oklch,var(--primary)_12%,transparent)]">
              <Sparkles className="w-3.5 h-3.5" />
              Triagem inteligente, decisão humana
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
              TalentFlow transforma currículos em perfis comparáveis e organiza o ranking para cada vaga — com uma{" "}
              <span className="text-foreground font-medium">justificativa clara que apoia a decisão do recrutador</span>.
              Não apenas um score. Contexto para avaliar cada candidato.
            </p>

            {/* CTAs */}
              <div className="opacity-0-initial animate-fade-in-up delay-400 flex flex-col sm:flex-row items-start gap-3">
              <Link
                href="/login?signup=true"
                id="cta-hero-primary"
                className="group flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] transition-all font-semibold py-3.5 px-7 rounded-xl shadow-lg shadow-primary/20 text-base"
              >
                Criar conta gratuitamente
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

            <div className="opacity-0-initial animate-fade-in delay-500 flex flex-wrap gap-x-5 gap-y-2 pt-2 text-xs text-muted-foreground">
              <span>✓ Sem cartão de crédito</span>
              <span>✓ Dados isolados por empresa</span>
              <span>✓ Decisão final sempre humana</span>
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
        className="py-20 md:py-32 border-y border-border/40 bg-secondary/15 relative"
        aria-labelledby="sandbox-title"
      >
        <div className="max-w-5xl mx-auto px-6">
          <RevealSection className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 text-xs font-semibold tracking-wide mb-5 shadow-[0_0_22px_color-mix(in_oklch,oklch(0.7_0.18_150)_12%,transparent)]">
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
              image: "/visuals/problemas/recrutador-sobrecarga-curriculos.jpg",
              imageAlt: "Profissional sobrecarregada diante de uma grande pilha de curriculos",
              title: "Tempo desperdiçado",
              desc: "Horas por semana lendo currículos que não chegam perto do perfil. O tempo mais valioso do RH gasto no trabalho mais repetitivo.",
            },
            {
              image: "/visuals/problemas/desorganizacao-processos-manuais.jpg",
              imageAlt: "Profissional cercada por documentos e processos manuais de trabalho",
              title: "Desorganização estrutural",
              desc: "Planilhas, e-mails e pastas compartilhadas que mais confundem do que organizam. Nenhuma visão consolidada do banco de talentos.",
            },
            {
              image: "/visuals/problemas/decisoes-sem-dados-analiticas.jpg",
              imageAlt: "Profissional analisando documentos para tomar uma decisao de contratacao",
              title: "Decisões sem dados",
              desc: "Decisões baseadas em intuição e disponibilidade, sem critérios consistentes para comparar os perfis e justificar prioridades.",
            },
          ].map((item, i) => (
            <RevealSection key={item.title} delay={i * 0.1}>
              <div className="group h-full overflow-hidden rounded-2xl glass-panel glass-panel-interactive">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#15132f]/60 via-transparent to-transparent" aria-hidden="true" />
                </div>
                <div className="space-y-3 p-6">
                  <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
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
        className="py-20 md:py-32 border-y border-border/40 bg-secondary/15 relative"
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
              <div className="group h-full overflow-hidden rounded-2xl glass-panel glass-panel-interactive relative">
                <div className="relative aspect-[2.15] overflow-hidden bg-[#11102d]">
                  <Image
                    src="/visuals/features/smart-match.svg"
                    alt="Ranking visual de candidatos conectado a um núcleo de compatibilidade e explicabilidade"
                    fill
                    sizes="(max-width: 768px) 100vw, 66vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="relative z-10 flex flex-col gap-5 p-8">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-bold text-foreground">
                      Smart Match com Explicabilidade
                    </h3>
                    <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
                      Decisão explicável
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Não apenas um score de compatibilidade. Para cada vaga, a IA gera uma{" "}
                    <span className="text-foreground font-medium">justificativa descritiva</span> —
                    o que o candidato tem, o que falta, e por que foi ranqueado onde foi.
                    Decisões de contratação que você consegue explicar.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Ranking automático", "Justificativa em texto", "Comparativo de candidatos", "Multi-vaga"].map(tag => (
                      <span key={tag} className="rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-xs font-mono text-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </RevealSection>

            {/* Card — Ingestão em Lote */}
            <RevealSection delay={0.1}>
              <div className="group h-full overflow-hidden rounded-2xl glass-panel glass-panel-interactive">
                <div className="relative aspect-[1.7] overflow-hidden bg-[#11102d]">
                  <Image
                    src="/visuals/features/batch-ingestion.svg"
                    alt="Múltiplos documentos entrando em paralelo e saindo organizados após processamento"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="space-y-3 p-6">
                  <h3 className="text-base font-bold text-foreground">Ingestão em Lote</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Arraste dezenas de PDFs de uma vez. O processamento acontece em background
                    enquanto você continua trabalhando. Nenhum bloqueio de tela.
                  </p>
                </div>
              </div>
            </RevealSection>

            {/* Card — Quality Score */}
            <RevealSection delay={0.1}>
              <div className="group h-full overflow-hidden rounded-2xl glass-panel glass-panel-interactive">
                <div className="relative aspect-[1.7] overflow-hidden bg-[#11102d]">
                  <Image
                    src="/visuals/features/quality-score.svg"
                    alt="Indicador visual de qualidade com sinais e validações de perfil"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="space-y-3 p-6">
                  <h3 className="text-base font-bold text-foreground">Quality Score</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Identifica automaticamente perfis mal estruturados ou incompletos.
                    Alertas precisos: dados ausentes, inconsistências e sinais de baixa qualidade.
                  </p>
                </div>
              </div>
            </RevealSection>

            {/* Card — Multi-Tenancy */}
            <RevealSection delay={0.15}>
              <div className="group h-full overflow-hidden rounded-2xl glass-panel glass-panel-interactive">
                <div className="relative aspect-[1.7] overflow-hidden bg-[#11102d]">
                  <Image
                    src="/visuals/features/multi-tenancy.svg"
                    alt="Três ambientes de empresa isolados e protegidos por um escudo central"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="space-y-3 p-6">
                  <h3 className="text-base font-bold text-foreground">Multi-Tenancy Isolada</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Cada empresa tem seus dados isolados com precisão cirúrgica. RBAC completo.
                    Ideal para agências de R&S com múltiplos clientes.
                  </p>
                </div>
              </div>
            </RevealSection>

            {/* Card — Engine Híbrido */}
            <RevealSection delay={0.2}>
              <div className="group h-full overflow-hidden rounded-2xl glass-panel glass-panel-interactive">
                <div className="relative aspect-[1.7] overflow-hidden bg-[#11102d]">
                  <Image
                    src="/visuals/features/hybrid-ai-engine.svg"
                    alt="Duas rotas de processamento de IA convergindo em uma saída unificada"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="space-y-3 p-6">
                  <h3 className="text-base font-bold text-foreground">Engine Híbrido de IA</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    O sistema seleciona o processamento adequado para documentos digitais e
                    escaneados, preservando a experiência em um único fluxo de trabalho.
                  </p>
                </div>
              </div>
            </RevealSection>

            {/* Card — Auditoria & LGPD */}
            <RevealSection delay={0.25}>
              <div className="group h-full overflow-hidden rounded-2xl glass-panel glass-panel-interactive">
                <div className="relative aspect-[1.7] overflow-hidden bg-[#11102d]">
                  <Image
                    src="/visuals/features/audit-lgpd.svg"
                    alt="Trilha de auditoria protegida por um escudo com cadeado e registros validados"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="space-y-3 p-6">
                  <h3 className="text-base font-bold text-foreground">Auditoria & LGPD</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
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

        <RevealSection className="mx-auto mb-16 max-w-5xl" delay={0.1}>
          <div className="overflow-hidden rounded-3xl glass-panel-strong bg-[#11102d] shadow-2xl shadow-primary/10">
            <Image
              src="/visuals/how-it-works/ingestion-pipeline.svg"
              alt="Pipeline visual do upload do currículo até a decisão de contratação"
              width={1200}
              height={720}
              className="h-auto w-full"
            />
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
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
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-primary/20 bg-background p-8 text-center shadow-xl shadow-primary/10 md:p-14 md:text-left">
            <Image
              src="/visuals/cta/cta-depth.svg"
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 960px"
              className="object-cover object-center"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/78 to-background/35" aria-hidden="true" />
            <ThreeOrbBackdrop />

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Comece com clareza
              </div>

              <h2 id="cta-title" className="text-3xl md:text-5xl font-extrabold tracking-tight mb-5 text-foreground">
                Pronto para elevar seu{" "}
                <span className="animate-gradient bg-gradient-to-r from-primary via-violet-500 to-indigo-500 bg-clip-text text-transparent">
                  processo seletivo?
                </span>
              </h2>

              <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto md:mx-0 mb-10 leading-relaxed">
                Centralize currículos, crie vagas e compare candidatos com um fluxo de IA que
                mantém o recrutador no controle. Sem planilhas. Sem achismos.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                <Link
                  href="/login?signup=true"
                  id="cta-final-signup"
                  className="group relative overflow-hidden inline-flex items-center gap-2.5 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.03] active:scale-[0.99] transition-all font-bold py-4 px-9 rounded-xl shadow-lg shadow-primary/20 text-base"
                >
                  <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/15 to-transparent" aria-hidden="true" />
                  <span className="relative">Criar conta gratuitamente</span>
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
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mt-10 text-xs text-muted-foreground/70">
                <span>✓ Sem cartão de crédito</span>
                <span>✓ Configuração em minutos</span>
                <span>✓ Dados isolados por empresa</span>
                <span>✓ Privacidade por desenho</span>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* Footer é injetado pelo layout.tsx (variante simple automática em pathname="/") */}
      <ScrollToTop />
      </div>
    </>
  );
}
