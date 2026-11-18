import { expect, test } from "vitest";
import { parseService, withService } from "./params";

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
