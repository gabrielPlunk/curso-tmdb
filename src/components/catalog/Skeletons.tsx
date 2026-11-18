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

export function GridSkeleton() {
  return (
    <div className="space-y-4 px-4 sm:px-6" aria-busy="true" aria-label="Carregando">
      <div className={`${pulse} h-8 w-56`} />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6">
        {Array.from({ length: 18 }, (_, i) => (
          <div key={i} className={`${pulse} aspect-[2/3]`} />
        ))}
      </div>
    </div>
  );
}

export function MovieDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando">
      <div className={`${pulse} aspect-[21/9] max-h-[50vh] w-full rounded-none`} />
      <div className="mx-auto -mt-20 flex max-w-5xl gap-6 px-4 sm:px-6">
        <div className={`${pulse} hidden aspect-[2/3] w-48 shrink-0 md:block`} />
        <div className="flex-1 space-y-3 pt-24 md:pt-20">
          <div className={`${pulse} h-8 w-2/3`} />
          <div className={`${pulse} h-4 w-1/3`} />
          <div className={`${pulse} h-20 w-full`} />
        </div>
      </div>
    </div>
  );
}
