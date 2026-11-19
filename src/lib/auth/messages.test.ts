import { expect, test } from "vitest";
import { authErrorMessage, validateSignIn, validateSignUp } from "./messages";

test("validateSignIn pede e-mail e senha", () => {
  expect(validateSignIn("", "x")).toBe("Digite seu e-mail.");
  expect(validateSignIn("a@b.c", "")).toBe("Digite sua senha.");
  expect(validateSignIn("a@b.c", "x")).toBeNull();
});

test("validateSignUp pede nome e senha de 6 caracteres", () => {
  expect(validateSignUp("  ", "a@b.c", "123456")).toBe("Digite seu nome.");
  expect(validateSignUp("Ana", "", "123456")).toBe("Digite seu e-mail.");
  expect(validateSignUp("Ana", "a@b.c", "12345")).toBe("A senha precisa ter pelo menos 6 caracteres.");
  expect(validateSignUp("Ana", "a@b.c", "123456")).toBeNull();
});

test("authErrorMessage traduz os erros do Supabase", () => {
  const cases: [string | undefined, string][] = [
    ["invalid_credentials", "E-mail ou senha incorretos."],
    ["user_already_exists", "Já existe uma conta com este e-mail."],
    ["email_exists", "Já existe uma conta com este e-mail."],
    ["weak_password", "A senha precisa ter pelo menos 6 caracteres."],
    ["email_address_invalid", "Confira o e-mail digitado."],
    ["validation_failed", "Confira o e-mail digitado."],
    ["over_request_rate_limit", "Muitas tentativas. Espere um pouco e tente de novo."],
    ["over_email_send_rate_limit", "Muitas tentativas. Espere um pouco e tente de novo."],
    ["email_not_confirmed", "Confirme seu e-mail antes de entrar."],
    [undefined, "Algo deu errado. Tente de novo."],
  ];
  for (const [code, text] of cases) expect(authErrorMessage({ code, message: "x" })).toBe(text);
});
