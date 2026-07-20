import { createClient } from '@/lib/supabase/server'

export type AdminAuthorization =
  | { authorized: true; userId: string }
  | { authorized: false; status: 401 | 403 }

export async function authorizeAdmin(): Promise<AdminAuthorization> {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) return { authorized: false, status: 401 }

  const { data: member, error: memberError } = await supabase
    .from('team_members')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (memberError || member?.role !== 'admin') {
    return { authorized: false, status: 403 }
  }

  return { authorized: true, userId: user.id }
}
