"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

/** O endereço atual (caminho + ?parâmetros), para voltar a ele depois de entrar ou sair. */
export function useCurrentPath(): string {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  return search ? `${pathname}?${search}` : pathname;
}

// "Entrar" na barra, para quem ainda não entrou. Depois do login, a pessoa volta para esta mesma página.
export function SignInLink() {
  const here = useCurrentPath();
  return (
    <Link href={`/entrar?volta=${encodeURIComponent(here)}`} className="btn-light shrink-0 px-4 py-2">
      Entrar
    </Link>
  );
}
