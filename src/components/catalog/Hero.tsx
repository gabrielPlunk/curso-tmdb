import Image from "next/image";
import Link from "next/link";
import { tmdbImage } from "@/lib/tmdb/images";
import type { Featured } from "@/lib/tmdb/queries";

export function Hero({ featured }: { featured: Featured }) {
  const { movie, service } = featured;
  const src = tmdbImage(movie.backdropPath, "w1280");
  return (
    <section className="relative mx-4 overflow-hidden rounded-xl bg-surface sm:mx-6">
      <div className="relative aspect-[16/9] max-h-[70vh] w-full sm:aspect-[21/9]">
        {src && <Image src={src} alt="" fill preload sizes="100vw" className="object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 space-y-2 p-5 sm:p-8">
          <h1 className="max-w-2xl text-2xl font-extrabold drop-shadow sm:text-4xl">{movie.title}</h1>
          <p className="text-sm text-white/80 sm:text-base">
            {service ? `Disponível ${service.preposition} ${service.name}` : "Disponível nos streamings"}
          </p>
          <Link
            href={`/filme/${movie.id}`}
            className="inline-block rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/85"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </section>
  );
}
