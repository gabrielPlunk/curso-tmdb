"use client";

import { CheckIcon, PlusIcon } from "@/components/ui/icons";
import type { MarkStatus } from "@/lib/marks/types";
import { useMarks } from "./MarksProvider";

const BUTTONS: { status: MarkStatus; label: string; Icon: typeof PlusIcon }[] = [
  { status: "quero", label: "Quero assistir", Icon: PlusIcon },
  { status: "assisti", label: "Já vi", Icon: CheckIcon },
];

// Os botões do alto da página do filme. Marcado = pílula branca; clicar de novo desmarca.
// Até as marcações chegarem, ficam invisíveis mas ocupando o lugar (a página não "pula" nem mostra um estado errado).
export function MarkButtons({ movieId }: { movieId: number }) {
  const marks = useMarks();
  const current = marks.statusOf(movieId);
  const busy = marks.isPending(movieId);

  return (
    <div
      role="group"
      aria-label="Minhas listas"
      aria-hidden={!marks.ready || undefined}
      className={`flex flex-wrap justify-end gap-2 ${marks.ready ? "" : "invisible"}`}
    >
      {BUTTONS.map(({ status, label, Icon }) => {
        const on = current === status;
        return (
          <button
            key={status}
            type="button"
            aria-pressed={on}
            disabled={busy || !marks.ready}
            onClick={() => marks.toggle(movieId, status)}
            className={`pill transition-colors disabled:cursor-wait ${
              on ? "bg-white text-black hover:bg-white/85" : "glass text-white hover:bg-white/20"
            }`}
          >
            <Icon className="text-base" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
