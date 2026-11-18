import { Suspense } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { NavigationTracker } from "@/components/movie/BackButton";

// Moldura das páginas do catálogo. Uma futura área de conta pode ter o próprio layout em app/(conta)/.
export default function CatalogLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Suspense fallback={null}>
        <NavigationTracker />
      </Suspense>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
