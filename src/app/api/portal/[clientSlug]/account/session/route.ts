import { NextRequest, NextResponse } from 'next/server'
import { resolveActivePortalMembership } from '@/lib/content-hub/portal-memberships'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ clientSlug: string }> }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Sessão necessária.' }, { status: 401 })

  const { clientSlug } = await params
  const access = await resolveActivePortalMembership(createAdminClient(), clientSlug, user.id)
  if (!access) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 })

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    client: { id: access.client.id, name: access.client.name, slug: access.client.portal_slug },
    membership: {
      id: access.membership.id,
      name: access.membership.name,
      role: access.membership.role,
      must_change_password: access.membership.must_change_password,
    },
  }, { headers: { 'Cache-Control': 'no-store' } })
}
