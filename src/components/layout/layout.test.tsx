import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { SearchForm } from "./SearchForm";
import { SiteFooter } from "./SiteFooter";

test("rodapé tem o aviso e o logo do TMDB", () => {
  render(<SiteFooter />);
  expect(screen.getByText("This product uses the TMDB API but is not endorsed or certified by TMDB.")).toBeInTheDocument();
  expect(screen.getByRole("img", { name: /TMDB/ })).toBeInTheDocument();
});

test("busca envia GET para /busca com o campo q", () => {
  render(<SearchForm />);
  const input = screen.getByRole("searchbox", { name: "Buscar filmes" });
  const form = input.closest("form")!;
  expect(form).toHaveAttribute("action", "/busca");
  expect(form).toHaveAttribute("method", "get");
  expect(input).toHaveAttribute("name", "q");
});

test("busca mostra o termo atual", () => {
  render(<SearchForm defaultValue="duna" />);
  expect(screen.getByRole("searchbox")).toHaveValue("duna");
});
