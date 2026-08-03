import { NextRequest, NextResponse } from 'next/server'
import { clientPortalLoginSchema } from '@/lib/content-hub/access-schemas'
import { recordPortalEvent } from '@/lib/content-hub/portal-audit'
import { resolveActivePortalMembership } from '@/lib/content-hub/portal-memberships'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ clientSlug: string }> }) {
  const parsed = clientPortalLoginSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Informe e-mail e senha válidos.' }, { status: 400 })

  const { clientSlug } = await params
  const admin = createAdminClient()
  const { data: targetClient } = await admin.from('clients')
    .select('id')
    .eq('portal_slug', clientSlug.toLowerCase())
    .eq('status', 'active')
    .maybeSingle()

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error || !data.user) {
    if (targetClient) {
      await recordPortalEvent(admin, request, {
        clientId: targetClient.id,
        eventType: 'login_failed',
        email: parsed.data.email,
        metadata: { reason: 'invalid_credentials' },
      })
    }
    return NextResponse.json({ error: 'E-mail ou senha inválidos.' }, { status: 401 })
  }

  const access = await resolveActivePortalMembership(admin, clientSlug, data.user.id)
  if (!access) {
    await supabase.auth.signOut()
    if (targetClient) {
      await recordPortalEvent(admin, request, {
        clientId: targetClient.id,
        eventType: 'login_failed',
        userId: data.user.id,
        email: parsed.data.email,
        metadata: { reason: 'membership_not_found_or_suspended' },
      })
    }
    return NextResponse.json({ error: 'Este usuário não possui acesso ao portal.' }, { status: 403 })
  }

  const now = new Date().toISOString()
  await admin.from('client_memberships').update({ last_access_at: now, updated_at: now }).eq('id', access.membership.id)
  await recordPortalEvent(admin, request, {
    clientId: access.client.id,
    eventType: 'login_succeeded',
    membershipId: access.membership.id,
    userId: data.user.id,
    email: access.membership.email,
  })

  return NextResponse.json({
    ok: true,
    must_change_password: access.membership.must_change_password,
    client: { id: access.client.id, name: access.client.name, slug: access.client.portal_slug },
    membership: {
      id: access.membership.id,
      name: access.membership.name,
      email: access.membership.email,
      role: access.membership.role,
    },
  }, { headers: { 'Cache-Control': 'no-store' } })
}
