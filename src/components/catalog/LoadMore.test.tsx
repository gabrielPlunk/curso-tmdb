import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { loadMoreMovies } from "@/app/(catalogo)/explorar/[categoria]/actions";
import { LoadMore } from "./LoadMore";

vi.mock("next/image", () => import("@/test/next-image-mock"));
vi.mock("@/app/(catalogo)/explorar/[categoria]/actions", () => ({ loadMoreMovies: vi.fn() }));
const actionMock = vi.mocked(loadMoreMovies);

// IntersectionObserver falso: chama o callback assim que observa (marcador "visível").
class VisibleObserver {
  constructor(private cb: IntersectionObserverCallback) {}
  observe() {
    this.cb([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
  disconnect() {}
  unobserve() {}
}

beforeEach(() => vi.stubGlobal("IntersectionObserver", VisibleObserver));
afterEach(() => {
  actionMock.mockReset();
  vi.unstubAllGlobals();
});

test("LoadMore sem mais páginas não chama a action", () => {
  render(<LoadMore category="acao" service={null} initialPage={1} initialHasMore={false} />);
  expect(actionMock).not.toHaveBeenCalled();
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

test("LoadMore acrescenta filmes da próxima página e não repete", async () => {
  actionMock.mockResolvedValueOnce({
    items: [
      { id: 2, title: "Dois", posterPath: null, backdropPath: null, year: null, rating: 0 },
      { id: 2, title: "Dois", posterPath: null, backdropPath: null, year: null, rating: 0 },
    ],
    page: 2,
    hasMore: false,
  });
  render(<LoadMore category="acao" service="max" initialPage={1} initialHasMore />);
  expect(await screen.findByText("Dois")).toBeInTheDocument();
  expect(screen.getAllByText("Dois")).toHaveLength(1);
  expect(actionMock).toHaveBeenCalledWith("acao", "max", 2);
});

test("LoadMore com erro mostra Tentar carregar mais", async () => {
  actionMock.mockRejectedValueOnce(new Error("falhou"));
  render(<LoadMore category="acao" service={null} initialPage={1} initialHasMore />);
  expect(await screen.findByRole("button", { name: "Tentar carregar mais" })).toBeInTheDocument();
});
