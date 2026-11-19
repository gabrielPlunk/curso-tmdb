// Mensagens dos formulários de entrar e criar conta, em português.

/** O que os formulários devolvem para a tela: a mensagem de erro e o e-mail digitado (para não sumir). */
export type AuthFormState = { error: string | null; email: string };

export const MIN_PASSWORD = 6;

export function validateSignIn(email: string, password: string): string | null {
  if (!email.trim()) return "Digite seu e-mail.";
  if (!password) return "Digite sua senha.";
  return null;
}

export function validateSignUp(name: string, email: string, password: string): string | null {
  if (!name.trim()) return "Digite seu nome.";
  if (!email.trim()) return "Digite seu e-mail.";
  if (password.length < MIN_PASSWORD) return "A senha precisa ter pelo menos 6 caracteres.";
  return null;
}

// O Supabase responde em inglês, com um código para cada tipo de erro.
const BY_CODE: Record<string, string> = {
  invalid_credentials: "E-mail ou senha incorretos.",
  user_already_exists: "Já existe uma conta com este e-mail.",
  email_exists: "Já existe uma conta com este e-mail.",
  weak_password: "A senha precisa ter pelo menos 6 caracteres.",
  email_address_invalid: "Confira o e-mail digitado.",
  validation_failed: "Confira o e-mail digitado.",
  over_request_rate_limit: "Muitas tentativas. Espere um pouco e tente de novo.",
  over_email_send_rate_limit: "Muitas tentativas. Espere um pouco e tente de novo.",
  email_not_confirmed: "Confirme seu e-mail antes de entrar.",
};

export function authErrorMessage(error: { code?: string; message?: string }): string {
  return (error.code && BY_CODE[error.code]) || "Algo deu errado. Tente de novo.";
}
