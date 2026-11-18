import { beforeEach, expect, test, vi } from "vitest";
import { tmdbFetch } from "./client";
import { getCategoryMovies, getFeatured, getMovie, getSimilarStreaming, searchMovies } from "./queries";
import type { TmdbMovieListItem } from "./raw-types";

vi.mock("next/cache", () => ({ cacheLife: vi.fn() }));
vi.mock("./client", async (orig) => ({ ...(await orig<typeof import("./client")>()), tmdbFetch: vi.fn() }));

const fetchMock = vi.mocked(tmdbFetch);
const item = (id: number, backdrop: string | null = "/b.jpg"): TmdbMovieListItem => ({
  id, title: `F${id}`, poster_path: "/p.jpg", backdrop_path: backdrop, release_date: "2024-01-01", vote_average: 7, genre_ids: [],
});
const paged = (results: TmdbMovieListItem[]) => ({ page: 1, total_pages: 3, total_results: results.length, results });

beforeEach(() => fetchMock.mockReset());

test("getCategoryMovies usa o gênero da categoria e o serviço", async () => {
  fetchMock.mockResolvedValueOnce(paged([item(1)]));
  const page = await getCategoryMovies("terror", "max", 2);
  expect(fetchMock).toHaveBeenCalledWith(
    "/discover/movie",
    expect.objectContaining({ with_genres: "27", with_watch_providers: "1899", page: 2 }),
  );
  expect(page.items[0].id).toBe(1);
});

test("getCategoryMovies em-alta não manda with_genres", async () => {
  fetchMock.mockResolvedValueOnce(paged([]));
  await getCategoryMovies("em-alta", null);
  expect(fetchMock.mock.calls[0][1]).not.toHaveProperty("with_genres");
  expect(fetchMock.mock.calls[0][1]).toMatchObject({ page: 1 });
});

const details = (overview: string) => ({
  id: 10, title: "F", overview, vote_average: 7, poster_path: null, backdrop_path: null,
});

test("getMovie busca a sinopse em inglês só quando a pt vem vazia", async () => {
  fetchMock.mockResolvedValueOnce(details("")).mockResolvedValueOnce({ overview: "EN" });
  expect((await getMovie(10)).overview).toBe("EN");
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(fetchMock.mock.calls[0][1]).toMatchObject({
    language: "pt-BR", append_to_response: "videos,credits,watch/providers", include_video_language: "pt,en",
  });
  expect(fetchMock.mock.calls[1]).toEqual(["/movie/10", { language: "en-US" }]);

  fetchMock.mockReset();
  fetchMock.mockResolvedValueOnce(details("PT"));
  expect((await getMovie(10)).overview).toBe("PT");
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test("getSimilarStreaming sem gêneros não chama a API", async () => {
  expect(await getSimilarStreaming({ id: 1, genres: [] })).toEqual([]);
  expect(fetchMock).not.toHaveBeenCalled();
});

test("getSimilarStreaming usa 2 gêneros em OU, tira o próprio filme e limita a 20", async () => {
  fetchMock.mockResolvedValueOnce(paged(Array.from({ length: 25 }, (_, i) => item(i + 1))));
  const list = await getSimilarStreaming({ id: 1, genres: [{ id: 28, name: "A" }, { id: 12, name: "B" }, { id: 99, name: "C" }] });
  expect(fetchMock.mock.calls[0][1]).toMatchObject({ with_genres: "28|12", with_watch_providers: "8|119|337|1899|350|307" });
  expect(list).toHaveLength(20);
  expect(list.some((m) => m.id === 1)).toBe(false);
});

test("getFeatured pula filmes sem backdrop e escolhe o serviço", async () => {
  fetchMock
    .mockResolvedValueOnce(paged([item(1, null), item(2)]))
    .mockResolvedValueOnce({ results: { BR: { flatrate: [{ provider_id: 8, provider_name: "Netflix", logo_path: null, display_priority: 1 }] } } });
  const f = await getFeatured(null);
  expect(f?.movie.id).toBe(2);
  expect(f?.service).toEqual({ name: "Netflix", preposition: "na" });
  expect(fetchMock.mock.calls[1][0]).toBe("/movie/2/watch/providers");
});

test("getFeatured devolve null se nenhum filme tem backdrop", async () => {
  fetchMock.mockResolvedValueOnce(paged([item(1, null)]));
  expect(await getFeatured(null)).toBeNull();
});

test("searchMovies busca no acervo inteiro com idioma e região", async () => {
  fetchMock.mockResolvedValueOnce(paged([item(5)]));
  const page = await searchMovies("matrix", 2);
  expect(fetchMock).toHaveBeenCalledWith("/search/movie", {
    query: "matrix", language: "pt-BR", region: "BR", include_adult: "false", page: 2,
  });
  expect(page.items[0].id).toBe(5);
});
