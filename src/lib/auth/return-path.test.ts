import { expect, test } from "vitest";
import { safeReturnPath } from "./return-path";

test("aceita caminhos internos do site", () => {
  expect(safeReturnPath("/filme/12?x=1")).toBe("/filme/12?x=1");
  expect(safeReturnPath("/perfil?aba=assisti")).toBe("/perfil?aba=assisti");
});

test("recusa endereços que levam para fora do site", () => {
  for (const raw of ["//evil.com", "/\\evil.com", "https://evil.com", "filme/1", "", undefined, ["/a"]]) {
    expect(safeReturnPath(raw)).toBe("/");
  }
});

test("recusa voltar para entrar ou criar conta (evita laço)", () => {
  for (const raw of ["/entrar", "/entrar?volta=/x", "/criar-conta", "/criar-conta?volta=/filme/1"]) {
    expect(safeReturnPath(raw)).toBe("/");
  }
});

test("usa o caminho reserva informado", () => {
  expect(safeReturnPath("//x", "/perfil")).toBe("/perfil");
});

test("recusa caracteres invisíveis que o navegador apaga (tab, quebra de linha)", () => {
  for (const raw of ["/\t/evil.com", "/\n/evil.com", "/\r/evil.com", "/\u0000x", "/\u007f/evil.com"]) {
    expect(safeReturnPath(raw)).toBe("/");
  }
});
