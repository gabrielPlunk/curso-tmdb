import Image from "next/image";
import { tmdbImage } from "@/lib/tmdb/images";
import type { Provider, WatchOptions } from "@/lib/tmdb/types";

const GROUPS: { key: keyof Omit<WatchOptions, "isEmpty">; label: string }[] = [
  { key: "subscription", label: "Assinatura" },
  { key: "free", label: "Grátis com anúncios" },
  { key: "rent", label: "Aluguel" },
  { key: "buy", label: "Compra" },
];

function Logo({ provider }: { provider: Provider }) {
  const src = tmdbImage(provider.logoPath, "w92");
  return src ? (
    <Image src={src} alt={provider.name} title={provider.name} width={44} height={44} className="rounded-lg" />
  ) : (
    <span title={provider.name} className="flex h-11 items-center rounded-lg bg-surface px-3 text-xs">
      {provider.name}
    </span>
  );
}

export function WatchProviders({ watch }: { watch: WatchOptions }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold">Onde assistir no Brasil</h2>
      {watch.isEmpty ? (
        <p className="text-white/70">Não está disponível em streaming no Brasil agora.</p>
      ) : (
        <div className="space-y-3">
          {GROUPS.filter((g) => watch[g.key].length > 0).map((g) => (
            <div key={g.key} className="space-y-1.5">
              <h3 className="text-xs uppercase tracking-wide text-white/50">{g.label}</h3>
              <ul className="flex flex-wrap gap-2">
                {watch[g.key].map((p) => (
                  <li key={p.id}>
                    <Logo provider={p} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-white/50">
        Dados de streaming:{" "}
        <a href="https://www.justwatch.com" target="_blank" rel="noreferrer" className="underline hover:text-white">
          JustWatch
        </a>
      </p>
    </section>
  );
}
