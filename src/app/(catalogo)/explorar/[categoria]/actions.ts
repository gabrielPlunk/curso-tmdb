"use server";

// "Carregar mais" do Ver tudo. Uma action pode ser chamada por qualquer um, então tudo é revalidado aqui.
import { parseService } from "@/lib/params";
import { resolveCategory } from "@/lib/tmdb/config";
import { getCategoryMovies } from "@/lib/tmdb/queries";
import type { MovieSummary, Page } from "@/lib/tmdb/types";

export async function loadMoreMovies(
  category: string,
  service: string | null,
  page: number,
): Promise<Page<MovieSummary>> {
  const resolved = resolveCategory(category);
  if (!resolved) throw new Error("Categoria inválida");
  if (!Number.isInteger(page) || page < 2 || page > 500) throw new Error("Página inválida");
  return getCategoryMovies(resolved.slug, parseService(service ?? undefined), page);
}
