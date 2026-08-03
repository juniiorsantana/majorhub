create type public.client_access_role as enum ('client_admin', 'approver', 'viewer');
create type public.client_access_status as enum ('active', 'suspended');
create type public.review_actor_type as enum ('legacy', 'client', 'major');
create type public.portal_access_event_type as enum (
  'login_succeeded',
  'login_failed',
  'logout',
  'password_changed',
  'portal_viewed',
  'review_submitted',
  'access_suspended',
  'access_reactivated'
);

create table public.client_memberships (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  role public.client_access_role not null default 'approver',
  status public.client_access_status not null default 'active',
  must_change_password boolean not null default true,
  last_access_at timestamptz,
  last_password_change_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_memberships_email_normalized check (email = lower(trim(email))),
  constraint client_memberships_email_shape check (position('@' in email) > 1)
);

create unique index client_memberships_client_user_unique
  on public.client_memberships(client_id, user_id);

create unique index client_memberships_client_email_unique
  on public.client_memberships(client_id, lower(email));

create index client_memberships_user_idx
  on public.client_memberships(user_id, status);

create index client_memberships_client_idx
  on public.client_memberships(client_id, status, role);

create or replace function public.prepare_client_membership()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.email := lower(trim(new.email));
  new.name := trim(new.name);
  new.updated_at := now();
  return new;
end;
$$;

create trigger client_memberships_prepare
before insert or update on public.client_memberships
for each row execute function public.prepare_client_membership();

create or replace function public.has_active_client_membership(
  target_client_id uuid,
  allowed_roles public.client_access_role[] default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.client_memberships membership
    where membership.client_id = target_client_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
      and (allowed_roles is null or membership.role = any(allowed_roles))
  )
$$;

create or replace function public.is_team_member_for_client(target_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.clients client
    join public.team_members member
      on member.organization_id = client.organization_id
    where client.id = target_client_id
      and member.user_id = auth.uid()
  )
$$;

create or replace function public.is_team_admin_for_client(target_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.clients client
    join public.team_members member
      on member.organization_id = client.organization_id
    where client.id = target_client_id
      and member.user_id = auth.uid()
      and member.role = 'admin'
  )
$$;

revoke all on function public.has_active_client_membership(uuid, public.client_access_role[]) from public;
revoke all on function public.is_team_member_for_client(uuid) from public;
revoke all on function public.is_team_admin_for_client(uuid) from public;
grant execute on function public.has_active_client_membership(uuid, public.client_access_role[]) to authenticated;
grant execute on function public.is_team_member_for_client(uuid) to authenticated;
grant execute on function public.is_team_admin_for_client(uuid) to authenticated;

alter table public.client_memberships enable row level security;

create policy "team reads client memberships"
on public.client_memberships
for select to authenticated
using (public.is_team_member_for_client(client_id));

create policy "members read own membership"
on public.client_memberships
for select to authenticated
using (user_id = auth.uid());

create policy "team admins create client memberships"
on public.client_memberships
for insert to authenticated
with check (public.is_team_admin_for_client(client_id));

create policy "team admins update client memberships"
on public.client_memberships
for update to authenticated
using (public.is_team_admin_for_client(client_id))
with check (public.is_team_admin_for_client(client_id));

create policy "team admins delete client memberships"
on public.client_memberships
for delete to authenticated
using (public.is_team_admin_for_client(client_id));

create table public.portal_access_events (
  id bigint generated always as identity primary key,
  client_id uuid not null references public.clients(id) on delete cascade,
  membership_id uuid references public.client_memberships(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  event_type public.portal_access_event_type not null,
  email_snapshot text,
  ip_hash text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint portal_access_events_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index portal_access_events_client_idx
  on public.portal_access_events(client_id, created_at desc);

create index portal_access_events_user_idx
  on public.portal_access_events(user_id, created_at desc)
  where user_id is not null;

alter table public.portal_access_events enable row level security;

create policy "team reads portal access events"
on public.portal_access_events
for select to authenticated
using (public.is_team_member_for_client(client_id));

create policy "members record own portal events"
on public.portal_access_events
for insert to authenticated
with check (
  user_id = auth.uid()
  and membership_id is not null
  and exists (
    select 1
    from public.client_memberships membership
    where membership.id = membership_id
      and membership.client_id = portal_access_events.client_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
  )
);

alter table public.reviews
  add column reviewer_user_id uuid references auth.users(id) on delete set null,
  add column reviewer_membership_id uuid references public.client_memberships(id) on delete set null,
  add column reviewer_email_snapshot text,
  add column actor_type public.review_actor_type not null default 'legacy';

alter table public.reviews
  add constraint reviews_verified_actor_check check (
    actor_type = 'legacy'
    or (actor_type = 'client' and reviewer_user_id is not null and reviewer_membership_id is not null)
    or (actor_type = 'major' and reviewer_user_id is not null)
  );

create index reviews_reviewer_user_idx
  on public.reviews(reviewer_user_id, created_at desc)
  where reviewer_user_id is not null;

create index reviews_reviewer_membership_idx
  on public.reviews(reviewer_membership_id, created_at desc)
  where reviewer_membership_id is not null;
