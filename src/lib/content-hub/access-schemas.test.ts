import { describe, expect, it } from 'vitest'
import {
  clientMembershipCreateSchema,
  clientMembershipUpdateSchema,
  clientPasswordResetSchema,
  clientPortalLoginSchema,
  clientPortalPasswordChangeSchema,
} from './access-schemas'
import { normalizeMembershipEmail } from './memberships'

const strongPassword = 'MajorHub2026'

describe('client membership schemas', () => {
  it('normalizes an email and defaults to the approver role', () => {
    const result = clientMembershipCreateSchema.parse({
      email: '  CLIENTE@EXAMPLE.COM ',
      name: 'Dr. Lucas',
      temporary_password: strongPassword,
    })

    expect(result.email).toBe('cliente@example.com')
    expect(result.role).toBe('approver')
  })

  it('allows an existing Auth user to be linked without a new password', () => {
    const result = clientMembershipCreateSchema.safeParse({
      email: 'parceiro@example.com',
      name: 'Parceiro',
      role: 'viewer',
    })

    expect(result.success).toBe(true)
  })

  it('rejects weak temporary passwords', () => {
    const result = clientMembershipCreateSchema.safeParse({
      email: 'cliente@example.com',
      name: 'Cliente',
      temporary_password: 'senha-fraca',
    })

    expect(result.success).toBe(false)
  })

  it('requires at least one membership update', () => {
    expect(clientMembershipUpdateSchema.safeParse({}).success).toBe(false)
    expect(clientMembershipUpdateSchema.safeParse({ status: 'suspended' }).success).toBe(true)
  })

  it('accepts only supported client roles', () => {
    expect(clientMembershipUpdateSchema.safeParse({ role: 'client_admin' }).success).toBe(true)
    expect(clientMembershipUpdateSchema.safeParse({ role: 'owner' }).success).toBe(false)
  })
})

describe('client password schemas', () => {
  it('applies the same password policy to resets and first changes', () => {
    expect(clientPasswordResetSchema.safeParse({ temporary_password: strongPassword }).success).toBe(true)
    expect(clientPortalPasswordChangeSchema.safeParse({ password: strongPassword }).success).toBe(true)
    expect(clientPortalPasswordChangeSchema.safeParse({ password: '1234567890' }).success).toBe(false)
  })
})

describe('client portal login schema', () => {
  it('normalizes the login email without changing the password', () => {
    const result = clientPortalLoginSchema.parse({
      email: ' CLIENTE@EXAMPLE.COM ',
      password: strongPassword,
    })

    expect(result).toEqual({ email: 'cliente@example.com', password: strongPassword })
  })

  it('normalizes membership emails consistently', () => {
    expect(normalizeMembershipEmail('  CLIENTE@EXAMPLE.COM ')).toBe('cliente@example.com')
  })
})
