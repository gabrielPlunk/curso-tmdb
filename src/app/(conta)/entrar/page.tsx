import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthCard, AuthFormSkeleton } from "@/components/account/AuthCard";
import { AuthForm } from "@/components/account/AuthForm";
import { safeReturnPath } from "@/lib/auth/return-path";
import { getCurrentUser } from "@/lib/auth/user";
import { signIn } from "../actions";

export const metadata: Metadata = { title: "Entrar" };

type Props = PageProps<"/entrar">;

export default function SignInPage({ searchParams }: Props) {
  return (
    <AuthCard title="Entrar">
      <Suspense fallback={<AuthFormSkeleton />}>
        <SignIn searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function SignIn({ searchParams }: Pick<Props, "searchParams">) {
  const volta = safeReturnPath((await searchParams).volta);
  // Quem já entrou não precisa ver o formulário.
  if (await getCurrentUser()) redirect(volta === "/" ? "/perfil" : volta);
  return <AuthForm mode="entrar" volta={volta} action={signIn} />;
}
