begin;

create extension if not exists pgtap with schema extensions;

select plan(18);

select ok(to_regclass('public.client_memberships') is not null, 'client_memberships exists');
select ok(to_regclass('public.portal_access_events') is not null, 'portal_access_events exists');

select ok(
  exists (
    select 1 from pg_type
    where typname = 'client_access_role'
      and typnamespace = 'public'::regnamespace
  ),
  'client_access_role enum exists'
);

select ok(
  exists (
    select 1 from pg_type
    where typname = 'client_access_status'
      and typnamespace = 'public'::regnamespace
  ),
  'client_access_status enum exists'
);

select ok(
  exists (
    select 1 from pg_type
    where typname = 'portal_access_event_type'
      and typnamespace = 'public'::regnamespace
  ),
  'portal_access_event_type enum exists'
);

select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'client_memberships'
      and column_name = 'must_change_password'
  ),
  'client_memberships tracks temporary passwords'
);

select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'client_memberships'
      and column_name = 'last_access_at'
  ),
  'client_memberships tracks last access'
);

select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'reviews'
      and column_name = 'reviewer_user_id'
  ),
  'reviews tracks authenticated user'
);

select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'reviews'
      and column_name = 'reviewer_membership_id'
  ),
  'reviews tracks client membership'
);

select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'reviews'
      and column_name = 'actor_type'
  ),
  'reviews distinguishes legacy, client and Major actors'
);

select is(
  (select relrowsecurity from pg_class where oid = 'public.client_memberships'::regclass),
  true,
  'RLS is enabled on client_memberships'
);

select is(
  (select relrowsecurity from pg_class where oid = 'public.portal_access_events'::regclass),
  true,
  'RLS is enabled on portal_access_events'
);

select ok(
  exists (
    select 1 from pg_proc
    where proname = 'has_active_client_membership'
      and pronamespace = 'public'::regnamespace
  ),
  'membership authorization helper exists'
);

select ok(
  exists (
    select 1 from pg_proc
    where proname = 'is_team_member_for_client'
      and pronamespace = 'public'::regnamespace
  ),
  'team membership helper exists'
);

select ok(
  exists (
    select 1 from pg_proc
    where proname = 'is_team_admin_for_client'
      and pronamespace = 'public'::regnamespace
  ),
  'team admin helper exists'
);

select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'client_memberships'
      and policyname = 'team admins create client memberships'
  ),
  'only team admins receive the membership insert policy'
);

select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'client_memberships'
      and policyname = 'members read own membership'
  ),
  'client members can read their own membership'
);

select ok(
  exists (
    select 1 from pg_constraint
    where conname = 'reviews_verified_actor_check'
      and conrelid = 'public.reviews'::regclass
  ),
  'review actor integrity constraint exists'
);

select * from finish();
rollback;
