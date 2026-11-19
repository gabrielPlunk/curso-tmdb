import type { Metadata } from "next";
// Fontes guardadas no próprio projeto: não dependem de baixar do Google Fonts.
import { GeistSans } from "geist/font/sans";
import { archivo } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Catálogo · filmes nos streamings", template: "%s · Catálogo" },
  description: "Descubra filmes disponíveis agora nos streamings do Brasil.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${archivo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-bg text-white">{children}</body>
    </html>
  );
}
