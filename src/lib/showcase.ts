// Decide o que a vitrine mostra a partir das respostas (algumas podem ter falhado).
import { CATEGORIES, type Category } from "./tmdb/config";
import type { Featured } from "./tmdb/queries";
import type { MovieSummary, Page } from "./tmdb/types";

export type Showcase = { hero: Featured | null; rows: { category: Category; movies: MovieSummary[] }[] };

/**
 * Uma fileira que falhou ou veio vazia some. Mas se TUDO falhou (TMDB fora do ar, chave inválida),
 * lança o erro para aparecer a tela "Algo deu errado" com "Tentar de novo", em vez de uma vitrine vazia.
 */
export function buildShowcase(
  featured: PromiseSettledResult<Featured | null>,
  rows: PromiseSettledResult<Page<MovieSummary>>[],
): Showcase {
  const all = [featured, ...rows];
  const firstFailure = all.find((r): r is PromiseRejectedResult => r.status === "rejected");
  if (firstFailure && all.every((r) => r.status === "rejected")) throw firstFailure.reason;

  return {
    hero: featured.status === "fulfilled" ? featured.value : null,
    rows: CATEGORIES.map((category, i) => {
      const result = rows[i];
      return { category, movies: result?.status === "fulfilled" ? result.value.items : [] };
    }).filter((row) => row.movies.length > 0),
  };
}
