import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnv } from "./env";

/**
 * Roda antes de cada página: confere o crachá (sessão) da pessoa e, se ele estiver para vencer,
 * troca por um novo e grava nos cookies da resposta. Não bloqueia ninguém; a proteção fica nas páginas.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const env = supabaseEnv();
  let response = NextResponse.next({ request });
  if (!env) return response;

  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list, headers) => {
        // O crachá novo vai para a requisição (a página que vem a seguir já enxerga) e para a resposta (o navegador guarda).
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
        // Cabeçalhos de cache que o Supabase pede, para nenhuma CDN guardar uma resposta com o crachá de alguém.
        for (const [key, value] of Object.entries(headers ?? {})) response.headers.set(key, value);
      },
    },
  });

  // Nada pode ficar entre criar o cliente e esta chamada: é ela que confere e renova a sessão.
  await supabase.auth.getClaims();
  return response;
}
