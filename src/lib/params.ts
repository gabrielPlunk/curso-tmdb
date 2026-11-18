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
