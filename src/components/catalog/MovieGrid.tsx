import type { MovieSummary } from "@/lib/tmdb/types";
import { PosterCard } from "./PosterCard";

export const gridClass = "grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3.5 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7";

export function MovieGrid({ movies }: { movies: MovieSummary[] }) {
  return (
    <ul className={gridClass}>
      {movies.map((movie) => (
        <li key={movie.id}>
          <PosterCard movie={movie} />
        </li>
      ))}
    </ul>
  );
}
