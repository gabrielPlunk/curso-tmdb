import { beforeEach, expect, test, vi } from "vitest";
import { getCategoryMovies } from "@/lib/tmdb/queries";
import { loadMoreMovies } from "./actions";

vi.mock("@/lib/tmdb/queries", () => ({ getCategoryMovies: vi.fn() }));
const getMock = vi.mocked(getCategoryMovies);

beforeEach(() => {
  getMock.mockReset();
  getMock.mockResolvedValue({ items: [], page: 2, hasMore: false });
});

test("loadMoreMovies rejeita categoria e página inválidas", async () => {
  await expect(loadMoreMovies("series", null, 2)).rejects.toThrow("Categoria inválida");
  await expect(loadMoreMovies("acao", null, 501)).rejects.toThrow("Página inválida");
  await expect(loadMoreMovies("acao", null, 1)).rejects.toThrow("Página inválida");
  await expect(loadMoreMovies("acao", null, 1.5)).rejects.toThrow("Página inválida");
  expect(getMock).not.toHaveBeenCalled();
});

test("loadMoreMovies trata serviço inválido como Todos", async () => {
  await loadMoreMovies("acao", "xyz", 2);
  expect(getMock).toHaveBeenCalledWith("acao", null, 2);
});

test("loadMoreMovies repassa serviço válido", async () => {
  await loadMoreMovies("em-alta", "netflix", 3);
  expect(getMock).toHaveBeenCalledWith("em-alta", "netflix", 3);
});
