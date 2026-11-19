import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { MovieGrid } from "@/components/catalog/MovieGrid";
import { GridSkeleton } from "@/components/catalog/Skeletons";
import { ProfileTabs } from "@/components/marks/ProfileTabs";
import { DisplayTitle } from "@/components/ui/DisplayTitle";
import { getCurrentUser } from "@/lib/auth/user";
import { getMyMarks } from "@/lib/marks/queries";
import type { Mark } from "@/lib/marks/types";
import type { MovieSummary } from "@/lib/tmdb/types";
import { parseTab } from "./parse-tab";

export const metadata: Metadata = { title: "Meu perfil" };

type Props = PageProps<"/perfil">;

export default function ProfilePage({ searchParams }: Props) {
  return (
    <div className="px-4 pb-8 pt-10 sm:px-6 sm:pt-14 lg:px-10">
      <Suspense fallback={<GridSkeleton />}>
        <Profile searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// O pôster do perfil usa o título e o pôster guardados na marcação (sem consultar o TMDB).
const toSummary = (m: Mark): MovieSummary => ({
  id: m.movieId,
  title: m.title,
  posterPath: m.posterPath,
  backdropPath: null,
  year: null,
  rating: 0,
});

async function Profile({ searchParams }: Pick<Props, "searchParams">) {
  const tab = parseTab((await searchParams).aba);
  const user = await getCurrentUser();
  // O perfil é só de quem entrou. Quem não entrou vai para "Entrar" e volta para cá depois.
  if (!user) redirect(`/entrar?volta=${encodeURIComponent(`/perfil?aba=${tab}`)}`);

  const marks = await getMyMarks();
  const counts = { quero: 0, assisti: 0 };
  for (const m of marks) counts[m.status] += 1;
  // A lista vem do banco quando a aba abre. Se a pessoa desmarca algo aqui, o pôster fica no lugar
  // (com o botão já desmarcado) até ela trocar de aba ou voltar depois.
  const movies = marks.filter((m) => m.status === tab).map(toSummary);

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <DisplayTitle size="lg">{`Olá, ${user.name}`}</DisplayTitle>
        <ProfileTabs active={tab} serverCounts={counts} />
      </div>
      {movies.length === 0 ? (
        <div className="space-y-4 py-16 text-center">
          <p className="text-white/60">Você ainda não marcou nenhum filme</p>
          <Link href="/" className="pill glass px-5 py-2.5 transition-colors hover:bg-white/20">
            Explorar a vitrine
          </Link>
        </div>
      ) : (
        <MovieGrid movies={movies} showWatchedVeil={tab !== "assisti"} />
      )}
    </div>
  );
}
