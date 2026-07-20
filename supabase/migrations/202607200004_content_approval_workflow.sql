create type public.calendar_status as enum ('draft', 'active', 'completed', 'archived');

create table public.content_calendars (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  starts_on date,
  ends_on date,
  status public.calendar_status not null default 'draft',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts
  add column title text not null default 'Publicacao sem titulo',
  add column calendar_id uuid references public.content_calendars(id) on delete set null;

alter table public.share_links
  add column calendar_id uuid references public.content_calendars(id) on delete cascade;

alter table public.content_calendars enable row level security;

create policy "team manages client calendars" on public.content_calendars
for all to authenticated
using (
  exists (
    select 1 from public.clients c
    where c.id = client_id
      and c.organization_id = public.current_organization_id()
  )
)
with check (
  exists (
    select 1 from public.clients c
    where c.id = client_id
      and c.organization_id = public.current_organization_id()
  )
);

create index content_calendars_client_idx
  on public.content_calendars(client_id, status, starts_on);

create index posts_calendar_idx
  on public.posts(calendar_id, scheduled_at);

create or replace function public.get_approval_feed(raw_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  selected_link public.share_links%rowtype;
  result jsonb;
begin
  select * into selected_link
  from public.share_links
  where token_hash = encode(digest(raw_token, 'sha256'), 'hex')
    and revoked_at is null
    and (expires_at is null or expires_at > now())
  limit 1;

  if selected_link.id is null then
    raise exception 'LINK_INVALIDO' using errcode = 'P0001';
  end if;

  select jsonb_build_object(
    'client', jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'contact_name', c.contact_name,
      'instagram', c.instagram,
      'avatar_path', c.avatar_path
    ),
    'calendar', case when cal.id is null then null else jsonb_build_object(
      'id', cal.id,
      'name', cal.name,
      'starts_on', cal.starts_on,
      'ends_on', cal.ends_on
    ) end,
    'posts', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'title', p.title,
          'scheduled_at', p.scheduled_at,
          'format', p.format,
          'caption', p.caption,
          'hashtags', p.hashtags,
          'status', p.status,
          'current_version', p.current_version,
          'media', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', m.id,
                'storage_path', m.storage_path,
                'mime_type', m.mime_type,
                'position', m.position,
                'is_cover', m.is_cover
              ) order by m.position
            )
            from public.media_assets m
            where m.post_id = p.id
          ), '[]'::jsonb),
          'latest_review', (
            select jsonb_build_object(
              'decision', r.decision,
              'comment', r.comment,
              'reviewer_name', r.reviewer_name,
              'created_at', r.created_at
            )
            from public.reviews r
            where r.post_id = p.id
            order by r.created_at desc
            limit 1
          )
        ) order by p.scheduled_at nulls last, p.created_at
      )
      from public.posts p
      where p.client_id = selected_link.client_id
        and (selected_link.calendar_id is null or p.calendar_id = selected_link.calendar_id)
        and p.status in ('pending_review', 'changes_requested', 'approved')
    ), '[]'::jsonb)
  ) into result
  from public.clients c
  left join public.content_calendars cal on cal.id = selected_link.calendar_id
  where c.id = selected_link.client_id;

  return result;
end;
$$;

create or replace function public.submit_approval_review(
  raw_token text,
  target_post uuid,
  review_decision_text text,
  review_comment text default null,
  review_reviewer_name text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  selected_link public.share_links%rowtype;
  selected_post public.posts%rowtype;
  parsed_decision public.review_decision;
begin
  select * into selected_link
  from public.share_links
  where token_hash = encode(digest(raw_token, 'sha256'), 'hex')
    and revoked_at is null
    and (expires_at is null or expires_at > now())
  limit 1;

  if selected_link.id is null then
    raise exception 'LINK_INVALIDO' using errcode = 'P0001';
  end if;

  select * into selected_post
  from public.posts
  where id = target_post
    and client_id = selected_link.client_id
    and (selected_link.calendar_id is null or calendar_id = selected_link.calendar_id)
    and status in ('pending_review', 'changes_requested', 'approved')
  for update;

  if selected_post.id is null then
    raise exception 'POST_INVALIDO' using errcode = 'P0001';
  end if;

  if review_decision_text not in ('approved', 'changes_requested') then
    raise exception 'DECISAO_INVALIDA' using errcode = 'P0001';
  end if;

  parsed_decision := review_decision_text::public.review_decision;

  if parsed_decision = 'changes_requested'
    and length(trim(coalesce(review_comment, ''))) = 0 then
    raise exception 'COMENTARIO_OBRIGATORIO' using errcode = 'P0001';
  end if;

  insert into public.reviews (post_id, version, decision, comment, reviewer_name)
  values (
    selected_post.id,
    selected_post.current_version,
    parsed_decision,
    nullif(trim(review_comment), ''),
    nullif(trim(review_reviewer_name), '')
  );

  update public.posts
  set status = case
      when parsed_decision = 'approved' then 'approved'::public.post_status
      else 'changes_requested'::public.post_status
    end,
    updated_at = now()
  where id = selected_post.id;

  return jsonb_build_object(
    'ok', true,
    'post_id', selected_post.id,
    'status', case when parsed_decision = 'approved' then 'approved' else 'changes_requested' end
  );
end;
$$;

revoke all on function public.get_approval_feed(text) from public;
revoke all on function public.submit_approval_review(text, uuid, text, text, text) from public;
grant execute on function public.get_approval_feed(text) to anon, authenticated;
grant execute on function public.submit_approval_review(text, uuid, text, text, text) to anon, authenticated;
