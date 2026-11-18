export type ImageSize = "w92" | "w185" | "w342" | "w780" | "w1280";

export function tmdbImage(path: string | null, size: ImageSize): string | null {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}
