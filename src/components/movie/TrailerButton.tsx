"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon, PlayIcon } from "@/components/ui/icons";
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
      <button type="button" onClick={() => setOpen(true)} className="btn-light">
        <PlayIcon />
        Ver trailer
      </button>
      {open && (
        <dialog
          ref={dialog}
          onClose={() => setOpen(false)}
          onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
          aria-label={trailer.name}
          className="m-auto w-[min(92vw,1100px)] bg-transparent p-0 text-white backdrop:bg-black/85 backdrop:backdrop-blur-sm"
        >
          <div className="flex justify-end pb-3">
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="pill glass pl-2.5 transition-colors glass-hover"
            >
              <CloseIcon className="text-base" />
              Fechar
            </button>
          </div>
          <div className="aspect-video w-full overflow-hidden rounded-[20px] bg-black ring-1 ring-white/10">
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
