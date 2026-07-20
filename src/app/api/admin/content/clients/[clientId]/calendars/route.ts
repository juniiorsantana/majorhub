import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/admin/auth'
import { calendarSchema } from '@/lib/content-hub/schemas'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })

  const parsed = calendarSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Revise os dados do cronograma.' }, { status: 400 })

  const { clientId } = await params
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_calendars')
    .insert({ ...parsed.data, client_id: clientId, created_by: authorization.userId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Nao foi possivel criar o cronograma.', detail: error.message }, { status: 500 })
  return NextResponse.json({ calendar: { ...data, posts: [] } }, { status: 201 })
}
