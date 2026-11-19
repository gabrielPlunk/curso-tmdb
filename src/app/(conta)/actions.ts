"use server";

// Ações de servidor da conta: rodam no servidor quando a pessoa envia o formulário.
// A senha vai direto do servidor para o Supabase; o navegador nunca fala com o banco.
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { authErrorMessage, validateSignIn, validateSignUp, type AuthFormState } from "@/lib/auth/messages";
import { safeReturnPath } from "@/lib/auth/return-path";
import { createSupabaseServer } from "@/lib/supabase/server";

const text = (form: FormData, key: string) => String(form.get(key) ?? "");
const GENERIC = "Algo deu errado. Tente de novo.";

/** Depois de entrar ou sair: atualiza a barra e as marcações na tela e leva a pessoa de volta. */
function goBack(volta: string): never {
  refresh();
  redirect(volta);
}

export async function signIn(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  const email = text(form, "email").trim();
  const password = text(form, "password");
  const invalid = validateSignIn(email, password);
  if (invalid) return { error: invalid, email };

  const supabase = await createSupabaseServer();
  if (!supabase) return { error: GENERIC, email };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: authErrorMessage(error), email };

  goBack(safeReturnPath(form.get("volta")));
}

export async function signUp(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  const name = text(form, "name").trim();
  const email = text(form, "email").trim();
  const password = text(form, "password");
  const invalid = validateSignUp(name, email, password);
  if (invalid) return { error: invalid, email };

  const supabase = await createSupabaseServer();
  if (!supabase) return { error: GENERIC, email };
  // O nome fica guardado nos dados da própria conta (user_metadata); não precisa de outra tabela.
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
  if (error) return { error: authErrorMessage(error), email };
  // Sem sessão quer dizer que a confirmação por e-mail está ligada no painel do Supabase.
  if (!data.session) return { error: authErrorMessage({ code: "email_not_confirmed" }), email };

  goBack(safeReturnPath(form.get("volta")));
}

export async function signOut(form: FormData): Promise<void> {
  const supabase = await createSupabaseServer();
  // scope "local": sai só deste aparelho e apaga o crachá daqui mesmo se o Supabase não responder.
  await supabase?.auth.signOut({ scope: "local" });
  const volta = safeReturnPath(form.get("volta"));
  // O perfil só existe para quem está logado; quem sai dali vai para a vitrine.
  goBack(volta.startsWith("/perfil") ? "/" : volta);
}
