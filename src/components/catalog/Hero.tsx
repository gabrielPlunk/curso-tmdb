import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AmbientSource } from "@/components/ambient/Ambient";
import { DisplayTitle } from "@/components/ui/DisplayTitle";
import { formatRating } from "@/lib/format";
import { ambientImage, tmdbImage } from "@/lib/tmdb/images";
import type { Featured } from "@/lib/tmdb/queries";

// O filme em destaque, de ponta a ponta: a imagem começa atrás do cabeçalho e some num degradê para baixo.
// `children` é o filtro de streaming, numa pílula de vidro logo abaixo do título.
export function Hero({ featured, children }: { featured: Featured; children?: ReactNode }) {
  const { movie, service } = featured;
  const src = tmdbImage(movie.backdropPath, "w1280");
  return (
    <section aria-labelledby="destaque-titulo" className="bleed-top relative isolate">
      <AmbientSource src={ambientImage(movie)} />
      <div aria-hidden className="hero-fade absolute inset-0 -z-10 overflow-hidden">
        {src && <Image src={src} alt="" fill preload sizes="100vw" className="object-cover object-[center_25%]" />}
        {/* Escurece a esquerda (onde fica o texto) e o topo (onde fica o cabeçalho). */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/50 to-transparent" />
      </div>

      <div className="flex min-h-[min(80svh,860px)] flex-col justify-end gap-5 px-4 pb-2 pt-48 sm:min-h-[min(90svh,900px)] sm:px-6 lg:px-10">
        <p className="text-sm font-medium text-white/80 sm:text-base">
          {service ? `Disponível ${service.preposition} ${service.name}` : "Disponível nos streamings"}
        </p>
        <DisplayTitle id="destaque-titulo">{movie.title}</DisplayTitle>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Link href={`/filme/${movie.id}`} className="btn-light">
            Ver detalhes
          </Link>
          {movie.year && <span className="pill glass">{movie.year}</span>}
          {movie.rating > 0 && <span className="pill glass">★ {formatRating(movie.rating)}</span>}
        </div>
        {children && <div className="glass mt-6 w-fit max-w-full rounded-full sm:mt-10">{children}</div>}
      </div>
    </section>
  );
}
