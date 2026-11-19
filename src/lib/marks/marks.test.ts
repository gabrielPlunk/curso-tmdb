import { beforeEach, expect, test, vi } from "vitest";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getMovie } from "@/lib/tmdb/queries";
import { setMark } from "./actions";
import { getMyMarks } from "./queries";

vi.mock("@/lib/supabase/server", () => ({ createSupabaseServer: vi.fn() }));
vi.mock("@/lib/tmdb/queries", () => ({ getMovie: vi.fn() }));

const mockedClient = vi.mocked(createSupabaseServer);
const mockedMovie = vi.mocked(getMovie);

// Um falso "construtor de consultas" do Supabase: anota cada chamada e devolve `result` no fim.
type Call = [string, ...unknown[]];
function fakeClient({ userId = "u1" as string | null, result = { data: [] as unknown, error: null as unknown } } = {}) {
  const calls: Call[] = [];
  const builder: Record<string, unknown> = {};
  for (const name of ["upsert", "delete", "select", "eq", "order"]) {
    builder[name] = (...args: unknown[]) => {
      calls.push([name, ...args]);
      return builder;
    };
  }
  builder.then = (resolve: (v: unknown) => void) => resolve(result);
  const client = {
    auth: { getClaims: vi.fn().mockResolvedValue({ data: userId ? { claims: { sub: userId } } : null, error: null }) },
    from: vi.fn((table: string) => {
      calls.push(["from", table]);
      return builder;
    }),
  };
  return { client, calls };
}

const movie = { id: 10, title: "Duna", posterPath: "/duna.jpg" };

beforeEach(() => {
  vi.clearAllMocks();
  mockedMovie.mockResolvedValue(movie as never);
});

test("setMark grava o status com título e pôster vindos do TMDB", async () => {
  const { client, calls } = fakeClient();
  mockedClient.mockResolvedValue(client as never);
  expect(await setMark(10, "assisti")).toEqual({ ok: true });
  expect(mockedMovie).toHaveBeenCalledWith(10);
  const upsert = calls.find((c) => c[0] === "upsert")!;
  expect(upsert[1]).toMatchObject({ user_id: "u1", movie_id: 10, status: "assisti", title: "Duna", poster_path: "/duna.jpg" });
  expect(new Date((upsert[1] as { marked_at: string }).marked_at).toString()).not.toBe("Invalid Date");
  expect(upsert[2]).toEqual({ onConflict: "user_id,movie_id" });
});

test("setMark com null apaga a marcação, sem consultar o TMDB", async () => {
  const { client, calls } = fakeClient();
  mockedClient.mockResolvedValue(client as never);
  expect(await setMark(10, null)).toEqual({ ok: true });
  expect(calls).toContainEqual(["delete"]);
  expect(calls).toContainEqual(["eq", "movie_id", 10]);
  expect(calls).toContainEqual(["eq", "user_id", "u1"]);
  expect(mockedMovie).not.toHaveBeenCalled();
});

test("setMark sem sessão pede login e não grava", async () => {
  const { client } = fakeClient({ userId: null });
  mockedClient.mockResolvedValue(client as never);
  expect(await setMark(10, "quero")).toEqual({ ok: false, reason: "auth" });
  expect(client.from).not.toHaveBeenCalled();
});

test("setMark sem Supabase configurado pede login", async () => {
  mockedClient.mockResolvedValue(null);
  expect(await setMark(10, "quero")).toEqual({ ok: false, reason: "auth" });
});

test("setMark recusa id ou status inválidos sem gravar", async () => {
  const { client } = fakeClient();
  mockedClient.mockResolvedValue(client as never);
  for (const id of [0, -1, Number.NaN, 1.5]) expect(await setMark(id, "quero")).toEqual({ ok: false, reason: "error" });
  expect(await setMark(10, "favorito" as never)).toEqual({ ok: false, reason: "error" });
  expect(client.from).not.toHaveBeenCalled();
});

test("setMark de filme inexistente no TMDB não grava", async () => {
  const { client } = fakeClient();
  mockedClient.mockResolvedValue(client as never);
  mockedMovie.mockResolvedValue(null);
  expect(await setMark(10, "quero")).toEqual({ ok: false, reason: "error" });
  expect(client.from).not.toHaveBeenCalled();
});

test("setMark com erro do banco devolve erro", async () => {
  const { client } = fakeClient({ result: { data: null, error: { message: "boom" } } });
  mockedClient.mockResolvedValue(client as never);
  expect(await setMark(10, "quero")).toEqual({ ok: false, reason: "error" });
});

test("getMyMarks devolve as marcações da pessoa, mais recentes primeiro", async () => {
  const rows = [{ movie_id: 10, status: "assisti", title: "Duna", poster_path: "/duna.jpg", marked_at: "2026-11-19T10:00:00Z" }];
  const { client, calls } = fakeClient({ result: { data: rows, error: null } });
  mockedClient.mockResolvedValue(client as never);
  expect(await getMyMarks()).toEqual([
    { movieId: 10, status: "assisti", title: "Duna", posterPath: "/duna.jpg", markedAt: "2026-11-19T10:00:00Z" },
  ]);
  expect(calls).toContainEqual(["eq", "user_id", "u1"]);
  expect(calls).toContainEqual(["order", "marked_at", { ascending: false }]);
});

test("getMyMarks sem sessão devolve lista vazia", async () => {
  const { client } = fakeClient({ userId: null });
  mockedClient.mockResolvedValue(client as never);
  expect(await getMyMarks()).toEqual([]);
});
