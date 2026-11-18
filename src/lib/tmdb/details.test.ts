import { expect, test } from "vitest";
import { groupWatchProviders, mapMovieDetails, pickHeroService, pickTrailer } from "./details";
import type { TmdbMovieDetailsRaw, TmdbProvider, TmdbVideo } from "./raw-types";

const p = (id: number, priority: number): TmdbProvider => ({
  provider_id: id, provider_name: `P${id}`, logo_path: `/l${id}.png`, display_priority: priority,
});
const v = (key: string, type: string, lang: string): TmdbVideo => ({ key, type, iso_639_1: lang, site: "YouTube", name: key });

function rawWith(o: { overview?: string; runtime?: number; castCount?: number } = {}): TmdbMovieDetailsRaw {
  return {
    id: 1, title: "Filme", overview: o.overview ?? "Sinopse", release_date: "2021-10-22", runtime: o.runtime ?? 155,
    vote_average: 7.84, genres: [{ id: 878, name: "Ficção científica" }], poster_path: "/p.jpg", backdrop_path: "/b.jpg",
    videos: { results: [v("t1", "Trailer", "pt")] },
    credits: { cast: Array.from({ length: o.castCount ?? 3 }, (_, i) => ({ id: i, name: `Ator ${i}`, character: `Papel ${i}`, profile_path: null })) },
    "watch/providers": { results: { BR: { flatrate: [p(8, 1)] } } },
  };
}

test("groupWatchProviders sem dados do Brasil", () => {
  expect(groupWatchProviders(undefined)).toEqual({ subscription: [], free: [], rent: [], buy: [], isEmpty: true });
});

test("groupWatchProviders ordena por prioridade e une free+ads sem repetir", () => {
  const w = groupWatchProviders({ flatrate: [p(119, 5), p(8, 1)], free: [p(300, 2)], ads: [p(300, 2), p(301, 3)] });
  expect(w.subscription.map((x) => x.id)).toEqual([8, 119]);
  expect(w.free.map((x) => x.id)).toEqual([300, 301]);
  expect(w.subscription[0]).toEqual({ id: 8, name: "P8", logoPath: "/l8.png" });
  expect(w.isEmpty).toBe(false);
});

test("pickTrailer prefere Trailer pt, depois en, ignora não-YouTube", () => {
  expect(pickTrailer([v("a", "Trailer", "en"), v("b", "Trailer", "pt")])?.youtubeKey).toBe("b");
  expect(pickTrailer([v("c", "Teaser", "pt"), v("d", "Trailer", "en")])?.youtubeKey).toBe("d");
  expect(pickTrailer([v("e", "Teaser", "en")])?.youtubeKey).toBe("e");
  expect(pickTrailer([{ ...v("f", "Trailer", "pt"), site: "Vimeo" }])).toBeNull();
  expect(pickTrailer([])).toBeNull();
});

test("pickHeroService respeita o selecionado e ignora serviços fora da lista", () => {
  const c = { flatrate: [p(119, 1), p(8, 2), p(999, 0)] };
  expect(pickHeroService(c, "netflix")).toEqual({ name: "Netflix", preposition: "na" });
  expect(pickHeroService(c, null)).toEqual({ name: "Prime Video", preposition: "no" });
  expect(pickHeroService({ flatrate: [p(999, 0)] }, null)).toBeNull();
  expect(pickHeroService(undefined, null)).toBeNull();
});

test("mapMovieDetails usa o fallback quando a sinopse em pt está vazia", () => {
  expect(mapMovieDetails(rawWith({ overview: "  " }), "English overview").overview).toBe("English overview");
  expect(mapMovieDetails(rawWith({ overview: "" }), null).overview).toBe("");
  expect(mapMovieDetails(rawWith({ runtime: 0 }), null).runtimeMinutes).toBeNull();
  expect(mapMovieDetails(rawWith({ castCount: 20 }), null).cast).toHaveLength(12);
});

test("mapMovieDetails traduz os campos principais", () => {
  const d = mapMovieDetails(rawWith(), null);
  expect(d).toMatchObject({ id: 1, title: "Filme", overview: "Sinopse", year: "2021", runtimeMinutes: 155, rating: 7.8 });
  expect(d.trailer).toEqual({ youtubeKey: "t1", name: "t1" });
  expect(d.watch.subscription.map((x) => x.id)).toEqual([8]);
  expect(d.cast[0]).toEqual({ id: 0, name: "Ator 0", character: "Papel 0", profilePath: null });
});
