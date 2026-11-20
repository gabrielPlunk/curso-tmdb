"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadMoreMovies } from "@/app/(catalogo)/explorar/[categoria]/actions";
import type { CategorySlug, ServiceSlug } from "@/lib/tmdb/config";
import type { MovieSummary } from "@/lib/tmdb/types";
import { gridClass } from "./MovieGrid";
import { PosterCard } from "./PosterCard";

type Props = {
  category: CategorySlug;
  service: ServiceSlug | null;
  initialPage: number;
  initialHasMore: boolean;
  /** Filmes já mostrados pela página 1 (para não repetir). */
  seenIds?: number[];
};

// Quando a pessoa chega perto do fim da grade, busca a próxima página.
export function LoadMore({ category, service, initialPage, initialHasMore, seenIds = [] }: Props) {
  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const sentinel = useRef<HTMLDivElement>(null);
  const seen = useRef(new Set(seenIds));

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const next = await loadMoreMovies(category, service, page + 1);
      const fresh = next.items.filter((m) => (seen.current.has(m.id) ? false : (seen.current.add(m.id), true)));
      setMovies((prev) => [...prev, ...fresh]);
      setPage(next.page);
      setHasMore(next.hasMore);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }, [category, service, page]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore || status !== "idle") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          observer.disconnect();
          void load();
        }
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, status, load]);

  return (
    <>
      {movies.length > 0 && (
        <ul className={`${gridClass} mt-2.5 sm:mt-3.5 pointer-fine:mt-12`}>
          {movies.map((movie) => (
            <li key={movie.id}>
              <PosterCard movie={movie} />
            </li>
          ))}
        </ul>
      )}
      {hasMore && <div ref={sentinel} aria-hidden className="h-px" />}
      {status === "loading" && <p className="py-8 text-center text-sm text-white/55">Carregando mais filmes…</p>}
      {status === "error" && (
        <div className="py-6 text-center">
          <button
            type="button"
            onClick={() => void load()}
            className="pill glass px-5 py-2.5 transition-colors glass-hover"
          >
            Tentar carregar mais
          </button>
        </div>
      )}
    </>
  );
}
