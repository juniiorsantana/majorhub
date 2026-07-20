import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/admin/auth'
import { mediaCropSchema } from '@/lib/content-hub/schemas'
import { createClient } from '@/lib/supabase/server'

type Context = { params: Promise<{ assetId: string }> }

export async function PATCH(request: NextRequest, { params }: Context) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })
  const parsed = mediaCropSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Enquadramento inválido.' }, { status: 400 })

  const { assetId } = await params
  const supabase = await createClient()
  const { data, error } = await supabase.from('media_assets').update(parsed.data).eq('id', assetId).select().maybeSingle()
  if (error) return NextResponse.json({ error: 'Não foi possível salvar o enquadramento.', detail: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Mídia não encontrada.' }, { status: 404 })
  return NextResponse.json({ media: data })
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })
  const { assetId } = await params
  const supabase = await createClient()
  const { data: asset } = await supabase.from('media_assets').select('storage_path').eq('id', assetId).maybeSingle()
  if (!asset) return NextResponse.json({ error: 'Mídia não encontrada.' }, { status: 404 })

  const { error } = await supabase.from('media_assets').delete().eq('id', assetId)
  if (error) return NextResponse.json({ error: 'Não foi possível excluir a mídia.' }, { status: 500 })
  await supabase.storage.from('client-media').remove([asset.storage_path])
  return NextResponse.json({ ok: true })
}
