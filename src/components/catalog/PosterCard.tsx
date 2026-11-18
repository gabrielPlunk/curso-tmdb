import Image from "next/image";
import Link from "next/link";
import { tmdbImage } from "@/lib/tmdb/images";
import type { MovieSummary } from "@/lib/tmdb/types";

export function PosterCard({ movie, className = "" }: { movie: MovieSummary; className?: string }) {
  const src = tmdbImage(movie.posterPath, "w342");
  return (
    <Link
      href={`/filme/${movie.id}`}
      title={movie.title}
      className={`group relative block aspect-[2/3] overflow-hidden rounded-md bg-surface ring-accent/80 transition-transform duration-200 hover:scale-[1.04] focus-visible:ring-2 ${className}`}
    >
      {src ? (
        <Image src={src} alt={movie.title} fill sizes="(min-width: 1024px) 180px, 33vw" className="object-cover" />
      ) : (
        <span className="flex h-full items-center justify-center p-3 text-center text-sm font-semibold text-white/70">
          {movie.title}
        </span>
      )}
    </Link>
  );
}
