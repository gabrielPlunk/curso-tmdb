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
    <Image
      src={src}
      alt={provider.name}
      title={provider.name}
      width={48}
      height={48}
      className="rounded-xl ring-1 ring-white/10"
    />
  ) : (
    <span title={provider.name} className="flex h-12 items-center rounded-xl bg-white/10 px-3 text-xs">
      {provider.name}
    </span>
  );
}

export function WatchProviders({ watch, className = "" }: { watch: WatchOptions; className?: string }) {
  return (
    <section className={`panel space-y-5 rounded-3xl p-5 sm:p-6 ${className}`}>
      <h2 className="font-display text-lg font-bold tracking-tight [font-stretch:115%]">Onde assistir no Brasil</h2>
      {watch.isEmpty ? (
        <p className="text-white/70">Não está disponível em streaming no Brasil agora.</p>
      ) : (
        <div className="space-y-4">
          {GROUPS.filter((g) => watch[g.key].length > 0).map((g) => (
            <div key={g.key} className="space-y-2">
              <h3 className="text-sm text-white/55">{g.label}</h3>
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
      <p className="text-xs text-white/45">
        Dados de streaming:{" "}
        <a href="https://www.justwatch.com" target="_blank" rel="noreferrer" className="underline hover:text-white">
          JustWatch
        </a>
      </p>
    </section>
  );
}
