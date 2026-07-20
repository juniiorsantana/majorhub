'use client'

import Link from 'next/link'
import { CSSProperties, useEffect, useMemo, useState } from 'react'
import type { ContentClient } from '@/lib/content-hub/types'
import styles from '@/components/content-hub/ContentHub.module.css'

const accents = ['#2878ff', '#45c8e8', '#806bff', '#21a875', '#ef6a5b']

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ContentClient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'active' | 'all' | 'attention'>('active')

  useEffect(() => {
    fetch('/api/admin/content/clients')
      .then(response => response.json().then(data => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error || 'Não foi possível carregar os clientes.')
        setClients(data.clients)
      })
      .catch(cause => setError(cause instanceof Error ? cause.message : 'Erro ao carregar clientes.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => clients.filter(client => {
    const matchesSearch = !search || `${client.name} ${client.email} ${client.instagram}`.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || (filter === 'active' ? client.status === 'active' : Boolean(client.stats?.changes))
    return matchesSearch && matchesFilter
  }), [clients, filter, search])

  return (
    <div className={styles.hub}>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.eyebrow}>Content studio</div>
          <h1 className={styles.pageTitle}>Clientes & aprovações</h1>
          <p className={styles.pageSubtitle}>Uma pasta por cliente, com cronogramas, peças e todo o histórico de decisões.</p>
        </div>
        <Link className={styles.primaryButton} href="/admin/clientes/novo">＋ Novo cliente</Link>
      </div>

      <div className={styles.toolbar}>
        <input className={styles.search} value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar cliente, e-mail ou Instagram…" />
        {([
          ['active', 'Ativos'],
          ['attention', 'Pedem atenção'],
          ['all', 'Todos'],
        ] as const).map(([value, label]) => (
          <button key={value} type="button" className={filter === value ? styles.secondaryButton : styles.quietButton} onClick={() => setFilter(value)}>{label}</button>
        ))}
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}
      {loading ? (
        <div className={styles.loading}><span className={styles.spin} /><br />Abrindo as pastas…</div>
      ) : (
        <div className={styles.clientGrid}>
          {filtered.map((client, index) => (
            <Link
              href={`/admin/clientes/${client.id}`}
              key={client.id}
              className={styles.clientCard}
              style={{ '--card-accent': accents[index % accents.length] } as CSSProperties}
            >
              <div className={styles.clientCardBody}>
                <div className={styles.clientIdentity}>
                  {client.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className={styles.avatar} src={client.avatar_url} alt="" />
                  ) : <span className={styles.avatarFallback}>{initials(client.name)}</span>}
                  <div>
                    <h2 className={styles.clientName}>{client.name}</h2>
                    <div className={styles.clientHandle}>{client.instagram ? `@${client.instagram}` : client.email}</div>
                  </div>
                </div>
                <div className={styles.statsRow}>
                  <div className={styles.statBox}><span className={styles.statValue}>{client.stats?.pending ?? 0}</span><span className={styles.statLabel}>Aguardando</span></div>
                  <div className={styles.statBox}><span className={styles.statValue}>{client.stats?.changes ?? 0}</span><span className={styles.statLabel}>Correções</span></div>
                  <div className={styles.statBox}><span className={styles.statValue}>{client.stats?.approved ?? 0}</span><span className={styles.statLabel}>Aprovados</span></div>
                </div>
              </div>
              <div className={styles.clientCardFooter}><span>{client.stats?.total ?? 0} publicações na pasta</span><span className={styles.arrow}>→</span></div>
            </Link>
          ))}
          {!filtered.length && (
            <div className={styles.emptyState}>
              <strong>{clients.length ? 'Nenhum cliente encontrado' : 'A primeira pasta começa aqui'}</strong>
              <span>{clients.length ? 'Ajuste a busca ou o filtro.' : 'Cadastre um cliente para montar o primeiro cronograma.'}</span>
              {!clients.length && <Link className={styles.primaryButton} href="/admin/clientes/novo">Cadastrar cliente</Link>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
