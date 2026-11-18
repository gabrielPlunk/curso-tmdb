import { expect, test } from "vitest";
import { tmdbImage } from "./images";

test("tmdbImage monta a URL ou devolve null", () => {
  expect(tmdbImage("/a.jpg", "w342")).toBe("https://image.tmdb.org/t/p/w342/a.jpg");
  expect(tmdbImage(null, "w342")).toBeNull();
});
