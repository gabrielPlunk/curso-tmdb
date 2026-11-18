import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MovieGrid } from "@/components/catalog/MovieGrid";
import { GridSkeleton } from "@/components/catalog/Skeletons";
import { SearchForm } from "@/components/layout/SearchForm";
import { normalizeQuery, parsePage } from "@/lib/params";
import { searchMovies } from "@/lib/tmdb/queries";

export const metadata: Metadata = { title: "Buscar" };

type Props = PageProps<"/busca">;

export default function SearchPage({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
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
      <div className="max-w-xl">
        <SearchForm key={query ?? ""} defaultValue={query ?? ""} large />
      </div>
      {query ? <Results query={query} page={page} /> : <p className="text-white/60">Digite o nome de um filme para buscar.</p>}
    </>
  );
}

async function Results({ query, page }: { query: string; page: number }) {
  const result = await searchMovies(query, page);
  if (!result.items.length) {
    return <p className="text-white/60">Nenhum filme encontrado para &quot;{query}&quot;.</p>;
  }
  const next = `/busca?q=${encodeURIComponent(query)}&pagina=${result.page + 1}`;
  return (
    <div className="space-y-4">
      <p className="text-sm text-white/50">
        Os resultados podem incluir filmes que não estão em nenhum streaming no Brasil.
      </p>
      <MovieGrid movies={result.items} />
      {result.hasMore && (
        <div className="pt-2 text-center">
          <Link href={next} className="inline-block rounded-md border border-white/20 px-4 py-2 text-sm hover:border-white/50">
            Mais resultados
          </Link>
        </div>
      )}
    </div>
  );
}
