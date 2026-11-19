"use server";

import { getCurrentUser } from "@/lib/auth/user";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getMovie } from "@/lib/tmdb/queries";
import { MARK_STATUSES, type MarkStatus, type SetMarkResult } from "./types";

/**
 * Marca um filme como "quero" ou "assisti", ou desmarca (status null).
 * Tudo que chega aqui veio do navegador, então é conferido de novo: quem é a pessoa, se o id é válido
 * e se o filme existe. Título e pôster vêm do TMDB, nunca do navegador.
 * Não atualiza a página (sem refresh): a tela já mudou no navegador, e assim o pôster fica no lugar no perfil.
 */
export async function setMark(movieId: number, status: MarkStatus | null): Promise<SetMarkResult> {
  if (!Number.isInteger(movieId) || movieId <= 0) return { ok: false, reason: "error" };
  if (status !== null && !MARK_STATUSES.includes(status)) return { ok: false, reason: "error" };

  const user = await getCurrentUser();
  const supabase = await createSupabaseServer();
  if (!user || !supabase) return { ok: false, reason: "auth" };

  if (status === null) {
    const { error } = await supabase.from("marcacoes").delete().eq("movie_id", movieId).eq("user_id", user.id);
    return error ? { ok: false, reason: "error" } : { ok: true };
  }

  const movie = await getMovie(movieId).catch(() => null);
  if (!movie) return { ok: false, reason: "error" };

  // Uma linha por (pessoa, filme): gravar "assisti" num filme que estava em "quero" troca a linha.
  const { error } = await supabase.from("marcacoes").upsert(
    {
      user_id: user.id,
      movie_id: movieId,
      status,
      title: movie.title,
      poster_path: movie.posterPath,
      marked_at: new Date().toISOString(),
    },
    { onConflict: "user_id,movie_id" },
  );
  return error ? { ok: false, reason: "error" } : { ok: true };
}
