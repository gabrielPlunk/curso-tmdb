import { beforeEach, expect, test, vi } from "vitest";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getCurrentUser, toCurrentUser } from "./user";

vi.mock("@/lib/supabase/server", () => ({ createSupabaseServer: vi.fn() }));
const mocked = vi.mocked(createSupabaseServer);

beforeEach(() => mocked.mockReset());

function clientWith(claims: unknown) {
  return { auth: { getClaims: vi.fn().mockResolvedValue({ data: claims ? { claims } : null, error: null }) } };
}

test("toCurrentUser usa o nome guardado na conta", () => {
  expect(toCurrentUser({ sub: "u1", user_metadata: { name: "  gabriel " } })).toEqual({ id: "u1", name: "gabriel", initial: "G" });
});

test("toCurrentUser sem nome usa o começo do e-mail", () => {
  expect(toCurrentUser({ sub: "u1", email: "ana@x.com" })).toEqual({ id: "u1", name: "ana", initial: "A" });
});

test("toCurrentUser sem nome nem e-mail", () => {
  expect(toCurrentUser({ sub: "u1" })).toEqual({ id: "u1", name: "Você", initial: "?" });
});

test("getCurrentUser sem Supabase configurado devolve null", async () => {
  mocked.mockResolvedValue(null);
  expect(await getCurrentUser()).toBeNull();
});

test("getCurrentUser sem sessão devolve null", async () => {
  mocked.mockResolvedValue(clientWith(null) as never);
  expect(await getCurrentUser()).toBeNull();
});

test("getCurrentUser com sessão devolve a pessoa", async () => {
  mocked.mockResolvedValue(clientWith({ sub: "u9", email: "b@x.com", user_metadata: { name: "Bia" } }) as never);
  expect(await getCurrentUser()).toEqual({ id: "u9", name: "Bia", initial: "B" });
});
