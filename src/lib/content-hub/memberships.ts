import type { User } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'

type SupabaseAdminClient = ReturnType<typeof createAdminClient>

export function normalizeMembershipEmail(value: string) {
  return value.trim().toLowerCase()
}

export async function findAuthUserByEmail(admin: SupabaseAdminClient, rawEmail: string): Promise<User | null> {
  const email = normalizeMembershipEmail(rawEmail)
  const perPage = 200

  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) throw error

    const user = data.users.find(item => normalizeMembershipEmail(item.email ?? '') === email)
    if (user) return user
    if (data.users.length < perPage) return null
  }

  throw new Error('Limite de usuários do Auth excedido durante a busca por e-mail.')
}

export async function resolvePortalMembership(admin: SupabaseAdminClient, clientSlug: string, userId: string) {
  const { data: client, error: clientError } = await admin.from('clients')
    .select('id, name, portal_slug')
    .eq('portal_slug', clientSlug.toLowerCase())
    .maybeSingle()

  if (clientError) throw clientError
  if (!client) return null

  const { data: membership, error: membershipError } = await admin.from('client_memberships')
    .select('*')
    .eq('client_id', client.id)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (membershipError) throw membershipError
  if (!membership) return null
  return { client, membership }
}
