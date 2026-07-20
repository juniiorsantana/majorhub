import { createHash, randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/admin/auth'
import { shareLinkSchema } from '@/lib/content-hub/schemas'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })

  const parsed = shareLinkSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Configuracao do link invalida.' }, { status: 400 })

  const { clientId } = await params
  const rawToken = randomBytes(32).toString('base64url')
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  const expiresAt = new Date(Date.now() + parsed.data.expires_in_days * 24 * 60 * 60 * 1000).toISOString()
  const supabase = await createClient()

  let revokeQuery = supabase.from('share_links').update({ revoked_at: new Date().toISOString() })
    .eq('client_id', clientId).is('revoked_at', null)
  revokeQuery = parsed.data.calendar_id
    ? revokeQuery.eq('calendar_id', parsed.data.calendar_id)
    : revokeQuery.is('calendar_id', null)
  await revokeQuery

  const { error } = await supabase.from('share_links').insert({
    client_id: clientId,
    calendar_id: parsed.data.calendar_id ?? null,
    token_hash: tokenHash,
    expires_at: expiresAt,
    created_by: authorization.userId,
  })

  if (error) return NextResponse.json({ error: 'Nao foi possivel gerar o link.', detail: error.message }, { status: 500 })

  const origin = new URL(request.url).origin
  return NextResponse.json({ url: `${origin}/aprovar/${rawToken}`, expires_at: expiresAt })
}
