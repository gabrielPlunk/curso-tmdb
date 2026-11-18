"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

// Conta navegações dentro do site nesta aba (zera ao recarregar a página).
let inAppNavigations = -1;

/** Fica no layout: registra cada troca de página feita dentro do site. */
export function NavigationTracker() {
  const pathname = usePathname();
  useEffect(() => {
    inAppNavigations += 1;
  }, [pathname]);
  return null;
}

// Volta para onde a pessoa estava (mantendo a rolagem). Se ela chegou direto pelo link, vai para a vitrine.
export function BackButton() {
  const router = useRouter();
  const back = () => (inAppNavigations > 0 ? router.back() : router.push("/"));
  return (
    <button
      type="button"
      onClick={back}
      className="rounded-full bg-black/50 px-3 py-1 text-sm text-white backdrop-blur hover:bg-black/70"
    >
      ← Voltar
    </button>
  );
}
