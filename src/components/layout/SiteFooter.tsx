// Créditos obrigatórios ao TMDB (termos de uso da API).
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/5">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-xs text-white/50 sm:flex-row sm:items-center sm:px-6">
        <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG local e pequeno */}
          <img src="/tmdb-logo.svg" alt="Logo do TMDB" width={120} height={16} />
        </a>
        <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </div>
    </footer>
  );
}
