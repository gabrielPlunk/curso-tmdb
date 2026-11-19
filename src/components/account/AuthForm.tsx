"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthFormState } from "@/lib/auth/messages";

type Mode = "entrar" | "criar-conta";
type Props = {
  mode: Mode;
  /** Para onde voltar depois de entrar (já validado pela página). */
  volta: string;
  action: (prev: AuthFormState, form: FormData) => Promise<AuthFormState>;
};

const COPY = {
  entrar: { submit: "Entrar", pending: "Entrando…", switchText: "Ainda não tem conta?", switchLabel: "Criar conta", switchTo: "/criar-conta" },
  "criar-conta": { submit: "Criar conta", pending: "Criando conta…", switchText: "Já tem conta?", switchLabel: "Entrar", switchTo: "/entrar" },
} as const;

const field =
  "w-full rounded-xl border border-white/12 bg-black/30 px-4 py-3 text-white outline-none transition-colors placeholder:text-white/40 hover:border-white/25 focus:border-white/60 focus:bg-black/45";

// Formulário de entrar e de criar conta. O useActionState guarda a resposta da ação (o erro e o e-mail digitado).
export function AuthForm({ mode, volta, action }: Props) {
  const [state, submit, pending] = useActionState(action, { error: null, email: "" });
  const copy = COPY[mode];
  const id = (name: string) => `${mode}-${name}`;

  return (
    <form action={submit} className="space-y-4" noValidate>
      <input type="hidden" name="volta" value={volta} />
      {mode === "criar-conta" && (
        <div className="space-y-1.5">
          <label htmlFor={id("name")} className="text-sm font-medium text-white/80">
            Nome
          </label>
          <input id={id("name")} name="name" autoComplete="given-name" maxLength={60} className={field} />
        </div>
      )}
      <div className="space-y-1.5">
        <label htmlFor={id("email")} className="text-sm font-medium text-white/80">
          E-mail
        </label>
        <input id={id("email")} name="email" type="email" autoComplete="email" defaultValue={state.email} className={field} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor={id("password")} className="text-sm font-medium text-white/80">
          Senha
        </label>
        <input
          id={id("password")}
          name="password"
          type="password"
          autoComplete={mode === "entrar" ? "current-password" : "new-password"}
          aria-describedby={mode === "criar-conta" ? id("hint") : undefined}
          className={field}
        />
        {mode === "criar-conta" && (
          <p id={id("hint")} className="text-xs text-white/50">
            Pelo menos 6 caracteres
          </p>
        )}
      </div>

      {state.error && (
        <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-100">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-light w-full justify-center disabled:opacity-60">
        {pending ? copy.pending : copy.submit}
      </button>

      <p className="text-center text-sm text-white/60">
        {copy.switchText}{" "}
        <Link href={`${copy.switchTo}?volta=${encodeURIComponent(volta)}`} className="font-medium text-white underline-offset-4 hover:underline">
          {copy.switchLabel}
        </Link>
      </p>
    </form>
  );
}
