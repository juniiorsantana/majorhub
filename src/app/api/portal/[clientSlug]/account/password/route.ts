import { NextRequest, NextResponse } from 'next/server'
import { clientPortalPasswordChangeSchema } from '@/lib/content-hub/access-schemas'
import { recordPortalEvent } from '@/lib/content-hub/portal-audit'
import { resolveActivePortalMembership } from '@/lib/content-hub/portal-memberships'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ clientSlug: string }> }) {
  const parsed = clientPortalPasswordChangeSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'A nova senha é inválida.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return NextResponse.json({ error: 'Sessão necessária.' }, { status: 401 })

  const { clientSlug } = await params
  const admin = createAdminClient()
  const access = await resolveActivePortalMembership(admin, clientSlug, user.id)
  if (!access) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 })

  const { error: passwordError } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (passwordError) return NextResponse.json({ error: 'Não foi possível alterar a senha.', detail: passwordError.message }, { status: 400 })

  const now = new Date().toISOString()
  const { error: membershipError } = await admin.from('client_memberships')
    .update({ must_change_password: false, last_password_change_at: now, updated_at: now })
    .eq('user_id', user.id)
  if (membershipError) return NextResponse.json({ error: 'A senha mudou, mas o acesso não foi atualizado.', detail: membershipError.message }, { status: 500 })

  await recordPortalEvent(admin, request, {
    clientId: access.client.id,
    eventType: 'password_changed',
    membershipId: access.membership.id,
    userId: user.id,
    email: access.membership.email,
  })

  return NextResponse.json({ ok: true, must_change_password: false })
}
