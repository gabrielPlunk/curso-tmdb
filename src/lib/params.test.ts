import { expect, test } from "vitest";
import { normalizeQuery, parsePage, parseService, withService } from "./params";

test("parseService aceita slug válido", () => {
  expect(parseService("netflix")).toBe("netflix");
});

test("parseService trata inválido, vazio e repetido como Todos", () => {
  expect(parseService("xyz")).toBeNull();
  expect(parseService(undefined)).toBeNull();
  expect(parseService("")).toBeNull();
  expect(parseService(["max", "netflix"])).toBeNull();
});

test("withService acrescenta ?servico só quando há serviço", () => {
  expect(withService("/explorar/acao", "max")).toBe("/explorar/acao?servico=max");
  expect(withService("/explorar/acao", null)).toBe("/explorar/acao");
});

test("normalizeQuery limpa espaços, corta em 100 e rejeita vazio ou repetido", () => {
  expect(normalizeQuery("  duna   parte  dois ")).toBe("duna parte dois");
  expect(normalizeQuery("   ")).toBeNull();
  expect(normalizeQuery(undefined)).toBeNull();
  expect(normalizeQuery(["a", "b"])).toBeNull();
  expect(normalizeQuery("x".repeat(150))).toHaveLength(100);
});

test("parsePage aceita 1 a 500 e trata o resto como 1", () => {
  expect(parsePage("3")).toBe(3);
  for (const bad of [undefined, "0", "501", "abc", "2.5", ["2", "3"]]) expect(parsePage(bad)).toBe(1);
});
