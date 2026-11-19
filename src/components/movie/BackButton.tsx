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
    // Botão "fantasma": sem fundo nem borda, para não competir com a pílula do cabeçalho logo acima.
    // O -ml alinha a seta com a margem da página; o fundo só aparece ao passar o mouse.
    <button
      type="button"
      onClick={back}
      className="pill -ml-2.5 pl-2.5 text-white/80 transition-colors [text-shadow:0_1px_8px_rgb(0_0_0/0.5)] hover:bg-white/10 hover:text-white"
    >
      <ChevronLeft className="text-lg" />
      Voltar
    </button>
  );
}
