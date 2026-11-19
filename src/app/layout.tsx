import type { Metadata } from "next";
// Fonte guardada no próprio projeto (pacote geist): não depende de baixar do Google Fonts.
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Catálogo · filmes nos streamings", template: "%s · Catálogo" },
  description: "Descubra filmes disponíveis agora nos streamings do Brasil.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-bg text-white">{children}</body>
    </html>
  );
}
