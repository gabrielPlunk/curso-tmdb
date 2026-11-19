import type { CSSProperties } from "react";
import { titleFit } from "@/lib/format";

type Props = {
  children: string;
  as?: "h1" | "h2";
  id?: string;
  /** "xl": destaque e página do filme. "lg": títulos de página (gênero, por exemplo). */
  size?: "xl" | "lg";
  className?: string;
};

/** Título grande em caixa alta cuja largura da letra acompanha o tamanho do texto (ver .display-title no CSS). */
export function DisplayTitle({ children, as: Tag = "h1", id, size = "xl", className = "" }: Props) {
  const { stretch, scale } = titleFit(children);
  const style = { "--stretch": `${stretch}%`, "--scale": scale } as CSSProperties;
  return (
    <Tag id={id} data-size={size} style={style} className={`display-title ${className}`}>
      {children}
    </Tag>
  );
}
