import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/admin/auth'
import { clientMembershipCreateSchema } from '@/lib/content-hub/access-schemas'
import { shouldEnableLegacyApprover } from '@/lib/content-hub/access-policy'
import { findAuthUserByEmail } from '@/lib/content-hub/memberships'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

type Context = { params: Promise<{ clientId: string }> }

export async function GET(_request: NextRequest, { params }: Context) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })

  const { clientId } = await params
  const supabase = await createClient()
  const { data: client } = await supabase.from('clients').select('id').eq('id', clientId).maybeSingle()
  if (!client) return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 })

  const { data, error } = await supabase.from('client_memberships')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at')

  if (error) return NextResponse.json({ error: 'Não foi possível carregar os acessos.', detail: error.message }, { status: 500 })
  return NextResponse.json({ memberships: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: NextRequest, { params }: Context) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })

  const parsed = clientMembershipCreateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Revise os dados do usuário.' }, { status: 400 })
  }

  const { clientId } = await params
  const supabase = await createClient()
  const { data: client } = await supabase.from('clients').select('id').eq('id', clientId).maybeSingle()
  if (!client) return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 })

  const { data: duplicate } = await supabase.from('client_memberships')
    .select('id')
    .eq('client_id', clientId)
    .ilike('email', parsed.data.email)
    .maybeSingle()
  if (duplicate) return NextResponse.json({ error: 'Este e-mail já possui acesso ao cliente.' }, { status: 409 })

  const admin = createAdminClient()
  let authUser = await findAuthUserByEmail(admin, parsed.data.email)
  let createdAuthUser = false

  if (!authUser) {
    if (!parsed.data.temporary_password) {
      return NextResponse.json({ error: 'Informe uma senha temporária para o novo usuário.' }, { status: 400 })
    }

    const { data, error } = await admin.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.temporary_password,
      email_confirm: true,
      user_metadata: { display_name: parsed.data.name },
    })
    if (error || !data.user) {
      return NextResponse.json({ error: 'Não foi possível criar o usuário no Auth.', detail: error?.message }, { status: 500 })
    }
    authUser = data.user
    createdAuthUser = true
  }

  const { data: membership, error: membershipError } = await supabase.from('client_memberships').insert({
    client_id: clientId,
    user_id: authUser.id,
    email: parsed.data.email,
    name: parsed.data.name,
    role: parsed.data.role,
    status: 'active',
    must_change_password: createdAuthUser,
    created_by: authorization.userId,
  }).select().single()

  if (membershipError || !membership) {
    if (createdAuthUser) await admin.auth.admin.deleteUser(authUser.id)
    return NextResponse.json({ error: 'Não foi possível vincular o usuário ao cliente.', detail: membershipError?.message }, { status: 500 })
  }

  const { data: legacyApprover } = await supabase.from('client_approvers')
    .select('id')
    .eq('client_id', clientId)
    .ilike('email', parsed.data.email)
    .maybeSingle()

  const legacyApprovalEnabled = shouldEnableLegacyApprover(parsed.data.role)
  if (legacyApprover) {
    await supabase.from('client_approvers').update({ name: parsed.data.name, active: legacyApprovalEnabled }).eq('id', legacyApprover.id)
  } else if (legacyApprovalEnabled) {
    await supabase.from('client_approvers').insert({ client_id: clientId, email: parsed.data.email, name: parsed.data.name, active: true })
  }

  await supabase.from('portal_access_events').insert({
    client_id: clientId,
    membership_id: membership.id,
    user_id: authUser.id,
    event_type: 'access_created',
    email_snapshot: parsed.data.email,
    metadata: { role: parsed.data.role, auth_user_created: createdAuthUser },
  })

  return NextResponse.json({ membership, auth_user_created: createdAuthUser }, { status: 201 })
}
