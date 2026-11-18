import Link from "next/link";
import { SERVICES, type ServiceSlug } from "@/lib/tmdb/config";

const chip = "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors";
const on = "border-accent bg-accent text-black";
const off = "border-white/15 text-white/80 hover:border-white/40 hover:text-white";

export function ServiceChips({ selected }: { selected: ServiceSlug | null }) {
  const items = [{ slug: null, name: "Todos" }, ...SERVICES.map((s) => ({ slug: s.slug, name: s.name }))];
  return (
    <nav aria-label="Filtrar por streaming" className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
      <ul className="flex gap-2">
        {items.map((item) => {
          const active = item.slug === selected;
          return (
            <li key={item.name}>
              <Link
                href={item.slug ? `/?servico=${item.slug}` : "/"}
                aria-current={active ? "page" : undefined}
                className={`${chip} ${active ? on : off} inline-block`}
                scroll={false}
              >
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
