import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MovieRow } from "@/components/catalog/MovieRow";
import { MovieDetailSkeleton, RowSkeleton } from "@/components/catalog/Skeletons";
import { BackButton } from "@/components/movie/BackButton";
import { CastList } from "@/components/movie/CastList";
import { TrailerButton } from "@/components/movie/TrailerButton";
import { WatchProviders } from "@/components/movie/WatchProviders";
import { formatMovieMeta } from "@/lib/format";
import { tmdbImage } from "@/lib/tmdb/images";
import { getMovie, getSimilarStreaming } from "@/lib/tmdb/queries";
import type { MovieDetails } from "@/lib/tmdb/types";
import { parseMovieId } from "./parse-id";

type Props = PageProps<"/filme/[id]">;

export default function MoviePage({ params }: Props) {
  return (
    <Suspense fallback={<MovieDetailSkeleton />}>
      <Movie params={params} />
    </Suspense>
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
  const meta = formatMovieMeta(movie);

  return (
    <article className="pb-8">
      <div className="relative aspect-[16/9] max-h-[55vh] w-full bg-surface sm:aspect-[21/9]">
        {backdrop && <Image src={backdrop} alt="" fill preload sizes="100vw" className="object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
        <div className="absolute left-4 top-4 sm:left-6">
          <BackButton />
        </div>
      </div>

      <div className="relative mx-auto -mt-16 max-w-5xl space-y-8 px-4 sm:-mt-24 sm:px-6">
        <div className="flex flex-col gap-5 md:flex-row md:gap-8">
          <div className="relative aspect-[2/3] w-32 shrink-0 overflow-hidden rounded-lg bg-surface shadow-2xl ring-1 ring-white/10 sm:w-40 md:w-52">
            {poster ? (
              <Image src={poster} alt={movie.title} fill sizes="208px" className="object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center p-3 text-center text-sm text-white/60">
                {movie.title}
              </span>
            )}
          </div>
          <div className="space-y-3 md:pt-24">
            <h1 className="text-3xl font-extrabold sm:text-4xl">{movie.title}</h1>
            {meta && <p className="text-sm text-white/70">{meta}</p>}
            {movie.genres.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {movie.genres.map((g) => (
                  <li key={g.id} className="rounded-full border border-white/15 px-2.5 py-0.5 text-xs text-white/80">
                    {g.name}
                  </li>
                ))}
              </ul>
            )}
            {movie.overview && <p className="max-w-2xl leading-relaxed text-white/85">{movie.overview}</p>}
            {movie.trailer && <TrailerButton trailer={movie.trailer} />}
          </div>
        </div>

        <WatchProviders watch={movie.watch} />
        <CastList cast={movie.cast} />
      </div>

      <div className="mt-10">
        <Suspense fallback={<RowSkeleton />}>
          <Similar movie={movie} />
        </Suspense>
      </div>
    </article>
  );
}

/** Semelhantes que estão nos streamings. Se falhar, a fileira simplesmente não aparece. */
async function Similar({ movie }: { movie: MovieDetails }) {
  const similar = await getSimilarStreaming({ id: movie.id, genres: movie.genres }).catch(() => []);
  return <MovieRow title="Semelhantes" movies={similar} />;
}
