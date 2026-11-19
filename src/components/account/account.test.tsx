import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { AccountMenu } from "./AccountMenu";
import { AuthForm } from "./AuthForm";
import { SignInLink } from "./SignInLink";

const noop = vi.fn(async () => ({ error: null, email: "" }));

test("AuthForm de entrar tem e-mail, senha e link para criar conta mantendo o voltar", () => {
  render(<AuthForm mode="entrar" volta="/filme/12" action={noop} />);
  expect(screen.getByLabelText("E-mail")).toHaveAttribute("type", "email");
  expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "password");
  expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute("href", "/criar-conta?volta=%2Ffilme%2F12");
});

test("AuthForm de criar conta tem nome, dica da senha e link para entrar", () => {
  render(<AuthForm mode="criar-conta" volta="/filme/12" action={noop} />);
  expect(screen.getByLabelText("Nome")).toBeInTheDocument();
  expect(screen.getByText("Pelo menos 6 caracteres")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Criar conta" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/entrar?volta=%2Ffilme%2F12");
});

test("AuthForm envia o voltar num campo oculto", () => {
  const { container } = render(<AuthForm mode="entrar" volta="/filme/12" action={noop} />);
  expect(container.querySelector('input[type="hidden"][name="volta"]')).toHaveValue("/filme/12");
});

test("AuthForm mostra o erro e mantém o e-mail devolvido", async () => {
  const action = vi.fn(async () => ({ error: "E-mail ou senha incorretos.", email: "a@b.c" }));
  render(<AuthForm mode="entrar" volta="/" action={action} />);
  await userEvent.type(screen.getByLabelText("E-mail"), "a@b.c");
  await userEvent.type(screen.getByLabelText("Senha"), "errada");
  await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("E-mail ou senha incorretos.");
  expect(screen.getByLabelText("E-mail")).toHaveValue("a@b.c");
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/filme/12",
  useSearchParams: () => new URLSearchParams(""),
}));
vi.mock("@/app/(conta)/actions", () => ({ signOut: vi.fn() }));

test("SignInLink leva para entrar voltando à página atual", () => {
  render(<SignInLink />);
  expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/entrar?volta=%2Ffilme%2F12");
});

test("AccountMenu abre com perfil e sair, e fecha com Esc", async () => {
  render(<AccountMenu user={{ id: "u1", name: "Gabriel", initial: "G" }} />);
  const button = screen.getByRole("button", { name: "Conta de Gabriel" });
  expect(button).toHaveTextContent("G");
  expect(button).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByRole("link", { name: "Meu perfil" })).not.toBeInTheDocument();

  await userEvent.click(button);
  expect(button).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("link", { name: "Meu perfil" })).toHaveAttribute("href", "/perfil");
  const sair = screen.getByRole("button", { name: "Sair" });
  expect(sair.closest("form")!.querySelector('input[name="volta"]')).toHaveValue("/filme/12");

  await userEvent.keyboard("{Escape}");
  expect(screen.queryByRole("link", { name: "Meu perfil" })).not.toBeInTheDocument();
  expect(button).toHaveFocus();
});

test("AccountMenu fecha ao clicar fora", async () => {
  render(
    <div>
      <p>fora</p>
      <AccountMenu user={{ id: "u1", name: "Gabriel", initial: "G" }} />
    </div>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Conta de Gabriel" }));
  await userEvent.click(screen.getByText("fora"));
  expect(screen.queryByRole("link", { name: "Meu perfil" })).not.toBeInTheDocument();
});
