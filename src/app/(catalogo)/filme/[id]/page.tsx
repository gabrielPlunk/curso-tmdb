import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AmbientSource } from "@/components/ambient/Ambient";
import { MovieRow } from "@/components/catalog/MovieRow";
import { MovieDetailSkeleton, RowSkeleton } from "@/components/catalog/Skeletons";
import { BackButton } from "@/components/movie/BackButton";
import { CastList } from "@/components/movie/CastList";
import { TrailerButton } from "@/components/movie/TrailerButton";
import { WatchProviders } from "@/components/movie/WatchProviders";
import { DisplayTitle } from "@/components/ui/DisplayTitle";
import { movieMetaParts } from "@/lib/format";
import { ambientImage, tmdbImage } from "@/lib/tmdb/images";
import { getMovie, getSimilarStreaming } from "@/lib/tmdb/queries";
import type { MovieDetails } from "@/lib/tmdb/types";
import { parseMovieId } from "./parse-id";

type Props = PageProps<"/filme/[id]">;

export default function MoviePage({ params }: Props) {
  return (
    <div>
      <Suspense fallback={<MovieDetailSkeleton />}>
        <Movie params={params} />
      </Suspense>
    </div>
  );
}

async function Movie({ params }: Pick<Props, "params">) {
  const id = parseMovieId((await params).id);
  if (!id) notFound();
  // null = o filme não existe. Outros erros vão para a tela "Algo deu errado".
  const movie = await getMovie(id);
  if (!movie) notFound();

  const backdrop = tmdbImage(movie.backdropPath, "w1280");
  const poster = tmdbImage(movie.posterPath, "w342");
  const meta = movieMetaParts(movie);

  return (
    <article className="space-y-12">
      <AmbientSource src={ambientImage(movie)} />

      {/* Abertura de ponta a ponta: a cena do filme some num degradê, com o título por cima. */}
      <section className="bleed-top relative isolate">
        <div aria-hidden className="hero-fade absolute inset-0 -z-10 overflow-hidden">
          {backdrop && <Image src={backdrop} alt="" fill preload sizes="100vw" className="object-cover object-[center_25%]" />}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/50 to-transparent" />
        </div>
        <div className="flex min-h-[min(76svh,800px)] flex-col justify-between gap-16 px-4 pb-2 pt-[calc(var(--header-h)+1.25rem)] sm:min-h-[min(84svh,840px)] sm:px-6 lg:px-10">
          <div>
            <BackButton />
          </div>
          <div className="space-y-5">
            <DisplayTitle>{movie.title}</DisplayTitle>
            <div className="flex flex-wrap items-center gap-2">
              {movie.trailer && <TrailerButton trailer={movie.trailer} />}
              {meta.map((part) => (
                <span key={part} className="pill glass">
                  {part}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-8 px-4 sm:px-6 lg:px-10">
        <div className="grid gap-8 md:grid-cols-[11rem_1fr] lg:grid-cols-[13rem_1fr_22rem] lg:gap-10">
          <div className="relative hidden aspect-[2/3] overflow-hidden rounded-2xl bg-surface shadow-[0_24px_60px_-20px_rgb(0_0_0/0.9)] ring-1 ring-white/10 md:block">
            {poster ? (
              <Image src={poster} alt={movie.title} fill sizes="208px" className="object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center p-3 text-center text-sm text-white/60">
                {movie.title}
              </span>
            )}
          </div>

          <div className="min-w-0 space-y-5">
            {movie.genres.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {movie.genres.map((g) => (
                  <li key={g.id} className="pill border border-white/20 py-1 text-xs text-white/85">
                    {g.name}
                  </li>
                ))}
              </ul>
            )}
            {movie.overview && (
              <p className="max-w-[62ch] text-base leading-relaxed text-white/85 sm:text-lg sm:leading-relaxed">
                {movie.overview}
              </p>
            )}
            <div className="pt-4">
              <CastList cast={movie.cast} />
            </div>
          </div>

          <WatchProviders watch={movie.watch} className="self-start md:col-span-2 lg:col-span-1" />
        </div>
      </div>

      <Suspense fallback={<RowSkeleton />}>
        <Similar movie={movie} />
      </Suspense>
    </article>
  );
}

/** Semelhantes que estão nos streamings. Se falhar, a fileira simplesmente não aparece. */
async function Similar({ movie }: { movie: MovieDetails }) {
  const similar = await getSimilarStreaming({ id: movie.id, genres: movie.genres }).catch(() => []);
  return <MovieRow title="Semelhantes" movies={similar} />;
}
