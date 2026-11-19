import type { ReactNode } from "react";

// Placa centralizada das telas de entrar e criar conta.
export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex justify-center px-4 pb-16 pt-12 sm:px-6 sm:pt-20">
      <div className="panel w-full max-w-sm rounded-3xl p-6 sm:p-8">
        <h1 className="mb-6 font-display text-2xl font-extrabold tracking-tight [font-stretch:115%]">{title}</h1>
        {children}
      </div>
    </div>
  );
}

/** Espaço reservado enquanto a página confere se a pessoa já entrou. */
export function AuthFormSkeleton() {
  return <div aria-hidden className="h-72 animate-pulse rounded-xl bg-white/5" />;
}
