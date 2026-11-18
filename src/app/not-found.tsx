import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="text-xl font-bold">Página não encontrada.</h1>
      <Link href="/" className="text-accent underline-offset-4 hover:underline">
        Voltar para o catálogo
      </Link>
    </div>
  );
}
