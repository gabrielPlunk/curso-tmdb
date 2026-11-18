// Formato simples que as páginas recebem (já traduzido do TMDB).

export type MovieSummary = {
  id: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  year: string | null;
  rating: number;
};

export type Page<T> = { items: T[]; page: number; hasMore: boolean };

export type Provider = { id: number; name: string; logoPath: string | null };

export type WatchOptions = {
  subscription: Provider[];
  free: Provider[];
  rent: Provider[];
  buy: Provider[];
  isEmpty: boolean;
};

export type CastMember = {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
};

export type Trailer = { youtubeKey: string; name: string };

export type MovieDetails = {
  id: number;
  title: string;
  overview: string;
  year: string | null;
  runtimeMinutes: number | null;
  rating: number;
  genres: { id: number; name: string }[];
  posterPath: string | null;
  backdropPath: string | null;
  trailer: Trailer | null;
  cast: CastMember[];
  watch: WatchOptions;
};
