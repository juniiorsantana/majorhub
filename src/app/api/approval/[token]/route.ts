import { NextRequest, NextResponse } from 'next/server'
import { reviewSchema } from '@/lib/content-hub/schemas'
import { withSignedMediaUrls } from '@/lib/content-hub/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { MediaAsset } from '@/lib/content-hub/types'

type Context = { params: Promise<{ token: string }> }

export async function GET(_request: NextRequest, { params }: Context) {
  const { token } = await params
  if (!token || token.length > 200) return NextResponse.json({ error: 'Link invalido.' }, { status: 404 })

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_approval_feed', { raw_token: token })
  if (error || !data) return NextResponse.json({ error: 'Este link expirou ou nao esta mais disponivel.' }, { status: 404 })

  try {
    const admin = createAdminClient()
    const posts = await Promise.all((data.posts ?? []).map(async (post: { media: MediaAsset[] }) => ({
      ...post,
      media: await withSignedMediaUrls(admin, post.media, 60 * 60 * 6),
    })))
    let avatarUrl: string | null = null
    if (data.client?.avatar_path) {
      const avatar = await withSignedMediaUrls(admin, [{ id: 'avatar', storage_path: data.client.avatar_path, mime_type: 'image', position: 0, is_cover: true }], 60 * 60 * 6)
      avatarUrl = avatar[0]?.url ?? null
    }

    return NextResponse.json({ ...data, client: { ...data.client, avatar_url: avatarUrl }, posts }, {
      headers: { 'Cache-Control': 'private, no-store, max-age=0' },
    })
  } catch {
    return NextResponse.json({ error: 'O acesso seguro as imagens ainda nao foi configurado.' }, { status: 503 })
  }
}

export async function POST(request: NextRequest, { params }: Context) {
  const { token } = await params
  const parsed = reviewSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Revise sua resposta antes de enviar.' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('submit_approval_review', {
    raw_token: token,
    target_post: parsed.data.post_id,
    review_decision_text: parsed.data.decision,
    review_comment: parsed.data.comment ?? null,
    review_reviewer_name: parsed.data.reviewer_name ?? null,
  })

  if (error) return NextResponse.json({ error: 'Nao foi possivel registrar sua resposta. Atualize a pagina e tente novamente.' }, { status: 400 })
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
}
