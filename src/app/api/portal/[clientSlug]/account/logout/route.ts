import { NextRequest, NextResponse } from 'next/server'
import { recordPortalEvent } from '@/lib/content-hub/portal-audit'
import { resolveActivePortalMembership } from '@/lib/content-hub/portal-memberships'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ clientSlug: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { clientSlug } = await params

  if (user) {
    const admin = createAdminClient()
    const access = await resolveActivePortalMembership(admin, clientSlug, user.id)
    if (access) {
      await recordPortalEvent(admin, request, {
        clientId: access.client.id,
        eventType: 'logout',
        membershipId: access.membership.id,
        userId: user.id,
        email: access.membership.email,
      })
    }
  }

  await supabase.auth.signOut()
  return NextResponse.json({ ok: true })
}
