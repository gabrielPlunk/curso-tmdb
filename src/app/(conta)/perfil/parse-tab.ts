import type { MarkStatus } from "@/lib/marks/types";

/** A aba do perfil vem do endereço (?aba=assisti). Qualquer outro valor abre "Quero assistir". */
export function parseTab(raw: unknown): MarkStatus {
  return raw === "assisti" ? "assisti" : "quero";
}
