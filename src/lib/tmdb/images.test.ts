import { expect, test } from "vitest";
import { ambientImage, tmdbImage } from "./images";

test("tmdbImage monta a URL ou devolve null", () => {
  expect(tmdbImage("/a.jpg", "w342")).toBe("https://image.tmdb.org/t/p/w342/a.jpg");
  expect(tmdbImage(null, "w342")).toBeNull();
});

test("ambientImage prefere a cena pequena e cai para o pôster", () => {
  expect(ambientImage({ backdropPath: "/b.jpg", posterPath: "/p.jpg" })).toBe("https://image.tmdb.org/t/p/w300/b.jpg");
  expect(ambientImage({ backdropPath: null, posterPath: "/p.jpg" })).toBe("https://image.tmdb.org/t/p/w92/p.jpg");
  expect(ambientImage({ backdropPath: null, posterPath: null })).toBeNull();
});
