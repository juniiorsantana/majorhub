import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeAdmin } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  first_post_id: z.string().uuid(),
  second_post_id: z.string().uuid(),
}).refine(value => value.first_post_id !== value.second_post_id, { message: 'Escolha duas publicações diferentes.' })

/** Organizar o feed: duas publicações trocam de data. O resto do cronograma não muda. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Escolha duas publicações diferentes.' }, { status: 400 })

  const { clientId } = await params
  const { first_post_id: firstId, second_post_id: secondId } = parsed.data
  const supabase = await createClient()
  const { data: posts, error } = await supabase.from('posts').select('id, scheduled_at, status')
    .eq('client_id', clientId).in('id', [firstId, secondId])
  if (error) return NextResponse.json({ error: 'Não foi possível ler as publicações.', detail: error.message }, { status: 500 })

  const first = posts?.find(post => post.id === firstId)
  const second = posts?.find(post => post.id === secondId)
  if (!first || !second) return NextResponse.json({ error: 'Publicação não encontrada.' }, { status: 404 })
  if (first.status === 'published' || second.status === 'published') {
    return NextResponse.json({ error: 'Publicações que já foram ao ar não mudam de data.' }, { status: 409 })
  }
  if (!first.scheduled_at || !second.scheduled_at) {
    return NextResponse.json({ error: 'As duas publicações precisam ter data para trocar.' }, { status: 400 })
  }

  const updatedAt = new Date().toISOString()
  const { error: firstError } = await supabase.from('posts').update({ scheduled_at: second.scheduled_at, updated_at: updatedAt }).eq('id', firstId)
  if (firstError) return NextResponse.json({ error: 'Não foi possível trocar as datas.', detail: firstError.message }, { status: 500 })

  const { error: secondError } = await supabase.from('posts').update({ scheduled_at: first.scheduled_at, updated_at: updatedAt }).eq('id', secondId)
  if (secondError) {
    // Desfaz a primeira metade para as duas não ficarem na mesma data.
    await supabase.from('posts').update({ scheduled_at: first.scheduled_at }).eq('id', firstId)
    return NextResponse.json({ error: 'Não foi possível trocar as datas.', detail: secondError.message }, { status: 500 })
  }

  return NextResponse.json({
    posts: [
      { id: firstId, scheduled_at: second.scheduled_at },
      { id: secondId, scheduled_at: first.scheduled_at },
    ],
  })
}
