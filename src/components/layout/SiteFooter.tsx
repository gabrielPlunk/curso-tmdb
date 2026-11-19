// Créditos obrigatórios: TMDB (termos de uso da API) e JustWatch (fonte do "onde assistir" que filtra a vitrine).
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/5">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-xs text-white/50 sm:flex-row sm:items-center sm:px-6">
        <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG local e pequeno */}
          <img src="/tmdb-logo.svg" alt="Logo do TMDB" width={120} height={16} />
        </a>
        <div className="space-y-1">
          <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
          <p>
            Dados de streaming:{" "}
            <a href="https://www.justwatch.com" target="_blank" rel="noreferrer" className="underline hover:text-white">
              JustWatch
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
