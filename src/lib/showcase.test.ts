import { expect, test } from "vitest";
import { CATEGORIES } from "./tmdb/config";
import type { MovieSummary, Page } from "./tmdb/types";
import { buildShowcase } from "./showcase";

const movie: MovieSummary = { id: 1, title: "F", posterPath: null, backdropPath: null, year: null, rating: 0 };
const ok = (items: MovieSummary[]): PromiseSettledResult<Page<MovieSummary>> => ({ status: "fulfilled", value: { items, page: 1, hasMore: false } });
const fail: PromiseRejectedResult = { status: "rejected", reason: new Error("TMDB fora do ar") };

test("buildShowcase esconde fileiras que falharam ou vieram vazias", () => {
  const rows = CATEGORIES.map((_, i) => (i === 0 ? ok([movie]) : i === 1 ? fail : ok([])));
  const result = buildShowcase({ status: "fulfilled", value: null }, rows);
  expect(result.rows.map((r) => r.category.slug)).toEqual(["em-alta"]);
  expect(result.hero).toBeNull();
});

test("buildShowcase com tudo vazio (sem falha) devolve zero fileiras, sem erro", () => {
  const result = buildShowcase({ status: "fulfilled", value: null }, CATEGORIES.map(() => ok([])));
  expect(result.rows).toEqual([]);
});

test("buildShowcase lança erro quando o destaque e todas as fileiras falharam (TMDB fora do ar)", () => {
  expect(() => buildShowcase(fail, CATEGORIES.map(() => fail))).toThrow("TMDB fora do ar");
});
