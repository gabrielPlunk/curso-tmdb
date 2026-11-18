import { expect, test } from "vitest";
import { CATEGORIES, providerIdsFor, resolveCategory } from "./config";

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
