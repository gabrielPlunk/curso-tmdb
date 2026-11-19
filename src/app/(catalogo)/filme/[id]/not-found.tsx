import Link from "next/link";

export default function MovieNotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-4 py-28 text-center">
      <h1 className="font-display text-2xl font-bold tracking-tight [font-stretch:115%]">Filme não encontrado.</h1>
      <Link href="/" className="btn-light">
        Voltar para o catálogo
      </Link>
    </div>
  );
}
