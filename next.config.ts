import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Perfis de cache: por quanto tempo as respostas do TMDB ficam guardadas.
  cacheLife: {
    // Listas da vitrine, destaque, semelhantes e busca: revalida a cada 6 h.
    catalogo: { stale: 300, revalidate: 60 * 60 * 6, expire: 60 * 60 * 24 },
    // Detalhes do filme e onde assistir: revalida a cada 24 h.
    filme: { stale: 300, revalidate: 60 * 60 * 24, expire: 60 * 60 * 48 },
  },
  images: {
    remotePatterns: [new URL("https://image.tmdb.org/t/p/**")],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
