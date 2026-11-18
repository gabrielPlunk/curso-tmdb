// O "telefone" com o TMDB. Só roda no servidor: a chave nunca vai para o navegador.
import "server-only";

const BASE_URL = "https://api.themoviedb.org/3";

export class TmdbError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "TmdbError";
  }
}

/** O TMDB respondeu 404: o filme (ou recurso) não existe. */
export class TmdbNotFoundError extends TmdbError {
  constructor(path: string) {
    super(`TMDB: não encontrado (${path})`, 404);
    this.name = "TmdbNotFoundError";
  }
}

export async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T> {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!token) {
    throw new Error("TMDB_READ_ACCESS_TOKEN não configurado em .env.local");
  }

  const url = new URL(BASE_URL + path);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  // Sem opções de cache aqui: o cache é feito pelas consultas com "use cache".
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });

  if (response.status === 404) throw new TmdbNotFoundError(path);
  if (!response.ok) {
    throw new TmdbError(`TMDB respondeu ${response.status} em ${path}`, response.status);
  }
  return (await response.json()) as T;
}
