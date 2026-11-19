import { Suspense } from "react";
import { AmbientLight } from "@/components/ambient/Ambient";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MarksLoader } from "@/components/marks/MarksLoader";
import { MarksProvider } from "@/components/marks/MarksProvider";
import { NavigationTracker } from "@/components/movie/BackButton";

// Moldura das páginas do catálogo. Uma futura área de conta pode ter o próprio layout em app/(conta)/.
export default function CatalogLayout({ children }: LayoutProps<"/">) {
  return (
    <MarksProvider>
      <Suspense fallback={null}>
        <NavigationTracker />
      </Suspense>
      {/* As marcações de quem entrou chegam à parte; a vitrine não espera por elas. */}
      <Suspense fallback={null}>
        <MarksLoader />
      </Suspense>
      {/* A luz do filme atrás de tudo. Fica no layout para continuar acesa (e fazer a transição) entre páginas. */}
      <AmbientLight />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </MarksProvider>
  );
}
