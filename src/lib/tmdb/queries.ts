// Os "pedidos prontos" que as páginas usam. Cada resposta fica guardada (cache) por horas.
import "server-only";
import { cacheLife } from "next/cache";
import { TmdbNotFoundError, tmdbFetch } from "./client";
import { LANGUAGE, REGION, resolveCategory, type CategorySlug, type ServiceSlug } from "./config";
import { mapMovieDetails, pickHeroService } from "./details";
import { buildDiscoverParams, toPage } from "./lists";
import type { TmdbMovieDetailsRaw, TmdbMovieListItem, TmdbPaged, TmdbWatchProvidersResponse } from "./raw-types";
import type { MovieDetails, MovieSummary, Page } from "./types";

const MAX_SIMILAR = 20;

export async function getCategoryMovies(
  category: CategorySlug,
  service: ServiceSlug | null,
  page = 1,
): Promise<Page<MovieSummary>> {
  "use cache";
  cacheLife("catalogo");
  const genreId = resolveCategory(category)?.genreId;
  const raw = await tmdbFetch<TmdbPaged<TmdbMovieListItem>>(
    "/discover/movie",
    buildDiscoverParams({ service, genreIds: genreId ? [genreId] : undefined, page }),
  );
  return toPage(raw);
}

export type Featured = {
  movie: MovieSummary;
  service: { name: string; preposition: "na" | "no" } | null;
};

/** O filme mais popular do filtro atual que tenha imagem de fundo. */
export async function getFeatured(service: ServiceSlug | null): Promise<Featured | null> {
  "use cache";
  cacheLife("catalogo");
  const { items } = await getCategoryMovies("em-alta", service, 1);
  const movie = items.find((m) => m.backdropPath);
  if (!movie) return null;
  const providers = await tmdbFetch<TmdbWatchProvidersResponse>(`/movie/${movie.id}/watch/providers`);
  return { movie, service: pickHeroService(providers.results?.BR, service) };
}

/**
 * Detalhes de um filme, ou `null` se ele não existe no TMDB.
 * "Não encontrado" sai como valor, e não como erro, porque um erro lançado dentro do
 * "use cache" chega à página como um Error genérico no build de produção.
 */
export async function getMovie(id: number): Promise<MovieDetails | null> {
  "use cache";
  cacheLife("filme");
  let raw: TmdbMovieDetailsRaw;
  try {
    raw = await tmdbFetch<TmdbMovieDetailsRaw>(`/movie/${id}`, {
      language: LANGUAGE,
      append_to_response: "videos,credits,watch/providers",
      include_video_language: "pt,en",
    });
  } catch (error) {
    if (error instanceof TmdbNotFoundError) return null;
    throw error;
  }
  let fallback: string | null = null;
  if (!raw.overview?.trim()) {
    const en = await tmdbFetch<{ overview?: string }>(`/movie/${id}`, { language: "en-US" });
    fallback = en.overview ?? null;
  }
  return mapMovieDetails(raw, fallback);
}

/** Semelhantes que também estão nos streamings (mesma promessa da vitrine). */
export async function getSimilarStreaming(movie: Pick<MovieDetails, "id" | "genres">): Promise<MovieSummary[]> {
  "use cache";
  cacheLife("catalogo");
  if (!movie.genres.length) return [];
  const raw = await tmdbFetch<TmdbPaged<TmdbMovieListItem>>(
    "/discover/movie",
    buildDiscoverParams({ service: null, genreIds: movie.genres.slice(0, 2).map((g) => g.id) }),
  );
  return toPage(raw, { excludeId: movie.id }).items.slice(0, MAX_SIMILAR);
}

/** Busca no acervo inteiro do TMDB (não filtra por streaming). */
export async function searchMovies(query: string, page = 1): Promise<Page<MovieSummary>> {
  "use cache";
  cacheLife("catalogo");
  const raw = await tmdbFetch<TmdbPaged<TmdbMovieListItem>>("/search/movie", {
    query,
    language: LANGUAGE,
    region: REGION,
    include_adult: "false",
    page,
  });
  return toPage(raw);
}
