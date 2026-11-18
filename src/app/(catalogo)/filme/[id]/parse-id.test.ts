import { expect, test } from "vitest";
import { parseMovieId } from "./parse-id";

test("parseMovieId aceita só inteiros positivos", () => {
  expect(parseMovieId("603")).toBe(603);
  for (const bad of ["abc", "0", "-1", "1.5", "603abc", "", "00"]) expect(parseMovieId(bad)).toBeNull();
});
