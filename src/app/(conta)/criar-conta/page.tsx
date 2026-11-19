import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthCard, AuthFormSkeleton } from "@/components/account/AuthCard";
import { AuthForm } from "@/components/account/AuthForm";
import { safeReturnPath } from "@/lib/auth/return-path";
import { getCurrentUser } from "@/lib/auth/user";
import { signUp } from "../actions";

export const metadata: Metadata = { title: "Criar conta" };

type Props = PageProps<"/criar-conta">;

export default function SignUpPage({ searchParams }: Props) {
  return (
    <AuthCard title="Criar conta">
      <Suspense fallback={<AuthFormSkeleton />}>
        <SignUp searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function SignUp({ searchParams }: Pick<Props, "searchParams">) {
  const volta = safeReturnPath((await searchParams).volta);
  if (await getCurrentUser()) redirect(volta === "/" ? "/perfil" : volta);
  return <AuthForm mode="criar-conta" volta={volta} action={signUp} />;
}
