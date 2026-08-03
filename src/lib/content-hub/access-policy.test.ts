import { describe, expect, it } from 'vitest'
import { canSubmitClientReview, shouldEnableLegacyApprover } from './access-policy'

describe('client access policy', () => {
  it.each(['client_admin', 'approver'] as const)('allows %s to submit reviews', role => {
    expect(canSubmitClientReview(role)).toBe(true)
  })

  it('keeps viewers read-only', () => {
    expect(canSubmitClientReview('viewer')).toBe(false)
  })

  it.each(['client_admin', 'approver'] as const)('enables the legacy approver for active %s access', role => {
    expect(shouldEnableLegacyApprover(role, 'active')).toBe(true)
  })

  it('does not create a legacy approval path for viewers', () => {
    expect(shouldEnableLegacyApprover('viewer', 'active')).toBe(false)
  })

  it.each(['client_admin', 'approver', 'viewer'] as const)('disables legacy approval while %s access is suspended', role => {
    expect(shouldEnableLegacyApprover(role, 'suspended')).toBe(false)
  })
})
