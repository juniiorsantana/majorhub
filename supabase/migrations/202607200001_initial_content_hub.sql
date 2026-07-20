create extension if not exists pgcrypto;

create type public.team_role as enum ('admin', 'editor');
create type public.client_status as enum ('active', 'archived');
create type public.post_status as enum ('draft', 'pending_review', 'changes_requested', 'in_progress', 'approved', 'published', 'archived');
create type public.post_format as enum ('image', 'carousel', 'video', 'reel');
create type public.review_decision as enum ('approved', 'changes_requested');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.team_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  role public.team_role not null default 'editor',
  created_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  contact_name text,
  email text not null,
  instagram text,
  phone text,
  avatar_path text,
  internal_notes text,
  status public.client_status not null default 'active',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  scheduled_at timestamptz,
  format public.post_format not null default 'image',
  caption text not null default '',
  hashtags text not null default '',
  internal_notes text,
  status public.post_status not null default 'draft',
  current_version integer not null default 1 check (current_version > 0),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  storage_path text not null,
  mime_type text not null,
  position integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now(),
  unique (post_id, position)
);

create table public.post_versions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (post_id, version)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  version integer not null,
  decision public.review_decision not null,
  comment text,
  reviewer_name text,
  created_at timestamptz not null default now(),
  constraint correction_requires_comment check (decision <> 'changes_requested' or length(trim(comment)) > 0)
);

create table public.share_links (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create or replace function public.current_organization_id()
returns uuid language sql stable security definer set search_path = public
as $$ select organization_id from public.team_members where user_id = auth.uid() $$;

alter table public.organizations enable row level security;
alter table public.team_members enable row level security;
alter table public.clients enable row level security;
alter table public.posts enable row level security;
alter table public.media_assets enable row level security;
alter table public.post_versions enable row level security;
alter table public.reviews enable row level security;
alter table public.share_links enable row level security;

create policy "team reads own organization" on public.organizations for select to authenticated using (id = public.current_organization_id());
create policy "team reads colleagues" on public.team_members for select to authenticated using (organization_id = public.current_organization_id());
create policy "team manages own clients" on public.clients for all to authenticated using (organization_id = public.current_organization_id()) with check (organization_id = public.current_organization_id());
create policy "team manages client posts" on public.posts for all to authenticated using (exists (select 1 from public.clients c where c.id = client_id and c.organization_id = public.current_organization_id())) with check (exists (select 1 from public.clients c where c.id = client_id and c.organization_id = public.current_organization_id()));
create policy "team manages post media" on public.media_assets for all to authenticated using (exists (select 1 from public.posts p join public.clients c on c.id = p.client_id where p.id = post_id and c.organization_id = public.current_organization_id())) with check (exists (select 1 from public.posts p join public.clients c on c.id = p.client_id where p.id = post_id and c.organization_id = public.current_organization_id()));
create policy "team manages post versions" on public.post_versions for all to authenticated using (exists (select 1 from public.posts p join public.clients c on c.id = p.client_id where p.id = post_id and c.organization_id = public.current_organization_id())) with check (exists (select 1 from public.posts p join public.clients c on c.id = p.client_id where p.id = post_id and c.organization_id = public.current_organization_id()));
create policy "team manages reviews" on public.reviews for all to authenticated using (exists (select 1 from public.posts p join public.clients c on c.id = p.client_id where p.id = post_id and c.organization_id = public.current_organization_id())) with check (exists (select 1 from public.posts p join public.clients c on c.id = p.client_id where p.id = post_id and c.organization_id = public.current_organization_id()));
create policy "team manages share links" on public.share_links for all to authenticated using (exists (select 1 from public.clients c where c.id = client_id and c.organization_id = public.current_organization_id())) with check (exists (select 1 from public.clients c where c.id = client_id and c.organization_id = public.current_organization_id()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('client-media', 'client-media', false, 52428800, array['image/jpeg','image/png','image/webp','video/mp4','video/quicktime'])
on conflict (id) do nothing;

create policy "team reads organization media" on storage.objects for select to authenticated
using (bucket_id = 'client-media' and (storage.foldername(name))[1] = public.current_organization_id()::text);
create policy "team uploads organization media" on storage.objects for insert to authenticated
with check (bucket_id = 'client-media' and (storage.foldername(name))[1] = public.current_organization_id()::text);
create policy "team updates organization media" on storage.objects for update to authenticated
using (bucket_id = 'client-media' and (storage.foldername(name))[1] = public.current_organization_id()::text);
create policy "team deletes organization media" on storage.objects for delete to authenticated
using (bucket_id = 'client-media' and (storage.foldername(name))[1] = public.current_organization_id()::text);

create index clients_organization_idx on public.clients(organization_id, status);
create index posts_client_status_idx on public.posts(client_id, status, scheduled_at);
create index media_assets_post_idx on public.media_assets(post_id, position);

-- Restringe helpers SECURITY DEFINER aos usuários autenticados.
revoke all on function public.current_organization_id() from public;
grant execute on function public.current_organization_id() to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.team_members
    where user_id = auth.uid() and role = 'admin'
  )
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;