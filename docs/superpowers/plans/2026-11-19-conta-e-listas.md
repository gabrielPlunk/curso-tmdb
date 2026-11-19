# Conta e listas "Quero assistir" / "Já assisti": plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Objetivo:** contas com e-mail e senha no Supabase. Com elas, a pessoa marca filmes como "Quero assistir" ou "Já assisti" (na página do filme e no hover dos pôsteres) e vê as duas listas em `/perfil`.

**Arquitetura:** a sessão do Supabase fica em cookies (`@supabase/ssr`) e é renovada pelo `src/proxy.ts`. Login, cadastro, saída e marcações são Server Actions. A leitura da sessão no servidor passa por uma camada única (`src/lib/auth/`, `src/lib/marks/`), sempre atrás de `<Suspense>`, para o esqueleto estático das páginas continuar pré-gerado. No navegador, um `MarksProvider` em cada layout guarda o estado das marcações. Ele recebe os dados uma vez do servidor (por um `MarksSeed` atrás de `<Suspense>`) e passa a ser a fonte de verdade da tela: muda na hora do clique, chama a action e volta atrás se ela falhar.

**Tecnologia:** Next.js 16.4.6 (App Router, `cacheComponents`, `proxy.ts`, `refresh` de `next/cache`), React 19.3 (`useActionState`), `@supabase/supabase-js` 2.x, `@supabase/ssr` 0.12.x, Tailwind 4.3, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-19-conta-e-listas-design.md`

**Para o Gabriel:** cada tarefa começa com um bloco **"Em linguagem simples"**. Ao executar, o Claude conta esse resumo antes de começar a tarefa.

## Restrições globais

- Antes de codar, ler `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md` e `03-api-reference/03-file-conventions/proxy.md`. No Next 16 o arquivo é `src/proxy.ts`, com a função exportada `proxy` (o antigo `middleware.ts` está obsoleto).
- Todo componente que lê cookies ou sessão fica atrás de `<Suspense>`, nunca no topo de um layout ou página.
- Variáveis: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` em `.env.local`. A service role key **nunca** é usada.
- No servidor, a identidade vem de `supabase.auth.getClaims()`, nunca só de `getSession()`.
- Arquivos que falam com o Supabase no servidor têm `import "server-only"` (as actions usam `"use server"`).
- Status das marcações: exatamente `"quero"` e `"assisti"`. Tabela `public.marcacoes`, com uma linha por `(user_id, movie_id)`.
- Título e pôster gravados na marcação vêm do servidor (`getMovie` de `@/lib/tmdb/queries`), nunca do navegador.
- Sem Supabase configurado (variáveis ausentes), o catálogo continua funcionando: ninguém está logado e as actions devolvem erro.
- Textos visíveis, exatamente como na spec e nas tarefas: "Entrar", "Criar conta", "Meu perfil", "Sair", "Quero assistir", "Já vi", "Já assistido", "Olá, {nome}", "Você ainda não marcou nenhum filme", "Não foi possível salvar. Tente de novo.", "E-mail ou senha incorretos.", "Já existe uma conta com este e-mail.", "A senha precisa ter pelo menos 6 caracteres."
- O "voltar para" é o parâmetro `?volta=` e só aceita caminhos internos (`safeReturnPath`).
- Conferir o visual com `npm run build && npx next start -p 3100`, não com `next dev`, porque o dev entrega o CSS atrasado neste projeto.

## Foco da revisão

Situações que a spec implica e que nenhum teste de tarefa cobriria sozinho. Cada uma ganhou um teste na tarefa dona do código.

1. **Cliques rápidos seguidos** no mesmo filme (por exemplo, "Já vi" e logo depois "Quero" antes da primeira resposta): o estado final na tela deve bater com o que foi gravado. Enquanto um filme está salvando, os botões dele ficam desabilitados. Teste na Tarefa 6.
2. **Sessão vencida com a página aberta:** `setMark` devolve `reason: "auth"`. O botão volta ao estado anterior e a pessoa vai para `/entrar?volta=<página atual>`. Testes nas Tarefas 5 e 6.
3. **`?volta=` malicioso ou em laço** (`//evil.com`, `/\evil.com`, `https://evil.com`, `/entrar`, `/criar-conta?volta=...`): vai para `/`. Teste na Tarefa 2.
4. **Entrar ou sair sem recarregar a página:** a barra e os véus precisam refletir a conta nova. As actions chamam `refresh()` antes do `redirect()`. Teste na Tarefa 3, conferência manual na Tarefa 10.
5. **`movieId` inválido ou filme inexistente no TMDB** em `setMark` (`0`, `-1`, `NaN`, `1.5` ou `getMovie` devolvendo `null`): devolve `{ ok: false, reason: "error" }` e não grava nada. Teste na Tarefa 5.

---

## Mapa de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `supabase/migrations/0001_marcacoes.sql` | Tabela, índice e regras RLS (o Gabriel cola no SQL Editor) |
| `src/lib/supabase/env.ts` | Lê as duas variáveis; `null` se faltarem |
| `src/lib/supabase/server.ts` | `createSupabaseServer()` para Server Components e Actions |
| `src/lib/supabase/proxy.ts` + `src/proxy.ts` | Renovação da sessão a cada requisição |
| `src/lib/auth/return-path.ts` | `safeReturnPath` |
| `src/lib/auth/messages.ts` | Validação dos formulários e tradução dos erros |
| `src/lib/auth/user.ts` | `CurrentUser`, `toCurrentUser`, `getCurrentUser` |
| `src/app/(conta)/actions.ts` | `signIn`, `signUp`, `signOut` |
| `src/app/(conta)/layout.tsx`, `entrar/page.tsx`, `criar-conta/page.tsx`, `perfil/page.tsx` | Páginas da conta |
| `src/components/account/AuthForm.tsx` | Formulário de entrar e de criar conta |
| `src/components/account/AccountSlot.tsx`, `AccountMenu.tsx`, `SignInLink.tsx` | Canto direito da barra |
| `src/lib/marks/types.ts`, `queries.ts`, `actions.ts` | Tipos, leitura e gravação das marcações |
| `src/components/marks/MarksProvider.tsx` | Estado das marcações no navegador e aviso de erro |
| `src/components/marks/MarksLoader.tsx` | Server Component que busca e entrega as marcações ao provider |
| `src/components/marks/MarkButtons.tsx` | Botões da página do filme |
| `src/components/marks/PosterMarks.tsx` | Véu e botões de hover do pôster |
| `src/components/marks/ProfileTabs.tsx` | Abas com contagem do perfil |
| `scripts/check-rls.mjs` | Conferência manual da RLS com duas contas |

---

### Tarefa 1: Base do Supabase (pacotes, variáveis, clientes, proxy e tabela)

**Em linguagem simples:** aqui o site aprende a falar com o Supabase. Instalamos a biblioteca, guardamos o endereço e a chave pública do seu projeto e criamos o "porteiro" (`proxy.ts`), que a cada visita renova o crachá de quem está logado. Também escrevemos a receita da tabela onde as marcações vão morar, com a regra de que cada pessoa só enxerga as próprias. Nesta tarefa você cria o projeto no painel do Supabase, com o Claude te guiando.

**Files:**
- Create: `supabase/migrations/0001_marcacoes.sql`, `src/lib/supabase/env.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/proxy.ts`, `src/proxy.ts`, `src/lib/supabase/env.test.ts`
- Modify: `package.json`, `.env.example`, `README.md`

**Interfaces:**
- Produces: `supabaseEnv(): { url: string; key: string } | null`; `createSupabaseServer(): Promise<SupabaseClient | null>` (`null` sem variáveis); `updateSession(request: NextRequest): Promise<NextResponse>`.

- [ ] **Step 1:** `npm install @supabase/supabase-js@^2.119 @supabase/ssr@^0.12`.
- [ ] **Step 2: Teste que falha** em `src/lib/supabase/env.test.ts`:
  - `supabaseEnv devolve null sem variáveis` (com `vi.stubEnv` das duas como `""`) → `null`.
  - `supabaseEnv devolve url e key` → `{ url: "https://x.supabase.co", key: "sb_publishable_abc" }`.
- [ ] **Step 3:** `npx vitest run src/lib/supabase/env.test.ts` → FAIL (módulo não existe).
- [ ] **Step 4: Implementar** `env.ts`. Depois `server.ts` (`server-only`; `createServerClient(url, key, { cookies: { getAll, setAll } })` com `await cookies()`; `setAll` dentro de `try/catch`, com um comentário explicando que Server Components não podem gravar cookies e que o proxy cuida disso). Depois `proxy.ts` em `lib/supabase` (padrão do `@supabase/ssr` para Next: cliente com os cookies da requisição, `await supabase.auth.getClaims()`, devolve a resposta com os cookies atualizados; sem variáveis, devolve `NextResponse.next()`). Por fim `src/proxy.ts`, que exporta `proxy` chamando `updateSession` e tem `config.matcher` = `["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)"]`. O proxy não redireciona ninguém, porque a proteção fica nas páginas.
- [ ] **Step 5: SQL** em `supabase/migrations/0001_marcacoes.sql`:
  - tabela `public.marcacoes`: `user_id uuid not null default auth.uid() references auth.users(id) on delete cascade`, `movie_id integer not null check (movie_id > 0)`, `status text not null check (status in ('quero','assisti'))`, `title text not null`, `poster_path text`, `marked_at timestamptz not null default now()`, `primary key (user_id, movie_id)`;
  - índice `marcacoes_user_marked_idx on (user_id, marked_at desc)`;
  - `alter table ... enable row level security`, mais quatro políticas (`select`, `insert`, `update`, `delete`) para `authenticated`, todas com `(select auth.uid()) = user_id` (em `using` e/ou `with check`, conforme o comando).
  - Comentários em português explicando cada bloco.
- [ ] **Step 6:** `.env.example` ganha as duas variáveis. O README ganha a seção "Configurar o Supabase": criar o projeto; Authentication → Sign In / Providers → Email → desligar **Confirm email** (com uma linha de como religar depois); copiar Project URL e a publishable key para `.env.local`; colar e rodar o SQL no SQL Editor.
- [ ] **Step 7: Guiar o Gabriel** pelos passos do README, um de cada vez, até o `.env.local` estar preenchido e a tabela aparecer em Table Editor com o selo "RLS enabled". O Claude não pede nem lê a chave: o Gabriel cola no arquivo.
- [ ] **Step 8:** `npm test` e `npm run build` → tudo passa, sem erro de cookies fora de Suspense.
- [ ] **Step 9: Commit:** `feat: base do Supabase (clientes, proxy e tabela de marcações)`.

### Tarefa 2: Regras da conta (voltar para, mensagens, usuário atual)

**Em linguagem simples:** são as regrinhas por trás do login, testadas sem precisar do Supabase de verdade. Para onde a pessoa volta depois de entrar (e o bloqueio para um link não mandar ninguém para fora do site), as mensagens de erro em português e quem é a pessoa logada agora.

**Files:**
- Create: `src/lib/auth/return-path.ts`, `src/lib/auth/messages.ts`, `src/lib/auth/user.ts` e testes `return-path.test.ts`, `messages.test.ts`, `user.test.ts`

**Interfaces:**
- Consumes: `createSupabaseServer` (Tarefa 1).
- Produces:
  - `safeReturnPath(raw: unknown, fallback?: string): string` (fallback padrão `"/"`).
  - `type AuthFormState = { error: string | null; email: string }`.
  - `validateSignIn(email: string, password: string): string | null`; `validateSignUp(name: string, email: string, password: string): string | null`.
  - `authErrorMessage(error: { code?: string; message?: string }): string`.
  - `type CurrentUser = { id: string; name: string; initial: string }`.
  - `toCurrentUser(claims: { sub: string; email?: string; user_metadata?: { name?: unknown } }): CurrentUser`.
  - `getCurrentUser(): Promise<CurrentUser | null>` (`server-only`, envolto em `cache` do React; `null` sem sessão ou sem Supabase).

- [ ] **Step 1: Testes que falham:**
  - `safeReturnPath`: `"/filme/12?x=1"` → igual; `"/perfil?aba=assisti"` → igual; `"//evil.com"`, `"/\\evil.com"`, `"https://evil.com"`, `"filme/1"`, `""`, `undefined`, `["/a"]` → `"/"`; `"/entrar"`, `"/entrar?volta=/x"`, `"/criar-conta"` → `"/"` (evita laço); `safeReturnPath("//x", "/perfil")` → `"/perfil"`.
  - `validateSignIn("", "x")` → `"Digite seu e-mail."`; `validateSignIn("a@b.c", "")` → `"Digite sua senha."`; válido → `null`.
  - `validateSignUp("  ", "a@b.c", "123456")` → `"Digite seu nome."`; senha `"12345"` → `"A senha precisa ter pelo menos 6 caracteres."`; válido → `null`.
  - `authErrorMessage`: `invalid_credentials` → `"E-mail ou senha incorretos."`; `user_already_exists` e `email_exists` → `"Já existe uma conta com este e-mail."`; `weak_password` → `"A senha precisa ter pelo menos 6 caracteres."`; `email_address_invalid` e `validation_failed` → `"Confira o e-mail digitado."`; `over_request_rate_limit` e `over_email_send_rate_limit` → `"Muitas tentativas. Espere um pouco e tente de novo."`; `email_not_confirmed` → `"Confirme seu e-mail antes de entrar."`; sem código → `"Algo deu errado. Tente de novo."`.
  - `toCurrentUser`: com `user_metadata.name = "  gabriel "` → `{ name: "gabriel", initial: "G" }`; sem nome e com `email: "ana@x.com"` → `name: "ana"`, `initial: "A"`; sem nada → `name: "Você"`, `initial: "?"`.
  - `getCurrentUser` (com `vi.mock("@/lib/supabase/server")`): cliente `null` → `null`; `getClaims` sem claims → `null`; com claims → `CurrentUser`.
- [ ] **Step 2:** `npx vitest run src/lib/auth` → FAIL.
- [ ] **Step 3: Implementar** os três arquivos. Em `safeReturnPath`, aceitar só strings que começam com `/`, não começam com `//` nem `/\`, não contêm `\` e cujo caminho não é `/entrar` nem `/criar-conta`.
- [ ] **Step 4:** `npx vitest run src/lib/auth` → PASS.
- [ ] **Step 5: Commit:** `feat: regras da conta (voltar para, mensagens e usuário atual)`.

### Tarefa 3: Entrar, criar conta e sair

**Em linguagem simples:** as telas de entrar e de criar conta, e as "ações de servidor" que conferem a senha com o Supabase. Quando dá certo, o Supabase entrega o crachá, que vira um cookie, e você volta para onde estava. Quando dá errado, a mensagem aparece em português e o e-mail digitado continua no campo.

**Files:**
- Create: `src/app/(conta)/actions.ts`, `src/app/(conta)/actions.test.ts`, `src/app/(conta)/layout.tsx`, `src/app/(conta)/entrar/page.tsx`, `src/app/(conta)/criar-conta/page.tsx`, `src/components/account/AuthForm.tsx`, `src/components/account/account.test.tsx`

**Interfaces:**
- Consumes: Tarefa 2 inteira; `createSupabaseServer`.
- Produces:
  - `signIn(prev: AuthFormState, form: FormData): Promise<AuthFormState>` (campos `email`, `password`, `volta`).
  - `signUp(prev: AuthFormState, form: FormData): Promise<AuthFormState>` (campos `name`, `email`, `password`, `volta`; `options.data.name` = nome sem espaços nas pontas).
  - `signOut(form: FormData): Promise<void>` (campo `volta`).
  - `<AuthForm mode="entrar" | "criar-conta" volta={string} action={...} />`.

- [ ] **Step 1: Testes que falham** em `actions.test.ts` (mock de `@/lib/supabase/server`, de `next/navigation` com `redirect` lançando um erro marcado e de `next/cache` com `refresh` como `vi.fn()`):
  - `signIn` com campos vazios devolve `{ error: "Digite seu e-mail.", email: "" }` e não chama o Supabase.
  - `signIn` com erro `invalid_credentials` devolve `{ error: "E-mail ou senha incorretos.", email: "a@b.c" }`.
  - `signIn` com sucesso chama `refresh()` **antes** de `redirect("/filme/12")` quando `volta="/filme/12"`, e `redirect("/")` quando `volta="//evil.com"`.
  - `signUp` com sucesso e sessão criada redireciona como o `signIn`. Sem sessão (confirmação ligada por engano) devolve `{ error: "Confirme seu e-mail antes de entrar.", email }`.
  - `signOut` com `volta="/perfil?aba=quero"` redireciona para `"/"`; com `volta="/filme/3"` redireciona para `"/filme/3"`; chama `signOut()` do Supabase e `refresh()`.
  - Sem Supabase configurado, `signIn` devolve `{ error: "Algo deu errado. Tente de novo.", email }`.
- [ ] **Step 2:** `npx vitest run "src/app/(conta)"` → FAIL.
- [ ] **Step 3: Implementar** `actions.ts` (`"use server"`).
- [ ] **Step 4: Testes que falham** em `account.test.tsx` para `AuthForm`:
  - modo `entrar`: campos com rótulos "E-mail" e "Senha", botão "Entrar" e link "Criar conta" com `href="/criar-conta?volta=%2Ffilme%2F12"` quando `volta="/filme/12"`.
  - modo `criar-conta`: campo "Nome", dica "Pelo menos 6 caracteres", botão "Criar conta" e link "Entrar" preservando o `volta`.
  - mostra `state.error` num elemento `role="alert"` e mantém o e-mail devolvido no campo.
- [ ] **Step 5: Implementar** `AuthForm` (cliente, com `useActionState`; campo oculto `volta`; botão desabilitado com "Entrando…" ou "Criando conta…" enquanto envia; `autoComplete` certo em cada campo; visual `panel` ou `glass`, centrado e com largura máxima de cerca de 24rem). Depois o `(conta)/layout.tsx`, com a mesma moldura do catálogo: `SiteHeader`, `<main className="flex-1">`, `SiteFooter`, sem `AmbientLight`. Por fim as páginas `entrar` e `criar-conta`: título (`metadata.title` "Entrar" e "Criar conta"), leem `?volta` atrás de `<Suspense>` e, se a pessoa já estiver logada, fazem `redirect(safeReturnPath(volta, "/perfil"))`.
- [ ] **Step 6:** `npm test` → PASS. `npm run build` → PASS.
- [ ] **Step 7: Commit:** `feat: telas de entrar e criar conta`.

### Tarefa 4: Conta na barra superior

**Em linguagem simples:** o canto direito da barra agora sabe se você entrou. Se não entrou, mostra "Entrar". Se entrou, mostra o círculo com a sua inicial e um menu com "Meu perfil" e "Sair". Só esse pedacinho espera o servidor conferir o crachá. O resto da barra aparece na hora.

**Files:**
- Create: `src/components/account/AccountSlot.tsx`, `AccountMenu.tsx`, `SignInLink.tsx`
- Modify: `src/components/layout/SiteHeader.tsx`, `src/components/account/account.test.tsx`

**Interfaces:**
- Consumes: `getCurrentUser`, `CurrentUser`, `signOut`.
- Produces: `<AccountSlot />` (servidor); `<AccountMenu user={CurrentUser} />` e `<SignInLink />` (cliente).

- [ ] **Step 1: Testes que falham** (mock de `next/navigation` com `usePathname` → `"/filme/12"` e `useSearchParams` → vazio):
  - `SignInLink` é um link "Entrar" com `href="/entrar?volta=%2Ffilme%2F12"`.
  - `AccountMenu` mostra um botão com nome acessível "Conta de Gabriel" e o texto "G", com `aria-expanded="false"`. Clicar abre um menu com o link "Meu perfil" (`/perfil`) e o botão "Sair". `Escape` fecha e devolve o foco ao botão. O formulário de "Sair" tem o campo oculto `volta="/filme/12"`.
- [ ] **Step 2:** `npx vitest run src/components/account` → FAIL.
- [ ] **Step 3: Implementar.** `AccountSlot` chama `getCurrentUser()` e escolhe `SignInLink` ou `AccountMenu`. No `SiteHeader`, ele entra depois da busca, dentro de `<Suspense fallback={<span className="size-9 shrink-0" aria-hidden />}>`, para não deslocar a barra. O círculo tem `size-9` com `glass`. O menu fecha ao clicar fora.
- [ ] **Step 4:** `npm test` → PASS; `npm run build` → PASS.
- [ ] **Step 5: Commit:** `feat: entrar e menu da conta na barra superior`.

### Tarefa 5: Ler e gravar marcações

**Em linguagem simples:** as duas operações do banco. "Ler as minhas marcações" e "marcar ou desmarcar um filme". O servidor confere quem você é antes de gravar e busca sozinho o título e o pôster no TMDB. Assim ninguém consegue mandar um título inventado. Como cada filme só pode ter uma linha por pessoa, marcar "Já vi" substitui o "Quero" automaticamente.

**Files:**
- Create: `src/lib/marks/types.ts`, `src/lib/marks/queries.ts`, `src/lib/marks/actions.ts`, `src/lib/marks/marks.test.ts`

**Interfaces:**
- Consumes: `createSupabaseServer`, `getMovie(id: number): Promise<MovieDetails | null>`.
- Produces:
  - `type MarkStatus = "quero" | "assisti"`; `type MarkRef = { movieId: number; status: MarkStatus }`; `type Mark = MarkRef & { title: string; posterPath: string | null; markedAt: string }`; `type SetMarkResult = { ok: true } | { ok: false; reason: "auth" | "error" }`.
  - `getMyMarks(): Promise<Mark[]>` (`server-only`, `cache` do React; `[]` sem sessão; ordem `marked_at desc`).
  - `setMark(movieId: number, status: MarkStatus | null): Promise<SetMarkResult>` (`"use server"`; `null` = desmarcar).

- [ ] **Step 1: Testes que falham** (mock do cliente Supabase com `from().upsert/delete/select` encadeáveis e de `getMovie`):
  - `setMark(10, "assisti")` logado faz `upsert` com `{ user_id, movie_id: 10, status: "assisti", title: <de getMovie>, poster_path: <de getMovie>, marked_at: <ISO> }` e `onConflict: "user_id,movie_id"`, e devolve `{ ok: true }`.
  - `setMark(10, null)` faz `delete` filtrando `movie_id = 10` e `user_id`, sem chamar `getMovie`.
  - Sem sessão → `{ ok: false, reason: "auth" }` e nada gravado.
  - `setMark(0 | -1 | NaN | 1.5, "quero")` → `{ ok: false, reason: "error" }` e nada gravado. `status` fora de `"quero"`, `"assisti"` ou `null` → igual.
  - `getMovie` devolvendo `null` → `{ ok: false, reason: "error" }`.
  - Erro do Supabase no `upsert` → `{ ok: false, reason: "error" }`.
  - `getMyMarks` converte as linhas para `Mark` e sem sessão devolve `[]`.
- [ ] **Step 2:** `npx vitest run src/lib/marks` → FAIL.
- [ ] **Step 3: Implementar.** `setMark` não chama `refresh()`: a tela é atualizada pelo `MarksProvider` (Tarefa 6), e isso mantém o pôster no lugar no perfil.
- [ ] **Step 4:** `npx vitest run src/lib/marks` → PASS.
- [ ] **Step 5: Commit:** `feat: ler e gravar marcações no Supabase`.

### Tarefa 6: Estado das marcações no navegador

**Em linguagem simples:** um "quadro de avisos" que fica aberto enquanto você navega e lembra o que você marcou. Quando você clica, o quadro muda na hora e avisa o servidor. Se o servidor recusar, ele desfaz e mostra "Não foi possível salvar. Tente de novo.". Ele é preenchido uma vez com os dados do servidor, num pedaço separado, para a vitrine não precisar esperar.

**Files:**
- Create: `src/components/marks/MarksProvider.tsx`, `src/components/marks/MarksLoader.tsx`, `src/components/marks/marks.test.tsx`
- Modify: `src/app/(catalogo)/layout.tsx`, `src/app/(conta)/layout.tsx`

**Interfaces:**
- Consumes: `setMark`, `getMyMarks`, `getCurrentUser`, `MarkRef`, `MarkStatus`.
- Produces:
  - `<MarksProvider>{children}</MarksProvider>` e `useMarks(): MarksApi`, com:
    ```ts
    type MarksApi = {
      ready: boolean;          // false até o MarksSeed chegar
      signedIn: boolean;
      statusOf(movieId: number): MarkStatus | null;
      isPending(movieId: number): boolean;
      counts: Record<MarkStatus, number>;
      toggle(movieId: number, clicked: MarkStatus): void;
    };
    ```
    Fora de um provider, `useMarks()` devolve um valor inerte (`ready: false`) em vez de lançar erro, para o `PosterCard` funcionar em testes e no `not-found`.
  - `<MarksSeed signedIn={boolean} marks={MarkRef[]} />` (cliente, exportado de `MarksProvider.tsx`; entrega os dados ao provider num efeito).
  - `<MarksLoader />` (servidor; busca `getCurrentUser` e `getMyMarks` e renderiza `MarksSeed` só com `movieId` e `status`).

- [ ] **Step 1: Testes que falham** (mock de `@/lib/marks/actions` e de `next/navigation` com `useRouter().push` como `vi.fn()`):
  - antes do seed, `ready=false`; depois do seed com `[{movieId: 1, status: "quero"}]`, `statusOf(1) = "quero"` e `counts = { quero: 1, assisti: 0 }`.
  - `toggle(1, "assisti")` muda na hora para `"assisti"` e chama `setMark(1, "assisti")`. `toggle(1, "assisti")` de novo chama `setMark(1, null)`.
  - `setMark` devolvendo `{ ok: false, reason: "error" }` volta ao estado anterior e mostra `"Não foi possível salvar. Tente de novo."` em `role="status"`.
  - `{ ok: false, reason: "auth" }` volta ao estado anterior e faz `push("/entrar?volta=" + encodeURIComponent(location.pathname + location.search))`.
  - deslogado (`signedIn=false`), `toggle` não chama `setMark` e faz o mesmo `push`.
  - **Foco da revisão 1:** com `setMark` pendente, `isPending(1)=true` e um segundo `toggle(1, "quero")` é ignorado. Ao resolver, `isPending(1)=false`.
- [ ] **Step 2:** `npx vitest run src/components/marks` → FAIL.
- [ ] **Step 3: Implementar.** O aviso some depois de cerca de 4 s e fica fixo embaixo, centrado, com `glass`. Nos dois layouts, envolver o conteúdo com `<MarksProvider>` e colocar `<Suspense fallback={null}><MarksLoader /></Suspense>` dentro dele, sem envolver `children` nesse Suspense.
- [ ] **Step 4:** `npm test` → PASS; `npm run build` → PASS, e o log do build continua mostrando a home e o filme com esqueleto pré-gerado (◐/partial), não totalmente dinâmicos.
- [ ] **Step 5: Commit:** `feat: estado das marcações no navegador`.

### Tarefa 7: Botões na página do filme

**Em linguagem simples:** os botões "Quero assistir" e "Já vi" no alto da página do filme, no canto oposto ao Voltar. Eles ficam invisíveis (mas ocupando o lugar) até o quadro de avisos chegar. Assim nunca aparecem num estado errado.

**Files:**
- Create: `src/components/marks/MarkButtons.tsx`
- Modify: `src/components/ui/icons.tsx` (adicionar `CheckIcon` e `PlusIcon`), `src/app/(catalogo)/filme/[id]/page.tsx`, `src/components/marks/marks.test.tsx`

**Interfaces:**
- Consumes: `useMarks`.
- Produces: `<MarkButtons movieId={number} />`; `CheckIcon`, `PlusIcon` (mesmo estilo `Icon` de traço 1,75).

- [ ] **Step 1: Testes que falham** (dentro de um `MarksProvider` semeado):
  - mostra dois botões, "Quero assistir" e "Já vi", com `aria-pressed` refletindo `statusOf`.
  - clicar em "Já vi" chama `toggle(id, "assisti")`.
  - antes do seed, o grupo tem `aria-hidden="true"` e a classe `invisible`.
  - com `isPending`, os dois botões ficam `disabled`.
- [ ] **Step 2:** `npx vitest run src/components/marks` → FAIL.
- [ ] **Step 3: Implementar.** Pílulas `pill glass`. O estado marcado fica preenchido (fundo claro, texto escuro, ícone ✓ ou +). Na página do filme, trocar `<div><BackButton /></div>` por uma linha `flex items-center justify-between gap-3` com `BackButton` e `MarkButtons`. A linha pode quebrar em telas estreitas.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5: Commit:** `feat: marcar filme na página do filme`.

### Tarefa 8: Véu "Já assistido" e botões de hover nos pôsteres

**Em linguagem simples:** na vitrine, no "Ver tudo", na busca e no perfil, o pôster de um filme que você já viu ganha um véu escuro com "Já assistido". No computador, ao passar o mouse (ou ao chegar pelo Tab), aparecem dois ícones embaixo do pôster, e o nome de cada um aparece ao passar sobre ele. No celular os ícones não aparecem e o espaçamento não muda.

**Files:**
- Create: `src/components/marks/PosterMarks.tsx`
- Modify: `src/components/catalog/PosterCard.tsx`, `src/components/catalog/Carousel.tsx`, `src/components/catalog/MovieGrid.tsx`, `src/components/catalog/catalog.test.tsx`

**Interfaces:**
- Consumes: `useMarks`, `CheckIcon`, `PlusIcon`.
- Produces: `PosterCard` passa a aceitar `showWatchedVeil?: boolean` (padrão `true`); `MovieGrid` aceita e repassa `showWatchedVeil`; `<PosterMarks movieId={number} showWatchedVeil={boolean} />`.

- [ ] **Step 1: Testes que falham** (os testes atuais do `PosterCard` continuam passando):
  - com `statusOf = "assisti"`, aparece o texto "Já assistido". Com `showWatchedVeil={false}`, não aparece. Com `"quero"`, não aparece.
  - há dois botões com nomes acessíveis "Já vi" e "Quero assistir" e `aria-pressed` correto, **fora** do link (o link continua com `href="/filme/7"`).
  - clicar em "Quero assistir" chama `toggle(7, "quero")` e não navega.
  - antes do seed, não há véu nem botões.
- [ ] **Step 2:** `npx vitest run src/components/catalog` → FAIL.
- [ ] **Step 3: Implementar.**
  - `PosterCard` vira um `div` `group/poster relative`, que recebe o `className` de fora. Dentro ficam o `Link` atual (sem o `className` externo) e `PosterMarks`.
  - Véu: `absolute inset-0 pointer-events-none`, fundo `bg-black/55`, ✓ e "Já assistido" centrados. `group-hover/poster:` e `group-focus-within/poster:` clareiam para cerca de `bg-black/15` e esmaecem o texto. O texto fica menor abaixo de `sm`.
  - Botões: `absolute top-full mt-2` centrados, `hidden pointer-fine:flex`, `opacity-0` → `opacity-100` em `group-hover/poster` e `group-focus-within/poster`. Ícones redondos `glass size-8`, preenchidos quando ativos. O rótulo é um `span` que aparece em hover e foco do próprio botão (o nome acessível vem de `aria-label`).
  - Espaço: `Carousel` troca `pb-6` por `pb-6 pointer-fine:pb-12`. `gridClass` ganha `pointer-fine:gap-y-12`. Com isso o espaço de baixo do pôster passa de cerca de 24px para 48px só em telas com mouse.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5: Conferência visual** com `npm run build && npx next start -p 3100` e prints do Playwright (`channel: "chrome"`) da home em 1440px (mouse sobre um pôster, com e sem véu) e em 390px. Mostrar os prints ao Gabriel. Se os botões ficarem ruins entre as fileiras, falar com ele sobre a alternativa da spec (botões sobre a parte de baixo do pôster) antes de mudar.
- [ ] **Step 6: Commit:** `feat: véu de já assistido e botões de hover nos pôsteres`.

### Tarefa 9: Página de perfil

**Em linguagem simples:** a página `/perfil`, com "Olá, {nome}" e as abas "Quero assistir" e "Já assisti", cada uma com sua grade. Ela só abre para quem entrou. A lista vem do banco quando a página abre. Se você desmarca um filme, ele fica no lugar até você sair da aba, mas a contagem muda na hora.

**Files:**
- Create: `src/app/(conta)/perfil/page.tsx`, `src/app/(conta)/perfil/parse-tab.ts`, `src/app/(conta)/perfil/parse-tab.test.ts`, `src/components/marks/ProfileTabs.tsx`
- Modify: `src/components/marks/marks.test.tsx`

**Interfaces:**
- Consumes: `getCurrentUser`, `getMyMarks`, `useMarks`, `MovieGrid` (`showWatchedVeil`), `safeReturnPath`.
- Produces: `parseTab(raw: unknown): MarkStatus` (padrão `"quero"`); `<ProfileTabs active={MarkStatus} serverCounts={Record<MarkStatus, number>} />`.

- [ ] **Step 1: Testes que falham:**
  - `parseTab("assisti")` → `"assisti"`; `parseTab("quero")`, `parseTab(undefined)`, `parseTab("x")` e `parseTab(["assisti"])` → `"quero"`.
  - `ProfileTabs` antes do seed mostra "Quero assistir · 2" e "Já assisti · 5" (de `serverCounts`). Depois do seed, mostra as contagens do provider. A aba ativa tem `aria-current="page"`. Os links são `/perfil?aba=quero` e `/perfil?aba=assisti`.
- [ ] **Step 2:** `npx vitest run "src/app/(conta)/perfil" src/components/marks` → FAIL.
- [ ] **Step 3: Implementar** a página (`metadata.title` "Meu perfil"). Dentro de `<Suspense fallback={<GridSkeleton />}>`: sem usuário, `redirect("/entrar?volta=" + encodeURIComponent("/perfil?aba=" + tab))`. Com usuário, mostrar "Olá, {name}" com `DisplayTitle`, depois `ProfileTabs` e a grade das marcações da aba (convertidas para `MovieSummary`: `backdropPath: null`, `year: null`, `rating: 0`), com `showWatchedVeil={tab !== "assisti"}`. Lista vazia: "Você ainda não marcou nenhum filme" e o link "Explorar a vitrine" para `/`.
- [ ] **Step 4:** `npm test` → PASS; `npm run build` → PASS.
- [ ] **Step 5: Commit:** `feat: página de perfil com as duas listas`.

### Tarefa 10: Conferência de ponta a ponta

**Em linguagem simples:** testar tudo como um visitante de verdade, no site gerado para produção. Criar conta, marcar, ver no perfil, sair e entrar de novo. Também conferimos com uma segunda conta que uma pessoa não enxerga a lista da outra.

**Files:**
- Create: `scripts/check-rls.mjs`
- Modify: `README.md` (como rodar o script)

- [ ] **Step 1: Script `scripts/check-rls.mjs`** (Node 22, lê `.env.local` com `--env-file`, só a publishable key). Recebe `RLS_A_EMAIL`, `RLS_A_PASSWORD`, `RLS_B_EMAIL` e `RLS_B_PASSWORD` do ambiente. Passos: A entra e marca o filme 550 como `quero`; B entra e (1) `select *` não traz nenhuma linha de A; (2) `update` e `delete` filtrando `user_id = A` afetam 0 linhas; (3) `insert` com `user_id = A` falha. No fim, A apaga a própria marcação. Imprime `OK` ou `FALHOU: <passo>` e sai com código 1 se falhar.
- [ ] **Step 2:** o Gabriel cria duas contas de teste pelo site e roda `node --env-file=.env.local scripts/check-rls.mjs` com as variáveis. Esperado: `OK`.
- [ ] **Step 3: Roteiro manual** em `npm run build && npx next start -p 3100`, com prints do Playwright (`channel: "chrome"`):
  1. Deslogado, a barra mostra "Entrar". Clicar em "Quero assistir" num filme leva a `/entrar?volta=/filme/<id>`.
  2. "Criar conta" a partir dali, depois volta ao filme. O botão continua desmarcado (sem marcar sozinho) e a barra mostra o círculo sem recarregar a página (**Foco da revisão 4**).
  3. Marcar "Já vi". Na home, o pôster tem véu "Já assistido". O hover mostra os ícones e o nome.
  4. No perfil, em "Já assisti", o filme aparece sem véu. Desmarcar deixa o filme no lugar e a contagem cai. Trocar de aba e voltar faz o filme sumir.
  5. Senha errada mostra "E-mail ou senha incorretos." e mantém o e-mail no campo.
  6. "Sair" a partir do perfil vai para a vitrine, e a barra volta a "Entrar" sem véus.
  7. `/perfil` deslogado vai para `/entrar?volta=%2Fperfil%3Faba%3Dquero`.
- [ ] **Step 4:** `npm test`, `npm run lint` e `npm run build` → tudo passa.
- [ ] **Step 5: Commit:** `chore: conferência da RLS e roteiro de ponta a ponta`.
