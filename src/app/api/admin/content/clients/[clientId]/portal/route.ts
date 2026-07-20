import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeAdmin } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({ calendar_id: z.string().uuid() })

function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'aprovacao'
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Selecione um cronograma válido.' }, { status: 400 })

  const { clientId } = await params
  const supabase = await createClient()
  const [{ data: client }, { data: calendar }] = await Promise.all([
    supabase.from('clients').select('id, portal_slug').eq('id', clientId).maybeSingle(),
    supabase.from('content_calendars').select('id, name').eq('id', parsed.data.calendar_id).eq('client_id', clientId).maybeSingle(),
  ])
  if (!client || !calendar) return NextResponse.json({ error: 'Cliente ou cronograma não encontrado.' }, { status: 404 })

  const { data: existing } = await supabase.from('approval_batches').select('*')
    .eq('client_id', clientId).eq('calendar_id', calendar.id).eq('status', 'open').maybeSingle()
  const origin = new URL(request.url).origin
  if (existing) return NextResponse.json({ batch: existing, portal_url: `${origin}/${client.portal_slug}`, reused: true })

  const { data: posts, error: postsError } = await supabase.from('posts').select('id, current_version, status')
    .eq('client_id', clientId).eq('calendar_id', calendar.id).not('status', 'in', '(archived)').order('scheduled_at', { ascending: true, nullsFirst: false })
  if (postsError) return NextResponse.json({ error: 'Não foi possível carregar os posts do cronograma.', detail: postsError.message }, { status: 500 })
  if (!posts?.length) return NextResponse.json({ error: 'Adicione ao menos uma publicação antes de liberar o portal.' }, { status: 400 })

  const baseSlug = slugify(calendar.name)
  const { count } = await supabase.from('approval_batches').select('*', { count: 'exact', head: true }).eq('client_id', clientId).like('slug', `${baseSlug}%`)
  const batchSlug = count ? `${baseSlug}-${count + 1}` : baseSlug
  const { data: batch, error: batchError } = await supabase.from('approval_batches').insert({
    client_id: clientId,
    calendar_id: calendar.id,
    title: calendar.name,
    slug: batchSlug,
    status: 'open',
    created_by: authorization.userId,
    published_at: new Date().toISOString(),
  }).select().single()
  if (batchError) return NextResponse.json({ error: 'Não foi possível liberar o cronograma.', detail: batchError.message }, { status: 500 })

  const { error: membershipError } = await supabase.from('approval_batch_posts').insert(posts.map((post, position) => ({
    batch_id: batch.id,
    post_id: post.id,
    position,
    version_at_publish: post.current_version,
  })))
  if (membershipError) {
    await supabase.from('approval_batches').delete().eq('id', batch.id)
    return NextResponse.json({ error: 'Não foi possível fixar os posts deste envio.', detail: membershipError.message }, { status: 500 })
  }

  const pendingIds = posts.filter(post => ['draft', 'changes_requested', 'in_progress'].includes(post.status)).map(post => post.id)
  if (pendingIds.length) await supabase.from('posts').update({ status: 'pending_review', updated_at: new Date().toISOString() }).in('id', pendingIds)

  return NextResponse.json({ batch, portal_url: `${origin}/${client.portal_slug}`, reused: false }, { status: 201 })
}
