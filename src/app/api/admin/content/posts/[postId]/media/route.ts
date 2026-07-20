import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeAdmin } from '@/lib/admin/auth'
import { mediaCropSchema } from '@/lib/content-hub/schemas'
import { createClient } from '@/lib/supabase/server'

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'])
const settingsSchema = z.array(mediaCropSchema)

export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })

  const formData = await request.formData()
  const files = formData.getAll('files').filter((value): value is File => value instanceof File)
  if (!files.length || files.some(file => !allowedTypes.has(file.type) || file.size > 50 * 1024 * 1024)) {
    return NextResponse.json({ error: 'Envie imagens ou vídeos compatíveis de até 50 MB cada.' }, { status: 400 })
  }

  let settings = files.map(() => ({ crop_x: 50, crop_y: 50, zoom: 1 }))
  const rawSettings = formData.get('settings')
  if (typeof rawSettings === 'string') {
    try {
      const parsed = settingsSchema.safeParse(JSON.parse(rawSettings))
      if (parsed.success && parsed.data.length === files.length) settings = parsed.data
    } catch { /* Mantém o enquadramento central como padrão. */ }
  }

  const { postId } = await params
  const supabase = await createClient()
  const { data: post } = await supabase.from('posts').select('client_id, calendar_id').eq('id', postId).single()
  const { data: member } = await supabase.from('team_members').select('organization_id').eq('user_id', authorization.userId).single()
  if (!post || !member) return NextResponse.json({ error: 'Publicação não encontrada.' }, { status: 404 })

  const { count } = await supabase.from('media_assets').select('*', { count: 'exact', head: true }).eq('post_id', postId)
  const uploaded = []

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index]
    const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
    const path = `${member.organization_id}/${post.client_id}/${post.calendar_id ?? 'avulsos'}/${postId}/${randomUUID()}.${extension}`
    const { error: uploadError } = await supabase.storage.from('client-media').upload(path, file, { contentType: file.type })
    if (uploadError) return NextResponse.json({ error: `Falha ao enviar ${file.name}.`, detail: uploadError.message }, { status: 500 })

    const position = (count ?? 0) + index
    const { data: asset, error: assetError } = await supabase.from('media_assets').insert({
      post_id: postId,
      storage_path: path,
      mime_type: file.type,
      position,
      is_cover: position === 0,
      crop_x: settings[index].crop_x,
      crop_y: settings[index].crop_y,
      zoom: settings[index].zoom,
    }).select().single()

    if (assetError) {
      await supabase.storage.from('client-media').remove([path])
      return NextResponse.json({ error: 'Falha ao registrar uma das mídias.', detail: assetError.message }, { status: 500 })
    }

    const { data: signed } = await supabase.storage.from('client-media').createSignedUrl(path, 3600)
    uploaded.push({ ...asset, url: signed?.signedUrl })
  }

  return NextResponse.json({ media: uploaded }, { status: 201 })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })
  const body = await request.json() as { asset_ids?: string[] }
  if (!Array.isArray(body.asset_ids) || body.asset_ids.some(id => typeof id !== 'string')) {
    return NextResponse.json({ error: 'Ordem de mídia inválida.' }, { status: 400 })
  }

  const { postId } = await params
  const supabase = await createClient()
  for (let index = 0; index < body.asset_ids.length; index += 1) {
    await supabase.from('media_assets').update({ position: -1000 - index, is_cover: index === 0 }).eq('id', body.asset_ids[index]).eq('post_id', postId)
  }
  for (let index = 0; index < body.asset_ids.length; index += 1) {
    const { error } = await supabase.from('media_assets').update({ position: index, is_cover: index === 0 }).eq('id', body.asset_ids[index]).eq('post_id', postId)
    if (error) return NextResponse.json({ error: 'Não foi possível reordenar as mídias.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
