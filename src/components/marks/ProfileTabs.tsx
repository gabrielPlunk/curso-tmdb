"use client";

import Link from "next/link";
import type { MarkStatus } from "@/lib/marks/types";
import { useMarks } from "./MarksProvider";

const TABS: { status: MarkStatus; label: string }[] = [
  { status: "quero", label: "Quero assistir" },
  { status: "assisti", label: "Já assisti" },
];

// As abas do perfil. A contagem muda na hora quando a pessoa marca ou desmarca
// (vem do MarksProvider); antes de ele estar pronto, usa a contagem que veio do servidor.
export function ProfileTabs({ active, serverCounts }: { active: MarkStatus; serverCounts: Record<MarkStatus, number> }) {
  const marks = useMarks();
  const counts = marks.ready ? marks.counts : serverCounts;
  return (
    <nav aria-label="Minhas listas" className="flex flex-wrap gap-2">
      {TABS.map(({ status, label }) => {
        const on = status === active;
        return (
          <Link
            key={status}
            href={`/perfil?aba=${status}`}
            aria-current={on ? "page" : undefined}
            className={`pill transition-colors ${on ? "bg-white text-black" : "glass text-white/85 glass-hover hover:text-white"}`}
          >
            {`${label} · ${counts[status]}`}
          </Link>
        );
      })}
    </nav>
  );
}
