import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AmbientSource } from "@/components/ambient/Ambient";
import { LoadMore } from "@/components/catalog/LoadMore";
import { MovieGrid } from "@/components/catalog/MovieGrid";
import { GridSkeleton } from "@/components/catalog/Skeletons";
import { DisplayTitle } from "@/components/ui/DisplayTitle";
import { parseService } from "@/lib/params";
import { SERVICES, resolveCategory } from "@/lib/tmdb/config";
import { ambientImage } from "@/lib/tmdb/images";
import { getCategoryMovies } from "@/lib/tmdb/queries";

type Props = PageProps<"/explorar/[categoria]">;

export default function ExplorePage({ params, searchParams }: Props) {
  return (
    <div className="pt-10 sm:pt-14">
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
  // A luz da página vem do primeiro filme da lista que tiver imagem.
  const lead = first.items.find((m) => m.backdropPath || m.posterPath);

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-10">
      {lead && <AmbientSource src={ambientImage(lead)} />}
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <DisplayTitle size="lg">{category.title}</DisplayTitle>
        {serviceName && <span className="pill glass mb-1">{serviceName}</span>}
      </div>
      {first.items.length === 0 ? (
        <p className="py-16 text-center text-white/60">Nenhum filme encontrado para este serviço agora.</p>
      ) : (
        <div>
          <MovieGrid movies={first.items} />
          <LoadMore
            key={`${category.slug}-${service ?? "todos"}`}
            category={category.slug}
            service={service}
            initialPage={first.page}
            initialHasMore={first.hasMore}
            seenIds={first.items.map((m) => m.id)}
          />
        </div>
      )}
    </div>
  );
}
