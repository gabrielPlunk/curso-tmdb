// Confere as regras de segurança (RLS) da tabela marcacoes com duas contas de teste.
// Uso (na raiz do projeto):
//   RLS_A_EMAIL=... RLS_A_PASSWORD=... RLS_B_EMAIL=... RLS_B_PASSWORD=... node --env-file=.env.local scripts/check-rls.mjs
// Usa só a chave pública (publishable), como o site. Imprime OK ou FALHOU: <passo>.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const { RLS_A_EMAIL, RLS_A_PASSWORD, RLS_B_EMAIL, RLS_B_PASSWORD } = process.env;
const MOVIE = 550; // Clube da Luta

function fail(step, detail = "") {
  console.log(`FALHOU: ${step}${detail ? ` (${detail})` : ""}`);
  process.exit(1);
}

if (!url || !key) fail("faltam NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY no .env.local");
if (!RLS_A_EMAIL || !RLS_A_PASSWORD || !RLS_B_EMAIL || !RLS_B_PASSWORD) fail("faltam RLS_A_EMAIL, RLS_A_PASSWORD, RLS_B_EMAIL ou RLS_B_PASSWORD");

async function signIn(email, password, who) {
  const client = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) fail(`entrar com a conta ${who}`, error.message);
  return { client, id: data.user.id };
}

const a = await signIn(RLS_A_EMAIL, RLS_A_PASSWORD, "A");
const b = await signIn(RLS_B_EMAIL, RLS_B_PASSWORD, "B");

// A marca um filme.
const mark = await a.client
  .from("marcacoes")
  .upsert({ user_id: a.id, movie_id: MOVIE, status: "quero", title: "Teste RLS", poster_path: null }, { onConflict: "user_id,movie_id" });
if (mark.error) fail("A marca um filme", mark.error.message);

try {
  // 1) B não enxerga nenhuma linha de A.
  const read = await b.client.from("marcacoes").select("user_id").eq("user_id", a.id);
  if (read.error) fail("B tenta ler as marcações de A", read.error.message);
  if (read.data.length > 0) fail("B conseguiu LER as marcações de A");

  // 2) B não altera nem apaga linhas de A (o banco simplesmente não encontra nenhuma).
  const upd = await b.client.from("marcacoes").update({ status: "assisti" }).eq("user_id", a.id).select();
  if ((upd.data ?? []).length > 0) fail("B conseguiu ALTERAR uma marcação de A");
  const del = await b.client.from("marcacoes").delete().eq("user_id", a.id).select();
  if ((del.data ?? []).length > 0) fail("B conseguiu APAGAR uma marcação de A");

  // 3) B não cria marcações em nome de A.
  const ins = await b.client.from("marcacoes").insert({ user_id: a.id, movie_id: 551, status: "quero", title: "Intruso" });
  if (!ins.error) fail("B conseguiu CRIAR uma marcação em nome de A");

  // E a marcação de A continua lá, intacta.
  const mine = await a.client.from("marcacoes").select("status").eq("movie_id", MOVIE).single();
  if (mine.error || mine.data.status !== "quero") fail("a marcação de A deveria continuar intacta");
} finally {
  await a.client.from("marcacoes").delete().eq("user_id", a.id).eq("movie_id", MOVIE);
}

console.log("OK");
