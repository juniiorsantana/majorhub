import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { canSubmitClientReview } from '@/lib/content-hub/access-policy'
import { recordPortalEvent } from '@/lib/content-hub/portal-audit'
import { resolveActivePortalMembership } from '@/lib/content-hub/portal-memberships'
import { withSignedMediaUrls } from '@/lib/content-hub/server'
import type { MediaAsset } from '@/lib/content-hub/types'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

type Context = { params: Promise<{ clientSlug: string }> }
type PostRow = Record<string, unknown> & { id: string; current_version: number }
type AssetRow = MediaAsset & { post_id: string }
type ReviewRow = Record<string, unknown> & { post_id: string; created_at: string }

const reviewSchema = z.object({
  batch_id: z.string().uuid(),
  post_id: z.string().uuid(),
  decision: z.enum(['approved', 'changes_requested']),
  comment: z.string().trim().max(3000).optional().nullable(),
}).superRefine((value, context) => {
  if (value.decision === 'changes_requested' && !value.comment) {
    context.addIssue({ code: 'custom', path: ['comment'], message: 'Descreva o que precisa ser corrigido.' })
  }
})

async function authenticatedAccess(clientSlug: string) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { error: 'unauthenticated' as const }

  const admin = createAdminClient()
  const access = await resolveActivePortalMembership(admin, clientSlug, user.id)
  if (!access) return { error: 'forbidden' as const }
  return { supabase, admin, user, ...access }
}

export async function GET(request: NextRequest, { params }: Context) {
  const { clientSlug } = await params

  try {
    const authorization = await authenticatedAccess(clientSlug)
    if ('error' in authorization) {
      return NextResponse.json(
        { error: authorization.error === 'unauthenticated' ? 'Sessão necessária.' : 'Acesso não autorizado.' },
        { status: authorization.error === 'unauthenticated' ? 401 : 403 },
      )
    }

    const { admin, client, membership, user } = authorization
    if (membership.must_change_password) {
      return NextResponse.json({ error: 'Troque a senha temporária antes de abrir o portal.', must_change_password: true }, { status: 428 })
    }

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
        admin.from('posts').select('*').eq('client_id', client.id).in('id', postIds),
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
    const { data: fullClient } = await admin.from('clients').select('avatar_path, contact_name, instagram').eq('id', client.id).single()
    if (fullClient?.avatar_path) {
      const avatar = await withSignedMediaUrls(admin, [{ id: 'avatar', storage_path: fullClient.avatar_path, mime_type: 'image', position: 0, is_cover: true }], 60 * 60 * 6)
      avatarUrl = avatar[0]?.url ?? null
    }

    await recordPortalEvent(admin, request, {
      clientId: client.id,
      eventType: 'portal_viewed',
      membershipId: membership.id,
      userId: user.id,
      email: membership.email,
    })

    return NextResponse.json({
      client: { ...client, ...fullClient, avatar_url: avatarUrl },
      membership: { id: membership.id, name: membership.name, email: membership.email, role: membership.role },
      batches: hydratedBatches,
    }, { headers: { 'Cache-Control': 'private, no-store, max-age=0' } })
  } catch (cause) {
    console.error('[portal/account/feed]', cause)
    return NextResponse.json({ error: 'Não foi possível carregar o portal agora.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: Context) {
  const parsed = reviewSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Revise sua resposta.' }, { status: 400 })

  const { clientSlug } = await params

  try {
    const authorization = await authenticatedAccess(clientSlug)
    if ('error' in authorization) {
      return NextResponse.json(
        { error: authorization.error === 'unauthenticated' ? 'Sessão necessária.' : 'Acesso não autorizado.' },
        { status: authorization.error === 'unauthenticated' ? 401 : 403 },
      )
    }

    const { admin, client, membership, user } = authorization
    if (membership.must_change_password) return NextResponse.json({ error: 'Troque a senha temporária antes de aprovar.' }, { status: 428 })
    if (!canSubmitClientReview(membership.role)) {
      return NextResponse.json({ error: 'Seu acesso permite apenas visualizar.' }, { status: 403 })
    }

    const { data: batch } = await admin.from('approval_batches').select('id')
      .eq('id', parsed.data.batch_id).eq('client_id', client.id).eq('status', 'open').maybeSingle()
    if (!batch) return NextResponse.json({ error: 'Este envio não está mais aberto para aprovação.' }, { status: 409 })

    const { data: membershipPost } = await admin.from('approval_batch_posts').select('post_id')
      .eq('batch_id', batch.id).eq('post_id', parsed.data.post_id).maybeSingle()
    if (!membershipPost) return NextResponse.json({ error: 'Publicação não encontrada neste envio.' }, { status: 404 })

    const { data: post } = await admin.from('posts').select('current_version')
      .eq('id', parsed.data.post_id).eq('client_id', client.id).maybeSingle()
    if (!post) return NextResponse.json({ error: 'Publicação não encontrada.' }, { status: 404 })

    const { error: reviewError } = await admin.from('reviews').insert({
      post_id: parsed.data.post_id,
      version: post.current_version,
      decision: parsed.data.decision,
      comment: parsed.data.decision === 'changes_requested' ? parsed.data.comment : null,
      reviewer_name: membership.name,
      reviewer_user_id: user.id,
      reviewer_membership_id: membership.id,
      reviewer_email_snapshot: membership.email,
      actor_type: 'client',
    })
    if (reviewError) throw reviewError

    const status = parsed.data.decision === 'approved' ? 'approved' : 'changes_requested'
    const { error: updateError } = await admin.from('posts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', parsed.data.post_id)
      .eq('client_id', client.id)
    if (updateError) throw updateError

    await recordPortalEvent(admin, request, {
      clientId: client.id,
      eventType: 'review_submitted',
      membershipId: membership.id,
      userId: user.id,
      email: membership.email,
      metadata: { batch_id: batch.id, post_id: parsed.data.post_id, decision: parsed.data.decision },
    })

    return NextResponse.json({ ok: true, post_id: parsed.data.post_id, status })
  } catch (cause) {
    console.error('[portal/account/review]', cause)
    return NextResponse.json({ error: 'Não foi possível registrar sua resposta.' }, { status: 500 })
  }
}
