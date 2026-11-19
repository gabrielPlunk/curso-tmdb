import "server-only";
import { cache } from "react";
import { getCurrentUser } from "@/lib/auth/user";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Mark, MarkStatus } from "./types";

type Row = { movie_id: number; status: MarkStatus; title: string; poster_path: string | null; marked_at: string };

/**
 * Todas as marcações de quem está logado, das mais recentes para as mais antigas ([] para quem não entrou).
 * O filtro por user_id é só clareza: mesmo sem ele, as regras RLS do banco só devolveriam as linhas da pessoa.
 */
export const getMyMarks = cache(async (): Promise<Mark[]> => {
  const user = await getCurrentUser();
  const supabase = await createSupabaseServer();
  if (!user || !supabase) return [];
  const { data, error } = await supabase
    .from("marcacoes")
    .select("movie_id, status, title, poster_path, marked_at")
    .eq("user_id", user.id)
    .order("marked_at", { ascending: false });
  if (error) throw new Error(`Não foi possível ler as marcações: ${error.message}`);
  return ((data ?? []) as Row[]).map((r) => ({
    movieId: r.movie_id,
    status: r.status,
    title: r.title,
    posterPath: r.poster_path,
    markedAt: r.marked_at,
  }));
});
