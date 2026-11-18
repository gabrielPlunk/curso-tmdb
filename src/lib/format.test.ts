import { expect, test } from "vitest";
import { formatMovieMeta } from "./format";

test("formatMovieMeta monta ano · duração · nota com vírgula", () => {
  expect(formatMovieMeta({ year: "2024", runtimeMinutes: 166, rating: 8.2 })).toBe("2024 · 2h 46min · ★ 8,2");
});

test("formatMovieMeta omite partes ausentes", () => {
  expect(formatMovieMeta({ year: null, runtimeMinutes: 45, rating: 0 })).toBe("45min");
  expect(formatMovieMeta({ year: "1999", runtimeMinutes: null, rating: 7 })).toBe("1999 · ★ 7,0");
});
