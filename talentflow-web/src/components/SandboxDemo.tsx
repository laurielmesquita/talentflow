"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface SandboxResult {
  full_name: string;
  skills: string[];
  experiences: {
    company_name: string;
    job_title: string;
    is_current: boolean;
  }[];
  quality_score: number;
  quality_alerts: string[];
}

export default function SandboxDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SandboxResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== "application/pdf") {
        setError("Por favor, selecione apenas arquivos PDF.");
        return;
      }
      setFile(selected);
      await processFile(selected);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const selected = e.dataTransfer.files?.[0];
    if (selected) {
      if (selected.type !== "application/pdf") {
        setError("Por favor, selecione apenas arquivos PDF.");
        return;
      }
      setFile(selected);
      await processFile(selected);
    }
  };

  const processFile = async (selectedFile: File) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${baseUrl}/api/sandbox/extract`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 429) throw new Error("Você atingiu o limite de testes por minuto. Aguarde um instante.");
        if (response.status === 503) throw new Error("O orçamento diário da Sandbox esgotou. Volte amanhã!");
        throw new Error("Erro ao processar currículo. Tente novamente.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-5xl rounded-2xl glass-panel-strong p-3 md:p-4 shadow-2xl">
      {!loading && !result && (
        <div className="grid overflow-hidden rounded-xl border border-white/10 bg-background/35 md:grid-cols-[1.15fr_0.85fr]">
          <div className="relative min-h-[280px] overflow-hidden bg-[#11102d] md:min-h-[420px]">
            <Image
              src="/visuals/sandbox/extraction-flow.svg"
              alt="Fluxo visual de um currículo passando pela análise de IA até virar um perfil estruturado"
              fill
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#11102d]/35" aria-hidden="true" />
          </div>

          <div
            className="flex cursor-pointer flex-col items-center justify-center border-t-2 border-dashed border-border/60 bg-background/45 p-8 text-center transition-colors hover:border-primary/50 md:border-l-0 md:border-t-0 md:border-l-2 md:p-10"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
            }}
          >
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UploadCloud className="h-8 w-8" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Faça upload de um currículo (PDF)</h3>
            <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
              Arraste e solte o arquivo aqui ou clique para selecionar. O processamento leva cerca de 3 segundos.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Ao enviar este arquivo, você concorda com o processamento temporário dos dados por nossa IA. Os dados não são armazenados.
            </p>

            {error && (
              <div className="mt-6 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
                <AlertTriangle className="h-4 w-4" /> {error}
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
          <h3 className="text-xl font-bold mb-2 animate-pulse">Analisando currículo com IA...</h3>
          <p className="text-muted-foreground text-sm">Extraindo experiências, habilidades e avaliando a qualidade.</p>
        </div>
      )}

      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between border-b border-border/40 pb-6 flex-wrap gap-4">
            <div>
              <h3 className="text-2xl font-bold mb-1">{result.full_name}</h3>
              <p className="text-muted-foreground">Perfil extraído com sucesso via Sandbox</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-xl border text-sm font-bold flex items-center gap-2 ${
                result.quality_score >= 80 ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' :
                result.quality_score >= 60 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
              }`}>
                {result.quality_score >= 80 ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                Quality Score: {result.quality_score}/100
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Habilidades Encontradas</h4>
                <div className="flex flex-wrap gap-2">
                  {result.skills.length > 0 ? result.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-secondary text-sm font-medium border border-border/60">
                      {skill}
                    </span>
                  )) : (
                    <span className="text-sm text-muted-foreground">Nenhuma habilidade listada explicitamente.</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Principais Experiências</h4>
                <div className="space-y-3">
                  {result.experiences.length > 0 ? result.experiences.map((exp, i) => (
                    <div key={i} className="p-3 rounded-xl border border-border/60 bg-background/40">
                      <div className="font-semibold text-sm">{exp.job_title}</div>
                      <div className="text-xs text-muted-foreground">{exp.company_name} {exp.is_current ? '(Atual)' : ''}</div>
                    </div>
                  )) : (
                    <span className="text-sm text-muted-foreground">Nenhuma experiência extraída.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 text-primary opacity-20">
                  <Sparkles className="w-16 h-16" />
                </div>
                <div className="flex items-center gap-2 text-primary font-bold text-sm mb-3">
                  <Sparkles className="w-4 h-4" />
                  Insight da IA
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">
                  A extração foi concluída com sucesso usando nossos modelos de IA. 
                  Em produção, a TalentFlow analisa esses dados para gerar um ranking de compatibilidade com a vaga e uma justificativa explicável.
                </p>
                {result.quality_alerts && result.quality_alerts.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-primary/10">
                    <div className="text-xs font-bold text-destructive mb-2 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" /> Alertas de Qualidade no Currículo:
                    </div>
                    <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                      {result.quality_alerts.map((alert, i) => <li key={i}>{alert}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-border/40 gap-4">
            <button 
              onClick={() => { setResult(null); setFile(null); }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Testar outro currículo
            </button>
            <Link 
              href="/login?signup=true" 
              className="w-full sm:w-auto text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md py-3 px-6 rounded-xl flex items-center justify-center gap-2 group"
            >
              Gostou? Crie sua conta grátis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
