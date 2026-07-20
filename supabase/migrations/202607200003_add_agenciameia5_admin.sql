do $$
declare
  admin_user_id uuid;
  majorhub_organization_id uuid;
begin
  select id
    into admin_user_id
  from auth.users
  where lower(email) = 'agenciameia5@gmail.com'
  limit 1;

  if admin_user_id is null then
    raise exception 'Usuário agenciameia5@gmail.com não encontrado no Supabase Auth.';
  end if;

  select id
    into majorhub_organization_id
  from public.organizations
  where name = 'MajorHub'
  order by created_at
  limit 1;

  if majorhub_organization_id is null then
    raise exception 'Organização MajorHub não encontrada.';
  end if;

  insert into public.team_members (user_id, organization_id, name, role)
  values (admin_user_id, majorhub_organization_id, 'Agência Meia 5', 'admin')
  on conflict (user_id) do update
    set organization_id = excluded.organization_id,
        name = excluded.name,
        role = excluded.role;
end
$$;
