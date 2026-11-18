import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { TmdbError, TmdbNotFoundError, tmdbFetch } from "./client";

const fetchMock = vi.fn();

function respond(status: number, body: unknown = {}) {
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(body), { status }));
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("TMDB_READ_ACCESS_TOKEN", "tok");
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

test("monta URL, omite undefined e envia Bearer", async () => {
  respond(200, { ok: true });
  const data = await tmdbFetch<{ ok: boolean }>("/discover/movie", { page: 2, with_genres: undefined });
  const [url, init] = fetchMock.mock.calls[0];
  expect(String(url)).toBe("https://api.themoviedb.org/3/discover/movie?page=2");
  expect(init.headers.Authorization).toBe("Bearer tok");
  expect(data).toEqual({ ok: true });
});

test("404 vira TmdbNotFoundError", async () => {
  respond(404);
  await expect(tmdbFetch("/movie/1")).rejects.toBeInstanceOf(TmdbNotFoundError);
});

test("500 vira TmdbError com status", async () => {
  respond(500);
  const err = await tmdbFetch("/x").catch((e) => e);
  expect(err).toBeInstanceOf(TmdbError);
  expect(err).not.toBeInstanceOf(TmdbNotFoundError);
  expect(err.status).toBe(500);
});

test("sem token, erro claro e nenhuma chamada", async () => {
  vi.stubEnv("TMDB_READ_ACCESS_TOKEN", "");
  await expect(tmdbFetch("/x")).rejects.toThrow("TMDB_READ_ACCESS_TOKEN não configurado em .env.local");
  expect(fetchMock).not.toHaveBeenCalled();
});
