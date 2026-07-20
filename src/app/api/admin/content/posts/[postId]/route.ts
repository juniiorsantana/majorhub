import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/admin/auth'
import { postSchema } from '@/lib/content-hub/schemas'
import { withSignedMediaUrls } from '@/lib/content-hub/server'
import { createClient } from '@/lib/supabase/server'
import type { MediaAsset } from '@/lib/content-hub/types'

type Context = { params: Promise<{ postId: string }> }

export async function GET(_request: NextRequest, { params }: Context) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })
  const { postId } = await params
  const supabase = await createClient()
  const { data, error } = await supabase.from('posts')
    .select('*, media_assets(*), reviews(*)').eq('id', postId).maybeSingle()

  if (error) return NextResponse.json({ error: 'Nao foi possivel carregar a publicacao.' }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Publicacao nao encontrada.' }, { status: 404 })

  const media = await withSignedMediaUrls(supabase, (data.media_assets as MediaAsset[]).sort((a, b) => a.position - b.position))
  return NextResponse.json({ post: { ...data, media_assets: media } }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function PUT(request: NextRequest, { params }: Context) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })
  const parsed = postSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Revise os dados da publicacao.' }, { status: 400 })

  const { postId } = await params
  const supabase = await createClient()
  const { data: existing } = await supabase.from('posts').select('status, current_version').eq('id', postId).maybeSingle()
  if (!existing) return NextResponse.json({ error: 'Publicacao nao encontrada.' }, { status: 404 })

  const isNewReviewVersion = parsed.data.status === 'pending_review' && ['changes_requested', 'in_progress'].includes(existing.status)
  const currentVersion = isNewReviewVersion ? existing.current_version + 1 : existing.current_version
  const { data, error } = await supabase.from('posts')
    .update({ ...parsed.data, current_version: currentVersion, updated_at: new Date().toISOString() })
    .eq('id', postId).select().single()

  if (error) return NextResponse.json({ error: 'Nao foi possivel salvar a publicacao.', detail: error.message }, { status: 500 })

  await supabase.from('post_versions').upsert({
    post_id: data.id,
    version: data.current_version,
    snapshot: data,
    created_by: authorization.userId,
  }, { onConflict: 'post_id,version' })

  return NextResponse.json({ post: data })
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })
  const { postId } = await params
  const supabase = await createClient()
  const { data: assets } = await supabase.from('media_assets').select('storage_path').eq('post_id', postId)
  const { error } = await supabase.from('posts').delete().eq('id', postId)
  if (error) return NextResponse.json({ error: 'Nao foi possivel excluir a publicacao.' }, { status: 500 })
  if (assets?.length) await supabase.storage.from('client-media').remove(assets.map(asset => asset.storage_path))
  return NextResponse.json({ ok: true })
}
