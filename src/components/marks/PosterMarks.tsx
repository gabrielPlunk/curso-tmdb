"use client";

import { CheckIcon, PlusIcon } from "@/components/ui/icons";
import type { MarkStatus } from "@/lib/marks/types";
import { useMarks } from "./MarksProvider";

/**
 * Véu escuro com "Já assistido" sobre o pôster (vai dentro do link, para subir junto no hover).
 * No hover ou no foco, o véu clareia para mostrar o pôster.
 */
export function WatchedVeil({ movieId }: { movieId: number }) {
  const marks = useMarks();
  if (!marks.ready || marks.statusOf(movieId) !== "assisti") return null;
  return (
    <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 text-white transition-colors duration-300 group-hover/poster:bg-black/15 group-focus-within/poster:bg-black/15">
      <CheckIcon className="text-2xl transition-opacity duration-300 group-hover/poster:opacity-0 group-focus-within/poster:opacity-0 sm:text-3xl" />
      <span className="text-[0.7rem] font-semibold uppercase tracking-wide transition-opacity duration-300 group-hover/poster:opacity-0 group-focus-within/poster:opacity-0 sm:text-xs">
        Já assistido
      </span>
    </span>
  );
}

const ACTIONS: { status: MarkStatus; label: string; Icon: typeof PlusIcon }[] = [
  { status: "assisti", label: "Já vi", Icon: CheckIcon },
  { status: "quero", label: "Quero assistir", Icon: PlusIcon },
];

/**
 * Os dois ícones que aparecem embaixo do pôster no hover (ou ao chegar pelo Tab).
 * Só em telas com mouse (pointer-fine): no celular não existe hover, e lá se marca pela página do filme.
 * O nome de cada um aparece ao passar o mouse ou focar o próprio ícone.
 */
export function PosterActions({ movieId }: { movieId: number }) {
  const marks = useMarks();
  if (!marks.ready) return null;
  const current = marks.statusOf(movieId);
  const busy = marks.isPending(movieId);

  return (
    <div className="absolute inset-x-0 top-full z-10 mt-2 hidden justify-center gap-2 opacity-0 transition-opacity duration-200 group-hover/poster:opacity-100 group-focus-within/poster:opacity-100 pointer-fine:flex">
      {ACTIONS.map(({ status, label, Icon }) => {
        const on = current === status;
        return (
          <button
            key={status}
            type="button"
            aria-label={label}
            aria-pressed={on}
            disabled={busy}
            onClick={() => marks.toggle(movieId, status)}
            className={`group/btn relative flex size-8 items-center justify-center rounded-full text-base transition-colors disabled:cursor-wait ${
              on ? "bg-white text-black hover:bg-white/85" : "glass text-white hover:bg-white/25"
            }`}
          >
            <Icon />
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-full mb-1.5 whitespace-nowrap rounded-md bg-black/85 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover/btn:opacity-100 group-focus-visible/btn:opacity-100"
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
