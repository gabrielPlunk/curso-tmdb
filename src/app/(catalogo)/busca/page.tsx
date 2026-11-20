import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AmbientSource } from "@/components/ambient/Ambient";
import { MovieGrid } from "@/components/catalog/MovieGrid";
import { GridSkeleton } from "@/components/catalog/Skeletons";
import { SearchForm } from "@/components/layout/SearchForm";
import { normalizeQuery, parsePage } from "@/lib/params";
import { ambientImage } from "@/lib/tmdb/images";
import { searchMovies } from "@/lib/tmdb/queries";

export const metadata: Metadata = { title: "Buscar" };

type Props = PageProps<"/busca">;

export default function SearchPage({ searchParams }: Props) {
  return (
    <div className="space-y-8 px-4 pt-10 sm:px-6 sm:pt-14 lg:px-10">
      <Suspense fallback={<GridSkeleton />}>
        <Search searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Search({ searchParams }: Pick<Props, "searchParams">) {
  const sp = await searchParams;
  const query = normalizeQuery(sp.q);
  const page = parsePage(sp.pagina);

  return (
    <>
      <div className="max-w-2xl">
        <SearchForm key={query ?? ""} defaultValue={query ?? ""} large />
      </div>
      {query ? (
        <Results query={query} page={page} />
      ) : (
        <p className="text-white/60">Digite o nome de um filme para buscar.</p>
      )}
    </>
  );
}

async function Results({ query, page }: { query: string; page: number }) {
  const result = await searchMovies(query, page);
  if (!result.items.length) {
    return <p className="text-white/60">Nenhum filme encontrado para &quot;{query}&quot;.</p>;
  }
  const lead = result.items.find((m) => m.backdropPath || m.posterPath);
  const next = `/busca?q=${encodeURIComponent(query)}&pagina=${result.page + 1}`;
  return (
    <div className="space-y-5">
      {lead && <AmbientSource src={ambientImage(lead)} />}
      <p className="text-sm text-white/55">Os resultados podem incluir filmes que não estão em nenhum streaming no Brasil.</p>
      <MovieGrid movies={result.items} />
      {result.hasMore && (
        <div className="pt-4 text-center">
          <Link href={next} className="pill glass px-5 py-2.5 transition-colors glass-hover">
            Mais resultados
          </Link>
        </div>
      )}
    </div>
  );
}
