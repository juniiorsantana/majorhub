begin;

create extension if not exists pgtap with schema extensions;

select plan(4);

select ok(
  exists (
    select 1
    from pg_enum enum_value
    join pg_type enum_type on enum_type.oid = enum_value.enumtypid
    where enum_type.typname = 'portal_access_event_type'
      and enum_value.enumlabel = 'access_created'
  ),
  'access creation can be audited'
);

select ok(
  exists (
    select 1
    from pg_enum enum_value
    join pg_type enum_type on enum_type.oid = enum_value.enumtypid
    where enum_type.typname = 'portal_access_event_type'
      and enum_value.enumlabel = 'role_changed'
  ),
  'role changes can be audited'
);

select ok(
  exists (
    select 1
    from pg_enum enum_value
    join pg_type enum_type on enum_type.oid = enum_value.enumtypid
    where enum_type.typname = 'portal_access_event_type'
      and enum_value.enumlabel = 'password_reset'
  ),
  'password resets can be audited'
);

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'portal_access_events'
      and policyname = 'team admins record portal events'
  ),
  'team admins can record access administration events'
);

select * from finish();
rollback;
