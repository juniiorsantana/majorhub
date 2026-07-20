import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/admin/auth'
import { calendarSchema } from '@/lib/content-hub/schemas'
import { createClient } from '@/lib/supabase/server'

type Context = { params: Promise<{ calendarId: string }> }

export async function PUT(request: NextRequest, { params }: Context) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })
  const parsed = calendarSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Revise os dados do cronograma.' }, { status: 400 })

  const { calendarId } = await params
  const supabase = await createClient()
  const { data, error } = await supabase.from('content_calendars')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', calendarId).select().maybeSingle()

  if (error) return NextResponse.json({ error: 'Nao foi possivel salvar o cronograma.' }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Cronograma nao encontrado.' }, { status: 404 })
  return NextResponse.json({ calendar: data })
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })
  const { calendarId } = await params
  const supabase = await createClient()
  const { error } = await supabase.from('content_calendars').update({ status: 'archived', updated_at: new Date().toISOString() }).eq('id', calendarId)
  if (error) return NextResponse.json({ error: 'Nao foi possivel arquivar o cronograma.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
