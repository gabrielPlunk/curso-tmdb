import Image from "next/image";
import { tmdbImage } from "@/lib/tmdb/images";
import type { CastMember } from "@/lib/tmdb/types";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function CastList({ cast }: { cast: CastMember[] }) {
  if (!cast.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold">Elenco</h2>
      <ul className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {cast.map((person) => {
          const src = tmdbImage(person.profilePath, "w185");
          return (
            <li key={person.id} className="w-20 shrink-0 text-center">
              <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full bg-surface">
                {src ? (
                  <Image src={src} alt={person.name} fill sizes="64px" className="object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-sm font-semibold text-white/60">
                    {initials(person.name)}
                  </span>
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-xs font-medium">{person.name}</p>
              {person.character && <p className="line-clamp-2 text-xs text-white/50">{person.character}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
