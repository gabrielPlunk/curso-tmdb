import type { MovieSummary } from "@/lib/tmdb/types";
import { PosterCard } from "./PosterCard";

// Com mouse (pointer-fine), as linhas ficam mais afastadas para caber os ícones de marcar sob cada pôster.
export const gridClass =
  "grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3.5 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 pointer-fine:gap-y-12";

export function MovieGrid({ movies, showWatchedVeil = true }: { movies: MovieSummary[]; showWatchedVeil?: boolean }) {
  return (
    <ul className={gridClass}>
      {movies.map((movie) => (
        <li key={movie.id}>
          <PosterCard movie={movie} showWatchedVeil={showWatchedVeil} />
        </li>
      ))}
    </ul>
  );
}
