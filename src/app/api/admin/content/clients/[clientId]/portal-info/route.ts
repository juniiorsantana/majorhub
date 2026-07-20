import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const authorization = await authorizeAdmin()
  if (!authorization.authorized) return NextResponse.json({ error: 'Acesso negado.' }, { status: authorization.status })
  const { clientId } = await params
  const supabase = await createClient()
  const [clientResult, approversResult, batchesResult] = await Promise.all([
    supabase.from('clients').select('id, portal_slug').eq('id', clientId).maybeSingle(),
    supabase.from('client_approvers').select('id, email, name, active').eq('client_id', clientId).order('created_at'),
    supabase.from('approval_batches').select('id, calendar_id, title, slug, status, published_at, approval_batch_posts(count)').eq('client_id', clientId).order('published_at', { ascending: false }),
  ])
  if (clientResult.error || !clientResult.data) return NextResponse.json({ error: 'Portal do cliente não encontrado.' }, { status: 404 })
  if (approversResult.error || batchesResult.error) return NextResponse.json({ error: 'Não foi possível carregar os dados do portal.' }, { status: 500 })
  const origin = new URL(_request.url).origin
  return NextResponse.json({
    portal_slug: clientResult.data.portal_slug,
    portal_url: `${origin}/${clientResult.data.portal_slug}`,
    approvers: approversResult.data ?? [],
    batches: batchesResult.data ?? [],
  }, { headers: { 'Cache-Control': 'no-store' } })
}
