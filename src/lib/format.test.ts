import { expect, test } from "vitest";
import { formatMovieMeta, movieMetaParts, titleFit } from "./format";

test("formatMovieMeta monta ano · duração · nota com vírgula", () => {
  expect(formatMovieMeta({ year: "2024", runtimeMinutes: 166, rating: 8.2 })).toBe("2024 · 2h 46min · ★ 8,2");
});

test("formatMovieMeta omite partes ausentes", () => {
  expect(formatMovieMeta({ year: null, runtimeMinutes: 45, rating: 0 })).toBe("45min");
  expect(formatMovieMeta({ year: "1999", runtimeMinutes: null, rating: 7 })).toBe("1999 · ★ 7,0");
});

test("movieMetaParts devolve as partes separadas", () => {
  expect(movieMetaParts({ year: "2024", runtimeMinutes: 166, rating: 8.2 })).toEqual(["2024", "2h 46min", "★ 8,2"]);
  expect(movieMetaParts({ year: null, runtimeMinutes: null, rating: 0 })).toEqual([]);
});

test("titleFit: curto fica largo, longo fica estreito e menor", () => {
  expect(titleFit("Duna")).toEqual({ stretch: 125, scale: 1 });
  expect(titleFit("Interestelar").stretch).toBeLessThan(125);
  expect(titleFit("Interestelar").stretch).toBeGreaterThan(68);
  expect(titleFit("O Senhor dos Anéis: A Sociedade do Anel")).toEqual({ stretch: 68, scale: 0.77 });
  expect(titleFit("x".repeat(200)).scale).toBe(0.6);
});
