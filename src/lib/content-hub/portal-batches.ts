import type { SupabaseClient } from '@supabase/supabase-js'

interface BatchPost { id: string; current_version: number }

/** Acrescenta ao fim do envio as publicações que ainda não estão nele. As que já estão continuam como a cliente viu. */
export async function appendToBatch<T extends BatchPost>(supabase: SupabaseClient, batchId: string, posts: T[]) {
  const { data: members, error } = await supabase.from('approval_batch_posts').select('post_id, position').eq('batch_id', batchId)
  if (error) return { error: error.message }
  const inBatch = new Set((members ?? []).map(member => member.post_id))
  const missing = posts.filter(post => !inBatch.has(post.id))
  if (!missing.length) return { added: [] as T[] }

  const nextPosition = Math.max(-1, ...(members ?? []).map(member => member.position)) + 1
  const { error: insertError } = await supabase.from('approval_batch_posts').insert(missing.map((post, index) => ({
    batch_id: batchId,
    post_id: post.id,
    position: nextPosition + index,
    version_at_publish: post.current_version,
  })))
  if (insertError) return { error: insertError.message }
  return { added: missing }
}

/** Enviar para aprovação coloca a publicação no envio aberto do cronograma, quando o portal já foi liberado. */
export async function addToOpenBatch(supabase: SupabaseClient, post: BatchPost & { client_id: string; calendar_id: string | null; status: string }) {
  if (post.status !== 'pending_review' || !post.calendar_id) return
  const { data: batch } = await supabase.from('approval_batches').select('id')
    .eq('client_id', post.client_id).eq('calendar_id', post.calendar_id).eq('status', 'open').maybeSingle()
  if (!batch) return
  const result = await appendToBatch(supabase, batch.id, [post])
  if ('error' in result) console.error('[content-hub] publicação não entrou no envio aberto', result.error)
}
