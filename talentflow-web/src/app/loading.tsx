export default function Loading() {
  return (
    <div className="flex-1 bg-background text-foreground flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-5 text-center px-6">
        {/* Wordmark */}
        <p className="text-[15px] font-semibold tracking-tight text-foreground">
          TalentFlow
        </p>

        {/* Progress bar */}
        <div className="w-40 h-[2px] bg-border/60 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-primary rounded-full animate-[shimmer-slide_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
        </div>

        <p className="text-[12px] text-muted-foreground tracking-wide">
          Carregando dados...
        </p>
      </div>
    </div>
  );
}
