# Catálogo de filmes nos streamings: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Objetivo:** construir um site em Next.js com uma vitrine visual de filmes disponíveis agora nos streamings do Brasil, com filtro por serviço, a página de cada filme e uma busca.

**Arquitetura:** todo o acesso ao TMDB fica numa camada que só roda no servidor (`src/lib/tmdb/`), com funções puras testadas e funções de consulta guardadas em cache. As páginas são Server Components que recebem dados já tratados. Só carrosséis, "carregar mais", trailer e botão voltar rodam no navegador. O estado de navegação (serviço, busca) fica no endereço da página.

**Tecnologia:** Next.js 16.4.x (App Router, `cacheComponents`, `"use cache"` com `cacheLife`), React 19, TypeScript, Tailwind CSS 4.3.x, Vitest + Testing Library, Node.js 22.

**Spec:** `docs/superpowers/specs/2026-11-18-catalogo-streaming-design.md`

**Para o Gabriel:** cada tarefa começa com um bloco **"Em linguagem simples"**. É ele que explica a etapa para quem está aprendendo. Ao executar, o Claude conta esse resumo antes de começar cada tarefa.

## Restrições globais

- Só filmes, só Brasil: `watch_region=BR`, `region=BR`, `language=pt-BR`.
- A vitrine, o "Ver tudo" e os "Semelhantes" usam sempre `with_watch_monetization_types=flatrate|free|ads`.
- Os serviços, nesta ordem: Netflix (8), Prime Video (119), Disney+ (337), Max (1899), Apple TV+ (350), Globoplay (307). "Todos" quer dizer esses seis IDs unidos por `|`.
- Os gêneros, nesta ordem, depois de "Em alta": Ação 28, Comédia 35, Drama 18, Terror 27, Ficção científica 878, Animação 16, Romance 10749, Suspense 53.
- A chave fica em `TMDB_READ_ACCESS_TOKEN` (`.env.local`) e só é lida em arquivos com `import "server-only"`. Nada que tenha a chave pode rodar no navegador.
- Cache `catalogo` (listas, destaque, semelhantes, busca): revalidar a cada 6 h. Cache `filme` (detalhes e onde assistir): revalidar a cada 24 h.
- O crédito à JustWatch é obrigatório onde aparece "onde assistir", com o texto `Dados de streaming: JustWatch`. No rodapé de todas as páginas vão o logo do TMDB e o texto `This product uses the TMDB API but is not endorsed or certified by TMDB.`
- Todo o texto visível fica em pt-BR, como escrito nas tarefas.
- Visual escuro: fundo `#0f0f14`, superfície `#1a1a22`, destaque `#e8b04a`. Precisa funcionar a partir de 360 px de largura.
- Fora de escopo: séries, outros países, login, favoritos, filtro com vários serviços ao mesmo tempo, sugestões de busca enquanto se digita.

## Foco da revisão

Situações que a spec implica e que mais provavelmente vão afetar quem usa o site. Cada uma tem um teste na tarefa dona do código.

1. **Endereço com serviço inválido** (`/?servico=xyz` ou `?servico=a&servico=b`): tratar como "Todos", sem erro. O teste fica na Tarefa 1 (`parseService`).
2. **Filme sem dados para o Brasil** (`results.BR` ausente): mostrar "Não está disponível em streaming no Brasil agora.", nunca quebrar. Testes nas Tarefas 4 (`groupWatchProviders(undefined)`) e 9 (`WatchProviders`).
3. **Filme inexistente ou id inválido** (`/filme/abc`, `/filme/999999999`): página "Filme não encontrado", não a tela de erro. Testes nas Tarefas 2 (`TmdbNotFoundError` no 404) e 9 (`parseMovieId`).
4. **Busca vazia ou só com espaços** (`/busca?q=%20%20`): não chamar a API e pedir que a pessoa digite algo. Teste na Tarefa 10 (`normalizeQuery`).
5. **Fechar o trailer**: o vídeo para de tocar, porque o iframe sai da página. Teste na Tarefa 9 (`TrailerButton`).

Outros casos cobertos pelos testes das tarefas: pôster ou foto ausente vira marcador de lugar, o "carregar mais" para no limite de 500 páginas do TMDB, e a action do "carregar mais" rejeita categoria inválida.

---

### Tarefa 0 (do Gabriel): conseguir a chave do TMDB

**Em linguagem simples:** o TMDB só entrega dados para quem se identifica. Você cria uma conta e recebe um "crachá" (o token). O site usa esse token, escondido no servidor, toda vez que pede filmes.

- [ ] Criar uma conta em https://www.themoviedb.org/signup e confirmar o e-mail.
- [ ] Em https://www.themoviedb.org/settings/api, pedir uma chave para uso pessoal ou educacional e aceitar os termos.
- [ ] Copiar o **API Read Access Token**, o texto longo que começa com `eyJ`, e entregar ao Claude na hora da Tarefa 1. Ele vai para `.env.local`, que nunca é registrado no git.

---

### Tarefa 1: base do projeto, listas fixas e leitura do endereço

**Em linguagem simples:** aqui o projeto é criado, como as fundações de uma casa. Também entram as duas listas fixas do app (os seis streamings e os oito gêneros) e uma função que lê o endereço da página para saber qual streaming está selecionado. Se o endereço vier estranho, ela escolhe "Todos" em vez de quebrar.

**Arquivos:**
- Criar: projeto via `create-next-app`, `.gitignore`, `.env.example`, `.env.local`, `next.config.ts`, `vitest.config.mts`, `src/test/setup.ts`, `src/test/empty.ts`
- Criar: `src/lib/tmdb/config.ts`, `src/lib/params.ts`
- Testes: `src/lib/params.test.ts`, `src/lib/tmdb/config.test.ts`

**Interfaces:**
- Produz (`src/lib/tmdb/config.ts`):
  - `REGION = "BR"`, `LANGUAGE = "pt-BR"`, `STREAMING_MONETIZATION = "flatrate|free|ads"`
  - `type ServiceSlug = "netflix" | "prime-video" | "disney-plus" | "max" | "apple-tv-plus" | "globoplay"`
  - `SERVICES: readonly { slug: ServiceSlug; name: string; providerId: number; preposition: "na" | "no" }[]`, na ordem e com os IDs das Restrições globais. Nomes: `Netflix`, `Prime Video`, `Disney+`, `Max`, `Apple TV+`, `Globoplay`. Preposição: `na` só para Netflix, `no` para os demais.
  - `providerIdsFor(service: ServiceSlug | null): string` devolve um ID, ou os seis unidos por `|` quando é `null`.
  - `type GenreSlug = "acao" | "comedia" | "drama" | "terror" | "ficcao-cientifica" | "animacao" | "romance" | "suspense"`
  - `type CategorySlug = "em-alta" | GenreSlug`
  - `CATEGORIES: readonly { slug: CategorySlug; title: string; genreId: number | null }[]`: `em-alta`/`Em alta`/`null` primeiro, depois os gêneros com títulos `Ação`, `Comédia`, `Drama`, `Terror`, `Ficção científica`, `Animação`, `Romance`, `Suspense`.
  - `resolveCategory(slug: string): (typeof CATEGORIES)[number] | null`
- Produz (`src/lib/params.ts`):
  - `parseService(value: string | string[] | undefined): ServiceSlug | null`
  - `withService(path: string, service: ServiceSlug | null): string`

- [ ] **Passo 1: criar o repositório git e o projeto Next.js**

`git init` na raiz. Rodar `npx create-next-app@16.4.6` com TypeScript, ESLint, Tailwind, App Router, `src/` e alias `@/*`, usando npm. Se o comando recusar por causa das pastas `docs/` e `.superpowers/`, gerar em `./.scaffold`, depois `rsync -a .scaffold/ ./` e `rm -rf .scaffold`. Conferir que `package.json` tem `next@16.4.x` e `tailwindcss@4.x`.

- [ ] **Passo 2: configurar `.gitignore`, variáveis de ambiente e `next.config.ts`**

- `.gitignore`: acrescentar `.superpowers/` e `.env*.local`.
- `.env.example`: `TMDB_READ_ACCESS_TOKEN=`. O `.env.local` recebe o token da Tarefa 0.
- `next.config.ts`:
  - `cacheComponents: true`
  - `images.remotePatterns` com `https://image.tmdb.org/t/p/**`
  - `cacheLife: { catalogo: { stale: 300, revalidate: 21600, expire: 86400 }, filme: { stale: 300, revalidate: 86400, expire: 172800 } }`

- [ ] **Passo 3: instalar e configurar os testes**

- `npm i server-only` e `npm i -D vitest @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`.
- `vitest.config.mts`: plugins react + tsconfig-paths, `environment: "jsdom"`, `setupFiles: ["src/test/setup.ts"]`, e `alias: { "server-only": "src/test/empty.ts" }`, porque o pacote real dá erro fora do servidor.
- `setup.ts` importa `@testing-library/jest-dom/vitest`.
- Script `"test": "vitest run"` no `package.json`.

- [ ] **Passo 4: escrever os testes que falham**

```ts
// src/lib/params.test.ts
test("parseService aceita slug válido", () => expect(parseService("netflix")).toBe("netflix"));
test("parseService trata inválido, vazio e repetido como Todos", () => {
  expect(parseService("xyz")).toBeNull();
  expect(parseService(undefined)).toBeNull();
  expect(parseService("")).toBeNull();
  expect(parseService(["max", "netflix"])).toBeNull();
});
test("withService acrescenta ?servico só quando há serviço", () => {
  expect(withService("/explorar/acao", "max")).toBe("/explorar/acao?servico=max");
  expect(withService("/explorar/acao", null)).toBe("/explorar/acao");
});

// src/lib/tmdb/config.test.ts
test("providerIdsFor", () => {
  expect(providerIdsFor("globoplay")).toBe("307");
  expect(providerIdsFor(null)).toBe("8|119|337|1899|350|307");
});
test("resolveCategory", () => {
  expect(resolveCategory("em-alta")).toEqual({ slug: "em-alta", title: "Em alta", genreId: null });
  expect(resolveCategory("terror")?.genreId).toBe(27);
  expect(resolveCategory("series")).toBeNull();
});
test("CATEGORIES começa por Em alta e segue a ordem dos gêneros", () =>
  expect(CATEGORIES.map((c) => c.slug)).toEqual(["em-alta", "acao", "comedia", "drama", "terror", "ficcao-cientifica", "animacao", "romance", "suspense"]));
```

- [ ] **Passo 5: rodar e ver falhar.** `npm test`. Esperado: FAIL, módulos não encontrados.
- [ ] **Passo 6: implementar `config.ts` e `params.ts`** com as interfaces acima.
- [ ] **Passo 7: rodar e ver passar.** `npm test` deve passar, e `npm run build` deve terminar sem erro.
- [ ] **Passo 8: commit**

```bash
git add -A && git commit -m "chore: base do projeto Next.js 16 com listas de serviços e gêneros"
```

Conferir com `git status` que `.env.local` e `.superpowers/` **não** foram registrados. O spec em `docs/` entra nesse commit.

---

### Tarefa 2: cliente do TMDB

**Em linguagem simples:** este é o "telefone" do site com o TMDB. Toda conversa com a API passa por aqui. É aqui que a chave fica escondida e que respostas ruins são tratadas: "não encontrado" é diferente de "deu erro", e a falta da chave gera um aviso claro.

**Arquivos:**
- Criar: `src/lib/tmdb/client.ts`
- Testes: `src/lib/tmdb/client.test.ts`

**Interfaces:**
- Produz:
  - `class TmdbError extends Error { status: number }`
  - `class TmdbNotFoundError extends TmdbError`
  - `tmdbFetch<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T>`. A base é `https://api.themoviedb.org/3`, o cabeçalho é `Authorization: Bearer <token>`, e parâmetros `undefined` são omitidos. O arquivo começa com `import "server-only"` e não passa opções de cache ao `fetch`, porque o cache é feito na Tarefa 5.

- [ ] **Passo 1: escrever os testes que falham.** Usar `vi.stubGlobal("fetch", ...)` e `vi.stubEnv("TMDB_READ_ACCESS_TOKEN", "tok")`.

```ts
test("monta URL, omite undefined e envia Bearer", async () => {
  await tmdbFetch("/discover/movie", { page: 2, with_genres: undefined });
  const [url, init] = fetchMock.mock.calls[0];
  expect(String(url)).toBe("https://api.themoviedb.org/3/discover/movie?page=2");
  expect(init.headers.Authorization).toBe("Bearer tok");
});
test("404 vira TmdbNotFoundError", async () => { /* status 404 */ await expect(tmdbFetch("/movie/1")).rejects.toBeInstanceOf(TmdbNotFoundError); });
test("500 vira TmdbError com status", async () => { /* status 500 */ await expect(tmdbFetch("/x")).rejects.toMatchObject({ status: 500 }); });
test("sem token, erro claro e nenhuma chamada", async () => {
  vi.stubEnv("TMDB_READ_ACCESS_TOKEN", "");
  await expect(tmdbFetch("/x")).rejects.toThrow("TMDB_READ_ACCESS_TOKEN não configurado em .env.local");
  expect(fetchMock).not.toHaveBeenCalled();
});
```

- [ ] **Passo 2: rodar e ver falhar.** `npx vitest run src/lib/tmdb/client.test.ts`. Esperado: FAIL.
- [ ] **Passo 3: implementar `client.ts`.**
- [ ] **Passo 4: rodar e ver passar.** Esperado: PASS.
- [ ] **Passo 5: commit.** `git commit -m "feat: cliente do TMDB só no servidor"`

---

### Tarefa 3: listas de filmes (vitrine, "Ver tudo" e busca)

**Em linguagem simples:** o TMDB devolve os dados num formato próprio, cheio de campos que não usamos. Aqui o site "traduz" cada filme para um formato simples (título, pôster, ano e nota). Também monta o pedido que diz "filmes no Brasil, por assinatura ou grátis, neste streaming, deste gênero".

**Arquivos:**
- Criar: `src/lib/tmdb/raw-types.ts`, `src/lib/tmdb/types.ts`, `src/lib/tmdb/lists.ts`, `src/lib/tmdb/images.ts`
- Testes: `src/lib/tmdb/lists.test.ts`, `src/lib/tmdb/images.test.ts`

**Interfaces:**
- Consome: `ServiceSlug`, `providerIdsFor`, `REGION`, `LANGUAGE`, `STREAMING_MONETIZATION` (Tarefa 1).
- Produz (`raw-types.ts`): os formatos do TMDB usados pelo app:
  - `TmdbMovieListItem` (`id`, `title`, `poster_path`, `backdrop_path`, `release_date`, `vote_average`, `genre_ids`)
  - `TmdbPaged<T>` (`page`, `results`, `total_pages`, `total_results`)
  - `TmdbProvider` (`provider_id`, `provider_name`, `logo_path`, `display_priority`)
  - `TmdbWatchCountry` (`link?`, `flatrate?`, `free?`, `ads?`, `rent?`, `buy?`)
  - `TmdbVideo` (`key`, `site`, `type`, `iso_639_1`, `name`, `official`)
  - `TmdbMovieDetailsRaw` (campos de detalhes, mais `videos.results`, `credits.cast` e `"watch/providers".results`)
- Produz (`types.ts`):
  - `MovieSummary { id: number; title: string; posterPath: string | null; backdropPath: string | null; year: string | null; rating: number }`
  - `Page<T> { items: T[]; page: number; hasMore: boolean }`
  - `Provider { id: number; name: string; logoPath: string | null }`
  - `WatchOptions { subscription: Provider[]; free: Provider[]; rent: Provider[]; buy: Provider[]; isEmpty: boolean }`
  - `CastMember { id: number; name: string; character: string; profilePath: string | null }`
  - `Trailer { youtubeKey: string; name: string }`
  - `MovieDetails { id; title; overview: string; year: string | null; runtimeMinutes: number | null; rating: number; genres: { id: number; name: string }[]; posterPath; backdropPath; trailer: Trailer | null; cast: CastMember[]; watch: WatchOptions }`
- Produz (`lists.ts`):
  - `mapMovieSummary(raw: TmdbMovieListItem): MovieSummary`. O ano vem dos 4 primeiros caracteres de `release_date`, ou `null` se estiver vazio. A nota é arredondada para 1 casa.
  - `buildDiscoverParams(opts: { service: ServiceSlug | null; genreIds?: number[]; page?: number }): Record<string, string | number>`
  - `toPage(raw: TmdbPaged<TmdbMovieListItem>, opts?: { excludeId?: number }): Page<MovieSummary>`
- Produz (`images.ts`):
  - `tmdbImage(path: string | null, size: "w92" | "w185" | "w342" | "w780" | "w1280"): string | null`

- [ ] **Passo 1: escrever os testes que falham**

```ts
test("buildDiscoverParams com serviço e gênero", () =>
  expect(buildDiscoverParams({ service: "netflix", genreIds: [28], page: 3 })).toEqual({
    watch_region: "BR", with_watch_providers: "8", with_watch_monetization_types: "flatrate|free|ads",
    sort_by: "popularity.desc", language: "pt-BR", include_adult: "false", page: 3, with_genres: "28",
  }));
test("buildDiscoverParams Todos, sem gênero, página 1, vários gêneros em OU", () => {
  const p = buildDiscoverParams({ service: null });
  expect(p.with_watch_providers).toBe("8|119|337|1899|350|307");
  expect(p.page).toBe(1);
  expect(p).not.toHaveProperty("with_genres");
  expect(buildDiscoverParams({ service: null, genreIds: [28, 12] }).with_genres).toBe("28|12");
});
test("mapMovieSummary com dados faltando", () =>
  expect(mapMovieSummary({ id: 1, title: "X", poster_path: null, backdrop_path: null, release_date: "", vote_average: 7.456, genre_ids: [] }))
    .toEqual({ id: 1, title: "X", posterPath: null, backdropPath: null, year: null, rating: 7.5 }));
test("toPage: hasMore respeita total_pages e o teto de 500 do TMDB", () => {
  expect(toPage({ page: 1, total_pages: 2, total_results: 40, results: [] }).hasMore).toBe(true);
  expect(toPage({ page: 2, total_pages: 2, total_results: 40, results: [] }).hasMore).toBe(false);
  expect(toPage({ page: 500, total_pages: 900, total_results: 18000, results: [] }).hasMore).toBe(false);
});
test("toPage remove excludeId", () => { /* results com ids 1 e 2, excludeId 1, items com id 2 apenas */ });
test("tmdbImage", () => {
  expect(tmdbImage("/a.jpg", "w342")).toBe("https://image.tmdb.org/t/p/w342/a.jpg");
  expect(tmdbImage(null, "w342")).toBeNull();
});
```

- [ ] **Passo 2: rodar e ver falhar.** `npx vitest run src/lib/tmdb/lists.test.ts src/lib/tmdb/images.test.ts`
- [ ] **Passo 3: implementar** `raw-types.ts`, `types.ts`, `lists.ts` e `images.ts`.
- [ ] **Passo 4: rodar e ver passar.** Esperado: PASS.
- [ ] **Passo 5: commit.** `git commit -m "feat: tradução das listas do TMDB e filtros do discover"`

---

### Tarefa 4: detalhes do filme e "onde assistir"

**Em linguagem simples:** aqui o site organiza a página de um filme. Separa os streamings em Assinatura, Grátis, Aluguel e Compra, escolhe o melhor trailer (de preferência em português) e decide qual streaming aparece no destaque da vitrine. Quando o filme não está em lugar nenhum no Brasil, isso fica registrado em vez de quebrar a página.

**Arquivos:**
- Criar: `src/lib/tmdb/details.ts`
- Testes: `src/lib/tmdb/details.test.ts`

**Interfaces:**
- Consome: os tipos da Tarefa 3, e `SERVICES` e `ServiceSlug` da Tarefa 1.
- Produz:
  - `groupWatchProviders(country: TmdbWatchCountry | undefined): WatchOptions`. Em cada grupo, ordenar por `display_priority`. `free` junta `free` e `ads` sem repetir `provider_id`. `isEmpty` é `true` quando os quatro grupos estão vazios.
  - `pickTrailer(videos: TmdbVideo[]): Trailer | null`. Só vídeos com `site === "YouTube"`. Ordem de preferência: Trailer em `pt`, Trailer em `en`, Teaser em `pt`, Teaser em `en`. Se nenhum servir, `null`.
  - `pickHeroService(country: TmdbWatchCountry | undefined, selected: ServiceSlug | null): { name: string; preposition: "na" | "no" } | null`. Considera só os seis serviços, em `flatrate`, `free` ou `ads`. Se o serviço selecionado estiver entre eles, devolve esse. Senão, o de menor `display_priority`.
  - `mapMovieDetails(raw: TmdbMovieDetailsRaw, fallbackOverview: string | null): MovieDetails`. `overview` é o texto em pt sem espaços nas pontas, ou o texto de fallback, ou `""`. `cast` são os 12 primeiros. `watch` vem de `groupWatchProviders(raw["watch/providers"]?.results?.BR)`. `runtimeMinutes` é `null` quando vier 0 ou ausente.

- [ ] **Passo 1: escrever os testes que falham**

```ts
test("groupWatchProviders sem dados do Brasil", () =>
  expect(groupWatchProviders(undefined)).toEqual({ subscription: [], free: [], rent: [], buy: [], isEmpty: true }));
test("groupWatchProviders ordena por prioridade e une free+ads sem repetir", () => {
  const w = groupWatchProviders({ flatrate: [p(119, 5), p(8, 1)], free: [p(300, 2)], ads: [p(300, 2), p(301, 3)] });
  expect(w.subscription.map((x) => x.id)).toEqual([8, 119]);
  expect(w.free.map((x) => x.id)).toEqual([300, 301]);
  expect(w.isEmpty).toBe(false);
});
test("pickTrailer prefere Trailer pt, depois en, ignora não-YouTube", () => {
  expect(pickTrailer([v("a", "Trailer", "en"), v("b", "Trailer", "pt")])?.youtubeKey).toBe("b");
  expect(pickTrailer([v("c", "Teaser", "pt"), v("d", "Trailer", "en")])?.youtubeKey).toBe("d");
  expect(pickTrailer([{ ...v("e", "Trailer", "pt"), site: "Vimeo" }])).toBeNull();
});
test("pickHeroService respeita o selecionado e ignora serviços fora da lista", () => {
  const c = { flatrate: [p(119, 1), p(8, 2), p(999, 0)] };
  expect(pickHeroService(c, "netflix")).toEqual({ name: "Netflix", preposition: "na" });
  expect(pickHeroService(c, null)).toEqual({ name: "Prime Video", preposition: "no" });
  expect(pickHeroService({ flatrate: [p(999, 0)] }, null)).toBeNull();
});
test("mapMovieDetails usa o fallback quando a sinopse em pt está vazia", () => {
  expect(mapMovieDetails(rawWith({ overview: "  " }), "English overview").overview).toBe("English overview");
  expect(mapMovieDetails(rawWith({ overview: "" }), null).overview).toBe("");
  expect(mapMovieDetails(rawWith({ runtime: 0 }), null).runtimeMinutes).toBeNull();
  expect(mapMovieDetails(rawWith({ castCount: 20 }), null).cast).toHaveLength(12);
});
```

Os helpers `p(id, priority)`, `v(key, type, lang)` e `rawWith(overrides)` ficam no próprio arquivo de teste.

- [ ] **Passo 2: rodar e ver falhar.** `npx vitest run src/lib/tmdb/details.test.ts`
- [ ] **Passo 3: implementar `details.ts`.**
- [ ] **Passo 4: rodar e ver passar.** Esperado: PASS.
- [ ] **Passo 5: commit.** `git commit -m "feat: detalhes do filme, onde assistir e trailer"`

---

### Tarefa 5: consultas com cache

**Em linguagem simples:** são os "pedidos prontos" que as páginas usam: a fileira de Ação na Netflix, os detalhes de um filme, os semelhantes, a busca. Cada resposta fica guardada por algumas horas (cache). Assim, se mil pessoas abrirem a vitrine, o TMDB é consultado uma vez, não mil.

**Arquivos:**
- Criar: `src/lib/tmdb/queries.ts`
- Testes: `src/lib/tmdb/queries.test.ts`, com `vi.mock("./client")` e `vi.mock("next/cache", () => ({ cacheLife: vi.fn() }))`

**Interfaces:**
- Consome: `tmdbFetch` (Tarefa 2), as funções das Tarefas 3 e 4, e `resolveCategory` e `CategorySlug` (Tarefa 1).
- Produz. Cada função começa com `"use cache"`, e o arquivo tem `import "server-only"`:
  - `getCategoryMovies(category: CategorySlug, service: ServiceSlug | null, page?: number): Promise<Page<MovieSummary>>`, com `cacheLife("catalogo")`.
  - `getFeatured(service: ServiceSlug | null): Promise<{ movie: MovieSummary; service: { name: string; preposition: "na" | "no" } | null } | null>`, com `cacheLife("catalogo")`. Pega o primeiro filme de "Em alta" (página 1) que tenha `backdropPath`, consulta `/movie/{id}/watch/providers` e aplica `pickHeroService(results.BR, service)`. Se nenhum filme tiver imagem de fundo, devolve `null`.
  - `getMovie(id: number): Promise<MovieDetails>`, com `cacheLife("filme")`. Chama `/movie/{id}` com `language=pt-BR`, `append_to_response=videos,credits,watch/providers` e `include_video_language=pt,en`. Se a sinopse vier vazia, chama `/movie/{id}` com `language=en-US` e usa o `overview` como fallback. Se o TMDB devolver 404, propaga o `TmdbNotFoundError`.
  - `getSimilarStreaming(movie: Pick<MovieDetails, "id" | "genres">): Promise<MovieSummary[]>`, com `cacheLife("catalogo")`. Sem gêneros, devolve `[]` e não chama a API. Usa o `discover` com os dois primeiros gêneros (em OU) e `service: null`, tira o próprio filme e devolve no máximo 20.
  - `searchMovies(query: string, page?: number): Promise<Page<MovieSummary>>`, com `cacheLife("catalogo")`. Chama `/search/movie` com `query`, `language=pt-BR`, `region=BR`, `include_adult=false` e `page`.

- [ ] **Passo 1: escrever os testes que falham**

```ts
test("getCategoryMovies usa o gênero da categoria e o serviço", async () => {
  await getCategoryMovies("terror", "max", 2);
  expect(tmdbFetch).toHaveBeenCalledWith("/discover/movie", expect.objectContaining({ with_genres: "27", with_watch_providers: "1899", page: 2 }));
});
test("getCategoryMovies em-alta não manda with_genres", async () => { /* params sem with_genres */ });
test("getMovie busca a sinopse em inglês só quando a pt vem vazia", async () => {
  // 1ª chamada: overview "" → 2ª chamada com language en-US → overview "EN"
  expect((await getMovie(10)).overview).toBe("EN");
  // overview "PT" → só 1 chamada
});
test("getSimilarStreaming sem gêneros não chama a API", async () => {
  expect(await getSimilarStreaming({ id: 1, genres: [] })).toEqual([]);
  expect(tmdbFetch).not.toHaveBeenCalled();
});
test("getSimilarStreaming tira o próprio filme e limita a 20", async () => { /* 25 resultados com o id 1 incluso → 20 itens, sem id 1 */ });
test("getFeatured pula filmes sem backdrop e devolve null se nenhum tem", async () => { /* … */ });
```

- [ ] **Passo 2: rodar e ver falhar.** `npx vitest run src/lib/tmdb/queries.test.ts`
- [ ] **Passo 3: implementar `queries.ts`.**
- [ ] **Passo 4: rodar e ver passar.** `npm test`. Esperado: todos PASS.
- [ ] **Passo 5: conferir de verdade.** Criar uma rota temporária, `src/app/api/_debug/route.ts`, que devolve `getCategoryMovies("em-alta", "netflix")`. Rodar `npm run dev` e `curl -s localhost:3000/api/_debug | head -c 400`. Esperado: JSON com filmes reais. **Apagar a rota** antes do commit.
- [ ] **Passo 6: commit.** `git commit -m "feat: consultas ao TMDB com cache"`

---

### Tarefa 6: esqueleto visual (cabeçalho, rodapé, erro e não encontrado)

**Em linguagem simples:** aqui fica a "moldura" que aparece em todas as páginas: o fundo escuro, o cabeçalho com o nome do site e a busca, e o rodapé com os créditos obrigatórios ao TMDB. Também entram as telas de "algo deu errado" e de "página não encontrada", para que nenhum erro mostre uma tela feia ou em branco.

**Arquivos:**
- Modificar: `src/app/layout.tsx`, `src/app/globals.css`
- Criar: `src/app/(catalogo)/layout.tsx`, `src/components/layout/SiteHeader.tsx`, `src/components/layout/SiteFooter.tsx`, `src/components/layout/SearchForm.tsx`, `src/app/(catalogo)/error.tsx`, `src/app/not-found.tsx`, `public/tmdb-logo.svg`
- Mover: a página inicial gerada vai para `src/app/(catalogo)/page.tsx`, como marcador provisório
- Testes: `src/components/layout/layout.test.tsx`

**Interfaces:**
- Produz:
  - `SiteHeader()`: logo "CATÁLOGO" com link para `/`, e o `SearchForm`.
  - `SearchForm({ defaultValue?: string })`: um `<form action="/busca" method="get">` com `<input name="q" type="search" placeholder="Buscar filmes" aria-label="Buscar filmes">`. Funciona mesmo sem JavaScript.
  - `SiteFooter()`: logo do TMDB, o aviso exato das Restrições globais e um link para themoviedb.org.
  - O grupo `(catalogo)` tem o layout com cabeçalho e rodapé. O `app/layout.tsx` raiz fica só com `<html lang="pt-BR">`, a fonte e o tema. Isso deixa espaço para um futuro `app/(conta)/`.
- Textos fixos:
  - `error.tsx` (`"use client"`, recebe `reset`): título `Algo deu errado ao carregar os filmes.` e botão `Tentar de novo`, que chama `reset()`.
  - `src/app/not-found.tsx` (genérico): `Página não encontrada.` e link `Voltar para o catálogo`, que leva a `/`. A Tarefa 9 cria a versão específica do filme.

- [ ] **Passo 1: escrever os testes que falham**

```tsx
test("rodapé tem o aviso do TMDB", () => {
  render(<SiteFooter />);
  expect(screen.getByText("This product uses the TMDB API but is not endorsed or certified by TMDB.")).toBeInTheDocument();
  expect(screen.getByRole("img", { name: /TMDB/ })).toBeInTheDocument();
});
test("busca envia GET para /busca com o campo q", () => {
  render(<SearchForm />);
  const form = screen.getByRole("searchbox", { name: "Buscar filmes" }).closest("form")!;
  expect(form).toHaveAttribute("action", "/busca");
  expect(screen.getByRole("searchbox")).toHaveAttribute("name", "q");
});
```

- [ ] **Passo 2: rodar e ver falhar.** `npx vitest run src/components/layout`
- [ ] **Passo 3: implementar.** No `globals.css`, um bloco `@theme` do Tailwind 4 com `--color-bg: #0f0f14`, `--color-surface: #1a1a22` e `--color-accent: #e8b04a`. Baixar o logo oficial do TMDB em https://www.themoviedb.org/about/logos-attribution, na versão para fundo escuro, e salvar em `public/tmdb-logo.svg`. Remover o conteúdo de exemplo do `create-next-app`.
- [ ] **Passo 4: rodar e ver passar.** Rodar `npm test` e `npm run build`.
- [ ] **Passo 5: commit.** `git commit -m "feat: moldura visual, créditos do TMDB e telas de erro"`

---

### Tarefa 7: vitrine (tela inicial)

**Em linguagem simples:** a tela principal. Os botões de streaming no topo mudam o endereço (por exemplo, `?servico=netflix`) e, com isso, a vitrine inteira. Logo abaixo ficam o filme em destaque e as fileiras de pôsteres que rolam para o lado. Fileiras vazias somem. Enquanto carrega, aparecem blocos cinza no formato das fileiras.

**Arquivos:**
- Criar:
  - `src/components/catalog/ServiceChips.tsx`
  - `src/components/catalog/PosterCard.tsx`
  - `src/components/catalog/Carousel.tsx` (`"use client"`)
  - `src/components/catalog/MovieRow.tsx`
  - `src/components/catalog/Hero.tsx`
  - `src/components/catalog/Skeletons.tsx`
- Modificar: `src/app/(catalogo)/page.tsx`
- Testes: `src/components/catalog/catalog.test.tsx`, com `vi.mock("next/image")` devolvendo um `<img>` simples

**Interfaces:**
- Consome: `getCategoryMovies`, `getFeatured` (Tarefa 5), `CATEGORIES`, `SERVICES` (Tarefa 1), `parseService`, `withService` (Tarefa 1), `tmdbImage` (Tarefa 3).
- Produz:
  - `ServiceChips({ selected: ServiceSlug | null })`: uma lista de links com "Todos" (`/`) seguido dos seis serviços (`/?servico=<slug>`). O ativo recebe `aria-current="page"`. No celular, a lista rola para o lado.
  - `PosterCard({ movie: MovieSummary })`: link para `/filme/{id}` com `next/image` (`w342`, proporção 2:3, `alt` com o título). Sem pôster, mostra um bloco com o título escrito.
  - `Carousel({ children, label: string })`: uma faixa horizontal com `overflow-x-auto` e `snap-x`. Botões `‹` e `›` (`aria-label` "Rolar para a esquerda" e "Rolar para a direita") aparecem só a partir de `md`, e cada um rola cerca de 90% da largura visível.
  - `MovieRow({ title: string; href?: string; movies: MovieSummary[] })`: título, link `Ver tudo →` (só quando há `href`) e `Carousel` de `PosterCard`. Com `movies` vazio, devolve `null`.
  - `Hero({ featured: NonNullable<Awaited<ReturnType<typeof getFeatured>>> })`: imagem de fundo (`w1280`, com `priority`), título, a linha `Disponível {preposition} {name}` (ou `Disponível nos streamings` quando `service` é `null`) e o botão `Ver detalhes`, que leva a `/filme/{id}`.
  - `HomeSkeleton()`: um bloco de destaque e 3 fileiras cinza animadas.
- Página inicial:
  - `export default function Page({ searchParams }: PageProps<"/">)` só renderiza `<Suspense fallback={<HomeSkeleton />}>` em volta de um componente assíncrono. Com `cacheComponents`, ler `searchParams` exige estar dentro de um `Suspense`.
  - Esse componente lê `parseService(sp.servico)` e chama `getFeatured` e todas as `CATEGORIES` em paralelo com `Promise.allSettled`.
  - Uma fileira que falhou ou veio vazia some.
  - Quando todas somem, mostra `Nenhum filme encontrado para este serviço agora.`
  - O `href` de cada fileira é `withService("/explorar/<slug>", service)`.

- [ ] **Passo 1: escrever os testes que falham**

```tsx
test("ServiceChips marca o ativo e monta os links", () => {
  render(<ServiceChips selected="max" />);
  expect(screen.getByRole("link", { name: "Max" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("link", { name: "Todos" })).toHaveAttribute("href", "/");
  expect(screen.getByRole("link", { name: "Netflix" })).toHaveAttribute("href", "/?servico=netflix");
});
test("PosterCard sem pôster mostra o título", () => {
  render(<PosterCard movie={{ id: 5, title: "Sem Capa", posterPath: null, backdropPath: null, year: null, rating: 0 }} />);
  expect(screen.getByRole("link")).toHaveAttribute("href", "/filme/5");
  expect(screen.getByText("Sem Capa")).toBeInTheDocument();
});
test("MovieRow vazio não renderiza nada", () => {
  const { container } = render(<MovieRow title="Ação" href="/explorar/acao" movies={[]} />);
  expect(container).toBeEmptyDOMElement();
});
test("Hero usa a preposição certa", () => {
  render(<Hero featured={{ movie: m, service: { name: "Netflix", preposition: "na" } }} />);
  expect(screen.getByText("Disponível na Netflix")).toBeInTheDocument();
});
```

- [ ] **Passo 2: rodar e ver falhar.** `npx vitest run src/components/catalog`
- [ ] **Passo 3: implementar** os componentes e a página.
- [ ] **Passo 4: rodar e ver passar.** Rodar `npm test` e `npm run build`.
- [ ] **Passo 5: conferir no navegador.** No `npm run dev`:
  - `/` mostra o destaque e as fileiras com filmes reais.
  - Clicar em "Netflix" troca o endereço para `?servico=netflix`, e o destaque diz "Disponível na Netflix".
  - `/?servico=xyz` se comporta como "Todos".
  - Numa janela de 375 px, as fileiras rolam com o dedo e os botões de streaming rolam para o lado.
- [ ] **Passo 6: commit.** `git commit -m "feat: vitrine com filtro de streaming"`

---

### Tarefa 8: "Ver tudo" com carregar mais

**Em linguagem simples:** ao clicar em "Ver tudo" numa fileira, abre uma grade com mais filmes daquela categoria, respeitando o streaming escolhido. Conforme a pessoa rola até o fim, mais filmes aparecem sozinhos, até acabarem.

**Arquivos:**
- Criar:
  - `src/app/(catalogo)/explorar/[categoria]/page.tsx`
  - `src/app/(catalogo)/explorar/[categoria]/actions.ts`
  - `src/components/catalog/MovieGrid.tsx`
  - `src/components/catalog/LoadMore.tsx` (`"use client"`)
- Testes: `src/app/(catalogo)/explorar/[categoria]/actions.test.ts`, `src/components/catalog/LoadMore.test.tsx`

**Interfaces:**
- Consome: `getCategoryMovies`, `resolveCategory`, `parseService`, `PosterCard`, `GridSkeleton` (acrescentar em `Skeletons.tsx`).
- Produz:
  - `actions.ts` (`"use server"`): `loadMoreMovies(category: string, service: string | null, page: number): Promise<Page<MovieSummary>>`. As entradas são revalidadas aqui, porque uma action pode ser chamada por qualquer um. Categoria inválida lança `Error("Categoria inválida")`. O serviço passa por `parseService`. `page` precisa ser inteiro entre 2 e 500, senão lança erro.
  - `MovieGrid({ movies: MovieSummary[] })`: uma grade responsiva de `PosterCard` (3 colunas no celular, 6 a partir de `lg`).
  - `LoadMore({ category: CategorySlug; service: ServiceSlug | null; initialPage: number; initialHasMore: boolean })`. Um `IntersectionObserver` num marcador no fim da grade chama `loadMoreMovies` e acrescenta os filmes, sem repetir `id`. Para quando `hasMore` é `false`. Em caso de erro, mostra o botão `Tentar carregar mais`.
- Página:
  - Fica dentro de `Suspense`.
  - Categoria inválida chama `notFound()`.
  - O título é o `title` da categoria, mais ` · {nome do serviço}` quando há um serviço.
  - A página 1 é renderizada no servidor, e o `LoadMore` continua a partir da 2.

- [ ] **Passo 1: escrever os testes que falham**

```ts
test("loadMoreMovies rejeita categoria e página inválidas", async () => {
  await expect(loadMoreMovies("series", null, 2)).rejects.toThrow("Categoria inválida");
  await expect(loadMoreMovies("acao", null, 501)).rejects.toThrow();
  await expect(loadMoreMovies("acao", null, 1.5)).rejects.toThrow();
});
test("loadMoreMovies trata serviço inválido como Todos", async () => {
  await loadMoreMovies("acao", "xyz", 2);
  expect(getCategoryMovies).toHaveBeenCalledWith("acao", null, 2);
});
```

```tsx
test("LoadMore sem mais páginas não chama a action", () => { /* initialHasMore false → nenhum observer/chamada; sem botão */ });
test("LoadMore com erro mostra Tentar carregar mais", async () => { /* action rejeita → botão visível */ });
```

- [ ] **Passo 2: rodar e ver falhar.**
- [ ] **Passo 3: implementar.**
- [ ] **Passo 4: rodar e ver passar.** Rodar `npm test` e `npm run build`.
- [ ] **Passo 5: conferir no navegador.**
  - `/explorar/acao?servico=netflix` carrega mais filmes ao rolar.
  - `/explorar/series` mostra "Página não encontrada.".
  - Voltar do filme para a grade mantém a posição da rolagem.
- [ ] **Passo 6: commit.** `git commit -m "feat: página Ver tudo com carregar mais"`

---

### Tarefa 9: página do filme

**Em linguagem simples:** a página de cada filme: imagem grande, pôster, ano, duração, nota, sinopse, trailer, elenco, "Onde assistir no Brasil" separado por tipo (com o crédito à JustWatch) e uma fileira de semelhantes que também estão nos streamings. Se o filme não existir, aparece "Filme não encontrado". Se ele não estiver em nenhum streaming, a página diz isso claramente.

**Arquivos:**
- Criar:
  - `src/app/(catalogo)/filme/[id]/page.tsx`
  - `src/app/(catalogo)/filme/[id]/not-found.tsx`
  - `src/app/(catalogo)/filme/[id]/parse-id.ts`
  - `src/components/movie/WatchProviders.tsx`
  - `src/components/movie/CastList.tsx`
  - `src/components/movie/TrailerButton.tsx` (`"use client"`)
  - `src/components/movie/BackButton.tsx` (`"use client"`)
- Testes: `src/components/movie/movie.test.tsx`, `src/app/(catalogo)/filme/[id]/parse-id.test.ts`

**Interfaces:**
- Consome: `getMovie`, `getSimilarStreaming`, `TmdbNotFoundError`, `MovieRow`, `tmdbImage`, `MovieDetailSkeleton` (acrescentar em `Skeletons.tsx`).
- Produz:
  - `parseMovieId(raw: string): number | null`. Só aceita `^\d+$`, maior que 0.
  - `WatchProviders({ watch: WatchOptions })`:
    - Título `Onde assistir no Brasil`.
    - Grupos, nesta ordem: `Assinatura`, `Grátis com anúncios`, `Aluguel`, `Compra`. Grupo vazio não aparece. Os logos usam `w92`, com `alt` igual ao nome.
    - Com `isEmpty`, mostra `Não está disponível em streaming no Brasil agora.`
    - Sempre mostra `Dados de streaming: JustWatch`, com link para https://www.justwatch.com.
  - `CastList({ cast: CastMember[] })`: foto redonda (`w185`), ou as iniciais quando não há foto, com nome e personagem. Lista vazia não aparece.
  - `TrailerButton({ trailer: Trailer })`:
    - Um botão `▶ Trailer` abre um `<dialog>`.
    - Dentro, um iframe `https://www.youtube-nocookie.com/embed/{youtubeKey}?autoplay=1` com `title` igual ao nome do trailer.
    - O diálogo fecha com Esc, com o botão `Fechar` ou com um clique fora. Ao fechar, o iframe é **removido**, para o som parar.
  - `BackButton()`: `← Voltar`. Usa `router.back()` quando há histórico no site, senão `router.push("/")`.
- Página:
  - Fica dentro de `Suspense`.
  - `parseMovieId` inválido chama `notFound()`. `getMovie` lançando `TmdbNotFoundError` também chama `notFound()`. Outros erros sobem para o `error.tsx`.
  - Os metadados ficam numa linha: `{ano} · {h}h {mm}min · ★ {nota}`. Partes ausentes são omitidas, e a nota usa vírgula (`8,2`).
  - Os gêneros aparecem como etiquetas.
  - A sinopse aparece quando existe.
  - O `TrailerButton` aparece só quando há trailer.
  - "Semelhantes" é uma `MovieRow` sem `href`, ou seja, sem "Ver tudo". Ela fica dentro de um `Suspense` próprio e, se falhar, simplesmente não aparece.
  - `src/app/(catalogo)/filme/[id]/not-found.tsx`: `Filme não encontrado.` e link `Voltar para o catálogo`, que leva a `/`.
  - No celular, tudo fica numa coluna só. A partir de `md`, o pôster fica ao lado do texto.

- [ ] **Passo 1: escrever os testes que falham**

```ts
test("parseMovieId", () => {
  expect(parseMovieId("603")).toBe(603);
  for (const bad of ["abc", "0", "-1", "1.5", "603abc", ""]) expect(parseMovieId(bad)).toBeNull();
});
```

```tsx
test("WatchProviders vazio mostra aviso e crédito", () => {
  render(<WatchProviders watch={{ subscription: [], free: [], rent: [], buy: [], isEmpty: true }} />);
  expect(screen.getByText("Não está disponível em streaming no Brasil agora.")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /JustWatch/ })).toHaveAttribute("href", "https://www.justwatch.com");
});
test("WatchProviders mostra só os grupos com serviços", () => {
  render(<WatchProviders watch={{ subscription: [prov("Netflix")], free: [], rent: [prov("Apple TV")], buy: [], isEmpty: false }} />);
  expect(screen.getByText("Assinatura")).toBeInTheDocument();
  expect(screen.getByText("Aluguel")).toBeInTheDocument();
  expect(screen.queryByText("Compra")).not.toBeInTheDocument();
  expect(screen.getByRole("img", { name: "Netflix" })).toBeInTheDocument();
});
test("TrailerButton remove o vídeo ao fechar", async () => {
  render(<TrailerButton trailer={{ youtubeKey: "abc", name: "Trailer oficial" }} />);
  await user.click(screen.getByRole("button", { name: "▶ Trailer" }));
  expect(screen.getByTitle("Trailer oficial")).toHaveAttribute("src", expect.stringContaining("youtube-nocookie.com/embed/abc"));
  await user.click(screen.getByRole("button", { name: "Fechar" }));
  expect(screen.queryByTitle("Trailer oficial")).not.toBeInTheDocument();
});
test("CastList sem foto mostra iniciais", () => { /* "Keanu Reeves" sem foto → "KR" */ });
```

O jsdom não implementa `HTMLDialogElement.showModal`. Criar um stub em `src/test/setup.ts`.

- [ ] **Passo 2: rodar e ver falhar.**
- [ ] **Passo 3: implementar.**
- [ ] **Passo 4: rodar e ver passar.** Rodar `npm test` e `npm run build`.
- [ ] **Passo 5: conferir no navegador.**
  - `/filme/603` (Matrix) mostra os dados completos e os grupos de streaming.
  - Um filme com sinopse só em inglês mostra o texto em inglês.
  - `/filme/abc` e `/filme/999999999` mostram "Filme não encontrado".
  - O trailer abre, e o som para ao fechar.
  - A partir da vitrine, abrir um filme e clicar em "← Voltar" devolve à mesma altura da rolagem.
- [ ] **Passo 6: commit.** `git commit -m "feat: página do filme com onde assistir, trailer e semelhantes"`

---

### Tarefa 10: busca

**Em linguagem simples:** a busca do cabeçalho leva a uma página de resultados. Ela procura em todo o acervo do TMDB, então avisa que alguns filmes podem não estar em streaming. Busca vazia não consulta nada e só pede que a pessoa digite algo.

**Arquivos:**
- Criar: `src/app/(catalogo)/busca/page.tsx`
- Modificar: `src/lib/params.ts`, para acrescentar `normalizeQuery`
- Testes: `src/lib/params.test.ts`, para acrescentar casos

**Interfaces:**
- Consome: `searchMovies`, `MovieGrid`, `SearchForm`, `GridSkeleton`. O `LoadMore` não é usado, porque a busca é paginada por links (veja abaixo).
- Produz:
  - `normalizeQuery(value: string | string[] | undefined): string | null`. Tira espaços das pontas, junta espaços repetidos e corta em 100 caracteres. Fica `null` quando o resultado é vazio ou quando chega um array.
- Página `/busca`:
  - Fica dentro de `Suspense`.
  - Mostra um `SearchForm` grande, com `defaultValue` igual ao termo.
  - Com `q` nulo, mostra `Digite o nome de um filme para buscar.` e não chama a API.
  - Com resultados, mostra o aviso `Os resultados podem incluir filmes que não estão em nenhum streaming no Brasil.` e o `MovieGrid`.
  - Sem resultados, mostra `Nenhum filme encontrado para "{q}".`
  - Paginação: um link `Mais resultados` para `/busca?q=…&pagina=N+1` quando `hasMore` é verdadeiro. A página vem de `pagina`, entre 1 e 500, e vira 1 quando é inválida.

- [ ] **Passo 1: escrever os testes que falham**

```ts
test("normalizeQuery", () => {
  expect(normalizeQuery("  duna   parte  dois ")).toBe("duna parte dois");
  expect(normalizeQuery("   ")).toBeNull();
  expect(normalizeQuery(undefined)).toBeNull();
  expect(normalizeQuery(["a", "b"])).toBeNull();
  expect(normalizeQuery("x".repeat(150))).toHaveLength(100);
});
```

- [ ] **Passo 2: rodar e ver falhar.**
- [ ] **Passo 3: implementar** `normalizeQuery` e a página.
- [ ] **Passo 4: rodar e ver passar.** Rodar `npm test` e `npm run build`.
- [ ] **Passo 5: conferir no navegador.**
  - Buscar "Matrix" pelo cabeçalho leva a `/busca?q=Matrix`, com o aviso e os resultados.
  - `/busca?q=%20%20` mostra o pedido para digitar.
  - Um termo sem resultados (`zzzzqqq`) mostra a mensagem.
- [ ] **Passo 6: commit.** `git commit -m "feat: busca de filmes"`

---

### Tarefa 11: verificação final

**Em linguagem simples:** antes de dizer que está pronto, o site inteiro é testado como um visitante faria, no computador e no celular. Isso confirma que as regras do plano (crédito, chave escondida, filmes sempre disponíveis) estão valendo.

**Arquivos:** nenhum arquivo novo. Pequenas correções vão no arquivo de origem.

- [ ] **Passo 1:** `npm test`, `npm run lint` e `npm run build` devem passar sem erros.
- [ ] **Passo 2: a chave não vaza.** Rodar `npm run build && grep -r "$(grep TMDB_READ_ACCESS_TOKEN .env.local | cut -d= -f2 | cut -c1-20)" .next/static`. Esperado: nenhum resultado.
- [ ] **Passo 3: roteiro manual** com `npm run start`, em 1280 px e em 375 px:
  - Vitrine em "Todos" e em cada um dos 6 serviços.
  - Escolher um filme ao acaso numa fileira de Netflix e conferir que a página dele lista a Netflix em Assinatura.
  - Em "Apple TV+", conferir que fileiras vazias somem.
  - Seguir "Ver tudo", rolar e voltar.
  - Abrir um filme, ver o trailer, voltar.
  - Buscar algo antigo, como "Casablanca", e conferir a mensagem de indisponível.
  - Conferir os créditos do TMDB e da JustWatch.
- [ ] **Passo 4: commit** de eventuais correções. `git commit -m "fix: ajustes da verificação final"`
