import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { authorizeAdmin } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function POST(request: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File) || !allowedTypes.has(file.type) || file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Envie uma imagem JPG, PNG ou WebP de ate 5 MB.' }, { status: 400 })
  }

  const { clientId } = await params
  const supabase = await createClient()
  const { data: member } = await supabase.from('team_members').select('organization_id').eq('user_id', authorization.userId).single()
  if (!member) return NextResponse.json({ error: 'Organizacao nao encontrada.' }, { status: 403 })

  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `${member.organization_id}/${clientId}/avatar/${randomUUID()}.${extension}`
  const { error: uploadError } = await supabase.storage.from('client-media').upload(path, file, { contentType: file.type })
  if (uploadError) return NextResponse.json({ error: 'Nao foi possivel enviar o avatar.', detail: uploadError.message }, { status: 500 })

  const { data: existing } = await supabase.from('clients').select('avatar_path').eq('id', clientId).single()
  const { error: updateError } = await supabase.from('clients').update({ avatar_path: path, updated_at: new Date().toISOString() }).eq('id', clientId)
  if (updateError) {
    await supabase.storage.from('client-media').remove([path])
    return NextResponse.json({ error: 'Nao foi possivel associar o avatar.' }, { status: 500 })
  }

  if (existing?.avatar_path) await supabase.storage.from('client-media').remove([existing.avatar_path])
  const { data: signed } = await supabase.storage.from('client-media').createSignedUrl(path, 3600)
  return NextResponse.json({ avatar_path: path, avatar_url: signed?.signedUrl })
}
