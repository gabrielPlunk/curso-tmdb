import type { MovieDetails } from "./tmdb/types";

/** 8.2 → "8,2" (com vírgula, como se escreve no Brasil). */
export function formatRating(rating: number): string {
  return rating.toFixed(1).replace(".", ",");
}

/** ["2024", "2h 46min", "★ 8,2"]: partes ausentes (ano, duração, nota 0) ficam de fora. */
export function movieMetaParts(m: Pick<MovieDetails, "year" | "runtimeMinutes" | "rating">): string[] {
  const parts: string[] = [];
  if (m.year) parts.push(m.year);
  if (m.runtimeMinutes) {
    const h = Math.floor(m.runtimeMinutes / 60);
    const min = m.runtimeMinutes % 60;
    parts.push(h ? `${h}h ${min}min` : `${min}min`);
  }
  if (m.rating > 0) parts.push(`★ ${formatRating(m.rating)}`);
  return parts;
}

/** "2024 · 2h 46min · ★ 8,2" */
export function formatMovieMeta(m: Pick<MovieDetails, "year" | "runtimeMinutes" | "rating">): string {
  return movieMetaParts(m).join(" · ");
}

/**
 * Largura da letra do título conforme o tamanho dele, para todo título ocupar mais ou menos o mesmo espaço.
 * stretch: 125% (até 5 letras, bem largo) → 68% (30 letras ou mais, bem estreito).
 * scale: acima de 30 letras a letra também diminui um pouco (até 60%).
 */
export function titleFit(title: string): { stretch: number; scale: number } {
  const n = title.trim().length;
  const t = Math.min(1, Math.max(0, (n - 5) / 25));
  const stretch = Math.round(125 - t * (125 - 68));
  const scale = n > 30 ? Math.max(0.6, Math.round((30 / n) * 100) / 100) : 1;
  return { stretch, scale };
}
