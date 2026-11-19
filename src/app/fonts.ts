import localFont from "next/font/local";

// Fonte dos títulos, guardada no projeto (pacote @fontsource-variable/archivo).
// É "variável": além do peso, muda de largura (de 62% a 125%). Títulos curtos ficam largos e longos ficam estreitos.
export const archivo = localFont({
  src: [
    { path: "../../node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2", style: "normal" },
    { path: "../../node_modules/@fontsource-variable/archivo/files/archivo-latin-ext-wdth-normal.woff2", style: "normal" },
  ],
  weight: "100 900",
  variable: "--font-archivo",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});
