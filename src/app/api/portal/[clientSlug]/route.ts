import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { PORTAL_SESSION_COOKIE, verifyPortalSession } from '@/lib/content-hub/portal-session'
import { withSignedMediaUrls } from '@/lib/content-hub/server'
import type { MediaAsset } from '@/lib/content-hub/types'

type Context = { params: Promise<{ clientSlug: string }> }
type PostRow = Record<string, unknown> & { id: string; current_version: number }
type AssetRow = MediaAsset & { post_id: string }
type ReviewRow = Record<string, unknown> & { post_id: string; created_at: string }

const reviewSchema = z.object({
  batch_id: z.string().uuid(),
  post_id: z.string().uuid(),
  decision: z.enum(['approved', 'changes_requested']),
  comment: z.string().trim().max(3000).optional().nullable(),
  reviewer_name: z.string().trim().max(120).optional().nullable(),
}).superRefine((value, context) => {
  if (value.decision === 'changes_requested' && !value.comment) {
    context.addIssue({ code: 'custom', path: ['comment'], message: 'Descreva o que precisa ser corrigido.' })
  }
})

async function authorizePortalRequest(request: NextRequest, clientSlug: string) {
  const session = verifyPortalSession(request.cookies.get(PORTAL_SESSION_COOKIE)?.value)
  if (!session || session.slug !== clientSlug.toLowerCase()) return null

  const admin = createAdminClient()
  const { data: client } = await admin.from('clients')
    .select('id, name, contact_name, instagram, avatar_path, portal_slug')
    .eq('id', session.clientId).eq('portal_slug', session.slug).maybeSingle()
  if (!client) return null

  const { data: approver } = await admin.from('client_approvers').select('id')
    .eq('client_id', client.id).eq('active', true).ilike('email', session.email).maybeSingle()
  if (!approver) return null
  return { admin, client, session }
}

export async function GET(request: NextRequest, { params }: Context) {
  const { clientSlug } = await params
  try {
    const authorization = await authorizePortalRequest(request, clientSlug)
    if (!authorization) return NextResponse.json({ error: 'Acesso necessário.' }, { status: 401 })
    const { admin, client } = authorization

    const { data: batchData, error: batchError } = await admin.from('approval_batches').select('*')
      .eq('client_id', client.id).in('status', ['open', 'closed']).order('published_at', { ascending: false })
    if (batchError) throw batchError
    const batches = batchData ?? []
    const batchIds = batches.map(batch => batch.id)

    let batchPostData: Array<{ batch_id: string; post_id: string; position: number; version_at_publish: number }> = []
    if (batchIds.length) {
      const { data, error } = await admin.from('approval_batch_posts').select('*').in('batch_id', batchIds).order('position', { ascending: true })
      if (error) throw error
      batchPostData = data ?? []
    }

    const postIds = [...new Set(batchPostData.map(item => item.post_id))]
    let postData: PostRow[] = []
    let mediaData: AssetRow[] = []
    let reviewData: ReviewRow[] = []
    if (postIds.length) {
      const [postsResult, mediaResult, reviewsResult] = await Promise.all([
        admin.from('posts').select('*').in('id', postIds),
        admin.from('media_assets').select('*').in('post_id', postIds).order('position', { ascending: true }),
        admin.from('reviews').select('*').in('post_id', postIds).order('created_at', { ascending: false }),
      ])
      if (postsResult.error) throw postsResult.error
      if (mediaResult.error) throw mediaResult.error
      if (reviewsResult.error) throw reviewsResult.error
      postData = (postsResult.data ?? []) as PostRow[]
      mediaData = (mediaResult.data ?? []) as AssetRow[]
      reviewData = (reviewsResult.data ?? []) as ReviewRow[]
    }

    const postsWithMedia = await Promise.all(postData.map(async post => ({
      ...post,
      media: await withSignedMediaUrls(admin, mediaData.filter(asset => asset.post_id === post.id), 60 * 60 * 6),
      latest_review: reviewData.find(review => review.post_id === post.id) ?? null,
    })))

    const hydratedBatches = batches.map(batch => ({
      ...batch,
      posts: batchPostData.filter(item => item.batch_id === batch.id).sort((a, b) => a.position - b.position).map(item => ({
        ...postsWithMedia.find(post => post.id === item.post_id),
        version_at_publish: item.version_at_publish,
      })).filter(post => post.id),
    }))

    let avatarUrl: string | null = null
    if (client.avatar_path) {
      const avatar = await withSignedMediaUrls(admin, [{ id: 'avatar', storage_path: client.avatar_path, mime_type: 'image', position: 0, is_cover: true }], 60 * 60 * 6)
      avatarUrl = avatar[0]?.url ?? null
    }

    return NextResponse.json({
      client: { ...client, avatar_url: avatarUrl },
      batches: hydratedBatches,
    }, { headers: { 'Cache-Control': 'private, no-store, max-age=0' } })
  } catch (cause) {
    console.error('[portal/feed]', cause)
    return NextResponse.json({ error: 'Não foi possível carregar o portal agora.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: Context) {
  const { clientSlug } = await params
  const parsed = reviewSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Revise sua resposta antes de enviar.' }, { status: 400 })

  try {
    const authorization = await authorizePortalRequest(request, clientSlug)
    if (!authorization) return NextResponse.json({ error: 'Sua sessão expirou. Entre novamente.' }, { status: 401 })
    const { admin, client, session } = authorization

    const { data: batch } = await admin.from('approval_batches').select('id').eq('id', parsed.data.batch_id).eq('client_id', client.id).eq('status', 'open').maybeSingle()
    if (!batch) return NextResponse.json({ error: 'Este envio não está mais aberto para aprovação.' }, { status: 409 })
    const { data: membership } = await admin.from('approval_batch_posts').select('post_id').eq('batch_id', batch.id).eq('post_id', parsed.data.post_id).maybeSingle()
    if (!membership) return NextResponse.json({ error: 'Publicação não encontrada neste envio.' }, { status: 404 })
    const { data: post } = await admin.from('posts').select('current_version').eq('id', parsed.data.post_id).eq('client_id', client.id).maybeSingle()
    if (!post) return NextResponse.json({ error: 'Publicação não encontrada.' }, { status: 404 })

    const { error: reviewError } = await admin.from('reviews').insert({
      post_id: parsed.data.post_id,
      version: post.current_version,
      decision: parsed.data.decision,
      comment: parsed.data.decision === 'changes_requested' ? parsed.data.comment : null,
      reviewer_name: parsed.data.reviewer_name || session.email,
    })
    if (reviewError) throw reviewError

    const status = parsed.data.decision === 'approved' ? 'approved' : 'changes_requested'
    const { error: updateError } = await admin.from('posts').update({ status, updated_at: new Date().toISOString() }).eq('id', parsed.data.post_id)
    if (updateError) throw updateError
    return NextResponse.json({ ok: true, post_id: parsed.data.post_id, status })
  } catch (cause) {
    console.error('[portal/review]', cause)
    return NextResponse.json({ error: 'Não foi possível registrar sua resposta.' }, { status: 500 })
  }
}
