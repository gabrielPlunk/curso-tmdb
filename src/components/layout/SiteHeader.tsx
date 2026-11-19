import Link from "next/link";
import { Suspense } from "react";
import { AccountSlot } from "@/components/account/AccountSlot";
import { SearchForm } from "./SearchForm";

// Cabeçalho flutuante: uma pílula de vidro que acompanha a rolagem.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 h-(--header-h) px-4 pt-3 sm:px-6 lg:px-10">
      <div className="glass flex h-13 items-center gap-4 rounded-full pl-5 pr-1.5 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.6)]">
        <Link href="/" className="shrink-0 font-display text-lg font-extrabold tracking-tight [font-stretch:125%]">
          Catálogo
        </Link>
        <div className="ml-auto w-full max-w-xs">
          <SearchForm />
        </div>
        {/* Só este pedaço espera o servidor conferir a sessão; o resto da barra aparece na hora. */}
        <Suspense fallback={<span aria-hidden className="size-10 shrink-0" />}>
          <AccountSlot />
        </Suspense>
      </div>
    </header>
  );
}
