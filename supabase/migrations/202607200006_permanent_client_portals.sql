create type public.approval_batch_status as enum ('draft', 'open', 'closed', 'archived');

alter table public.clients add column portal_slug text;

update public.clients
set portal_slug = lower(regexp_replace(coalesce(nullif(instagram, ''), name), '[^a-zA-Z0-9]+', '', 'g'));

alter table public.clients
  alter column portal_slug set not null,
  add constraint clients_portal_slug_format check (portal_slug ~ '^[a-z0-9][a-z0-9-]{2,79}$');

create unique index clients_portal_slug_unique on public.clients(lower(portal_slug));

create table public.client_approvers (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  email text not null,
  name text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index client_approvers_email_unique
  on public.client_approvers(client_id, lower(email));

create table public.approval_batches (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  calendar_id uuid references public.content_calendars(id) on delete set null,
  title text not null,
  slug text not null,
  status public.approval_batch_status not null default 'draft',
  created_by uuid references auth.users(id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, slug)
);

create unique index approval_batches_open_calendar_unique
  on public.approval_batches(client_id, calendar_id)
  where status = 'open' and calendar_id is not null;

create table public.approval_batch_posts (
  batch_id uuid not null references public.approval_batches(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  position integer not null default 0,
  version_at_publish integer not null default 1,
  created_at timestamptz not null default now(),
  primary key (batch_id, post_id),
  unique (batch_id, position)
);

insert into public.client_approvers (client_id, email, name)
select id, lower(trim(email)), contact_name
from public.clients
where length(trim(email)) > 3
on conflict do nothing;

alter table public.client_approvers enable row level security;
alter table public.approval_batches enable row level security;
alter table public.approval_batch_posts enable row level security;

create policy "team manages client approvers" on public.client_approvers
for all to authenticated
using (exists (
  select 1 from public.clients c
  where c.id = client_id and c.organization_id = public.current_organization_id()
))
with check (exists (
  select 1 from public.clients c
  where c.id = client_id and c.organization_id = public.current_organization_id()
));

create policy "team manages approval batches" on public.approval_batches
for all to authenticated
using (exists (
  select 1 from public.clients c
  where c.id = client_id and c.organization_id = public.current_organization_id()
))
with check (exists (
  select 1 from public.clients c
  where c.id = client_id and c.organization_id = public.current_organization_id()
));

create policy "team manages batch posts" on public.approval_batch_posts
for all to authenticated
using (exists (
  select 1 from public.approval_batches b
  join public.clients c on c.id = b.client_id
  where b.id = batch_id and c.organization_id = public.current_organization_id()
))
with check (exists (
  select 1 from public.approval_batches b
  join public.clients c on c.id = b.client_id
  where b.id = batch_id and c.organization_id = public.current_organization_id()
));

create index client_approvers_client_idx on public.client_approvers(client_id, active);
create index approval_batches_client_idx on public.approval_batches(client_id, status, published_at desc);
create index approval_batch_posts_batch_idx on public.approval_batch_posts(batch_id, position);

create or replace function public.prepare_client_portal()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.portal_slug is null or length(trim(new.portal_slug)) = 0 then
    new.portal_slug := lower(regexp_replace(coalesce(nullif(new.instagram, ''), new.name), '[^a-zA-Z0-9]+', '', 'g'));
  else
    new.portal_slug := lower(trim(both '-' from regexp_replace(new.portal_slug, '[^a-zA-Z0-9-]+', '-', 'g')));
  end if;
  return new;
end;
$$;

create trigger clients_prepare_portal_slug
before insert or update of portal_slug on public.clients
for each row execute function public.prepare_client_portal();

create or replace function public.create_primary_client_approver()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is not null and length(trim(new.email)) > 3 then
    insert into public.client_approvers (client_id, email, name)
    values (new.id, lower(trim(new.email)), new.contact_name)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger clients_create_primary_approver
after insert on public.clients
for each row execute function public.create_primary_client_approver();
