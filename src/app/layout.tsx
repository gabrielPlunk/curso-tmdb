import type { Metadata } from "next";
// Fontes guardadas no próprio projeto: não dependem de baixar do Google Fonts.
import { GeistSans } from "geist/font/sans";
import { Suspense } from "react";
import { MarksLoader } from "@/components/marks/MarksLoader";
import { MarksProvider } from "@/components/marks/MarksProvider";
import { archivo } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Catálogo · filmes nos streamings", template: "%s · Catálogo" },
  description: "Descubra filmes disponíveis agora nos streamings do Brasil.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${archivo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-bg text-white">
        {/* As marcações valem para o site todo. Elas chegam à parte: nenhuma página espera por elas. */}
        <MarksProvider>
          <Suspense fallback={null}>
            <MarksLoader />
          </Suspense>
          {children}
        </MarksProvider>
      </body>
    </html>
  );
}
