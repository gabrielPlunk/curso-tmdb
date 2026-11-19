// Endereço e chave pública do projeto no Supabase (ficam no .env.local).
// A chave "publishable" pode ser vista por qualquer um: quem protege os dados são as regras RLS do banco.
// Sem as duas, o site funciona como antes, só que sem contas (ninguém está logado).
export function supabaseEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? { url, key } : null;
}
