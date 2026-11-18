// Leitura segura do que vem no endereço da página (?servico=..., ?q=...).
import { SERVICES, type ServiceSlug } from "./tmdb/config";

/** Qualquer valor estranho (vazio, desconhecido, repetido) vira "Todos" (null). */
export function parseService(value: string | string[] | undefined): ServiceSlug | null {
  if (typeof value !== "string") return null;
  return SERVICES.find((s) => s.slug === value)?.slug ?? null;
}

export function withService(path: string, service: ServiceSlug | null): string {
  return service ? `${path}?servico=${service}` : path;
}

const MAX_QUERY = 100;

/** Termo de busca limpo; vazio, só espaços ou repetido no endereço → null (não consulta a API). */
export function normalizeQuery(value: string | string[] | undefined): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim().replace(/\s+/g, " ").slice(0, MAX_QUERY).trim();
  return clean || null;
}

/** Número de página do endereço (?pagina=N), entre 1 e 500; qualquer outra coisa → 1. */
export function parsePage(value: string | string[] | undefined): number {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return 1;
  const page = Number(value);
  return page >= 1 && page <= 500 ? page : 1;
}
