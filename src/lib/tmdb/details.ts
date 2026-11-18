// Organização da página do filme: onde assistir, trailer, destaque.
import { SERVICES, type ServiceSlug } from "./config";
import { roundRating, yearOf } from "./lists";
import type { TmdbMovieDetailsRaw, TmdbProvider, TmdbVideo, TmdbWatchCountry } from "./raw-types";
import type { MovieDetails, Provider, Trailer, WatchOptions } from "./types";

const MAX_CAST = 12;

function toProviders(...groups: (TmdbProvider[] | undefined)[]): Provider[] {
  const seen = new Set<number>();
  return groups
    .flatMap((g) => g ?? [])
    .sort((a, b) => a.display_priority - b.display_priority)
    .filter((p) => (seen.has(p.provider_id) ? false : (seen.add(p.provider_id), true)))
    .map((p) => ({ id: p.provider_id, name: p.provider_name, logoPath: p.logo_path }));
}

/** Separa por tipo de acesso. "Grátis" junta free e ads. */
export function groupWatchProviders(country: TmdbWatchCountry | undefined): WatchOptions {
  const subscription = toProviders(country?.flatrate);
  const free = toProviders(country?.free, country?.ads);
  const rent = toProviders(country?.rent);
  const buy = toProviders(country?.buy);
  const isEmpty = !subscription.length && !free.length && !rent.length && !buy.length;
  return { subscription, free, rent, buy, isEmpty };
}

const TRAILER_PREFERENCE: [type: string, lang: string][] = [
  ["Trailer", "pt"],
  ["Trailer", "en"],
  ["Teaser", "pt"],
  ["Teaser", "en"],
];

export function pickTrailer(videos: TmdbVideo[]): Trailer | null {
  const youtube = videos.filter((v) => v.site === "YouTube");
  for (const [type, lang] of TRAILER_PREFERENCE) {
    const found = youtube.find((v) => v.type === type && v.iso_639_1 === lang);
    if (found) return { youtubeKey: found.key, name: found.name };
  }
  return null;
}

/** Qual dos seis serviços aparece no destaque: o selecionado, se tiver o filme; senão o de maior prioridade. */
export function pickHeroService(
  country: TmdbWatchCountry | undefined,
  selected: ServiceSlug | null,
): { name: string; preposition: "na" | "no" } | null {
  const available = [...(country?.flatrate ?? []), ...(country?.free ?? []), ...(country?.ads ?? [])].sort(
    (a, b) => a.display_priority - b.display_priority,
  );
  const known = available
    .map((p) => SERVICES.find((s) => s.providerId === p.provider_id))
    .filter((s) => s !== undefined);
  const chosen = known.find((s) => s.slug === selected) ?? known[0];
  return chosen ? { name: chosen.name, preposition: chosen.preposition } : null;
}

export function mapMovieDetails(raw: TmdbMovieDetailsRaw, fallbackOverview: string | null): MovieDetails {
  return {
    id: raw.id,
    title: raw.title,
    overview: raw.overview?.trim() || fallbackOverview?.trim() || "",
    year: yearOf(raw.release_date),
    runtimeMinutes: raw.runtime ? raw.runtime : null,
    rating: roundRating(raw.vote_average),
    genres: raw.genres ?? [],
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path,
    trailer: pickTrailer(raw.videos?.results ?? []),
    cast: (raw.credits?.cast ?? []).slice(0, MAX_CAST).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character ?? "",
      profilePath: c.profile_path,
    })),
    watch: groupWatchProviders(raw["watch/providers"]?.results?.BR),
  };
}
