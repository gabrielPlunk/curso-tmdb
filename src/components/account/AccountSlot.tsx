import { getCurrentUser } from "@/lib/auth/user";
import { AccountMenu } from "./AccountMenu";
import { SignInLink } from "./SignInLink";

// Canto direito da barra. Lê o crachá da pessoa, por isso fica atrás de um <Suspense> no SiteHeader.
export async function AccountSlot() {
  const user = await getCurrentUser();
  return user ? <AccountMenu user={user} /> : <SignInLink />;
}
