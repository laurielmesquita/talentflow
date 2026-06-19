export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      
      <div className="flex flex-col items-center gap-4 text-center px-6">
        {/* Modern animated ring spinner */}
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20"></div>
          <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-t-primary animate-spin"></div>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-semibold tracking-tight text-foreground animate-pulse">Carregando dados táticos...</p>
          <p className="text-xs text-muted-foreground">Sincronizando banco de talentos e pipelines</p>
        </div>
      </div>
    </div>
  );
}
