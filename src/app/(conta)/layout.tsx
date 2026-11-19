import { Suspense } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MarksLoader } from "@/components/marks/MarksLoader";
import { MarksProvider } from "@/components/marks/MarksProvider";

// Moldura das páginas da conta (entrar, criar conta, perfil): a mesma barra e o mesmo rodapé do catálogo.
export default function AccountLayout({ children }: LayoutProps<"/">) {
  return (
    <MarksProvider>
      {/* As marcações chegam à parte; a página não espera por elas. */}
      <Suspense fallback={null}>
        <MarksLoader />
      </Suspense>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </MarksProvider>
  );
}
