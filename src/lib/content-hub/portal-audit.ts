import { createHmac } from 'crypto'
import type { NextRequest } from 'next/server'
import { getSupabaseAdminConfig, createAdminClient } from '@/lib/supabase/admin'

type SupabaseAdminClient = ReturnType<typeof createAdminClient>

interface PortalEventInput {
  clientId: string
  eventType: string
  membershipId?: string | null
  userId?: string | null
  email?: string | null
  metadata?: Record<string, unknown>
}

function requestIp(request: NextRequest) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || ''
}

function hashIp(ip: string) {
  if (!ip) return null
  return createHmac('sha256', getSupabaseAdminConfig().serviceRoleKey).update(ip).digest('hex')
}

export async function recordPortalEvent(
  admin: SupabaseAdminClient,
  request: NextRequest,
  input: PortalEventInput,
) {
  const { error } = await admin.from('portal_access_events').insert({
    client_id: input.clientId,
    membership_id: input.membershipId ?? null,
    user_id: input.userId ?? null,
    event_type: input.eventType,
    email_snapshot: input.email?.trim().toLowerCase() ?? null,
    ip_hash: hashIp(requestIp(request)),
    user_agent: request.headers.get('user-agent')?.slice(0, 500) ?? null,
    metadata: input.metadata ?? {},
  })

  if (error) console.error('[portal/audit]', error.message)
}
