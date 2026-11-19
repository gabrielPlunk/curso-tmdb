"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/*
  Luz ambiente: a cor do filme se espalha pela página, como a luz de uma TV num quarto escuro.
  - Cada página diz qual imagem ilumina o fundo com <AmbientSource src=... />.
  - Ao passar o mouse (ou o foco do teclado) num elemento com data-ambient="url", a luz muda para ele.
  - <AmbientLight /> fica no layout e desenha o fundo. Como não sai da tela entre páginas, a luz faz a transição.
*/

let base: string | null = null;
const listeners = new Set<() => void>();

function setBase(src: string | null) {
  if (src === base) return;
  base = src;
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}

/** Marca a imagem que ilumina esta página. Enquanto a próxima página carrega, a luz anterior continua. */
export function AmbientSource({ src }: { src: string | null }) {
  useEffect(() => {
    if (src) setBase(src);
  }, [src]);
  return null;
}

type Layer = { src: string | null; key: number };

export function AmbientLight() {
  const baseSrc = useSyncExternalStore(subscribe, () => base, () => null);
  const [hover, setHover] = useState<string | null>(null);

  // Trocou de página (ou de destaque): esquece o pôster que estava sob o mouse.
  const [lastBase, setLastBase] = useState(baseSrc);
  if (baseSrc !== lastBase) {
    setLastBase(baseSrc);
    setHover(null);
  }

  useEffect(() => {
    let timer: number | undefined;
    let wanted: string | null = null;

    // Só troca a luz depois que a imagem já baixou, para não piscar preto.
    const show = (src: string | null) => {
      wanted = src;
      if (!src) return setHover(null);
      const img = new Image();
      img.onload = () => {
        if (wanted === src) setHover(src);
      };
      img.src = src;
    };
    const schedule = (src: string | null, delay: number) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => show(src), delay);
    };
    const sourceOf = (target: EventTarget | null) =>
      target instanceof Element ? (target.closest("[data-ambient]")?.getAttribute("data-ambient") ?? null) : null;

    // Uma pausa curta sobre o pôster acende a luz dele; sair dos pôsteres volta à luz da página.
    const onPointerOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const src = sourceOf(e.target);
      schedule(src, src ? 140 : 650);
    };
    const onFocusIn = (e: FocusEvent) => schedule(sourceOf(e.target), 0);

    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, []);

  const current = hover ?? baseSrc;

  // Pilha de no máximo duas camadas: a que está saindo e a que está entrando por cima.
  const [stack, setStack] = useState<{ count: number; shown: string | null; layers: Layer[] }>({
    count: 1,
    shown: current,
    layers: [{ src: current, key: 1 }],
  });
  if (current !== stack.shown) {
    setStack((s) => ({
      count: s.count + 1,
      shown: current,
      layers: [...s.layers.slice(-1), { src: current, key: s.count + 1 }],
    }));
  }

  const top = stack.layers.length - 1;
  return (
    <div aria-hidden className="ambient">
      {stack.layers.map((layer, i) => (
        <div
          key={layer.key}
          className="ambient-layer"
          data-empty={layer.src ? undefined : ""}
          style={layer.src ? { backgroundImage: `url("${layer.src}")` } : undefined}
          onAnimationEnd={i === top ? () => setStack((s) => ({ ...s, layers: s.layers.slice(-1) })) : undefined}
        />
      ))}
      <div className="ambient-veil" />
    </div>
  );
}
