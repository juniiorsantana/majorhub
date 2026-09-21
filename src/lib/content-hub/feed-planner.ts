import { chronological } from './portal-feed'
import type { PostFormat, PostStatus } from './types'

interface Scheduled { scheduled_at: string | null }

/** Grade do perfil como o Instagram mostra: agendadas da mais recente para a mais antiga; sem data fica de fora. */
export function profileOrder<T extends Scheduled & { status: PostStatus }>(posts: T[]) {
  const visible = posts.filter(post => post.status !== 'archived')
  return {
    grid: chronological(visible.filter(post => post.scheduled_at)).reverse(),
    undated: visible.filter(post => !post.scheduled_at),
  }
}

/** Publicada já está no ar e não troca de data; sem data ainda não tem lugar na grade. */
export function canMoveInFeed(post: Scheduled & { status: PostStatus }) {
  return Boolean(post.scheduled_at) && post.status !== 'published'
}

/** Próximo código de cada série usada pelo cliente (C07 → C08, R02 → R03), da série mais usada para a menos usada. */
export function nextCreativeCodes(codes: Array<string | null | undefined>) {
  const series = new Map<string, { number: number; width: number; count: number }>()
  for (const code of codes) {
    const match = code?.trim().toUpperCase().match(/^([A-Z]+)(\d+)$/)
    if (!match) continue
    const [, prefix, digits] = match
    const current = series.get(prefix)
    series.set(prefix, {
      number: Math.max(Number(digits), current?.number ?? 0),
      width: Math.max(digits.length, current?.width ?? 0),
      count: (current?.count ?? 0) + 1,
    })
  }
  return [...series.entries()]
    .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
    .map(([prefix, { number, width }]) => prefix + String(number + 1).padStart(width, '0'))
}

/** Dia (AAAA-MM-DD) no fuso de quem está usando o painel. */
export function localDateKey(iso: string) {
  const date = new Date(iso)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function addDays(key: string, days: number) {
  const date = new Date(`${key}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/** Primeiro dia livre depois da última publicação agendada. */
export function nextFreeDateKey(occupied: string[]) {
  if (!occupied.length) return null
  const taken = new Set(occupied)
  let cursor = addDays([...taken].sort().at(-1)!, 1)
  while (taken.has(cursor)) cursor = addDays(cursor, 1)
  return cursor
}

/** Células do calendário do mês, começando no domingo; `null` preenche os dias fora do mês. */
export function monthCells(year: number, monthIndex: number) {
  const first = new Date(Date.UTC(year, monthIndex, 1))
  const days = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
  const cells: Array<string | null> = Array.from({ length: first.getUTCDay() }, () => null)
  for (let day = 1; day <= days; day++) cells.push(first.toISOString().slice(0, 8) + String(day).padStart(2, '0'))
  while (cells.length % 7) cells.push(null)
  return cells
}

/** As fileiras da grade a partir da fileira da peça, e quem fica antes e depois dela. */
export function feedWindow<T extends { id: string }>(grid: T[], targetId: string, rows = 2): { items: T[]; index: number; newer?: T; older?: T } {
  const index = grid.findIndex(post => post.id === targetId)
  if (index < 0) return { items: [], index }
  const start = Math.floor(index / 3) * 3
  return { items: grid.slice(start, start + rows * 3), index, newer: grid[index - 1], older: grid[index + 1] }
}

/** Formato sugerido pelas peças enviadas: várias viram carrossel; um vídeo vertical vira reels. */
export function detectFormat(media: Array<{ mime_type: string }>, ratio: string): PostFormat {
  if (media.length > 1) return 'carousel'
  if (media[0]?.mime_type.startsWith('video/')) return ratio === '9:16' ? 'reel' : 'video'
  return 'image'
}

/** O Instagram aceita até 30 hashtags somando legenda e campo de hashtags. */
export function countHashtags(...texts: string[]) {
  return texts.join(' ').match(/#[^\s#]+/g)?.length ?? 0
}
