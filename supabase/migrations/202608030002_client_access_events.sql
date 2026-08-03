alter type public.portal_access_event_type add value if not exists 'access_created';
alter type public.portal_access_event_type add value if not exists 'role_changed';
alter type public.portal_access_event_type add value if not exists 'password_reset';

create policy "team admins record portal events"
on public.portal_access_events
for insert to authenticated
with check (public.is_team_admin_for_client(client_id));
