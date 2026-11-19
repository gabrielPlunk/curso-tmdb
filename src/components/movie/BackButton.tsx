"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ChevronLeft } from "@/components/ui/icons";

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
    <button type="button" onClick={back} className="pill glass pl-2.5 text-white transition-colors hover:bg-white/20">
      <ChevronLeft className="text-lg" />
      Voltar
    </button>
  );
}
