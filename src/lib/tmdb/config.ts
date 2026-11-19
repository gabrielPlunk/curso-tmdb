// Listas fixas do app: país, idioma, streamings e gêneros.

export const REGION = "BR";
export const LANGUAGE = "pt-BR";
/** Assinatura + grátis (com ou sem anúncios). Aluguel e compra ficam de fora da vitrine. */
export const STREAMING_MONETIZATION = "flatrate|free|ads";

export type ServiceSlug =
  | "netflix"
  | "prime-video"
  | "disney-plus"
  | "max"
  | "apple-tv"
  | "globoplay";

export type Service = {
  slug: ServiceSlug;
  name: string;
  providerId: number;
  /** Para escrever "Disponível na Netflix" / "Disponível no Prime Video". */
  preposition: "na" | "no";
};

export const SERVICES: readonly Service[] = [
  { slug: "netflix", name: "Netflix", providerId: 8, preposition: "na" },
  { slug: "prime-video", name: "Prime Video", providerId: 119, preposition: "no" },
  { slug: "disney-plus", name: "Disney+", providerId: 337, preposition: "no" },
  { slug: "max", name: "HBO Max", providerId: 1899, preposition: "na" },
  { slug: "apple-tv", name: "Apple TV", providerId: 350, preposition: "na" },
  { slug: "globoplay", name: "Globoplay", providerId: 307, preposition: "no" },
];

/** Um serviço → seu ID; "Todos" (null) → os seis IDs unidos por "|" (OU). */
export function providerIdsFor(service: ServiceSlug | null): string {
  const list = service ? SERVICES.filter((s) => s.slug === service) : SERVICES;
  return list.map((s) => s.providerId).join("|");
}

export type GenreSlug =
  | "acao"
  | "comedia"
  | "drama"
  | "terror"
  | "ficcao-cientifica"
  | "animacao"
  | "romance"
  | "suspense";

export type CategorySlug = "em-alta" | GenreSlug;

export type Category = { slug: CategorySlug; title: string; genreId: number | null };

export const CATEGORIES: readonly Category[] = [
  { slug: "em-alta", title: "Em alta", genreId: null },
  { slug: "acao", title: "Ação", genreId: 28 },
  { slug: "comedia", title: "Comédia", genreId: 35 },
  { slug: "drama", title: "Drama", genreId: 18 },
  { slug: "terror", title: "Terror", genreId: 27 },
  { slug: "ficcao-cientifica", title: "Ficção científica", genreId: 878 },
  { slug: "animacao", title: "Animação", genreId: 16 },
  { slug: "romance", title: "Romance", genreId: 10749 },
  { slug: "suspense", title: "Suspense", genreId: 53 },
];

export function resolveCategory(slug: string): Category | null {
  return CATEGORIES.find((c) => c.slug === slug) ?? null;
}
