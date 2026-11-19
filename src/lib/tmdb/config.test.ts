import { expect, test } from "vitest";
import { CATEGORIES, SERVICES, providerIdsFor, resolveCategory } from "./config";

test("providerIdsFor devolve um ID ou os seis unidos por |", () => {
  expect(providerIdsFor("globoplay")).toBe("307");
  expect(providerIdsFor(null)).toBe("8|119|337|1899|350|307");
});

test("resolveCategory encontra categorias conhecidas e rejeita as outras", () => {
  expect(resolveCategory("em-alta")).toEqual({ slug: "em-alta", title: "Em alta", genreId: null });
  expect(resolveCategory("terror")?.genreId).toBe(27);
  expect(resolveCategory("series")).toBeNull();
});

test("CATEGORIES começa por Em alta e segue a ordem dos gêneros", () => {
  expect(CATEGORIES.map((c) => c.slug)).toEqual([
    "em-alta", "acao", "comedia", "drama", "terror", "ficcao-cientifica", "animacao", "romance", "suspense",
  ]);
});

test("nomes atuais dos serviços no Brasil (como o TMDB os chama)", () => {
  const bySlug = Object.fromEntries(SERVICES.map((s) => [s.slug, s]));
  expect(bySlug["max"]).toMatchObject({ name: "HBO Max", providerId: 1899, preposition: "na" });
  expect(bySlug["apple-tv"]).toMatchObject({ name: "Apple TV", providerId: 350, preposition: "na" });
  expect(SERVICES.map((s) => s.name)).toEqual(["Netflix", "Prime Video", "Disney+", "HBO Max", "Apple TV", "Globoplay"]);
});
