import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LoadMore } from "@/components/catalog/LoadMore";
import { MovieGrid } from "@/components/catalog/MovieGrid";
import { GridSkeleton } from "@/components/catalog/Skeletons";
import { parseService } from "@/lib/params";
import { SERVICES, resolveCategory } from "@/lib/tmdb/config";
import { getCategoryMovies } from "@/lib/tmdb/queries";

type Props = PageProps<"/explorar/[categoria]">;

export default function ExplorePage({ params, searchParams }: Props) {
  return (
    <div className="py-6">
      <Suspense fallback={<GridSkeleton />}>
        <Explore params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Explore({ params, searchParams }: Props) {
  const category = resolveCategory((await params).categoria);
  if (!category) notFound();
  const service = parseService((await searchParams).servico);
  const serviceName = SERVICES.find((s) => s.slug === service)?.name;

  const first = await getCategoryMovies(category.slug, service, 1);

  return (
    <div className="space-y-4 px-4 sm:px-6">
      <h1 className="text-2xl font-bold">
        {category.title}
        {serviceName && <span className="text-white/60"> · {serviceName}</span>}
      </h1>
      {first.items.length === 0 ? (
        <p className="py-16 text-center text-white/60">Nenhum filme encontrado para este serviço agora.</p>
      ) : (
        <>
          <MovieGrid movies={first.items} />
          <LoadMore
            key={`${category.slug}-${service ?? "todos"}`}
            category={category.slug}
            service={service}
            initialPage={first.page}
            initialHasMore={first.hasMore}
            seenIds={first.items.map((m) => m.id)}
          />
        </>
      )}
    </div>
  );
}
