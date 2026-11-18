import { expect, test } from "vitest";
import { buildDiscoverParams, mapMovieSummary, toPage } from "./lists";
import type { TmdbMovieListItem } from "./raw-types";

const item = (id: number): TmdbMovieListItem => ({
  id, title: `F${id}`, poster_path: "/p.jpg", backdrop_path: "/b.jpg", release_date: "2024-03-01", vote_average: 8, genre_ids: [],
});

test("buildDiscoverParams com serviço e gênero", () => {
  expect(buildDiscoverParams({ service: "netflix", genreIds: [28], page: 3 })).toEqual({
    watch_region: "BR", with_watch_providers: "8", with_watch_monetization_types: "flatrate|free|ads",
    sort_by: "popularity.desc", language: "pt-BR", include_adult: "false", page: 3, with_genres: "28",
  });
});

test("buildDiscoverParams Todos, sem gênero, página 1, vários gêneros em OU", () => {
  const p = buildDiscoverParams({ service: null });
  expect(p.with_watch_providers).toBe("8|119|337|1899|350|307");
  expect(p.page).toBe(1);
  expect(p).not.toHaveProperty("with_genres");
  expect(buildDiscoverParams({ service: null, genreIds: [28, 12] }).with_genres).toBe("28|12");
});

test("mapMovieSummary com dados faltando", () => {
  expect(
    mapMovieSummary({ id: 1, title: "X", poster_path: null, backdrop_path: null, release_date: "", vote_average: 7.456, genre_ids: [] }),
  ).toEqual({ id: 1, title: "X", posterPath: null, backdropPath: null, year: null, rating: 7.5 });
  expect(mapMovieSummary(item(2)).year).toBe("2024");
});

test("toPage: hasMore respeita total_pages e o teto de 500 do TMDB", () => {
  expect(toPage({ page: 1, total_pages: 2, total_results: 40, results: [] }).hasMore).toBe(true);
  expect(toPage({ page: 2, total_pages: 2, total_results: 40, results: [] }).hasMore).toBe(false);
  expect(toPage({ page: 500, total_pages: 900, total_results: 18000, results: [] }).hasMore).toBe(false);
});

test("toPage remove excludeId", () => {
  const page = toPage({ page: 1, total_pages: 1, total_results: 2, results: [item(1), item(2)] }, { excludeId: 1 });
  expect(page.items.map((m) => m.id)).toEqual([2]);
  expect(page.page).toBe(1);
});
