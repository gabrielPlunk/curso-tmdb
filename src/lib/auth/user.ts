import "server-only";
import { cache } from "react";
import { createSupabaseServer } from "@/lib/supabase/server";

/** Só o que a tela precisa saber de quem está logado. */
export type CurrentUser = { id: string; name: string; initial: string };

type Claims = { sub: string; email?: string; user_metadata?: { name?: unknown } };

export function toCurrentUser(claims: Claims): CurrentUser {
  const saved = typeof claims.user_metadata?.name === "string" ? claims.user_metadata.name.trim() : "";
  const fromEmail = claims.email?.split("@")[0] ?? "";
  const name = saved || fromEmail || "Você";
  const initial = saved || fromEmail ? name[0].toLocaleUpperCase("pt-BR") : "?";
  return { id: claims.sub, name, initial };
}

/**
 * Quem está logado agora, ou null. Lê o crachá nos cookies, então só pode ser usado atrás de um <Suspense>.
 * O getClaims confere a assinatura do crachá (não basta ler o cookie: ele poderia ter sido editado).
 * O cache do React faz a conferência uma vez só por requisição, mesmo que vários componentes perguntem.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createSupabaseServer();
  if (!supabase) return null;
  const { data } = await supabase.auth.getClaims();
  return data?.claims ? toCurrentUser(data.claims as Claims) : null;
});
