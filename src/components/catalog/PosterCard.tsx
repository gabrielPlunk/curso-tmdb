import Image from "next/image";
import Link from "next/link";
import { PosterActions, WatchedVeil } from "@/components/marks/PosterMarks";
import { ambientImage, tmdbImage } from "@/lib/tmdb/images";
import type { MovieSummary } from "@/lib/tmdb/types";

type Props = {
  movie: MovieSummary;
  className?: string;
  /** Véu "Já assistido" sobre filmes vistos. Desligado na aba "Já assisti" do perfil, onde seria repetitivo. */
  showWatchedVeil?: boolean;
};

// data-ambient: ao parar o mouse (ou o foco) sobre o pôster, a luz da página muda para a cor deste filme.
// O hover vale para o pôster e para os ícones embaixo dele juntos (group/poster), para nada sumir no caminho.
export function PosterCard({ movie, className = "", showWatchedVeil = true }: Props) {
  const src = tmdbImage(movie.posterPath, "w342");
  return (
    <div className={`group/poster relative ${className}`}>
      <Link
        href={`/filme/${movie.id}`}
        title={movie.title}
        data-ambient={ambientImage(movie) ?? undefined}
        className="relative block aspect-[2/3] overflow-hidden rounded-[14px] bg-surface shadow-[0_18px_40px_-18px_rgb(0_0_0/0.9)] ring-1 ring-white/10 transition duration-300 group-hover/poster:ring-white/50 motion-safe:group-hover/poster:-translate-y-1"
      >
        {src ? (
          <Image src={src} alt={movie.title} fill sizes="(min-width: 1024px) 180px, 33vw" className="object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center p-3 text-center font-display text-sm font-bold text-white/75 [font-stretch:90%]">
            {movie.title}
          </span>
        )}
        {showWatchedVeil && <WatchedVeil movieId={movie.id} />}
      </Link>
      <PosterActions movieId={movie.id} />
    </div>
  );
}
