-- Tabela das marcações "Quero assistir" e "Já assisti".
-- Como usar: no painel do Supabase, abra SQL Editor, cole este arquivo inteiro e clique em Run.

-- 1) A tabela. Uma linha por filme por pessoa: um filme fica em no máximo uma das listas.
create table public.marcacoes (
  -- Dono da marcação. Se a conta for apagada, as marcações vão junto.
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Id do filme no TMDB.
  movie_id integer not null check (movie_id > 0),
  -- Em qual lista o filme está.
  status text not null check (status in ('quero', 'assisti')),
  -- Título e pôster guardados junto, para o perfil abrir sem consultar o TMDB.
  title text not null,
  poster_path text,
  -- Quando foi marcado (o perfil mostra o mais recente primeiro).
  marked_at timestamptz not null default now(),
  primary key (user_id, movie_id)
);

-- 2) Índice para buscar rápido "as marcações desta pessoa, das mais recentes para as mais antigas".
create index marcacoes_user_marked_idx on public.marcacoes (user_id, marked_at desc);

-- 3) Permissão para contas logadas usarem a tabela (as regras abaixo ainda limitam às próprias linhas).
--    Projetos novos do Supabase podem não dar essa permissão sozinhos; repetir não faz mal.
grant select, insert, update, delete on public.marcacoes to authenticated;

-- 4) Segurança (RLS = Row Level Security). Com ela ligada, o banco recusa tudo que não tiver uma regra liberando.
alter table public.marcacoes enable row level security;

-- Cada regra libera uma operação só para as linhas da própria pessoa logada.
create policy "ler as próprias marcações" on public.marcacoes
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "criar as próprias marcações" on public.marcacoes
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "alterar as próprias marcações" on public.marcacoes
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "apagar as próprias marcações" on public.marcacoes
  for delete to authenticated
  using ((select auth.uid()) = user_id);
