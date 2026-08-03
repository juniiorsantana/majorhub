import type { ClientAccessRole, ClientAccessStatus } from './access-schemas'

export function canSubmitClientReview(role: ClientAccessRole) {
  return role === 'client_admin' || role === 'approver'
}

export function shouldEnableLegacyApprover(role: ClientAccessRole, status: ClientAccessStatus = 'active') {
  return status === 'active' && canSubmitClientReview(role)
}
