/** "/filme/603" → 603. Qualquer outra coisa → null (vira "Filme não encontrado"). */
export function parseMovieId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
