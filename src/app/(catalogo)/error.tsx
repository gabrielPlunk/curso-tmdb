"use client";

export default function CatalogError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-xl font-bold">Algo deu errado ao carregar os filmes.</h1>
      <button
        type="button"
        onClick={() => retry()}
        className="rounded-md bg-white px-4 py-2 font-semibold text-black hover:bg-white/85"
      >
        Tentar de novo
      </button>
    </div>
  );
}
