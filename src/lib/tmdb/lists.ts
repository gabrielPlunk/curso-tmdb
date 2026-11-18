// Tradução das listas do TMDB e montagem do pedido de "discover".
import { LANGUAGE, REGION, STREAMING_MONETIZATION, providerIdsFor, type ServiceSlug } from "./config";
import type { TmdbMovieListItem, TmdbPaged } from "./raw-types";
import type { MovieSummary, Page } from "./types";

/** O TMDB nunca entrega além da página 500. */
const TMDB_MAX_PAGE = 500;

export function yearOf(releaseDate: string | undefined): string | null {
  return releaseDate && releaseDate.length >= 4 ? releaseDate.slice(0, 4) : null;
}

export function roundRating(value: number): number {
  return Math.round(value * 10) / 10;
}

export function mapMovieSummary(raw: TmdbMovieListItem): MovieSummary {
  return {
    id: raw.id,
    title: raw.title,
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path,
    year: yearOf(raw.release_date),
    rating: roundRating(raw.vote_average),
  };
}

/** "Filmes no Brasil, por assinatura ou grátis, nestes streamings, destes gêneros (OU), mais populares primeiro." */
export function buildDiscoverParams(opts: {
  service: ServiceSlug | null;
  genreIds?: number[];
  page?: number;
}): Record<string, string | number> {
  const params: Record<string, string | number> = {
    watch_region: REGION,
    with_watch_providers: providerIdsFor(opts.service),
    with_watch_monetization_types: STREAMING_MONETIZATION,
    sort_by: "popularity.desc",
    language: LANGUAGE,
    include_adult: "false",
    page: opts.page ?? 1,
  };
  if (opts.genreIds?.length) params.with_genres = opts.genreIds.join("|");
  return params;
}

export function toPage(
  raw: TmdbPaged<TmdbMovieListItem>,
  opts: { excludeId?: number } = {},
): Page<MovieSummary> {
  return {
    items: raw.results.filter((m) => m.id !== opts.excludeId).map(mapMovieSummary),
    page: raw.page,
    hasMore: raw.page < Math.min(raw.total_pages, TMDB_MAX_PAGE),
  };
}
