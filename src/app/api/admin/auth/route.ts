import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const credentialsSchema = z.object({ email: z.string().email(), password: z.string().min(8).max(128) })

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Configure as chaves do Supabase no servidor.' }, { status: 500 })
    }
    const parsed = credentialsSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Informe um e-mail e uma senha válida.' }, { status: 400 })
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data)
    if (error) return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 })

    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('user_id', data.user.id)
      .maybeSingle()

    if (memberError || member?.role !== 'admin') {
      await supabase.auth.signOut()
      return NextResponse.json({ error: 'Esta conta não possui acesso administrativo.' }, { status: 403 })
    }

    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 })
  }
}
