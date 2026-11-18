import type { MovieDetails } from "./tmdb/types";

/** "2024 · 2h 46min · ★ 8,2" — partes ausentes (ano, duração, nota 0) ficam de fora. */
export function formatMovieMeta(m: Pick<MovieDetails, "year" | "runtimeMinutes" | "rating">): string {
  const parts: string[] = [];
  if (m.year) parts.push(m.year);
  if (m.runtimeMinutes) {
    const h = Math.floor(m.runtimeMinutes / 60);
    const min = m.runtimeMinutes % 60;
    parts.push(h ? `${h}h ${min}min` : `${min}min`);
  }
  if (m.rating > 0) parts.push(`★ ${m.rating.toFixed(1).replace(".", ",")}`);
  return parts.join(" · ");
}
