import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/admin/auth'
import { clientSchema } from '@/lib/content-hub/schemas'
import { normalizeInstagram, withSignedMediaUrls } from '@/lib/content-hub/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*, posts(id, status)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Nao foi possivel carregar os clientes.', detail: error.message }, { status: 500 })

  const clients = await Promise.all((data ?? []).map(async client => {
    const posts = client.posts ?? []
    const avatar = client.avatar_path
      ? await withSignedMediaUrls(supabase, [{ id: 'avatar', storage_path: client.avatar_path, mime_type: 'image', position: 0, is_cover: true }])
      : []

    return {
      ...client,
      posts: undefined,
      avatar_url: avatar[0]?.url ?? null,
      stats: {
        total: posts.length,
        pending: posts.filter((post: { status: string }) => post.status === 'pending_review').length,
        changes: posts.filter((post: { status: string }) => post.status === 'changes_requested').length,
        approved: posts.filter((post: { status: string }) => post.status === 'approved').length,
      },
    }
  }))

  return NextResponse.json({ clients }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: NextRequest) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })
  }

  const parsed = clientSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Revise os dados do cliente.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: member, error: memberError } = await supabase
    .from('team_members')
    .select('organization_id')
    .eq('user_id', authorization.userId)
    .single()

  if (memberError || !member) {
    return NextResponse.json({ error: 'Organizacao da equipe nao encontrada.' }, { status: 403 })
  }

  const payload = {
    ...parsed.data,
    instagram: normalizeInstagram(parsed.data.instagram),
    organization_id: member.organization_id,
    created_by: authorization.userId,
  }

  const { data, error } = await supabase.from('clients').insert(payload).select().single()
  if (error) return NextResponse.json({ error: 'Nao foi possivel criar o cliente.', detail: error.message }, { status: 500 })

  return NextResponse.json({ client: data }, { status: 201 })
}
