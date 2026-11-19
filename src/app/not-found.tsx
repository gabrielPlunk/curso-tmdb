import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-28 text-center">
      <h1 className="font-display text-2xl font-bold tracking-tight [font-stretch:115%]">Página não encontrada.</h1>
      <Link href="/" className="btn-light">
        Voltar para o catálogo
      </Link>
    </div>
  );
}
