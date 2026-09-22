-- Heartbeat do projeto Supabase.
--
-- O plano Free pausa o projeto depois de 7 dias sem atividade, e quem decide
-- a pausa é a plataforma, não o Postgres: trigger interno ou pg_cron não
-- contam como atividade. Por isso o ping precisa chegar de fora, pela API
-- (a rota /api/cron/keep-alive, agendada uma vez por dia na Vercel).
--
-- A tabela guarda uma linha só e o ping é sempre update, nunca insert: ela
-- não cresce, então o custo de storage é zero.

create table public.keep_alive (
  id smallint primary key default 1 check (id = 1),
  last_ping_at timestamptz not null default now(),
  ping_count bigint not null default 0,
  source text
);

insert into public.keep_alive (id) values (1) on conflict (id) do nothing;

alter table public.keep_alive enable row level security;

-- Sem policy nenhuma de propósito: com RLS ligado e zero policies, anon e
-- authenticated não enxergam nada. Só a service_role (que ignora RLS) escreve.
revoke all on table public.keep_alive from anon, authenticated;
grant select, update on table public.keep_alive to service_role;

create or replace function public.touch_keep_alive(ping_source text default null)
returns public.keep_alive
language sql
volatile
security definer
set search_path = public
as $$
  update public.keep_alive
  set last_ping_at = now(),
      ping_count = ping_count + 1,
      source = coalesce(nullif(trim(ping_source), ''), source)
  where id = 1
  returning *
$$;

revoke all on function public.touch_keep_alive(text) from public, anon, authenticated;
grant execute on function public.touch_keep_alive(text) to service_role;
