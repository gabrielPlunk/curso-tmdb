export type ImageSize = "w92" | "w185" | "w300" | "w342" | "w780" | "w1280";

export function tmdbImage(path: string | null, size: ImageSize): string | null {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

/** Imagem pequena para a luz ambiente (vai ser desfocada, não precisa de resolução): a cena do filme ou, sem ela, o pôster. */
export function ambientImage(movie: { backdropPath: string | null; posterPath: string | null }): string | null {
  return tmdbImage(movie.backdropPath, "w300") ?? tmdbImage(movie.posterPath, "w92");
}
