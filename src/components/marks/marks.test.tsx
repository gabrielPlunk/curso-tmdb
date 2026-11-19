import { act, render, screen } from "@testing-library/react";
import { Activity } from "react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import { setMark } from "@/lib/marks/actions";
import type { MarkRef, SetMarkResult } from "@/lib/marks/types";
import { MarkButtons } from "./MarkButtons";
import { MarksProvider, MarksSeed, useMarks } from "./MarksProvider";
import { ProfileTabs } from "./ProfileTabs";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/lib/marks/actions", () => ({ setMark: vi.fn() }));
const mockedSetMark = vi.mocked(setMark);

beforeEach(() => {
  vi.clearAllMocks();
  mockedSetMark.mockResolvedValue({ ok: true });
  window.history.replaceState(null, "", "/filme/1?x=2");
});

// Mostra o que o provider sabe e oferece botões para clicar.
function Probe({ id = 1 }: { id?: number }) {
  const m = useMarks();
  return (
    <div>
      <p data-testid="state">{`${m.ready}|${m.signedIn}|${m.statusOf(id)}|${m.isPending(id)}|${m.counts.quero}|${m.counts.assisti}`}</p>
      <button onClick={() => m.toggle(id, "assisti")}>assisti</button>
      <button onClick={() => m.toggle(id, "quero")}>quero</button>
    </div>
  );
}

function setup(seed?: { signedIn: boolean; marks: MarkRef[] }) {
  return render(
    <MarksProvider>
      {seed && <MarksSeed {...seed} />}
      <Probe />
    </MarksProvider>,
  );
}
const state = () => screen.getByTestId("state").textContent;

test("antes do seed não está pronto; depois sabe o status e as contagens", () => {
  const { rerender } = setup();
  expect(state()).toBe("false|false|null|false|0|0");
  rerender(
    <MarksProvider>
      <MarksSeed signedIn marks={[{ movieId: 1, status: "quero" }]} />
      <Probe />
    </MarksProvider>,
  );
  expect(state()).toBe("true|true|quero|false|1|0");
});

test("fora de um provider, useMarks é inerte", () => {
  render(<Probe />);
  expect(state()).toBe("false|false|null|false|0|0");
});

test("toggle muda na hora e grava; clicar de novo desmarca", async () => {
  setup({ signedIn: true, marks: [] });
  await userEvent.click(screen.getByText("assisti"));
  expect(state()).toBe("true|true|assisti|false|0|1");
  expect(mockedSetMark).toHaveBeenLastCalledWith(1, "assisti");
  await userEvent.click(screen.getByText("assisti"));
  expect(state()).toBe("true|true|null|false|0|0");
  expect(mockedSetMark).toHaveBeenLastCalledWith(1, null);
});

test("falha ao gravar volta ao estado anterior e avisa", async () => {
  mockedSetMark.mockResolvedValue({ ok: false, reason: "error" });
  setup({ signedIn: true, marks: [{ movieId: 1, status: "quero" }] });
  await userEvent.click(screen.getByText("assisti"));
  expect(state()).toBe("true|true|quero|false|1|0");
  expect(screen.getByRole("status")).toHaveTextContent("Não foi possível salvar. Tente de novo.");
});

test("sessão vencida volta ao estado anterior e leva para entrar", async () => {
  mockedSetMark.mockResolvedValue({ ok: false, reason: "auth" });
  setup({ signedIn: true, marks: [] });
  await userEvent.click(screen.getByText("quero"));
  expect(state()).toBe("true|true|null|false|0|0");
  expect(push).toHaveBeenCalledWith("/entrar?volta=%2Ffilme%2F1%3Fx%3D2");
});

test("deslogado, toggle leva para entrar sem gravar", async () => {
  setup({ signedIn: false, marks: [] });
  await userEvent.click(screen.getByText("quero"));
  expect(mockedSetMark).not.toHaveBeenCalled();
  expect(push).toHaveBeenCalledWith("/entrar?volta=%2Ffilme%2F1%3Fx%3D2");
});

test("enquanto salva, um segundo clique no mesmo filme é ignorado", async () => {
  let finish!: (r: SetMarkResult) => void;
  mockedSetMark.mockReturnValueOnce(new Promise((r) => (finish = r)));
  setup({ signedIn: true, marks: [] });
  await userEvent.click(screen.getByText("assisti"));
  expect(state()).toBe("true|true|assisti|true|0|1");
  await userEvent.click(screen.getByText("quero"));
  expect(mockedSetMark).toHaveBeenCalledTimes(1);
  expect(state()).toBe("true|true|assisti|true|0|1");
  await act(async () => finish({ ok: true }));
  expect(state()).toBe("true|true|assisti|false|0|1");
});


function seeded(ui: React.ReactNode, marks: MarkRef[] = [], signedIn = true) {
  return render(
    <MarksProvider>
      <MarksSeed signedIn={signedIn} marks={marks} />
      {ui}
    </MarksProvider>,
  );
}

test("MarkButtons mostra Quero assistir e Já vi com o estado", () => {
  seeded(<MarkButtons movieId={1} />, [{ movieId: 1, status: "assisti" }]);
  expect(screen.getByRole("button", { name: "Quero assistir" })).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByRole("button", { name: "Já vi" })).toHaveAttribute("aria-pressed", "true");
});

test("MarkButtons: clicar em Já vi marca como assistido", async () => {
  seeded(<MarkButtons movieId={1} />);
  await userEvent.click(screen.getByRole("button", { name: "Já vi" }));
  expect(mockedSetMark).toHaveBeenCalledWith(1, "assisti");
  expect(screen.getByRole("button", { name: "Já vi" })).toHaveAttribute("aria-pressed", "true");
});

test("MarkButtons fica invisível até as marcações chegarem", () => {
  render(
    <MarksProvider>
      <MarkButtons movieId={1} />
    </MarksProvider>,
  );
  const group = screen.getByRole("group", { hidden: true });
  expect(group).toHaveAttribute("aria-hidden", "true");
  expect(group).toHaveClass("invisible");
});

test("MarkButtons desabilita os dois botões enquanto salva", async () => {
  mockedSetMark.mockReturnValueOnce(new Promise(() => {}));
  seeded(<MarkButtons movieId={1} />);
  await userEvent.click(screen.getByRole("button", { name: "Quero assistir" }));
  expect(screen.getByRole("button", { name: "Quero assistir" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Já vi" })).toBeDisabled();
});

test("ProfileTabs usa as contagens do servidor até as marcações chegarem", () => {
  render(
    <MarksProvider>
      <ProfileTabs active="quero" serverCounts={{ quero: 2, assisti: 5 }} />
    </MarksProvider>,
  );
  expect(screen.getByRole("link", { name: "Quero assistir · 2" })).toHaveAttribute("href", "/perfil?aba=quero");
  expect(screen.getByRole("link", { name: "Quero assistir · 2" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("link", { name: "Já assisti · 5" })).toHaveAttribute("href", "/perfil?aba=assisti");
  expect(screen.getByRole("link", { name: "Já assisti · 5" })).not.toHaveAttribute("aria-current");
});

test("ProfileTabs passa a usar as contagens ao vivo", () => {
  seeded(<ProfileTabs active="assisti" serverCounts={{ quero: 2, assisti: 5 }} />, [{ movieId: 1, status: "assisti" }]);
  expect(screen.getByRole("link", { name: "Quero assistir · 0" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Já assisti · 1" })).toHaveAttribute("aria-current", "page");
});

test("reexibir uma página guardada (Voltar do navegador) não apaga o que foi marcado depois", async () => {
  const marks: MarkRef[] = [];
  const ui = (mode: "visible" | "hidden") => (
    <MarksProvider>
      <Activity mode={mode}>
        <MarksSeed signedIn marks={marks} />
      </Activity>
      <Probe />
    </MarksProvider>
  );
  const { rerender } = render(ui("visible"));
  await userEvent.click(screen.getByText("assisti"));
  expect(state()).toBe("true|true|assisti|false|0|1");
  rerender(ui("hidden"));
  rerender(ui("visible"));
  expect(state()).toBe("true|true|assisti|false|0|1");
});
