import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/admin/auth'
import { clientMembershipUpdateSchema } from '@/lib/content-hub/access-schemas'
import { shouldEnableLegacyApprover } from '@/lib/content-hub/access-policy'
import { createClient } from '@/lib/supabase/server'

type Context = { params: Promise<{ clientId: string; membershipId: string }> }

export async function PATCH(request: NextRequest, { params }: Context) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })

  const parsed = clientMembershipUpdateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Revise as alterações.' }, { status: 400 })
  }

  const { clientId, membershipId } = await params
  const supabase = await createClient()
  const { data: existing, error: existingError } = await supabase.from('client_memberships')
    .select('*')
    .eq('id', membershipId)
    .eq('client_id', clientId)
    .maybeSingle()

  if (existingError) return NextResponse.json({ error: 'Não foi possível consultar o acesso.', detail: existingError.message }, { status: 500 })
  if (!existing) return NextResponse.json({ error: 'Acesso não encontrado.' }, { status: 404 })

  const { data: membership, error } = await supabase.from('client_memberships')
    .update(parsed.data)
    .eq('id', membershipId)
    .eq('client_id', clientId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Não foi possível atualizar o acesso.', detail: error.message }, { status: 500 })

  if (parsed.data.name || parsed.data.status || parsed.data.role) {
    const legacyName = membership.name ?? existing.name
    const legacyApprovalEnabled = shouldEnableLegacyApprover(membership.role, membership.status)

    const { data: legacyApprover } = await supabase.from('client_approvers')
      .select('id')
      .eq('client_id', clientId)
      .ilike('email', existing.email)
      .maybeSingle()

    if (legacyApprover) {
      await supabase.from('client_approvers').update({
        name: legacyName,
        active: legacyApprovalEnabled,
      }).eq('id', legacyApprover.id)
    } else if (legacyApprovalEnabled) {
      await supabase.from('client_approvers').insert({
        client_id: clientId,
        email: existing.email,
        name: legacyName,
        active: true,
      })
    }
  }

  const eventType = parsed.data.status && parsed.data.status !== existing.status
    ? parsed.data.status === 'active' ? 'access_reactivated' : 'access_suspended'
    : parsed.data.role && parsed.data.role !== existing.role ? 'role_changed' : null

  if (eventType) {
    await supabase.from('portal_access_events').insert({
      client_id: clientId,
      membership_id: membership.id,
      user_id: membership.user_id,
      event_type: eventType,
      email_snapshot: membership.email,
      metadata: {
        previous_role: existing.role,
        role: membership.role,
        previous_status: existing.status,
        status: membership.status,
      },
    })
  }

  return NextResponse.json({ membership })
}
