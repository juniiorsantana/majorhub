'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import type { ClientAccessRole, ClientMembership } from '@/lib/content-hub/access-schemas'
import styles from './ClientAccessManager.module.css'

const ROLE_LABELS: Record<ClientAccessRole, string> = {
  client_admin: 'Administrador',
  approver: 'Aprovador',
  viewer: 'Visualizador',
}

const ROLE_DESCRIPTIONS: Record<ClientAccessRole, string> = {
  client_admin: 'Aprova conteúdos e administra o acesso do lado do cliente.',
  approver: 'Visualiza os envios e registra aprovações ou correções.',
  viewer: 'Acompanha os conteúdos sem poder registrar decisões.',
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()
}

function formatLastAccess(value: string | null) {
  if (!value) return 'Ainda não entrou'
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function generateTemporaryPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#'
  const bytes = new Uint32Array(14)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, value => alphabet[value % alphabet.length]).join('')
}

interface AccessForm {
  name: string
  email: string
  role: ClientAccessRole
  temporary_password: string
}

const EMPTY_FORM: AccessForm = {
  name: '',
  email: '',
  role: 'approver',
  temporary_password: '',
}

export default function ClientAccessManager({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [memberships, setMemberships] = useState<ClientMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<ClientMembership | null>(null)
  const [form, setForm] = useState<AccessForm>(EMPTY_FORM)
  const [resetPassword, setResetPassword] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [passwordVisible, setPasswordVisible] = useState(false)

  const loadMemberships = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/content/clients/${clientId}/memberships`, { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível carregar os acessos.')
      setMemberships(data.memberships ?? [])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível carregar os acessos.')
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => { loadMemberships() }, [loadMemberships])

  const stats = useMemo(() => ({
    active: memberships.filter(item => item.status === 'active').length,
    approvers: memberships.filter(item => item.status === 'active' && item.role !== 'viewer').length,
    viewers: memberships.filter(item => item.status === 'active' && item.role === 'viewer').length,
    suspended: memberships.filter(item => item.status === 'suspended').length,
  }), [memberships])

  function openCreate() {
    setForm({ ...EMPTY_FORM, temporary_password: generateTemporaryPassword() })
    setPasswordVisible(false)
    setError('')
    setNotice('')
    setCreateOpen(true)
  }

  async function createAccess(event: FormEvent) {
    event.preventDefault()
    setBusy('create')
    setError('')
    setNotice('')
    try {
      const response = await fetch(`/api/admin/content/clients/${clientId}/memberships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível criar o acesso.')
      setMemberships(previous => [...previous, data.membership])
      setCreateOpen(false)
      setNotice(`Acesso criado para ${form.email}. Compartilhe a senha temporária por um canal seguro.`)
      setForm(EMPTY_FORM)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível criar o acesso.')
    } finally {
      setBusy(null)
    }
  }

  async function updateAccess(membership: ClientMembership, patch: Partial<Pick<ClientMembership, 'role' | 'status'>>) {
    setBusy(membership.id)
    setError('')
    setNotice('')
    try {
      const response = await fetch(`/api/admin/content/clients/${clientId}/memberships/${membership.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível atualizar o acesso.')
      setMemberships(previous => previous.map(item => item.id === membership.id ? data.membership : item))
      setNotice(patch.status === 'suspended' ? `Acesso de ${membership.name} suspenso.` : patch.status === 'active' ? `Acesso de ${membership.name} reativado.` : `Papel de ${membership.name} atualizado.`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível atualizar o acesso.')
    } finally {
      setBusy(null)
    }
  }

  function openReset(membership: ClientMembership) {
    setResetTarget(membership)
    setResetPassword(generateTemporaryPassword())
    setPasswordVisible(false)
    setError('')
    setNotice('')
  }

  async function resetAccessPassword(event: FormEvent) {
    event.preventDefault()
    if (!resetTarget) return
    setBusy(`password:${resetTarget.id}`)
    setError('')
    try {
      const response = await fetch(`/api/admin/content/clients/${clientId}/memberships/${resetTarget.id}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temporary_password: resetPassword }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível redefinir a senha.')
      setMemberships(previous => previous.map(item => item.id === resetTarget.id ? { ...item, must_change_password: true } : item))
      setNotice(`Senha temporária criada para ${resetTarget.name}. Compartilhe-a por um canal seguro.`)
      setResetTarget(null)
      setResetPassword('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível redefinir a senha.')
    } finally {
      setBusy(null)
    }
  }

  async function copyPassword(value: string) {
    await navigator.clipboard.writeText(value)
    setNotice('Senha temporária copiada. Envie por um canal seguro.')
  }

  return <section className={styles.accessSection} aria-labelledby="client-access-title">
    <header className={styles.accessHeader}>
      <div>
        <span className={styles.kicker}>Equipe do cliente</span>
        <h2 id="client-access-title">Acessos ao portal</h2>
        <p>Cada pessoa entra com o próprio e-mail. Aprovações e acessos ficam identificados no histórico.</p>
      </div>
      <button className={styles.primaryButton} type="button" onClick={openCreate}>+ Novo acesso</button>
    </header>

    <div className={styles.accessRail} aria-label="Resumo dos acessos">
      <div><strong>{stats.active}</strong><span>Ativos</span></div>
      <div><strong>{stats.approvers}</strong><span>Podem aprovar</span></div>
      <div><strong>{stats.viewers}</strong><span>Só visualizam</span></div>
      <div><strong>{stats.suspended}</strong><span>Suspensos</span></div>
    </div>

    {error && <div className={styles.errorBox} role="alert">{error}</div>}
    {notice && <div className={styles.noticeBox} role="status">{notice}</div>}

    {loading ? <div className={styles.loading}>Carregando acessos…</div> : memberships.length ? (
      <div className={styles.memberList}>
        {memberships.map(membership => <article className={`${styles.memberRow} ${membership.status === 'suspended' ? styles.memberSuspended : ''}`} data-role={membership.role} key={membership.id}>
          <div className={styles.memberIdentity}>
            <span className={styles.memberAvatar}>{initials(membership.name)}</span>
            <div><strong>{membership.name}</strong><span>{membership.email}</span></div>
          </div>
          <div className={styles.memberActivity}>
            <span className={styles.metaLabel}>Último acesso</span>
            <strong>{formatLastAccess(membership.last_access_at)}</strong>
            {membership.must_change_password && <small>Troca de senha pendente</small>}
          </div>
          <label className={styles.roleField}>
            <span className={styles.metaLabel}>Papel</span>
            <select aria-label={`Papel de ${membership.name}`} disabled={busy === membership.id || membership.status === 'suspended'} value={membership.role} onChange={event => updateAccess(membership, { role: event.target.value as ClientAccessRole })}>
              {Object.entries(ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <div className={styles.memberActions}>
            <span className={`${styles.statusBadge} ${membership.status === 'active' ? styles.statusActive : styles.statusSuspended}`}>{membership.status === 'active' ? 'Ativo' : 'Suspenso'}</span>
            <button type="button" disabled={busy === membership.id} onClick={() => openReset(membership)}>Redefinir senha</button>
            <button className={membership.status === 'active' ? styles.dangerAction : styles.restoreAction} type="button" disabled={busy === membership.id} onClick={() => updateAccess(membership, { status: membership.status === 'active' ? 'suspended' : 'active' })}>{busy === membership.id ? 'Salvando…' : membership.status === 'active' ? 'Suspender' : 'Reativar'}</button>
          </div>
        </article>)}
      </div>
    ) : <div className={styles.emptyState}><strong>Nenhum acesso individual criado</strong><span>Crie o primeiro usuário de {clientName} para substituir o acesso compartilhado por e-mail.</span><button type="button" onClick={openCreate}>Criar primeiro acesso</button></div>}

    {createOpen && <div className={styles.modalBackdrop} onMouseDown={event => event.target === event.currentTarget && setCreateOpen(false)} role="presentation">
      <form className={styles.modal} onSubmit={createAccess} role="dialog" aria-modal="true" aria-labelledby="create-access-title">
        <div className={styles.modalHeader}><div><span className={styles.kicker}>Novo usuário</span><h3 id="create-access-title">Criar acesso para {clientName}</h3></div><button aria-label="Fechar" className={styles.closeButton} type="button" onClick={() => setCreateOpen(false)}>×</button></div>
        <div className={styles.formGrid}>
          <label><span>Nome</span><input autoFocus required minLength={2} maxLength={120} value={form.name} onChange={event => setForm(previous => ({ ...previous, name: event.target.value }))} placeholder="Ex.: Lucas Nemes" /></label>
          <label><span>E-mail</span><input autoComplete="email" required type="email" value={form.email} onChange={event => setForm(previous => ({ ...previous, email: event.target.value }))} placeholder="lucas@empresa.com.br" /></label>
          <label className={styles.fullField}><span>Nível de acesso</span><select value={form.role} onChange={event => setForm(previous => ({ ...previous, role: event.target.value as ClientAccessRole }))}>{Object.entries(ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><small>{ROLE_DESCRIPTIONS[form.role]}</small></label>
          <label className={styles.fullField}><span>Senha temporária</span><div className={styles.passwordControl}><input autoComplete="new-password" minLength={10} required type={passwordVisible ? 'text' : 'password'} value={form.temporary_password} onChange={event => setForm(previous => ({ ...previous, temporary_password: event.target.value }))} /><button type="button" onClick={() => setPasswordVisible(previous => !previous)}>{passwordVisible ? 'Ocultar' : 'Mostrar'}</button><button type="button" onClick={() => copyPassword(form.temporary_password)}>Copiar</button></div><small>Mínimo de 10 caracteres, com maiúscula, minúscula e número. O usuário deverá trocá-la no primeiro acesso.</small></label>
        </div>
        <div className={styles.modalActions}><button type="button" onClick={() => setCreateOpen(false)}>Cancelar</button><button className={styles.primaryButton} disabled={busy === 'create'} type="submit">{busy === 'create' ? 'Criando…' : 'Criar acesso'}</button></div>
      </form>
    </div>}

    {resetTarget && <div className={styles.modalBackdrop} onMouseDown={event => event.target === event.currentTarget && setResetTarget(null)} role="presentation">
      <form className={`${styles.modal} ${styles.resetModal}`} onSubmit={resetAccessPassword} role="dialog" aria-modal="true" aria-labelledby="reset-password-title">
        <div className={styles.modalHeader}><div><span className={styles.kicker}>Segurança</span><h3 id="reset-password-title">Redefinir senha de {resetTarget.name}</h3></div><button aria-label="Fechar" className={styles.closeButton} type="button" onClick={() => setResetTarget(null)}>×</button></div>
        <p className={styles.modalCopy}>A sessão atual será substituída por uma senha temporária. No próximo acesso, a troca será obrigatória.</p>
        <label className={styles.passwordLabel}><span>Nova senha temporária</span><div className={styles.passwordControl}><input autoComplete="new-password" minLength={10} required type={passwordVisible ? 'text' : 'password'} value={resetPassword} onChange={event => setResetPassword(event.target.value)} /><button type="button" onClick={() => setPasswordVisible(previous => !previous)}>{passwordVisible ? 'Ocultar' : 'Mostrar'}</button><button type="button" onClick={() => copyPassword(resetPassword)}>Copiar</button></div></label>
        <div className={styles.modalActions}><button type="button" onClick={() => setResetTarget(null)}>Cancelar</button><button className={styles.primaryButton} disabled={busy === `password:${resetTarget.id}`} type="submit">{busy === `password:${resetTarget.id}` ? 'Redefinindo…' : 'Redefinir senha'}</button></div>
      </form>
    </div>}
  </section>
}
