// Formulário de busca comum: funciona até sem JavaScript (vai para /busca?q=...).
export function SearchForm({ defaultValue, large = false }: { defaultValue?: string; large?: boolean }) {
  return (
    <form action="/busca" method="get" role="search" className="w-full">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Buscar filmes"
        aria-label="Buscar filmes"
        maxLength={100}
        className={`w-full rounded-full border border-white/10 bg-surface text-white placeholder:text-white/40 outline-none focus:border-accent ${
          large ? "px-5 py-3 text-base" : "px-4 py-1.5 text-sm"
        }`}
      />
    </form>
  );
}
