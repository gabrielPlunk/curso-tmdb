// Formato das respostas do TMDB (só os campos que o app usa).

export type TmdbMovieListItem = {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  vote_average: number;
  genre_ids?: number[];
};

export type TmdbPaged<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

export type TmdbProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
};

export type TmdbWatchCountry = {
  link?: string;
  flatrate?: TmdbProvider[];
  free?: TmdbProvider[];
  ads?: TmdbProvider[];
  rent?: TmdbProvider[];
  buy?: TmdbProvider[];
};

export type TmdbWatchProvidersResponse = {
  id?: number;
  results: Record<string, TmdbWatchCountry | undefined>;
};

export type TmdbVideo = {
  key: string;
  site: string;
  type: string;
  iso_639_1: string;
  name: string;
  official?: boolean;
};

export type TmdbCastRaw = {
  id: number;
  name: string;
  character?: string;
  profile_path: string | null;
};

export type TmdbMovieDetailsRaw = {
  id: number;
  title: string;
  overview?: string;
  release_date?: string;
  runtime?: number | null;
  vote_average: number;
  genres?: { id: number; name: string }[];
  poster_path: string | null;
  backdrop_path: string | null;
  videos?: { results: TmdbVideo[] };
  credits?: { cast: TmdbCastRaw[] };
  "watch/providers"?: TmdbWatchProvidersResponse;
};
