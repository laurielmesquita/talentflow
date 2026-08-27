import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, ChevronDown, FileSearch, Layers3, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import LandingHeader from "@/components/LandingHeader";
import RevealSection from "@/components/RevealSection";
import SandboxDemoWrapper from "@/components/SandboxDemoWrapper";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata = {
  title: "TalentFlow — Conheça candidatos com clareza",
  description: "Pare de ler currículos. Comece a conhecer candidatos com triagem inteligente e decisão humana.",
};

const principles = [
  [FileSearch, "Currículos que viram contexto", "Experiência, skills e sinais importantes organizados para a leitura humana."],
  [UsersRound, "Comparação sem achismo", "Veja quem se aproxima da vaga e entenda o porquê de cada recomendação."],
  [ShieldCheck, "Decisão que você explica", "A IA apoia o recrutador; a decisão final continua sendo sua."],
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <LandingHeader />

      <main>
        <section className="mx-auto grid min-h-[calc(100dvh-72px)] max-w-7xl items-center gap-12 px-5 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-20">
          <div className="max-w-xl">
            <p className="mb-7 text-sm font-semibold tracking-[0.08em] text-primary">TRIAGEM INTELIGENTE, DECISÃO HUMANA</p>
            <h1 className="max-w-[11ch] text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">Pare de ler currículos. <span className="text-primary">Comece a conhecer candidatos.</span></h1>
            <p className="mt-7 max-w-[52ch] text-lg leading-relaxed text-muted-foreground">O TalentFlow transforma currículos em perfis comparáveis para você decidir com contexto, velocidade e confiança.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/login?signup=true" className="inline-flex items-center justify-center gap-2 bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 active:translate-y-0">Criar conta gratuitamente <ArrowUpRight className="h-4 w-4" /></Link>
              <a href="#sandbox" className="inline-flex items-center justify-center gap-2 border border-border px-6 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-secondary">Ver em ação <ChevronDown className="h-4 w-4" /></a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground"><span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> Sem cartão</span><span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> Dados isolados</span><span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> Decisão humana</span></div>
          </div>

          <div className="relative min-h-[420px] overflow-hidden bg-primary p-4 sm:min-h-[560px] sm:p-6">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.12),transparent_45%)]" aria-hidden="true" />
            <Image src="/visuals/people/talentflow-team-hero.png" alt="Equipe de recrutamento em um momento de colaboração e análise" fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover mix-blend-multiply opacity-70" />
            <div className="absolute inset-x-6 bottom-6 bg-background p-5 sm:inset-x-10 sm:bottom-10 sm:p-7"><p className="text-sm font-semibold text-primary">UM FLUXO MAIS HUMANO</p><p className="mt-2 max-w-sm text-2xl font-semibold leading-tight tracking-[-0.03em]">Mais tempo para conversar com quem pode fazer a diferença.</p></div>
          </div>
        </section>

        <section id="sandbox" className="border-y border-border bg-secondary/50 px-5 py-20 sm:px-6 md:py-28" aria-labelledby="sandbox-title">
          <div className="mx-auto max-w-6xl"><RevealSection className="max-w-2xl"><p className="text-sm font-semibold tracking-[0.08em] text-primary">EXPERIMENTE O FLUXO</p><h2 id="sandbox-title" className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">O TalentFlow pensa com você.</h2><p className="mt-5 text-lg leading-relaxed text-muted-foreground">Envie um currículo e veja como o sistema estrutura o perfil, identifica skills e prepara o contexto para uma boa decisão.</p></RevealSection><RevealSection delay={0.12} className="mt-10"><SandboxDemoWrapper /></RevealSection></div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-28" aria-labelledby="features-title">
          <RevealSection className="max-w-3xl"><p className="text-sm font-semibold tracking-[0.08em] text-primary">O QUE MUDA</p><h2 id="features-title" className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Clareza para cada etapa da decisão.</h2></RevealSection>
          <div className="mt-14 grid gap-0 border-t border-border md:grid-cols-3">{principles.map(([Icon, title, text]) => { const Component = Icon as typeof FileSearch; return <RevealSection key={title as string} className="border-b border-border py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0"><Component className="h-7 w-7 text-primary" strokeWidth={1.6} /><h3 className="mt-6 text-xl font-semibold tracking-[-0.025em]">{title as string}</h3><p className="mt-3 leading-relaxed text-muted-foreground">{text as string}</p></RevealSection>; })}</div>
        </section>

        <section className="bg-[#292929] px-5 py-24 text-[#fcfcf8] sm:px-6 md:py-32" aria-labelledby="proof-title"><div className="mx-auto max-w-7xl"><RevealSection className="max-w-3xl"><p className="text-sm font-semibold tracking-[0.08em] text-[#b2c248]">DECISÕES MELHORES COMEÇAM AQUI</p><h2 id="proof-title" className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-6xl">A tecnologia organiza. Pessoas reconhecem pessoas.</h2></RevealSection><div className="mt-16 grid gap-4 md:grid-cols-2"><div className="border border-white/20 p-7 sm:p-10"><Layers3 className="h-7 w-7 text-[#b2c248]" /><p className="mt-16 max-w-md text-2xl leading-snug">“Não apenas um score. Contexto para avaliar cada candidato.”</p><p className="mt-10 text-sm text-white/60">Smart Match com justificativa descritiva</p></div><div className="border border-white/20 p-7 sm:p-10"><Sparkles className="h-7 w-7 text-[#b2c248]" /><p className="mt-16 max-w-md text-2xl leading-snug">“Menos triagem repetitiva. Mais tempo para conversas que importam.”</p><p className="mt-10 text-sm text-white/60">O propósito do TalentFlow</p></div></div></div></section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-28" aria-labelledby="how-title"><RevealSection className="max-w-3xl"><p className="text-sm font-semibold tracking-[0.08em] text-primary">COMO FUNCIONA</p><h2 id="how-title" className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Do PDF à próxima conversa.</h2></RevealSection><div className="mt-14 grid gap-10 border-t border-border pt-8 md:grid-cols-3">{[["01", "Envie", "Arraste seus currículos e deixe o processamento acontecer em segundo plano."], ["02", "Entenda", "Leia perfis comparáveis, skills encontradas e sinais relevantes para a vaga."], ["03", "Decida", "Compare candidatos com uma justificativa clara para cada recomendação."]].map(([number, title, text]) => <RevealSection key={number}><p className="text-sm font-semibold text-primary">{number}</p><h3 className="mt-12 text-2xl font-semibold tracking-[-0.03em]">{title}</h3><p className="mt-3 leading-relaxed text-muted-foreground">{text}</p></RevealSection>)}</div></section>

        <section className="border-t border-border bg-accent px-5 py-20 sm:px-6 md:py-28"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row md:items-end"><div className="max-w-2xl"><p className="text-sm font-semibold tracking-[0.08em] text-accent-foreground">COMECE COM CLAREZA</p><h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.045em] text-accent-foreground sm:text-6xl">Conheça melhor os candidatos que já estão chegando.</h2></div><Link href="/login?signup=true" className="inline-flex w-fit items-center gap-2 bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">Criar conta gratuitamente <ArrowUpRight className="h-4 w-4" /></Link></div></section>
      </main>
      <ScrollToTop />
    </div>
  );
}
