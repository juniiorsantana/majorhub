import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/admin/auth'
import { clientSchema } from '@/lib/content-hub/schemas'
import { normalizeInstagram, withSignedMediaUrls } from '@/lib/content-hub/server'
import { createClient } from '@/lib/supabase/server'
import type { ContentCalendar, ContentPost, MediaAsset, Review } from '@/lib/content-hub/types'

type Context = { params: Promise<{ clientId: string }> }
type CalendarRow = Omit<ContentCalendar, 'posts'>
type PostRow = Omit<ContentPost, 'media_assets' | 'reviews'>
type ReviewRow = Review & { post_id: string }

function databaseError(message: string, detail?: string) {
  console.error(`[content-hub] ${message}`, detail)
  return NextResponse.json({ error: message, detail }, { status: 500 })
}

export async function GET(_request: NextRequest, { params }: Context) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })

  try {
    const { clientId } = await params
    const supabase = await createClient()

    const { data: client, error: clientError } = await supabase.from('clients').select('*').eq('id', clientId).maybeSingle()
    if (clientError) return databaseError('Não foi possível carregar os dados do cliente.', clientError.message)
    if (!client) return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 })

    const [{ data: calendarData, error: calendarError }, { data: postData, error: postError }] = await Promise.all([
      supabase.from('content_calendars').select('*').eq('client_id', clientId).order('starts_on', { ascending: false, nullsFirst: false }),
      supabase.from('posts').select('*').eq('client_id', clientId).order('scheduled_at', { ascending: true, nullsFirst: false }),
    ])
    if (calendarError) return databaseError('Não foi possível carregar os cronogramas.', calendarError.message)
    if (postError) return databaseError('Não foi possível carregar as publicações.', postError.message)

    const rawPosts = (postData ?? []) as PostRow[]
    const postIds = rawPosts.map(post => post.id)
    let mediaData: MediaAsset[] = []
    let reviewData: ReviewRow[] = []

    if (postIds.length) {
      const [{ data: assets, error: mediaError }, { data: reviews, error: reviewError }] = await Promise.all([
        supabase.from('media_assets').select('*').in('post_id', postIds).order('position', { ascending: true }),
        supabase.from('reviews').select('*').in('post_id', postIds).order('created_at', { ascending: false }),
      ])
      if (mediaError) return databaseError('Não foi possível carregar as mídias das publicações.', mediaError.message)
      if (reviewError) return databaseError('Não foi possível carregar o histórico de aprovação.', reviewError.message)
      mediaData = (assets ?? []) as MediaAsset[]
      reviewData = (reviews ?? []) as ReviewRow[]
    }

    const posts = await Promise.all(rawPosts.map(async post => {
      const postMedia = mediaData.filter(asset => 'post_id' in asset && (asset as MediaAsset & { post_id: string }).post_id === post.id)
      return {
        ...post,
        media_assets: await withSignedMediaUrls(supabase, postMedia),
        reviews: reviewData.filter(review => review.post_id === post.id),
      }
    }))

    const avatar = client.avatar_path
      ? await withSignedMediaUrls(supabase, [{ id: 'avatar', storage_path: client.avatar_path, mime_type: 'image', position: 0, is_cover: true }])
      : []

    const calendars = ((calendarData ?? []) as CalendarRow[]).map(calendar => ({
      ...calendar,
      posts: posts.filter(post => post.calendar_id === calendar.id),
    }))

    return NextResponse.json({
      client: {
        ...client,
        avatar_url: avatar[0]?.url ?? null,
        content_calendars: calendars,
        posts: posts.filter(post => !post.calendar_id),
      },
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause)
    return databaseError('Não foi possível montar a pasta do cliente.', detail)
  }
}

export async function PUT(request: NextRequest, { params }: Context) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })
  const parsed = clientSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Revise os dados do cliente.' }, { status: 400 })

  const { clientId } = await params
  const supabase = await createClient()
  const { data, error } = await supabase.from('clients')
    .update({ ...parsed.data, instagram: normalizeInstagram(parsed.data.instagram), updated_at: new Date().toISOString() })
    .eq('id', clientId).select().maybeSingle()

  if (error) return databaseError('Não foi possível salvar o cliente.', error.message)
  if (!data) return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 })
  return NextResponse.json({ client: data })
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })
  const { clientId } = await params
  const supabase = await createClient()
  const { error } = await supabase.from('clients').update({ status: 'archived', updated_at: new Date().toISOString() }).eq('id', clientId)
  if (error) return databaseError('Não foi possível arquivar o cliente.', error.message)
  return NextResponse.json({ ok: true })
}
