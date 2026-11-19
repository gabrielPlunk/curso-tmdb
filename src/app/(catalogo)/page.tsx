import { Suspense } from "react";
import { Hero } from "@/components/catalog/Hero";
import { MovieRow } from "@/components/catalog/MovieRow";
import { ServiceChips } from "@/components/catalog/ServiceChips";
import { HomeSkeleton } from "@/components/catalog/Skeletons";
import { parseService, withService } from "@/lib/params";
import { buildShowcase } from "@/lib/showcase";
import { CATEGORIES } from "@/lib/tmdb/config";
import { getCategoryMovies, getFeatured } from "@/lib/tmdb/queries";

// A página lê o endereço (?servico=...), então o conteúdo fica dentro de um Suspense.
export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <div>
      <Suspense fallback={<HomeSkeleton />}>
        <Showcase searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Showcase({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const service = parseService((await searchParams).servico);

  // Tudo em paralelo. Uma fileira que falhar ou vier vazia some; se tudo falhar, aparece a tela de erro.
  const [featured, ...rows] = await Promise.allSettled([
    getFeatured(service),
    ...CATEGORIES.map((c) => getCategoryMovies(c.slug, service)),
  ]);

  const { hero, rows: visibleRows } = buildShowcase(featured, rows);
  const filter = <ServiceChips selected={service} />;

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Sem destaque (falhou ou não tem imagem), o filtro aparece sozinho numa pílula. */}
      {hero ? (
        <Hero featured={hero}>{filter}</Hero>
      ) : (
        <div className="px-4 pt-6 sm:px-6 lg:px-10">
          <div className="panel w-fit max-w-full rounded-full">{filter}</div>
        </div>
      )}
      {visibleRows.length === 0 ? (
        <p className="px-4 py-16 text-center text-white/60 sm:px-6">Nenhum filme encontrado para este serviço agora.</p>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {visibleRows.map(({ category, movies }) => (
            <MovieRow
              key={category.slug}
              title={category.title}
              href={withService(`/explorar/${category.slug}`, service)}
              movies={movies}
            />
          ))}
        </div>
      )}
    </div>
  );
}
