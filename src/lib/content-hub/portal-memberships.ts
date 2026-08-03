import { createAdminClient } from '@/lib/supabase/admin'

type SupabaseAdminClient = ReturnType<typeof createAdminClient>

export async function resolveActivePortalMembership(admin: SupabaseAdminClient, clientSlug: string, userId: string) {
  const { data: client, error: clientError } = await admin.from('clients')
    .select('id, name, portal_slug, status')
    .eq('portal_slug', clientSlug.toLowerCase())
    .eq('status', 'active')
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
