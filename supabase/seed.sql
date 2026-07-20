-- Depois de criar o primeiro usuário em Authentication > Users, substitua os valores.
insert into public.organizations (id, name)
values ('00000000-0000-0000-0000-000000000001', 'MajorHub')
on conflict (id) do nothing;

-- insert into public.team_members (user_id, organization_id, name, role)
-- values ('UUID_DO_USUARIO', '00000000-0000-0000-0000-000000000001', 'Seu nome', 'admin');
