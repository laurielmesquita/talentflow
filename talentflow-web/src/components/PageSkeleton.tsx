interface PageSkeletonProps {
  cards?: number;
  className?: string;
}

export default function PageSkeleton({ cards = 3, className = '' }: PageSkeletonProps) {
  return (
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`} aria-busy="true" aria-label="Carregando conteúdo">
      {Array.from({ length: cards }, (_, index) => (
        <div key={index} className="border-l-2 border-primary border-y border-r border-border bg-card p-6 animate-pulse">
          <div className="h-5 w-3/4 bg-muted" />
          <div className="mt-4 h-3 w-1/2 bg-muted" />
          <div className="mt-6 space-y-2">
            <div className="h-3 bg-muted" />
            <div className="h-3 w-5/6 bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
