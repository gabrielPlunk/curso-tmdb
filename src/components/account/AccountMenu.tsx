"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/(conta)/actions";
import type { CurrentUser } from "@/lib/auth/user";
import { useCurrentPath } from "./SignInLink";

// O círculo com a inicial, para quem entrou. Abre um menu com "Meu perfil" e "Sair".
export function AccountMenu({ user }: { user: CurrentUser }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const here = useCurrentPath();

  // Fecha com Esc (devolvendo o foco ao círculo) ou com um clique fora do menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const item = "block w-full rounded-xl px-3.5 py-2.5 text-left text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white";

  return (
    <div ref={root} className="relative shrink-0">
      <button
        ref={button}
        type="button"
        aria-label={`Conta de ${user.name}`}
        aria-expanded={open}
        aria-controls="account-menu"
        onClick={() => setOpen((v) => !v)}
        className="glass flex size-10 items-center justify-center rounded-full font-display text-base font-bold transition-colors glass-hover"
      >
        {user.initial}
      </button>
      {open && (
        <div
          id="account-menu"
          className="glass absolute right-0 top-full mt-2 w-48 rounded-2xl p-1.5 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.7)]"
        >
          <Link href="/perfil" onClick={() => setOpen(false)} className={item}>
            Meu perfil
          </Link>
          <form action={signOut}>
            <input type="hidden" name="volta" value={here} />
            <button type="submit" className={item}>
              Sair
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
