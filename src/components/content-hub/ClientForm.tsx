'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { ClientStatus, ContentClient } from '@/lib/content-hub/types'
import styles from './ContentHub.module.css'

interface FormState {
  name: string
  contact_name: string
  email: string
  instagram: string
  phone: string
  internal_notes: string
  status: ClientStatus
}

const emptyForm: FormState = { name: '', contact_name: '', email: '', instagram: '', phone: '', internal_notes: '', status: 'active' }

export default function ClientForm({ clientId }: { clientId?: string }) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(Boolean(clientId))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!clientId) return
    fetch(`/api/admin/content/clients/${clientId}`).then(response => response.json()).then(data => {
      if (!data.client) throw new Error(data.error || 'Cliente não encontrado.')
      const client = data.client as ContentClient
      setForm({ name: client.name, contact_name: client.contact_name ?? '', email: client.email, instagram: client.instagram ?? '', phone: client.phone ?? '', internal_notes: client.internal_notes ?? '', status: client.status })
      setAvatarPreview(client.avatar_url ?? null)
    }).catch(cause => setError(cause instanceof Error ? cause.message : 'Erro ao carregar cliente.')).finally(() => setLoading(false))
  }, [clientId])

  function setField<Key extends keyof FormState>(name: Key, value: FormState[Key]) {
    setForm(previous => ({ ...previous, [name]: value }))
  }

  function handleAvatar(file?: File) {
    if (!file) return
    setAvatar(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const response = await fetch(clientId ? `/api/admin/content/clients/${clientId}` : '/api/admin/content/clients', { method: clientId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível salvar o cliente.')
      const savedId = clientId ?? data.client.id
      if (avatar) {
        const upload = new FormData()
        upload.append('file', avatar)
        const avatarResponse = await fetch(`/api/admin/content/clients/${savedId}/avatar`, { method: 'POST', body: upload })
        const avatarData = await avatarResponse.json()
        if (!avatarResponse.ok) throw new Error(avatarData.error || 'O cliente foi salvo, mas o avatar não foi enviado.')
      }
      router.push(`/admin/clientes/${savedId}`)
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar o cliente.')
      setSaving(false)
    }
  }

  if (loading) return <div className={styles.loading}><span className={styles.spin} /><br />Carregando cliente…</div>

  return (
    <div className={styles.hub}>
      <Link className={styles.backLink} href={clientId ? `/admin/clientes/${clientId}` : '/admin/clientes'}>← Voltar para clientes</Link>
      <div className={styles.pageHeader}><div><div className={styles.eyebrow}>Pasta do cliente</div><h1 className={styles.pageTitle}>{clientId ? 'Editar cliente' : 'Novo cliente'}</h1><p className={styles.pageSubtitle}>Identifique o cliente e personalize a experiência de aprovação.</p></div></div>
      <form className={styles.surface} onSubmit={handleSubmit}>
        <div className={styles.surfaceHeader}>
          <div className={styles.clientIdentity} style={{ marginBottom: 0 }}>
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.avatar} src={avatarPreview} alt="Prévia do avatar" />
            ) : <span className={styles.avatarFallback}>{form.name ? form.name.slice(0, 2).toUpperCase() : 'MH'}</span>}
            <div><strong style={{ display: 'block', color: '#13273f', fontSize: 14 }}>Identidade do cliente</strong><label className={styles.quietButton} style={{ minHeight: 34, marginTop: 6, cursor: 'pointer' }}>Escolher avatar<input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={event => handleAvatar(event.target.files?.[0])} /></label></div>
          </div>
        </div>
        <div className={styles.surfaceBody}>
          {error && <div className={styles.errorBox}>{error}</div>}
          <div className={styles.formGrid}>
            <div className={styles.field}><label htmlFor="client-name">Nome do cliente</label><input id="client-name" required value={form.name} onChange={event => setField('name', event.target.value)} placeholder="Ex.: Clínica Horizonte" /></div>
            <div className={styles.field}><label htmlFor="contact-name">Pessoa de contato</label><input id="contact-name" value={form.contact_name} onChange={event => setField('contact_name', event.target.value)} placeholder="Quem fará as aprovações" /></div>
            <div className={styles.field}><label htmlFor="client-email">E-mail</label><input id="client-email" required type="email" value={form.email} onChange={event => setField('email', event.target.value)} placeholder="cliente@empresa.com.br" /></div>
            <div className={styles.field}><label htmlFor="client-phone">WhatsApp</label><input id="client-phone" value={form.phone} onChange={event => setField('phone', event.target.value)} placeholder="(65) 99999-9999" /></div>
            <div className={styles.field}><label htmlFor="client-instagram">Instagram</label><input id="client-instagram" value={form.instagram} onChange={event => setField('instagram', event.target.value)} placeholder="@nomedocliente" /><span className={styles.fieldHint}>Pode usar @usuario ou o link completo.</span></div>
            <div className={styles.field}><label htmlFor="client-status">Status</label><select id="client-status" value={form.status} onChange={event => setField('status', event.target.value as ClientStatus)}><option value="active">Ativo</option><option value="archived">Arquivado</option></select></div>
            <div className={`${styles.field} ${styles.fieldFull}`}><label htmlFor="client-notes">Observações internas</label><textarea id="client-notes" value={form.internal_notes} onChange={event => setField('internal_notes', event.target.value)} placeholder="Preferências, responsáveis e informações úteis para a equipe…" /></div>
          </div>
          <div className={styles.formActions}><Link className={styles.quietButton} href={clientId ? `/admin/clientes/${clientId}` : '/admin/clientes'}>Cancelar</Link><button className={styles.primaryButton} disabled={saving} type="submit">{saving ? 'Salvando…' : 'Salvar cliente'}</button></div>
        </div>
      </form>
    </div>
  )
}
