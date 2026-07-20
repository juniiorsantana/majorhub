alter table public.posts
  add column aspect_ratio text not null default '1:1'
  constraint posts_aspect_ratio_check check (aspect_ratio in ('1:1', '4:5'));

alter table public.media_assets
  add column crop_x numeric(5,2) not null default 50 check (crop_x between 0 and 100),
  add column crop_y numeric(5,2) not null default 50 check (crop_y between 0 and 100),
  add column zoom numeric(4,2) not null default 1 check (zoom between 1 and 3);

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
          'aspect_ratio', p.aspect_ratio,
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
                'is_cover', m.is_cover,
                'crop_x', m.crop_x,
                'crop_y', m.crop_y,
                'zoom', m.zoom
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

revoke all on function public.get_approval_feed(text) from public;
grant execute on function public.get_approval_feed(text) to anon, authenticated;
