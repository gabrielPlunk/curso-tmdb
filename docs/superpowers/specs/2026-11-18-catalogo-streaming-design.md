# Catálogo de filmes nos streamings: design

Data: 2026-11-18
Status: aprovado (2026-11-18)

## 1. Intenção e motivo

Um site para **descobrir filmes disponíveis agora nos streamings do Brasil**. A navegação é visual, no estilo vitrine da Netflix: fileiras de pôsteres por categoria e gênero, que podem ser filtradas por serviço de streaming.

O projeto é **de estudo**. O autor está acompanhando um curso em vídeo que ensina passo a passo com Next.js (App Router), React e Tailwind. Daí vêm algumas consequências:

- **O app não precisa ficar igual ao do curso.** O objetivo é o autor entender as **etapas** de construir um app assim.
- **O autor não escreve código; ele é leigo em programação.** Quem constrói é o Claude. O plano segue a ordem técnica, mas cada etapa deve vir com uma explicação curta, em linguagem simples, do que ela faz e por que existe, para o autor acompanhar e aprender.
- **As decisões técnicas ficam com quem constrói.** As decisões que vão para o autor são as que mudam a experiência de quem usa o site.
- O plano usa a mesma tecnologia do curso (Next.js, React, Tailwind), sem inventar outra.
- O plano trata como parte do trabalho os cuidados que tutoriais costumam pular: chave protegida, estados de carregamento e erro, casos vazios e crédito às fontes de dados.
- O autor quer explorar no futuro uma **área do usuário** com outras funções. O projeto deve ser organizado para que ela entre sem refazer o que existe.

## 2. Objetivos, fora de escopo e anti-objetivos

**Objetivos**
- Vitrine visual bonita, focada em descoberta, que funcione bem no computador e no celular.
- Todo filme mostrado na vitrine pode ser assistido agora no Brasil, por assinatura ou de graça com anúncios.
- Filtro por serviço de streaming que muda a vitrine inteira.
- Página de filme com informações completas e "onde assistir".
- Código organizado para receber a área do usuário depois.

**Fora de escopo (agora)**
- Séries. O app só trata de filmes.
- Outros países. O app só trata do Brasil (`watch_region=BR`).
- Novidades do tipo "chegou esta semana na Netflix". A API não informa desde quando um filme está num serviço.
- Botão que abre o filme direto no streaming. A API não fornece esses links.
- Login, contas, favoritos, lista para assistir e "meus streamings" salvos. Isso tudo fica para a área do usuário futura.
- Escolher vários serviços ao mesmo tempo no filtro.

**Anti-objetivos (o que tornaria o projeto um fracasso mesmo funcionando)**
- A pessoa clica num filme da vitrine e descobre que ele não está em nenhum streaming.
- A chave do TMDB aparece no navegador.
- Faltar o crédito à JustWatch ou ao TMDB, o que pode fazer o TMDB revogar o acesso à API.
- Fileiras ou espaços vazios e quebrados quando falta dado (sem pôster, sem sinopse, filtro sem resultados).
- Uma estrutura que obrigue a reescrever a vitrine para adicionar login no futuro.

## 3. Restrições

- **Tecnologia:** Next.js com App Router, React e Tailwind CSS, como recomendado pelo curso. Versões escolhidas pelo Claude: Next.js 16 (hoje na 16.4.6) e Tailwind CSS 4 (hoje na 4.3.5), as estáveis mais recentes, com TypeScript, rodando no Node.js 22 já instalado. O cache usa o modelo do Next 16 (`"use cache"` com `cacheLife`). Ter instalado Node.js e Python na preparação do curso não muda nada aqui, porque o Python não faz parte deste design.
- **Fonte de dados:** API v3 do TMDB, com autenticação pelo Read Access Token (Bearer).
- **Onde assistir:** os dados vêm da JustWatch, via TMDB (`/movie/{id}/watch/providers`). O crédito à JustWatch é **obrigatório** onde essa informação aparece.
- **Crédito ao TMDB:** logo e o aviso "This product uses the TMDB API but is not endorsed or certified by TMDB." no rodapé.
- **Idioma:** pt-BR. Quando a sinopse ou o trailer não existirem em português, usar a versão em inglês em vez de deixar vazio.
- **Limites da API:** a resposta de `discover`, `search` e `similar` não diz em quais serviços cada filme está. Saber isso exige uma consulta por filme. O design evita depender disso nas listas.

## 4. Abordagens consideradas

**Como buscar os dados**

| Abordagem | Como funciona | Troca |
|---|---|---|
| **A. Servidor do Next busca (escolhida)** | Server Components chamam o TMDB no servidor, com cache. Só as partes interativas rodam no navegador (carrosséis, "carregar mais"). | A chave nunca vai para o navegador, a primeira carga é rápida, há cache entre visitas e a base já serve para login no futuro. O modelo de servidor e cliente do App Router tem uma curva de aprendizado. |
| B. Navegador busca | Componentes de cliente pedem a rotas internas (`/api/...`) que repassam para o TMDB. | Mais familiar para quem vem de React clássico. Tem mais código no navegador e indicadores de carregamento em toda tela, e aproveita pouco do App Router. |
| Descartada: servidor separado em Python | API em Python entre o Next e o TMDB. | Duplica o servidor que o Next já tem, sem ganho para este escopo. |

O autor escolheu **A**.

**Decisões de produto tomadas com abordagens comparadas**
- **Conteúdo da vitrine:** só filmes disponíveis em streaming no Brasil, e não tudo o que está em alta. O autor escolheu "só disponíveis" para nunca frustrar quem clica. O custo é que "Em alta" significa "populares que estão no streaming", porque o endpoint `trending` não aceita filtro de serviço.
- **Tipos de acesso na vitrine:** só assinatura (`flatrate`) e grátis com anúncios (`free`, `ads`). Aluguel e compra aparecem só na página do filme, como informação extra.
- **Tela inicial:** foram comparadas três versões (A: destaque e gêneros; **B: a mesma vitrine com filtro de streaming no topo**; C: fileiras de serviço misturadas com gêneros). O autor escolheu **B**.
- **Ao clicar no filme:** página própria (`/filme/[id]`) ou janela sobre a vitrine. O autor escolheu a **página própria**.
- **Busca:** mostrar todos os resultados, filtrar consultando cada um ou não ter busca. O autor escolheu **mostrar todos**, com aviso na lista e mensagem clara na página do filme quando ele não está em streaming.
- **Plataforma:** site que funciona no computador e no celular. O autor escolheu esse formato.

## 5. O que foi decidido

### 5.1 Tela inicial (`/`)

```
[CATÁLOGO]                                   [🔍 Buscar]
(Todos) (Netflix) (Prime Video) (Disney+) (Max) (Apple TV+) (Globoplay)
┌──────────────────────────────────────────────────────┐
│  Filme em destaque (imagem de fundo grande)          │
│  Disponível na Netflix         [Ver detalhes]        │
└──────────────────────────────────────────────────────┘
Em alta                                       Ver tudo →
[pôster][pôster][pôster][pôster][pôster] →
Ação                                          Ver tudo →
[pôster][pôster][pôster][pôster][pôster] →
...
```

- **Filtro de streaming no topo**, com um serviço por vez e o valor guardado no endereço (`/?servico=netflix`). Isso permite compartilhar o link, faz o filtro funcionar no servidor e prepara o "meus streamings" salvo no futuro.
- **Serviços (lista fixa):** Netflix, Prime Video, Disney+, HBO Max, Apple TV e Globoplay (nomes atualizados em 2026-11-18 para bater com o TMDB no Brasil; antes "Max" e "Apple TV+").
- **"Todos" quer dizer qualquer um desses seis** (`with_watch_providers` com IDs separados por `|`), e não qualquer streaming do Brasil.
- **Todas as fileiras** usam `discover/movie` com `watch_region=BR`, `with_watch_monetization_types=flatrate|free|ads`, os serviços do filtro e, quando for o caso, `with_genres`.
- **"Em alta"** é ordenada por popularidade (`sort_by=popularity.desc`).
- **Pôsteres não levam selo do serviço**, porque isso custaria uma consulta por filme. Com um serviço selecionado, a pessoa já sabe onde tudo está.
- **Destaque:** fica no topo e mostra o serviço onde o filme está.
- **Cada fileira tem "Ver tudo".**
- **Fileira sem resultados não aparece.**
- **Visual:** escuro, com cara de vitrine, e fileiras que rolam para o lado. No computador, a rolagem é com setas ou mouse. No celular, é arrastando com o dedo.

### 5.2 Página "Ver tudo"

- Grade de pôsteres da categoria ou do gênero, respeitando o serviço selecionado.
- Carrega mais filmes conforme a pessoa rola (páginas do `discover`).

### 5.3 Página do filme (`/filme/[id]`)

```
[imagem de fundo]            ← Voltar
[pôster]  Título
          2024 · 2h 46min · ★ 8,2   [Gênero] [Gênero]
          Sinopse...
          [▶ Trailer]
Onde assistir no Brasil
  Assinatura:        [logo][logo]
  Grátis com anúncio: [logo]
  Aluguel:           [logo]
  Compra:            [logo]
  Dados de streaming: JustWatch
Elenco      (o) (o) (o) (o) (o)
Semelhantes [pôster][pôster][pôster] →
```

- **"Onde assistir"** fica separado por tipo de acesso. Um grupo sem serviços não aparece.
- **Sem nenhum serviço no Brasil:** a seção mostra "Não está disponível em streaming no Brasil agora". Isso vale principalmente para filmes que chegam pela busca.
- **Sinopse e trailer:** em português quando existirem. Senão, em inglês.
- **Ao voltar para a vitrine**, a rolagem vertical continua onde estava.

### 5.4 Busca

- Fica no cabeçalho e procura em todo o acervo (`search/movie`, `language=pt-BR`, `region=BR`).
- A lista de resultados tem um aviso discreto de que pode incluir filmes fora dos streamings.
- Não filtra por serviço.

### 5.5 Preparação para a área do usuário

Nada da área do usuário é construído agora. O que se pede é organização:

- **Todo o acesso ao TMDB fica numa camada única, que só roda no servidor** (por exemplo, `lib/tmdb/`, com `import "server-only"`). As páginas recebem dados já tratados, nunca a resposta crua da API.
- **Estado de navegação no endereço** (serviço selecionado, página da grade). No futuro, a preferência salva do usuário só passa a alimentar esse mesmo parâmetro.
- **Rotas organizadas em grupos** (por exemplo, `app/(catalogo)/...`), deixando espaço para um `app/(conta)/...` futuro com layout próprio.

## 6. Decisões tomadas por mim (Claude), que o autor pode revisar

- **Lista de gêneros:** Ação, Comédia, Drama, Terror, Ficção científica, Animação, Romance e Suspense, nessa ordem, depois de "Em alta".
- **Destaque:** o filme mais popular do filtro atual que tenha imagem de fundo.
- **Semelhantes:** em vez do endpoint `similar` do TMDB, que não filtra por streaming, usar o `discover` com os gêneros principais do filme, os seis serviços e o Brasil, tirando o próprio filme. Assim, a promessa da vitrine (tudo pode ser assistido) vale também aqui.
- **Cache:** listas da vitrine guardadas por 6 horas. Detalhes do filme e "onde assistir" guardados por 24 horas.
- **Imagens:** pelo `next/image`, com `image.tmdb.org` liberado. Quando faltar pôster ou foto do elenco, mostrar um marcador de lugar com o título ou as iniciais.
- **Erros:** se o TMDB falhar, mostrar uma tela de erro amigável com "Tentar de novo" (`error.tsx`). Uma fileira que falhar some, sem derrubar a vitrine inteira.
- **Carregamento:** esqueletos cinza no formato das fileiras e da página do filme (`loading.tsx` e `Suspense`).
- **Carrosséis:** a posição horizontal de cada fileira **não** precisa ser lembrada ao voltar. Só a rolagem vertical.
- **Busca como página de resultados:** o endereço fica `/busca?q=...`, a página é renderizada no servidor e o termo fica no endereço, como o resto do app. Não haverá sugestões aparecendo enquanto a pessoa digita.
- **Endereço do "Ver tudo":** `/explorar/[categoria]?servico=...`, sendo `em-alta` ou o gênero.
- **Serviço mostrado no destaque:** se o filme estiver em mais de um dos seis serviços, mostrar o primeiro pela ordem de `display_priority` da API. Com um serviço selecionado no filtro, mostrar esse.
- **Repetição entre fileiras:** um filme pode aparecer em mais de uma fileira (em "Em alta" e em "Ação", por exemplo). A Netflix também faz assim.
- **Trailer:** abre o vídeo do YouTube numa janela sobre a página do filme.
- **Rótulos dos tipos de acesso:** Assinatura, Grátis com anúncios, Aluguel, Compra. Na API, `free` e `ads` aparecem juntos no grupo grátis.

## 7. O que fica a critério de quem constrói

- **IDs dos serviços:** confirmar os IDs no Brasil consultando `/watch/providers/movie?watch_region=BR`. Os conhecidos são Netflix 8, Prime Video 119, Disney+ 337, Max 1899, Apple TV+ 350 e Globoplay 307. O Max mudou de ID no passado.
- **Chamadas da página do filme:** como buscar detalhes, vídeos, elenco e "onde assistir". `append_to_response` costuma resolver numa chamada só.
- **Biblioteca dos carrosséis:** pode ser uma ou CSS puro com scroll-snap.
- **Como o "carregar mais" busca as próximas páginas:** Server Action ou Route Handler, desde que use a mesma camada `lib/tmdb`.
- **Testes:** proporcionais a um projeto de estudo. Vale priorizar a camada `lib/tmdb` (montagem dos filtros, agrupamento do "onde assistir", troca para inglês quando falta texto).
- **Nomes de pastas, componentes e detalhes visuais**, desde que mantenham a cara de vitrine escura.
- **Variável de ambiente da chave:** por exemplo, `TMDB_READ_ACCESS_TOKEN` em `.env.local`, fora do controle de versão.
