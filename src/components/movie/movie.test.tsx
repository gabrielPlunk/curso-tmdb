import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import type { Provider } from "@/lib/tmdb/types";
import { CastList } from "./CastList";
import { TrailerButton } from "./TrailerButton";
import { WatchProviders } from "./WatchProviders";

vi.mock("next/image", () => import("@/test/next-image-mock"));

const prov = (name: string, id = name.length): Provider => ({ id, name, logoPath: `/${name}.png` });

test("WatchProviders vazio mostra aviso e crédito", () => {
  render(<WatchProviders watch={{ subscription: [], free: [], rent: [], buy: [], isEmpty: true }} />);
  expect(screen.getByText("Não está disponível em streaming no Brasil agora.")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /JustWatch/ })).toHaveAttribute("href", "https://www.justwatch.com");
});

test("WatchProviders mostra só os grupos com serviços", () => {
  render(<WatchProviders watch={{ subscription: [prov("Netflix")], free: [], rent: [prov("Apple TV")], buy: [], isEmpty: false }} />);
  expect(screen.getByRole("heading", { name: "Onde assistir no Brasil" })).toBeInTheDocument();
  expect(screen.getByText("Assinatura")).toBeInTheDocument();
  expect(screen.getByText("Aluguel")).toBeInTheDocument();
  expect(screen.queryByText("Compra")).not.toBeInTheDocument();
  expect(screen.queryByText("Grátis com anúncios")).not.toBeInTheDocument();
  expect(screen.getByRole("img", { name: "Netflix" })).toBeInTheDocument();
  expect(screen.queryByText("Não está disponível em streaming no Brasil agora.")).not.toBeInTheDocument();
  expect(screen.getByText(/Dados de streaming:/)).toBeInTheDocument();
});

test("TrailerButton remove o vídeo ao fechar", async () => {
  const user = userEvent.setup();
  render(<TrailerButton trailer={{ youtubeKey: "abc", name: "Trailer oficial" }} />);
  expect(screen.queryByTitle("Trailer oficial")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Ver trailer" }));
  expect(screen.getByTitle("Trailer oficial")).toHaveAttribute("src", expect.stringContaining("youtube-nocookie.com/embed/abc"));
  await user.click(screen.getByRole("button", { name: "Fechar" }));
  expect(screen.queryByTitle("Trailer oficial")).not.toBeInTheDocument();
});

test("CastList sem foto mostra iniciais; lista vazia não aparece", () => {
  const { container, rerender } = render(<CastList cast={[{ id: 1, name: "Keanu Reeves", character: "Neo", profilePath: null }]} />);
  expect(screen.getByText("KR")).toBeInTheDocument();
  expect(screen.getByText("Neo")).toBeInTheDocument();
  rerender(<CastList cast={[]} />);
  expect(container).toBeEmptyDOMElement();
});
