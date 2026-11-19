import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import type { MovieSummary } from "@/lib/tmdb/types";
import { Hero } from "./Hero";
import { MovieRow } from "./MovieRow";
import { PosterCard } from "./PosterCard";
import { ServiceChips } from "./ServiceChips";

vi.mock("next/image", () => import("@/test/next-image-mock"));

const m: MovieSummary = { id: 7, title: "Duna", posterPath: "/p.jpg", backdropPath: "/b.jpg", year: "2021", rating: 7.8 };

test("ServiceChips marca o ativo e monta os links", () => {
  render(<ServiceChips selected="max" />);
  expect(screen.getByRole("link", { name: "HBO Max" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("link", { name: "Todos" })).not.toHaveAttribute("aria-current");
  expect(screen.getByRole("link", { name: "Todos" })).toHaveAttribute("href", "/");
  expect(screen.getByRole("link", { name: "Netflix" })).toHaveAttribute("href", "/?servico=netflix");
});

test("ServiceChips sem seleção marca Todos", () => {
  render(<ServiceChips selected={null} />);
  expect(screen.getByRole("link", { name: "Todos" })).toHaveAttribute("aria-current", "page");
});

test("PosterCard sem pôster mostra o título", () => {
  render(<PosterCard movie={{ ...m, id: 5, title: "Sem Capa", posterPath: null }} />);
  expect(screen.getByRole("link")).toHaveAttribute("href", "/filme/5");
  expect(screen.getByText("Sem Capa")).toBeInTheDocument();
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});

test("PosterCard com pôster usa a imagem w342 com alt", () => {
  render(<PosterCard movie={m} />);
  expect(screen.getByRole("img", { name: "Duna" })).toHaveAttribute("src", "https://image.tmdb.org/t/p/w342/p.jpg");
});

test("MovieRow vazio não renderiza nada", () => {
  const { container } = render(<MovieRow title="Ação" href="/explorar/acao" movies={[]} />);
  expect(container).toBeEmptyDOMElement();
});

test("MovieRow mostra Ver tudo só com href", () => {
  const { rerender } = render(<MovieRow title="Ação" href="/explorar/acao" movies={[m]} />);
  expect(screen.getByRole("link", { name: /Ver tudo/ })).toHaveAttribute("href", "/explorar/acao");
  rerender(<MovieRow title="Semelhantes" movies={[m]} />);
  expect(screen.queryByRole("link", { name: /Ver tudo/ })).not.toBeInTheDocument();
});

test("Hero usa a preposição certa", () => {
  render(<Hero featured={{ movie: m, service: { name: "Netflix", preposition: "na" } }} />);
  expect(screen.getByText("Disponível na Netflix")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Ver detalhes" })).toHaveAttribute("href", "/filme/7");
});

test("Hero sem serviço identificado", () => {
  render(<Hero featured={{ movie: m, service: null }} />);
  expect(screen.getByText("Disponível nos streamings")).toBeInTheDocument();
});
