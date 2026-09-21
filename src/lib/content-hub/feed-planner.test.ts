import { describe, expect, it } from 'vitest'
import {
  addDays,
  canMoveInFeed,
  countHashtags,
  detectFormat,
  feedWindow,
  monthCells,
  nextCreativeCodes,
  nextFreeDateKey,
  profileOrder,
} from './feed-planner'
import type { PostStatus } from './types'

function post(id: string, scheduled_at: string | null, status: PostStatus = 'pending_review') {
  return { id, scheduled_at, status }
}

describe('feed planner', () => {
  it('shows scheduled posts newest first and keeps undated and archived ones out of the grid', () => {
    const { grid, undated } = profileOrder([
      post('antiga', '2026-10-01T15:00:00Z'),
      post('sem-data', null, 'draft'),
      post('nova', '2026-10-20T15:00:00Z'),
      post('arquivada', '2026-10-25T15:00:00Z', 'archived'),
    ])
    expect(grid.map(item => item.id)).toEqual(['nova', 'antiga'])
    expect(undated.map(item => item.id)).toEqual(['sem-data'])
  })

  it('locks published and undated posts', () => {
    expect(canMoveInFeed(post('a', '2026-10-01T15:00:00Z', 'published'))).toBe(false)
    expect(canMoveInFeed(post('b', null, 'draft'))).toBe(false)
    expect(canMoveInFeed(post('c', '2026-10-01T15:00:00Z', 'approved'))).toBe(true)
  })

  it('suggests the next code of each series, most used series first', () => {
    expect(nextCreativeCodes(['C07', 'C03', 'R02', null, 'solto', 'c01'])).toEqual(['C08', 'R03'])
    expect(nextCreativeCodes(['C009'])).toEqual(['C010'])
  })

  it('finds the first free day after the latest scheduled post', () => {
    expect(nextFreeDateKey(['2026-10-20', '2026-10-01', '2026-10-17'])).toBe('2026-10-21')
    expect(nextFreeDateKey([])).toBeNull()
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
  })

  it('lays out a month starting on sunday', () => {
    const cells = monthCells(2026, 9)
    expect(cells.slice(0, 5)).toEqual([null, null, null, null, '2026-10-01'])
    expect(cells.length % 7).toBe(0)
    expect(cells.filter(Boolean)).toHaveLength(31)
  })

  it('returns the rows starting at the post and its neighbours', () => {
    const grid = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(id => ({ id }))
    const placement = feedWindow(grid, 'e')
    expect(placement.items.map(item => item.id)).toEqual(['d', 'e', 'f', 'g', 'h'])
    expect(placement.newer?.id).toBe('d')
    expect(placement.older?.id).toBe('f')
    expect(feedWindow(grid, 'x').index).toBe(-1)
  })

  it('detects the format from the uploaded pieces', () => {
    expect(detectFormat([{ mime_type: 'image/png' }, { mime_type: 'image/png' }], '4:5')).toBe('carousel')
    expect(detectFormat([{ mime_type: 'video/mp4' }], '9:16')).toBe('reel')
    expect(detectFormat([{ mime_type: 'video/mp4' }], '4:5')).toBe('video')
    expect(detectFormat([{ mime_type: 'image/jpeg' }], '1:1')).toBe('image')
  })

  it('counts hashtags across caption and hashtag field', () => {
    expect(countHashtags('Texto com #um e #dois', '#tres #quatro')).toBe(4)
    expect(countHashtags('', '')).toBe(0)
  })
})
