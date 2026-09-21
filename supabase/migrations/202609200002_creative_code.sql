-- Código da peça no plano de conteúdo do cliente (R01, C03).
-- É a chave que liga a arte aprovada aqui à pauta e ao resultado de mídia
-- que vivem no painel do cliente. Único por cliente, nunca global: clientes
-- diferentes repetem R01 sem se atrapalharem.

alter table public.posts
  add column creative_code text;

alter table public.posts
  add constraint posts_creative_code_format
  check (creative_code is null or creative_code ~ '^[A-Z0-9][A-Z0-9-]{0,23}$');

create unique index posts_client_creative_code_unique
  on public.posts (client_id, creative_code)
  where creative_code is not null;
