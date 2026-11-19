import Link from "next/link";
import { SERVICES, type ServiceSlug } from "@/lib/tmdb/config";

const chip = "inline-block shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors";
const on = "bg-white text-black";
const off = "text-white/75 hover:bg-white/10 hover:text-white";

// Filtro por streaming, numa pílula de vidro abaixo do destaque. Trocar o serviço troca o destaque e a luz da página.
export function ServiceChips({ selected }: { selected: ServiceSlug | null }) {
  const items = [{ slug: null, name: "Todos" }, ...SERVICES.map((s) => ({ slug: s.slug, name: s.name }))];
  return (
    <nav aria-label="Filtrar por streaming" className="no-scrollbar overflow-x-auto p-1.5">
      <ul className="flex gap-1">
        {items.map((item) => {
          const active = item.slug === selected;
          return (
            <li key={item.name}>
              <Link
                href={item.slug ? `/?servico=${item.slug}` : "/"}
                aria-current={active ? "page" : undefined}
                className={`${chip} ${active ? on : off}`}
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
