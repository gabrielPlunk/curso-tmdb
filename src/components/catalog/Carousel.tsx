"use client";

import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";

const arrow =
  "glass absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-2xl text-white opacity-0 transition-opacity hover:bg-white/20 group-hover/row:opacity-100 focus-visible:opacity-100 md:flex";

// Faixa que rola para o lado: no celular com o dedo; no computador também com as setas.
export function Carousel({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };
  return (
    <div className="group/row relative">
      <button type="button" aria-label="Rolar para a esquerda" onClick={() => scroll(-1)} className={`${arrow} left-3 lg:left-5`}>
        <ChevronLeft />
      </button>
      <div
        ref={ref}
        role="region"
        aria-label={label}
        className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-2.5 overflow-x-auto scroll-smooth px-4 pb-6 pt-2 sm:scroll-px-6 sm:gap-3.5 sm:px-6 lg:scroll-px-10 lg:px-10"
      >
        {children}
      </div>
      <button type="button" aria-label="Rolar para a direita" onClick={() => scroll(1)} className={`${arrow} right-3 lg:right-5`}>
        <ChevronRight />
      </button>
    </div>
  );
}
