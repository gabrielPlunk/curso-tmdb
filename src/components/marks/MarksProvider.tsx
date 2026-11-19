"use client";

import { useRouter } from "next/navigation";
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { setMark } from "@/lib/marks/actions";
import type { MarkRef, MarkStatus } from "@/lib/marks/types";

export type MarksApi = {
  /** false até os dados do servidor chegarem. Enquanto isso, nada de véu nem botões (para não mostrar um estado errado). */
  ready: boolean;
  signedIn: boolean;
  statusOf(movieId: number): MarkStatus | null;
  /** true enquanto a marcação deste filme está sendo salva. */
  isPending(movieId: number): boolean;
  counts: Record<MarkStatus, number>;
  toggle(movieId: number, clicked: MarkStatus): void;
};

type Seed = { signedIn: boolean; marks: MarkRef[] };
type Ctx = { api: MarksApi; seed(data: Seed): void };

const INERT: MarksApi = {
  ready: false,
  signedIn: false,
  statusOf: () => null,
  isPending: () => false,
  counts: { quero: 0, assisti: 0 },
  toggle: () => {},
};

const MarksContext = createContext<Ctx | null>(null);

/** O que o provider sabe das marcações. Fora de um provider (testes, página 404), devolve um valor inerte. */
export function useMarks(): MarksApi {
  return use(MarksContext)?.api ?? INERT;
}

const SAVE_ERROR = "Não foi possível salvar. Tente de novo.";

/** Endereço de "Entrar" que volta para a página atual. */
function signInUrl() {
  return `/entrar?volta=${encodeURIComponent(window.location.pathname + window.location.search)}`;
}

/**
 * O "quadro de avisos" das marcações no navegador. Fica no layout raiz (um só para o site todo),
 * então continua aberto enquanto a pessoa navega entre a vitrine e o perfil.
 * Ao clicar, a tela muda na hora e o servidor é avisado; se ele recusar, a mudança é desfeita.
 */
export function MarksProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [marks, setMarks] = useState<ReadonlyMap<number, MarkStatus>>(new Map());
  const [pending, setPending] = useState<ReadonlySet<number>>(new Set());
  const [notice, setNotice] = useState<string | null>(null);
  // Cópias imediatas do estado: dois cliques seguidos acontecem antes de o React redesenhar a tela.
  const marksRef = useRef(marks);
  const pendingRef = useRef(new Set<number>());
  // O último pacote vindo do servidor. Quando o Next reexibe uma página guardada (botão Voltar),
  // o MarksSeed dela entrega de novo o mesmo pacote, já velho; ele é ignorado.
  const lastSeedRef = useRef<MarkRef[] | null>(null);

  const apply = useCallback((movieId: number, status: MarkStatus | null) => {
    const next = new Map(marksRef.current);
    if (status) next.set(movieId, status);
    else next.delete(movieId);
    marksRef.current = next;
    setMarks(next);
  }, []);

  const setBusy = useCallback((movieId: number, busy: boolean) => {
    if (busy) pendingRef.current.add(movieId);
    else pendingRef.current.delete(movieId);
    setPending(new Set(pendingRef.current));
  }, []);

  const seed = useCallback((data: Seed) => {
    if (data.marks === lastSeedRef.current) return;
    lastSeedRef.current = data.marks;
    const map = new Map(data.marks.map((m) => [m.movieId, m.status] as const));
    marksRef.current = map;
    setMarks(map);
    setSignedIn(data.signedIn);
    setReady(true);
  }, []);

  const toggle = useCallback(
    (movieId: number, clicked: MarkStatus) => {
      if (!ready) return;
      if (!signedIn) {
        router.push(signInUrl());
        return;
      }
      if (pendingRef.current.has(movieId)) return;

      const before = marksRef.current.get(movieId) ?? null;
      const after = before === clicked ? null : clicked;
      apply(movieId, after);
      setBusy(movieId, true);

      setMark(movieId, after)
        .catch(() => ({ ok: false, reason: "error" }) as const)
        .then((result) => {
          if (result.ok) return;
          apply(movieId, before);
          if (result.reason === "auth") router.push(signInUrl());
          else setNotice(SAVE_ERROR);
        })
        .finally(() => setBusy(movieId, false));
    },
    [ready, signedIn, router, apply, setBusy],
  );

  // O aviso de erro some sozinho depois de alguns segundos.
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const value = useMemo<Ctx>(() => {
    const counts = { quero: 0, assisti: 0 };
    for (const status of marks.values()) counts[status] += 1;
    return {
      seed,
      api: {
        ready,
        signedIn,
        statusOf: (id) => marks.get(id) ?? null,
        isPending: (id) => pending.has(id),
        counts,
        toggle,
      },
    };
  }, [ready, signedIn, marks, pending, toggle, seed]);

  return (
    <MarksContext value={value}>
      {children}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        {notice && <p className="glass rounded-full px-5 py-2.5 text-sm shadow-[0_12px_40px_-12px_rgb(0_0_0/0.7)]">{notice}</p>}
      </div>
    </MarksContext>
  );
}

/** Entrega ao provider os dados que vieram do servidor (renderizado pelo MarksLoader). */
export function MarksSeed({ signedIn, marks }: Seed) {
  const seed = use(MarksContext)?.seed;
  useEffect(() => {
    seed?.({ signedIn, marks });
  }, [seed, signedIn, marks]);
  return null;
}
