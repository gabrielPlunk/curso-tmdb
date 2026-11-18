// Blocos cinza no formato do conteúdo, enquanto os dados carregam.
const pulse = "animate-pulse rounded-md bg-white/5";

export function RowSkeleton() {
  return (
    <div className="space-y-2">
      <div className={`${pulse} mx-4 h-6 w-40 sm:mx-6`} />
      <div className="flex gap-2 overflow-hidden px-4 sm:gap-3 sm:px-6">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className={`${pulse} aspect-[2/3] w-28 shrink-0 sm:w-36 lg:w-44`} />
        ))}
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Carregando">
      <div className={`${pulse} mx-4 aspect-[16/9] max-h-[70vh] sm:mx-6 sm:aspect-[21/9]`} />
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
    </div>
  );
}
