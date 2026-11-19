# Conta e listas "Quero assistir" / "Já assisti": design

Data: 2026-11-19
Status: aprovado (2026-11-19)

## 1. Intenção e motivo

Quem visita o catálogo passa a poder **criar uma conta com e-mail e senha** e guardar filmes em duas listas pessoais: **"Quero assistir"** e **"Já assisti"**. A barra superior dá acesso ao perfil, onde ficam as duas listas. Contas e listas ficam no **Supabase**.

O motivo é **aprender**. O autor estuda as etapas de construir um app (ver o design do catálogo, `2026-11-18-catalogo-streaming-design.md`, seção 1). Ele não escreve código. Daí vêm algumas consequências:

- **O caminho de uma conta de verdade, só que enxuto.** O autor deve ver cada etapa uma vez (criar conta, entrar, sair, sessão, banco com regras de acesso, gravar e ler dados por pessoa). Acabamentos de app comercial ficam de fora.
- **Cada etapa do plano traz uma explicação curta, em linguagem simples**, do que ela faz e por que existe.
- **As decisões técnicas ficam com quem constrói.** As decisões de experiência foram tomadas com o autor (seção 5).
- **O jeito de construir é o mesmo que apps reais usam** (sessão em cookie lida pelo servidor), mesmo sendo mais trabalhoso, porque esse é o conceito que vale aprender.

## 2. Objetivos, fora de escopo e anti-objetivos

**Objetivos**
- Criar conta (nome, e-mail, senha), entrar e sair.
- Marcar e desmarcar um filme como "Quero assistir" ou "Já assisti" pela página do filme (celular e computador) e pelos pôsteres (só no computador, com hover).
- Ver na vitrine, de relance, quais filmes você já assistiu.
- Página de perfil com as duas listas.
- Listas privadas: só o dono lê e altera, e quem garante isso é o banco.

**Fora de escopo (agora)**
- "Esqueci minha senha", trocar e-mail ou senha, apagar conta, foto de perfil.
- Confirmação de conta por e-mail. Fica **desligada**. O plano grátis do Supabase manda poucos e-mails por hora, e isso atrapalharia os testes. O plano anota como ligar depois.
- Login com Google ou outros provedores.
- Listas públicas ou compartilhadas.
- **O gesto de segurar e arrastar o pôster** (esquerda = já assisti, direita = quero assistir). Ele vira um **protótipo descartável depois** desta versão, para testar no celular e no computador. Pontos já levantados: briga com a rolagem lateral do carrossel, ninguém descobre que existe sem uma dica, segurar a imagem no celular abre o menu do sistema e "esquerda" lembra "descartar".
- Séries, notas, comentários ou qualquer outro tipo de marcação.

**Anti-objetivos (o que tornaria o trabalho um fracasso mesmo funcionando)**
- Uma pessoa consegue ver ou alterar a lista de outra.
- A chave secreta do Supabase (service role) aparece no navegador ou no repositório.
- A vitrine fica lenta ou deixa de ser pré-gerada só porque agora existe login.
- A página "pisca": abre como se você não tivesse entrado e depois muda, ou os botões aparecem desmarcados e depois marcados.
- Uma marcação falha em silêncio: o botão diz que marcou, mas nada foi gravado.
- Depois de entrar, você cai num lugar diferente de onde estava. Ou pior: o "voltar para" do login leva para fora do site (open redirect).

## 3. Restrições

- **Tecnologia existente:** Next.js 16.4.6 (App Router) com `cacheComponents: true` e `partialPrefetching: true`, React 19.3, Tailwind 4, TypeScript, Vitest. Antes de escrever código, ler os guias em `node_modules/next/dist/docs/`, principalmente `01-app/02-guides/authentication-with-cache-components.md`, `authentication.md` e `03-api-reference/03-file-conventions/proxy.md`. No Next 16 o antigo `middleware.ts` se chama **`proxy.ts`**.
- **Com Cache Components, ler cookies é dado de requisição.** Todo componente que lê a sessão fica atrás de um `<Suspense>`, nunca no topo de um layout. O resto da página continua no "esqueleto estático" pré-gerado.
- **Supabase:** `@supabase/supabase-js` e `@supabase/ssr`, que guarda a sessão em cookies. No servidor, verificar o usuário com `getClaims()` ou `getUser()`, nunca confiando só em `getSession()`.
- **Chaves:** `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (a publicável pode ir ao navegador, porque quem protege os dados é a RLS). A service role **não é usada**. As chaves vão em `.env.local`, e os nomes vão para o `.env.example`.
- **O autor configura o Supabase pelo painel**, guiado passo a passo: criar o projeto (grátis), desligar "Confirm email", copiar URL e chave e rodar o SQL da tabela no SQL Editor. O SQL fica versionado no repositório (por exemplo, `supabase/migrations/0001_marcacoes.sql`) para ele copiar e colar.
- **Os dados do TMDB continuam só no servidor** (`lib/tmdb`, `server-only`). Nada nesta mudança chama o TMDB pelo navegador.
- **Idioma:** pt-BR, incluindo as mensagens de erro do login (o Supabase responde em inglês e as mensagens precisam ser traduzidas).

## 4. Abordagens consideradas

| Abordagem | Como funciona | Troca |
|---|---|---|
| **A. Sessão em cookie, lida pelo servidor (escolhida)** | `@supabase/ssr` grava a sessão em cookies. O `proxy.ts` renova a sessão. Os formulários de entrar e criar conta e as marcações são Server Actions. O servidor monta a barra, os botões do filme e o perfil já no estado certo, atrás de `<Suspense>`. A vitrine continua pré-gerada. As marcações dos pôsteres chegam num pedido separado, de uma vez, depois da página. | Sem "piscar", perfil protegido no servidor, vitrine continua rápida. Mais peças para montar (cookies, proxy, actions). É o padrão de apps reais e o conceito central a aprender. |
| B. Tudo no navegador | `supabase-js` no navegador, com a sessão no `localStorage`. O servidor nunca sabe quem é a pessoa. | Menos código. Cada página abre "deslogada" e depois muda, o perfil só fica protegido no navegador e o autor aprende menos sobre servidor. |

O Claude escolheu **A**, com a concordância do autor ("ok"). O autor deixou a parte técnica com o Claude.

**Decisão de produto com opções comparadas:** onde marcar os filmes. Foram comparadas A (só na página do filme) e B (página do filme e pôsteres). O autor escolheu a página do filme **com os botões no canto oposto ao Voltar** e propôs, para o computador, **botões que aparecem embaixo do pôster no hover**. O gesto de arrastar foi adiado (seção 2).

## 5. O que foi decidido com o autor

### 5.1 Barra superior

```
Sem conta:   [Catálogo]                    [🔍 Buscar] [Entrar]
Com conta:   [Catálogo]                    [🔍 Buscar] (G)
                                                        └ menu: Meu perfil · Sair
```

- **(G)** é um círculo com a inicial do nome da pessoa.
- O menu abre ao clicar no círculo e tem "Meu perfil" e "Sair".

### 5.2 Criar conta e entrar

- **Criar conta** pede nome, e-mail e senha. Como a confirmação por e-mail está desligada, a pessoa já entra na conta assim que a cria.
- **Entrar** pede e-mail e senha.
- As telas são simples, no mesmo visual de vidro do site, e têm link de uma para a outra.
- As mensagens são claras em português. Por exemplo: "E-mail ou senha incorretos", "Já existe uma conta com este e-mail" e o tamanho mínimo da senha.
- **Quem tenta marcar um filme sem ter entrado** vai para "Entrar" e, depois de entrar, **volta para a mesma página**. Isso vale também se a pessoa passar de "Entrar" para "Criar conta" no meio do caminho.
- **A marcação não é feita sozinha depois do login.** A pessoa volta para a página e clica de novo. O autor escolheu assim por ser mais simples e evitar que um link marque filmes na conta de alguém.

### 5.3 Página do filme

```
┌──────────────────────────────────────────────┐
│ [← Voltar]              [+ Quero] [✓ Já vi]  │
│                                              │
│ TÍTULO DO FILME                              │
│ [▶ Trailer] (2024) (2h10) (Ação)             │
└──────────────────────────────────────────────┘
```

- Os dois botões ficam **no alto, no canto oposto ao Voltar**. A ideia é que os elementos interativos do topo da página tenham um lugar previsível. Embaixo fica só a informação do filme, com o Trailer.
- **Os botões mostram o estado.** Marcado, o botão fica preenchido. Clicar de novo desmarca.
- **Marcar "Já vi" tira o filme do "Quero".** Um filme está em no máximo uma das listas. O mesmo vale ao contrário: marcar "Quero" num filme já visto o tira do "Já vi".

### 5.4 Pôsteres (vitrine, "Ver tudo" e busca)

```
┌──────┐ ┌──────┐ ┌──────┐
│pôster│ │░░░░░░│ │pôster│      ← o do meio já foi assistido (véu)
│      │ │  ✓   │ │  ▲   │      ← mouse sobre o da direita
│      │ │ Já   │ │      │
│      │ │assis-│ │      │
│      │ │ tido │ │      │
└──────┘ └──────┘ └──────┘
                   [✓] [+]       ← aparecem só no hover, embaixo do pôster
                    └ "Já vi"    ← nome aparece ao passar no ícone
```

- **No computador, no hover do pôster**, aparecem embaixo dele, no espaço entre as fileiras, **dois botões de ícone que ligam e desligam**: "Já vi" e "Quero assistir".
- **São só ícones. O nome aparece no hover do ícone**, para facilitar reconhecer a função.
- **Os botões também aparecem quando o pôster recebe o foco pelo teclado.**
- **No celular eles não aparecem** (não existe hover). No celular se marca pela página do filme.
- **Filme já assistido mostra um véu leve sobre o pôster, com o ícone ✓ e o texto "Já assistido"**, no computador e no celular. No hover o véu clareia para mostrar o pôster.
- **"Quero assistir" não tem marca visível** sem hover.
- O espaço entre as fileiras cresce um pouco, de forma permanente, para os botões caberem. Hoje sobram cerca de 24px embaixo dos pôsteres, e serão cerca de 48px. Se ficar ruim, a alternativa é pôr os botões sobre a parte de baixo do pôster.

### 5.5 Perfil (`/perfil`)

```
┌──────────────────────────────────────────────┐
│ Olá, Gabriel                                 │
│ (Quero assistir · 12)  (Já assisti · 30)     │ ← abas
│ ┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐         │
│ │    ││    ││    ││    ││    ││    │         │ ← grade de pôsteres
│ └────┘└────┘└────┘└────┘└────┘└────┘         │
└──────────────────────────────────────────────┘
```

- **Duas abas com contagem**, cada uma com uma grade de pôsteres.
- **Ordem:** o filme marcado por último aparece primeiro.
- **Na aba "Já assisti" não tem véu.** Os botões de hover continuam valendo, então dá para desmarcar ali mesmo.
- **Desmarcar ou passar um filme para a outra lista não o tira da grade na hora.** O pôster fica no lugar, com o botão no novo estado, e um novo clique desfaz o engano. **A contagem das abas muda na hora.** Na próxima visita à aba, ou ao trocar de aba, o filme não aparece mais. O autor escolheu assim por ser mais tolerante a cliques errados.
- **Lista vazia:** "Você ainda não marcou nenhum filme" e um link para a vitrine.
- Só quem entrou na conta acessa. Quem não entrou vai para "Entrar" e volta para cá depois.

## 6. Decisões tomadas por mim (Claude), que o autor pode revisar

- **Uma tabela, uma linha por filme por pessoa.** `marcacoes(user_id, movie_id, status, title, poster_path, marked_at)`, com chave primária `(user_id, movie_id)` e `status` em (`quero`, `assisti`). A regra "um filme em no máximo uma lista" fica garantida pelo próprio banco. Marcar é gravar ou trocar a linha (atualizando `marked_at`, que define a ordem do perfil). Desmarcar é apagar a linha. `user_id` referencia `auth.users` com `on delete cascade`.
- **RLS ligada na tabela**, com regras para cada pessoa ler, inserir, alterar e apagar só as linhas com `user_id = auth.uid()`. O plano inclui conferir isso com uma segunda conta.
- **Título e pôster guardados junto da marcação**, para o perfil abrir com uma única consulta, sem pedir dezenas de filmes ao TMDB. O título e o pôster vêm do servidor (dos dados do TMDB que a página já tem), não de um campo que o navegador possa inventar. Se mudarem no TMDB, a marcação mostra a versão de quando foi feita, o que é aceitável aqui.
- **Nome da pessoa** guardado nos metadados do usuário do Supabase na criação da conta. Não há tabela de perfis.
- **Endereços:** `/entrar`, `/criar-conta` e `/perfil?aba=quero|assisti` (a aba no endereço, como o resto do app), num grupo de rotas `app/(conta)/`. O "voltar para" vai como `?volta=/caminho` e só é aceito se for um caminho interno do site (começa com `/`, sem `//`). Caso contrário vai para `/`.
- **"Voltar para a mesma página" quer dizer o mesmo endereço**, não a mesma posição de rolagem, a posição dos carrosséis ou as páginas já carregadas no "Ver tudo". Na página do filme, o caso mais comum, isso não faz diferença.
- **Mesma barra e mesmo rodapé** nas páginas da conta.
- **Botões de hover aparecem também para quem não entrou.** Clicar leva para "Entrar" e depois de volta, igual à página do filme. Assim a função é descoberta antes de criar conta.
- **Resposta imediata ao clicar:** o botão muda na hora e, se o servidor falhar, volta ao estado anterior com um aviso curto ("Não foi possível salvar. Tente de novo."). Isso evita o anti-objetivo da falha silenciosa.
- **Marcações dos pôsteres:** o esqueleto da vitrine continua pré-gerado e em cache. Para quem entrou, a lista de IDs marcados (com o status) chega uma vez por página, atrás de `<Suspense>`, e é compartilhada com todos os pôsteres. Enquanto ela não chega, os pôsteres aparecem sem véu e os botões de hover não aparecem, o que evita mostrar um estado errado.
- **Depois de marcar**, a página do filme, o perfil e os pôsteres refletem a mudança na próxima vez que forem vistos, sem precisar recarregar.
- **Senha:** mínimo de 6 caracteres (o padrão do Supabase). Sem regras extras.
- **Sair** apaga a sessão e volta para a página onde a pessoa estava, a menos que ela esteja no perfil. Nesse caso vai para a vitrine.

## 7. O que fica a critério de quem constrói

- **A forma exata de buscar a sessão e as marcações com Cache Components**, seguindo o guia `authentication-with-cache-components.md`: por exemplo, uma camada de acesso a dados (`lib/supabase/` com `server-only`), `use cache: private` ou o padrão de uma promise passada por contexto e lida com `use()`. O importante são as restrições da seção 3 e os anti-objetivos.
- **Como o `PosterCard` ganha a parte interativa**: dividir em uma parte de servidor e uma de cliente, onde fica o provider das marcações, `useOptimistic` ou não.
- **Como os pôsteres e as páginas se atualizam depois de uma marcação** (`refresh`, `updateTag`, estado no cliente), desde que não "pisque".
- **Ícones** (seguindo o estilo de `components/ui/icons.tsx`), tooltip, acessibilidade do menu da barra (abrir com teclado, fechar com Esc) e detalhes visuais, mantendo o visual de vidro e escuro.
- **Testes:** proporcionais a um projeto de estudo. Vale priorizar a validação do "voltar para", a tradução das mensagens de erro, as actions de marcar e desmarcar (com o Supabase simulado) e os estados visuais do pôster e dos botões.
- **Nomes de arquivos, pastas e componentes.**
