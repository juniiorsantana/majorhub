import type { PostAspectRatio, PostFormat, PostStatus } from './types'

export type ReviewState = 'pending' | 'approved' | 'changes'

export function reviewState(status: PostStatus): ReviewState {
  if (status === 'approved' || status === 'published') return 'approved'
  if (status === 'changes_requested' || status === 'in_progress') return 'changes'
  return 'pending'
}

interface Scheduled { scheduled_at: string | null }

function scheduleTime(post: Scheduled) {
  const time = post.scheduled_at ? Date.parse(post.scheduled_at) : Number.NaN
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time
}

/** Ordem de publicação: pela data agendada, sem data por último; empate mantém a ordem do envio. */
export function chronological<T extends Scheduled>(posts: T[]): T[] {
  return posts
    .map((post, index) => ({ post, index }))
    .sort((a, b) => scheduleTime(a.post) - scheduleTime(b.post) || a.index - b.index)
    .map(item => item.post)
}

/** Próxima pendente depois de `from`, voltando ao início da lista; -1 quando não sobra nenhuma. */
export function nextPendingIndex<T>(posts: T[], from: number, isPending: (post: T) => boolean) {
  for (let step = 1; step < posts.length; step++) {
    const index = (from + step) % posts.length
    if (isPending(posts[index])) return index
  }
  return -1
}

interface FeedPost extends Scheduled { id: string; status: PostStatus }
interface FeedBatch<T extends FeedPost> { id: string; posts: T[] }

/**
 * O que já aparece no perfil abaixo do envio atual: peças aprovadas ou publicadas
 * de outros envios, agendadas antes da primeira peça deste, da mais recente para a mais antiga.
 */
export function previousFeedPosts<T extends FeedPost>(batches: FeedBatch<T>[], currentBatchId: string, limit = 12): T[] {
  const current = batches.find(batch => batch.id === currentBatchId)
  const currentIds = new Set(current?.posts.map(post => post.id))
  const firstScheduled = Math.min(...(current?.posts ?? []).map(scheduleTime))
  const seen = new Set<string>()
  const previous: T[] = []

  for (const batch of batches) {
    if (batch.id === currentBatchId) continue
    for (const post of batch.posts) {
      if (currentIds.has(post.id) || seen.has(post.id)) continue
      if (reviewState(post.status) !== 'approved' || scheduleTime(post) >= firstScheduled) continue
      seen.add(post.id)
      previous.push(post)
    }
  }

  return chronological(previous).reverse().slice(0, limit)
}

// Desde 2025 a grade do perfil usa miniaturas 3:4 e corta cada formato de um jeito.
const GRID_CROP_NOTES: Record<PostAspectRatio, string> = {
  '1:1': 'A grade usa 3:4: o quadrado perde parte das laterais.',
  '4:5': 'A grade usa 3:4: as laterais ficam levemente cortadas.',
  '9:16': 'A grade mostra só o centro: parte do topo e da base fica de fora.',
}

export function gridCropNote(ratio: PostAspectRatio) {
  return GRID_CROP_NOTES[ratio]
}

const FORMAT_LABELS: Record<PostFormat, string> = {
  image: 'Imagem',
  carousel: 'Carrossel',
  video: 'Vídeo',
  reel: 'Reels',
}

export function formatLabel(format: PostFormat, mediaCount: number) {
  if (mediaCount > 1) return `Carrossel · ${mediaCount} imagens`
  return FORMAT_LABELS[format] ?? 'Publicação'
}

/** Onde a cliente pode apontar o ajuste: cada imagem do carrossel, a legenda ou outro ponto. */
export function correctionTargets(format: PostFormat, mediaCount: number) {
  const media = mediaCount > 1
    ? Array.from({ length: mediaCount }, (_, index) => `Imagem ${index + 1}`)
    : [format === 'video' || format === 'reel' ? 'Vídeo' : 'Imagem']
  return [...media, 'Legenda', 'Outro']
}

/** O alvo vai como prefixo do comentário, então a API de revisão não muda. */
export function correctionComment(target: string | null, text: string) {
  const comment = text.trim()
  return target ? `[${target}] ${comment}` : comment
}
