// Blocos translúcidos no formato do conteúdo, enquanto os dados carregam.
const pulse = "animate-pulse bg-white/[0.06]";
const gutter = "px-4 sm:px-6 lg:px-10";

export function RowSkeleton() {
  return (
    <div className="space-y-3">
      <div className={gutter}>
        <div className={`${pulse} h-7 w-40 rounded-lg`} />
      </div>
      <div className={`flex gap-2.5 overflow-hidden pt-2 sm:gap-3.5 ${gutter}`}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className={`${pulse} aspect-[2/3] w-28 shrink-0 rounded-[14px] sm:w-36 lg:w-44`} />
        ))}
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="space-y-10" aria-busy="true" aria-label="Carregando">
      <div className={`${pulse} hero-fade bleed-top h-[min(80svh,860px)] sm:h-[min(90svh,900px)]`} />
      <RowSkeleton />
      <RowSkeleton />
    </div>
  );
}

export function GridSkeleton() {
  return (
    <div className={`space-y-6 ${gutter}`} aria-busy="true" aria-label="Carregando">
      <div className={`${pulse} h-14 w-64 rounded-xl`} />
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3.5 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
        {Array.from({ length: 21 }, (_, i) => (
          <div key={i} className={`${pulse} aspect-[2/3] rounded-[14px]`} />
        ))}
      </div>
    </div>
  );
}

export function MovieDetailSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Carregando">
      <div className={`${pulse} hero-fade bleed-top h-[min(76svh,800px)] sm:h-[min(84svh,840px)]`} />
      <div className={`flex gap-8 ${gutter}`}>
        <div className={`${pulse} hidden aspect-[2/3] w-52 shrink-0 rounded-2xl md:block`} />
        <div className="flex-1 space-y-3">
          <div className={`${pulse} h-5 w-1/3 rounded-md`} />
          <div className={`${pulse} h-24 w-full max-w-2xl rounded-md`} />
        </div>
      </div>
    </div>
  );
}
