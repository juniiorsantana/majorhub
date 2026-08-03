import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/admin/auth'
import { clientPasswordResetSchema } from '@/lib/content-hub/access-schemas'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

type Context = { params: Promise<{ clientId: string; membershipId: string }> }

export async function POST(request: NextRequest, { params }: Context) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })

  const parsed = clientPasswordResetSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Revise a senha temporária.' }, { status: 400 })
  }

  const { clientId, membershipId } = await params
  const supabase = await createClient()
  const { data: membership } = await supabase.from('client_memberships')
    .select('*')
    .eq('id', membershipId)
    .eq('client_id', clientId)
    .maybeSingle()

  if (!membership) return NextResponse.json({ error: 'Acesso não encontrado.' }, { status: 404 })

  const admin = createAdminClient()
  const { error: authError } = await admin.auth.admin.updateUserById(membership.user_id, {
    password: parsed.data.temporary_password,
  })
  if (authError) return NextResponse.json({ error: 'Não foi possível redefinir a senha.', detail: authError.message }, { status: 500 })

  const { error: membershipError } = await admin.from('client_memberships')
    .update({ must_change_password: true, updated_at: new Date().toISOString() })
    .eq('user_id', membership.user_id)
  if (membershipError) return NextResponse.json({ error: 'A senha mudou, mas o primeiro acesso não foi marcado.', detail: membershipError.message }, { status: 500 })

  await supabase.from('portal_access_events').insert({
    client_id: clientId,
    membership_id: membership.id,
    user_id: membership.user_id,
    event_type: 'password_reset',
    email_snapshot: membership.email,
    metadata: { reset_by: authorization.userId },
  })

  return NextResponse.json({ ok: true, must_change_password: true })
}
