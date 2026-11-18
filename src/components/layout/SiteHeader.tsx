import Link from "next/link";
import { SearchForm } from "./SearchForm";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="shrink-0 text-lg font-extrabold tracking-wide text-accent">
          CATÁLOGO
        </Link>
        <div className="ml-auto w-full max-w-xs">
          <SearchForm />
        </div>
      </div>
    </header>
  );
}
