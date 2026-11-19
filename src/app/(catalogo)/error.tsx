"use client";

export default function CatalogError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-4 py-28 text-center">
      <h1 className="font-display text-2xl font-bold tracking-tight [font-stretch:115%]">
        Algo deu errado ao carregar os filmes.
      </h1>
      <button type="button" onClick={() => retry()} className="btn-light">
        Tentar de novo
      </button>
    </div>
  );
}
