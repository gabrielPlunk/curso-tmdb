import Link from "next/link";

export default function MovieNotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-xl font-bold">Filme não encontrado.</h1>
      <Link href="/" className="text-accent underline-offset-4 hover:underline">
        Voltar para o catálogo
      </Link>
    </div>
  );
}
