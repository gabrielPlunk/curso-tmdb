import { getCurrentUser } from "@/lib/auth/user";
import { getMyMarks } from "@/lib/marks/queries";
import { MarksSeed } from "./MarksProvider";

/**
 * Busca no servidor quem está logado e as marcações dessa pessoa, e entrega ao MarksProvider.
 * Fica atrás de um <Suspense> próprio no layout: a página aparece sem esperar por ele.
 * Se a leitura falhar, não entrega nada: a tela fica sem véus e sem botões, em vez de mostrar tudo desmarcado.
 */
export async function MarksLoader() {
  const user = await getCurrentUser();
  if (!user) return <MarksSeed signedIn={false} marks={[]} />;
  try {
    const marks = await getMyMarks();
    // Para o navegador vai só o necessário: o id do filme e a lista.
    return <MarksSeed signedIn marks={marks.map(({ movieId, status }) => ({ movieId, status }))} />;
  } catch {
    return null;
  }
}
