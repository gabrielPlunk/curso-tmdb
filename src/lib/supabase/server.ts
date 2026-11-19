import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabaseEnv } from "./env";

/**
 * Cliente do Supabase para o servidor (páginas e Server Actions).
 * Ele lê o "crachá" da pessoa nos cookies da requisição. Um cliente novo por requisição, nunca compartilhado.
 * Devolve null quando o Supabase não está configurado.
 */
export async function createSupabaseServer(): Promise<SupabaseClient | null> {
  const env = supabaseEnv();
  if (!env) return null;
  const store = await cookies();
  return createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Páginas (Server Components) não podem gravar cookies; só Server Actions podem.
          // Não tem problema: o proxy (src/proxy.ts) já renovou o crachá antes da página começar.
        }
      },
    },
  });
}
