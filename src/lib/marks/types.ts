// As duas listas. Um filme fica em no máximo uma delas.
export type MarkStatus = "quero" | "assisti";

export const MARK_STATUSES: readonly MarkStatus[] = ["quero", "assisti"];

/** O mínimo que a tela precisa para saber se um filme está marcado. */
export type MarkRef = { movieId: number; status: MarkStatus };

/** Uma marcação completa, como guardada no banco (o perfil usa título e pôster). */
export type Mark = MarkRef & { title: string; posterPath: string | null; markedAt: string };

/** Resposta de marcar/desmarcar. "auth" = a pessoa precisa entrar (de novo). */
export type SetMarkResult = { ok: true } | { ok: false; reason: "auth" | "error" };
