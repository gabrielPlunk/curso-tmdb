import { expect, test } from "vitest";
import { parseTab } from "./parse-tab";

test("parseTab aceita assisti e cai em quero no resto", () => {
  expect(parseTab("assisti")).toBe("assisti");
  for (const raw of ["quero", undefined, "x", ["assisti"]]) expect(parseTab(raw)).toBe("quero");
});
