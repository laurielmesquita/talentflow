"use client";

import { useState, useEffect } from "react";
import { FileText, ExternalLink, Download, AlertCircle, Eye } from "lucide-react";

interface PDFViewerProps {
  pdfUrl?: string | null;
  candidateName: string;
  className?: string;
}

export default function PDFViewer({ pdfUrl, candidateName, className = "" }: PDFViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(pdfUrl || null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    let currentBlobUrl: string | null = null;

    if (!pdfUrl) {
      setIsLoading(false);
      return;
    }

    // Se já é um blob local ou data URL, não refaz o fetch
    if (pdfUrl.startsWith("blob:") || pdfUrl.startsWith("data:")) {
      setBlobUrl(pdfUrl);
      setIsLoading(false);
      return;
    }

    async function loadPdfBlob() {
      try {
        const res = await fetch(pdfUrl!);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const arrayBuffer = await res.arrayBuffer();
        if (!active) return;

        // Converte em Blob com MIME type 'application/pdf' explícito
        const blob = new Blob([arrayBuffer], { type: "application/pdf" });
        currentBlobUrl = URL.createObjectURL(blob);
        setBlobUrl(currentBlobUrl);
      } catch (err) {
        // Fallback para a URL direta caso ocorra falha de rede/CORS
        if (active) {
          setBlobUrl(pdfUrl!);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadPdfBlob();

    return () => {
      active = false;
      if (currentBlobUrl && currentBlobUrl.startsWith("blob:")) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [pdfUrl]);

  if (!pdfUrl) {
    return (
      <div className={`flex flex-col items-center justify-center h-full bg-card/60 backdrop-blur-sm rounded-xl border border-border/60 p-8 text-center ${className}`}>
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 text-muted-foreground">
          <FileText className="w-8 h-8 opacity-60" />
        </div>
        <h4 className="text-base font-semibold text-foreground">Arquivo PDF Não Encontrado</h4>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          Nenhum arquivo PDF original de <strong className="text-foreground">{candidateName}</strong> está disponível para visualização no momento.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-card/80 backdrop-blur-md rounded-xl border border-border/60 shadow-lg overflow-hidden transition-all duration-300 ${className}`}>
      {/* Barra de Ferramentas / Cabeçalho do PDF */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-muted/40 border-b border-border/60 backdrop-blur-md">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-1.5 bg-primary/10 rounded-lg text-primary flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Documento Original</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                PDF
              </span>
            </div>
            <p className="text-sm font-medium text-foreground truncate max-w-[200px] sm:max-w-xs">
              {candidateName}.pdf
            </p>
          </div>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir em nova guia"
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80 bg-muted/40 border border-border/50 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Nova Guia</span>
          </a>
          <a
            href={pdfUrl}
            download={`${candidateName.replace(/\s+/g, "_")}_Curriculo.pdf`}
            title="Baixar arquivo original"
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm transition-all hover:shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Baixar</span>
          </a>
        </div>
      </div>

      {/* Área Principal do Visualizador (50% Split) */}
      <div className="relative flex-1 w-full h-full bg-slate-900/10 dark:bg-slate-950/40 min-h-[400px]">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity">
            <div className="relative flex items-center justify-center w-12 h-12 mb-3">
              <span className="absolute w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs font-medium text-muted-foreground animate-pulse">
              Processando documento de {candidateName}...
            </p>
          </div>
        )}

        {/* Error / Fallback UI */}
        {hasError ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-card">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 text-amber-500">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h5 className="text-base font-bold text-foreground">Não foi possível exibir o PDF</h5>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-sm">
              O arquivo original está seguro. Você pode visualizá-lo abrindo externamente.
            </p>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir PDF em Nova Guia</span>
            </a>
          </div>
        ) : (
          blobUrl && (
            <object
              data={blobUrl}
              type="application/pdf"
              className="w-full h-full border-0 bg-white dark:bg-slate-900"
            >
              <iframe
                src={blobUrl}
                title={`Currículo Original - ${candidateName}`}
                className="w-full h-full border-0"
              />
            </object>
          )
        )}
      </div>
    </div>
  );
}
