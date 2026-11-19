import { SearchIcon } from "@/components/ui/icons";

// Formulário de busca comum: funciona até sem JavaScript (vai para /busca?q=...).
export function SearchForm({ defaultValue, large = false }: { defaultValue?: string; large?: boolean }) {
  return (
    <form action="/busca" method="get" role="search" className="relative w-full">
      <SearchIcon
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-white/55 ${
          large ? "left-5 text-xl" : "left-3.5 text-base"
        }`}
      />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Buscar filmes"
        aria-label="Buscar filmes"
        maxLength={100}
        className={`w-full rounded-full border border-white/10 bg-black/25 text-white outline-none transition-colors placeholder:text-white/45 hover:border-white/25 focus:border-white/60 focus:bg-black/40 focus-visible:outline-none ${
          large ? "py-4 pl-13 pr-6 text-lg" : "py-2 pl-10 pr-4 text-sm"
        }`}
      />
    </form>
  );
}
