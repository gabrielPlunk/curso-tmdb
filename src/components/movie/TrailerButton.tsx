"use client";

import { useEffect, useRef, useState } from "react";
import type { Trailer } from "@/lib/tmdb/types";

// Abre o trailer numa janela por cima da página. Ao fechar, o vídeo sai da página (o som para).
export function TrailerButton({ trailer }: { trailer: Trailer }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) dialog.current?.showModal();
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/85"
      >
        ▶ Trailer
      </button>
      {open && (
        <dialog
          ref={dialog}
          onClose={() => setOpen(false)}
          onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
          aria-label={trailer.name}
          className="m-auto w-[min(92vw,960px)] bg-transparent p-0 backdrop:bg-black/80"
        >
          <div className="flex justify-end pb-2">
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="rounded-md bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20"
            >
              Fechar
            </button>
          </div>
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailer.youtubeKey}?autoplay=1`}
              title={trailer.name}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </dialog>
      )}
    </>
  );
}
