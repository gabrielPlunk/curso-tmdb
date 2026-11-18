import Link from "next/link";
import type { MovieSummary } from "@/lib/tmdb/types";
import { Carousel } from "./Carousel";
import { PosterCard } from "./PosterCard";

export function MovieRow({ title, href, movies }: { title: string; href?: string; movies: MovieSummary[] }) {
  if (!movies.length) return null;
  return (
    <section className="space-y-2">
      <div className="flex items-baseline justify-between px-4 sm:px-6">
        <h2 className="text-lg font-bold sm:text-xl">{title}</h2>
        {href && (
          <Link href={href} className="text-sm text-white/60 hover:text-accent">
            Ver tudo →
          </Link>
        )}
      </div>
      <Carousel label={title}>
        {movies.map((movie) => (
          <PosterCard key={movie.id} movie={movie} className="w-28 shrink-0 snap-start sm:w-36 lg:w-44" />
        ))}
      </Carousel>
    </section>
  );
}
