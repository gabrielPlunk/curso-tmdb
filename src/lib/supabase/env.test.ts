import { afterEach, expect, test, vi } from "vitest";
import { supabaseEnv } from "./env";

afterEach(() => vi.unstubAllEnvs());

test("supabaseEnv devolve null sem variáveis", () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
  expect(supabaseEnv()).toBeNull();
});

test("supabaseEnv devolve url e key", () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://x.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_abc");
  expect(supabaseEnv()).toEqual({ url: "https://x.supabase.co", key: "sb_publishable_abc" });
});
