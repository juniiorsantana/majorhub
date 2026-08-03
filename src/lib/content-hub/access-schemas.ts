import { z } from 'zod'

const clientAccessPassword = z.string()
  .min(10, 'A senha temporária deve ter ao menos 10 caracteres.')
  .max(128, 'A senha temporária deve ter no máximo 128 caracteres.')
  .refine(value => /[a-z]/.test(value), 'Inclua uma letra minúscula.')
  .refine(value => /[A-Z]/.test(value), 'Inclua uma letra maiúscula.')
  .refine(value => /\d/.test(value), 'Inclua um número.')

export const clientMembershipCreateSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(180),
  name: z.string().trim().min(2).max(120),
  role: z.enum(['client_admin', 'approver', 'viewer']).default('approver'),
  temporary_password: clientAccessPassword.optional(),
})

export const clientMembershipUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  role: z.enum(['client_admin', 'approver', 'viewer']).optional(),
  status: z.enum(['active', 'suspended']).optional(),
}).refine(value => Object.keys(value).length > 0, 'Informe ao menos uma alteração.')

export const clientPasswordResetSchema = z.object({
  temporary_password: clientAccessPassword,
})

export const clientPortalLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(180),
  password: z.string().min(1).max(128),
})

export const clientPortalPasswordChangeSchema = z.object({
  password: clientAccessPassword,
})

export type ClientAccessRole = 'client_admin' | 'approver' | 'viewer'
export type ClientAccessStatus = 'active' | 'suspended'

export interface ClientMembership {
  id: string
  client_id: string
  user_id: string
  email: string
  name: string
  role: ClientAccessRole
  status: ClientAccessStatus
  must_change_password: boolean
  last_access_at: string | null
  last_password_change_at: string | null
  created_at: string
  updated_at: string
}
