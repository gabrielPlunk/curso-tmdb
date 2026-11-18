// next/image nos testes: um <img> simples.
import type { ImgHTMLAttributes } from "react";

type Props = ImgHTMLAttributes<HTMLImageElement> & { preload?: boolean; fill?: boolean };

export default function MockImage(props: Props) {
  const imgProps: Props = { ...props };
  delete imgProps.preload;
  delete imgProps.fill;
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  return <img {...imgProps} />;
}
