import { createClient } from '@supabase/supabase-js'

export type SupabaseAdminConfigCode = 'missing_url' | 'missing_service_role_key' | 'invalid_url'

export class SupabaseAdminConfigError extends Error {
  constructor(public readonly code: SupabaseAdminConfigCode) {
    super(code)
    this.name = 'SupabaseAdminConfigError'
  }
}

function normalizeEnvironmentValue(value?: string) {
  const trimmed = value?.trim() ?? ''
  if (trimmed.length >= 2) {
    const first = trimmed[0]
    const last = trimmed[trimmed.length - 1]
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return trimmed.slice(1, -1).trim()
    }
  }
  return trimmed
}

export function getSupabaseAdminConfig() {
  const url = normalizeEnvironmentValue(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)
  const serviceRoleKey = normalizeEnvironmentValue(
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY,
  )

  if (!url) throw new SupabaseAdminConfigError('missing_url')
  if (!serviceRoleKey) throw new SupabaseAdminConfigError('missing_service_role_key')

  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.protocol !== 'https:' && parsedUrl.hostname !== 'localhost' && parsedUrl.hostname !== '127.0.0.1') {
      throw new Error('invalid protocol')
    }
  } catch {
    throw new SupabaseAdminConfigError('invalid_url')
  }

  return { url, serviceRoleKey }
}

export function createAdminClient() {
  const { url, serviceRoleKey } = getSupabaseAdminConfig()

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
