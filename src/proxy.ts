import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// O "porteiro" do site (no Next 16 o antigo middleware se chama proxy): renova a sessão do Supabase a cada visita.
export function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Não precisa rodar para arquivos estáticos (imagens, fontes, ícones).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)"],
};
