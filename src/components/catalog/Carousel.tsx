"use client";

import { useRef, type ReactNode } from "react";

const arrow =
  "absolute top-0 z-10 hidden h-full w-10 items-center justify-center bg-bg/70 text-3xl text-white opacity-0 transition-opacity group-hover/row:opacity-100 focus-visible:opacity-100 md:flex";

// Faixa que rola para o lado: no celular com o dedo; no computador também com as setas.
export function Carousel({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };
  return (
    <div className="group/row relative">
      <button type="button" aria-label="Rolar para a esquerda" onClick={() => scroll(-1)} className={`${arrow} left-0`}>
        ‹
      </button>
      <div
        ref={ref}
        role="region"
        aria-label={label}
        className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto scroll-smooth px-4 sm:scroll-px-6 sm:gap-3 sm:px-6"
      >
        {children}
      </div>
      <button type="button" aria-label="Rolar para a direita" onClick={() => scroll(1)} className={`${arrow} right-0`}>
        ›
      </button>
    </div>
  );
}
