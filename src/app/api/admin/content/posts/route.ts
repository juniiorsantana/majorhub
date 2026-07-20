import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/admin/auth'
import { postSchema } from '@/lib/content-hub/schemas'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })

  const parsed = postSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Revise os dados da publicacao.' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase.from('posts')
    .insert({ ...parsed.data, created_by: authorization.userId })
    .select().single()

  if (error) return NextResponse.json({ error: 'Nao foi possivel criar a publicacao.', detail: error.message }, { status: 500 })

  await supabase.from('post_versions').insert({
    post_id: data.id,
    version: data.current_version,
    snapshot: data,
    created_by: authorization.userId,
  })

  return NextResponse.json({ post: { ...data, media_assets: [], reviews: [] } }, { status: 201 })
}
