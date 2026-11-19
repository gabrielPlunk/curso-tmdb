import { beforeEach, expect, test, vi } from "vitest";
import { createSupabaseServer } from "@/lib/supabase/server";
import { signIn, signOut, signUp } from "./actions";

// A ordem das chamadas importa: refresh() precisa vir antes do redirect().
const calls: string[] = [];

vi.mock("@/lib/supabase/server", () => ({ createSupabaseServer: vi.fn() }));
vi.mock("next/cache", () => ({ refresh: vi.fn(() => calls.push("refresh")) }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((to: string) => {
    calls.push(`redirect:${to}`);
    throw new Error("NEXT_REDIRECT");
  }),
}));

const mocked = vi.mocked(createSupabaseServer);
const auth = {
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
};
const empty = { error: null, email: "" };

function form(fields: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

beforeEach(() => {
  calls.length = 0;
  vi.clearAllMocks();
  mocked.mockResolvedValue({ auth } as never);
  auth.signInWithPassword.mockResolvedValue({ data: { session: {} }, error: null });
  auth.signUp.mockResolvedValue({ data: { session: {}, user: {} }, error: null });
  auth.signOut.mockResolvedValue({ error: null });
});

test("signIn com campos vazios não chama o Supabase", async () => {
  expect(await signIn(empty, form({ email: "", password: "" }))).toEqual({ error: "Digite seu e-mail.", email: "" });
  expect(auth.signInWithPassword).not.toHaveBeenCalled();
});

test("signIn com senha errada devolve a mensagem e mantém o e-mail", async () => {
  auth.signInWithPassword.mockResolvedValue({ data: {}, error: { code: "invalid_credentials", message: "x" } });
  expect(await signIn(empty, form({ email: "a@b.c", password: "123456" }))).toEqual({
    error: "E-mail ou senha incorretos.",
    email: "a@b.c",
  });
});

test("signIn com sucesso atualiza a tela e volta para a página", async () => {
  await expect(signIn(empty, form({ email: "a@b.c", password: "123456", volta: "/filme/12" }))).rejects.toThrow("NEXT_REDIRECT");
  expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: "a@b.c", password: "123456" });
  expect(calls).toEqual(["refresh", "redirect:/filme/12"]);
});

test("signIn não volta para fora do site", async () => {
  await expect(signIn(empty, form({ email: "a@b.c", password: "123456", volta: "//evil.com" }))).rejects.toThrow();
  expect(calls).toEqual(["refresh", "redirect:/"]);
});

test("signUp com sucesso guarda o nome e volta para a página", async () => {
  await expect(
    signUp(empty, form({ name: "  Gabriel ", email: "a@b.c", password: "123456", volta: "/filme/3" })),
  ).rejects.toThrow("NEXT_REDIRECT");
  expect(auth.signUp).toHaveBeenCalledWith({ email: "a@b.c", password: "123456", options: { data: { name: "Gabriel" } } });
  expect(calls).toEqual(["refresh", "redirect:/filme/3"]);
});

test("signUp sem sessão (confirmação por e-mail ligada) avisa", async () => {
  auth.signUp.mockResolvedValue({ data: { session: null, user: {} }, error: null });
  expect(await signUp(empty, form({ name: "Ana", email: "a@b.c", password: "123456" }))).toEqual({
    error: "Confirme seu e-mail antes de entrar.",
    email: "a@b.c",
  });
});

test("signUp com senha curta não chama o Supabase", async () => {
  expect(await signUp(empty, form({ name: "Ana", email: "a@b.c", password: "123" }))).toEqual({
    error: "A senha precisa ter pelo menos 6 caracteres.",
    email: "a@b.c",
  });
  expect(auth.signUp).not.toHaveBeenCalled();
});

test("signOut a partir do perfil vai para a vitrine", async () => {
  await expect(signOut(form({ volta: "/perfil?aba=quero" }))).rejects.toThrow("NEXT_REDIRECT");
  // Só este aparelho: não desconecta o celular, e apaga o crachá local mesmo se o Supabase não responder.
  expect(auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  expect(calls).toEqual(["refresh", "redirect:/"]);
});

test("signOut de outra página volta para ela", async () => {
  await expect(signOut(form({ volta: "/filme/3" }))).rejects.toThrow("NEXT_REDIRECT");
  expect(calls).toEqual(["refresh", "redirect:/filme/3"]);
});

test("signIn sem Supabase configurado devolve erro genérico", async () => {
  mocked.mockResolvedValue(null);
  expect(await signIn(empty, form({ email: "a@b.c", password: "123456" }))).toEqual({
    error: "Algo deu errado. Tente de novo.",
    email: "a@b.c",
  });
});
