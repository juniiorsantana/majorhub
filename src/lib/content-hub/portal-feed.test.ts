import { describe, expect, it } from 'vitest'
import {
  chronological,
  correctionComment,
  correctionTargets,
  formatLabel,
  nextPendingIndex,
  previousFeedPosts,
  reviewState,
} from './portal-feed'
import type { PostStatus } from './types'

function post(id: string, scheduled_at: string | null, status: PostStatus = 'pending_review') {
  return { id, scheduled_at, status }
}

describe('portal feed', () => {
  it('orders posts by schedule, undated last, keeping batch order on ties', () => {
    const posts = [
      post('sem-data', null),
      post('dia-20', '2026-10-20T12:00:00Z'),
      post('dia-15-a', '2026-10-15T12:00:00Z'),
      post('dia-15-b', '2026-10-15T12:00:00Z'),
    ]
    expect(chronological(posts).map(item => item.id)).toEqual(['dia-15-a', 'dia-15-b', 'dia-20', 'sem-data'])
  })

  it('finds the next pending post after the current one and wraps around', () => {
    const posts = ['pending', 'approved', 'current', 'approved']
    const isPending = (value: string) => value === 'pending'
    expect(nextPendingIndex(posts, 2, isPending)).toBe(0)
    expect(nextPendingIndex(['current', 'approved'], 0, isPending)).toBe(-1)
  })

  it('never returns the current post as the next pending one', () => {
    expect(nextPendingIndex(['pending'], 0, value => value === 'pending')).toBe(-1)
  })

  it.each([
    ['pending_review', 'pending'],
    ['draft', 'pending'],
    ['approved', 'approved'],
    ['published', 'approved'],
    ['changes_requested', 'changes'],
    ['in_progress', 'changes'],
  ] as const)('maps %s to %s', (status, expected) => {
    expect(reviewState(status)).toBe(expected)
  })

  it('keeps only approved posts from other batches scheduled before the current one, newest first', () => {
    const batches = [
      { id: 'outubro', posts: [post('c01', '2026-10-01T12:00:00Z'), post('c02', '2026-10-03T12:00:00Z')] },
      {
        id: 'setembro',
        posts: [
          post('s01', '2026-09-10T12:00:00Z', 'published'),
          post('s02', '2026-09-20T12:00:00Z', 'approved'),
          post('s03', '2026-09-25T12:00:00Z', 'changes_requested'),
          post('c01', '2026-10-01T12:00:00Z', 'approved'),
        ],
      },
      { id: 'novembro', posts: [post('n01', '2026-11-02T12:00:00Z', 'approved')] },
    ]
    expect(previousFeedPosts(batches, 'outubro').map(item => item.id)).toEqual(['s02', 's01'])
  })

  it('does not repeat a post that appears in more than one previous batch', () => {
    const batches = [
      { id: 'atual', posts: [post('a1', '2026-10-01T12:00:00Z')] },
      { id: 'antigo-1', posts: [post('x', '2026-09-01T12:00:00Z', 'approved')] },
      { id: 'antigo-2', posts: [post('x', '2026-09-01T12:00:00Z', 'approved')] },
    ]
    expect(previousFeedPosts(batches, 'atual')).toHaveLength(1)
  })

  it('offers one target per carousel image plus caption and other', () => {
    expect(correctionTargets('carousel', 3)).toEqual(['Imagem 1', 'Imagem 2', 'Imagem 3', 'Legenda', 'Outro'])
    expect(correctionTargets('reel', 1)).toEqual(['Vídeo', 'Legenda', 'Outro'])
  })

  it('prefixes the chosen target to the correction comment', () => {
    expect(correctionComment('Imagem 2', '  Trocar a foto.  ')).toBe('[Imagem 2] Trocar a foto.')
    expect(correctionComment(null, 'Trocar a foto.')).toBe('Trocar a foto.')
  })

  it('describes carousels by their number of images', () => {
    expect(formatLabel('carousel', 4)).toBe('Carrossel · 4 imagens')
    expect(formatLabel('reel', 1)).toBe('Reels')
  })
})
