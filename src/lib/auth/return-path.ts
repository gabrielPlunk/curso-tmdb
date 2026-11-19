// Para onde a pessoa volta depois de entrar ou sair (o ?volta= do endereço).
// Só aceita caminhos deste site. Sem essa trava, um link como /entrar?volta=//site-falso.com
// mandaria a pessoa, já logada, para outro site (o golpe "open redirect").
const AUTH_PAGES = ["/entrar", "/criar-conta"];

export function safeReturnPath(raw: unknown, fallback = "/"): string {
  if (typeof raw !== "string") return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return fallback;
  const path = raw.split(/[?#]/)[0];
  if (AUTH_PAGES.includes(path)) return fallback;
  return raw;
}
