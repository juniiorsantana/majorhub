'use client'

import { useEffect, useRef } from 'react'
import styles from './GrowthEngine.module.css'


// ─── Helpers ──────────────────────────────────────────────────────────────────
function clamp(v: number, a: number, b: number) { return Math.min(Math.max(v, a), b) }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function ease(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }

// ─── Constantes ───────────────────────────────────────────────────────────────
const BUDGET = 600
const FINAL_OFFSET_Y = [36, 18, 0]
const FINAL_SCALE = [0.92, 0.96, 1.0]

// ─── Cards ────────────────────────────────────────────────────────────────────
const CARDS = [
  {
    index: '01', label: 'Fase 1', title: 'Atrair',
    accent: 'Tráfego qualificado',
    description: 'Anúncios, busca e conteúdo para aproximar sua empresa de quem procura o que você oferece.',
    metrics: [{ value: '3.2×', label: 'Retorno em anúncios' }, { value: '-40%', label: 'Custo por lead' }],
    tags: ['Meta Ads', 'Google Ads', 'SEO', 'Conteúdo'],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></svg>,
  },
  {
    index: '02', label: 'Fase 2', title: 'Converter',
    accent: 'Do lead ao cliente',
    description: 'Páginas, funil e acompanhamento comercial para transformar o interesse em uma conversa de venda.',
    metrics: [{ value: '+68%', label: 'Taxa de conversão' }, { value: '24h', label: 'Tempo de resposta' }],
    tags: ['Landing Pages', 'CRM', 'Follow-up', 'Automação'],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
  },
  {
    index: '03', label: 'Fase 3', title: 'Escalar',
    accent: 'Crescimento previsível',
    description: 'Analisamos os resultados e ajustamos a operação para ampliar o que funciona.',
    metrics: [{ value: '5×', label: 'Volume em 90 dias' }, { value: '92%', label: 'Retenção de clientes' }],
    tags: ['Análise de Dados', 'Otimização', 'Escalada', 'Previsibilidade'],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
  },
]

// ─── Visual do card (compartilhado entre desktop e mobile) ────────────────────
function CardVisual({ card, isLast }: {
  card: typeof CARDS[0]
  isLast: boolean
}) {
  return (
    <div
      className="relative flex flex-col"
      style={{
        background: 'rgba(10,37,64,0.97)',
        backdropFilter: 'blur(12px) saturate(140%)',
        WebkitBackdropFilter: 'blur(12px) saturate(140%)',
        border: '1.5px solid rgba(0,229,255,0.3)',
        borderRadius: 16,
        boxShadow: '0 8px 32px -8px rgba(0,0,0,0.6), 0 0 16px -4px rgba(0,229,255,0.15)',
        overflow: 'hidden',
      }}
    >
      {/* TOP BAR */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[4px] uppercase" style={{ color: 'rgba(0,229,255,0.6)' }}>[{card.index}]</span>
          <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>{card.label}</span>
        </div>
        {isLast && (
          <span aria-hidden="true" className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5ff] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e5ff]" />
          </span>
        )}
      </div>

      {/* BODY */}
      <div className="flex flex-col flex-1 px-6 pt-5 pb-5 gap-4 min-h-0">
        <div className="flex items-start gap-4 flex-shrink-0">
          <div aria-hidden="true" className="flex-shrink-0 flex items-center justify-center text-[#00e5ff]" style={{ width: 44, height: 44, border: '1px solid rgba(0,229,255,0.2)', borderRadius: 8, background: 'rgba(0,229,255,0.05)' }}>
            {card.icon}
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[11px] tracking-[2px] uppercase mb-1" style={{ color: 'rgba(0,229,255,0.65)' }}>{card.accent}</p>
            <h3 className="font-['Sora'] font-black text-white leading-none tracking-tighter uppercase" style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)' }}>{card.title}</h3>
          </div>
        </div>

        <p className="font-['Inter'] leading-relaxed xl:pl-[60px] flex-shrink-0" style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{card.description}</p>

        <div className="grid grid-cols-2 gap-3 xl:pl-[60px] flex-shrink-0">
          {card.metrics.map((m, mi) => (
            <div key={mi} className="min-w-0 p-3" style={{ border: '1px solid rgba(0,229,255,0.1)', borderRadius: 6, background: 'rgba(0,229,255,0.04)' }}>
              <p className="font-['Sora'] font-black leading-none" style={{ fontSize: 20, color: '#00e5ff' }}>{m.value}</p>
              <p className="font-mono tracking-wider uppercase mt-1" style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{m.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 xl:pl-[60px]">
          {card.tags.map((tag, ti) => (
            <span key={ti} className="font-mono tracking-wider uppercase" style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4, padding: '3px 8px' }}>{tag}</span>
          ))}
        </div>
      </div>

      <div style={{ height: 2, flexShrink: 0, background: 'linear-gradient(to right, transparent, rgba(0,229,255,0.4), transparent)' }} />
    </div>
  )
}

// ─── Copy da coluna esquerda (compartilhada) ──────────────────────────────────
function GrowthCopy() {
  return (
    <>
      <p className="inline-block bg-[#00e5ff] text-[#001a2e] text-[11px] font-black tracking-[3px] uppercase px-3 py-1 mb-7">
        Motor de Crescimento Major
      </p>
      <h2 className="font-['Sora'] text-3xl md:text-[2.2rem] font-black text-[#e8f4f8] leading-[1.1] tracking-tighter mb-6">
        Da primeira visita à{' '}
        <span className="text-[#00e5ff]">próxima venda.</span>
      </h2>
      <p className="text-text-secondary leading-relaxed max-w-lg">
        Organizar o caminho entre encontrar sua empresa, entrar em contato e comprar.
      </p>
    </>
  )
}

// ─── GrowthEngine ─────────────────────────────────────────────────────────────
export function GrowthEngine() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const cardRefs = useRef<Array<HTMLLIElement | null>>([])

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const heading = copyRef.current
    const list = listRef.current
    const cards = cardRefs.current.filter((card): card is HTMLLIElement => card !== null)
    if (!section || !stage || !heading || !list || cards.length !== CARDS.length) return

    // O conteúdo estático é a base; empilhamos somente quando ele cabe na tela.
    const media = window.matchMedia('(min-width: 1024px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)')
    let stacked = false
    let frameId = 0
    let heights: number[] = []
    let availableHeight = 0

    function tick() {
      frameId = 0
      if (!stacked) return
      const distance = section!.offsetHeight - stage!.offsetHeight
      const progress = clamp(-section!.getBoundingClientRect().top / Math.max(distance, 1), 0, 1)

      cards.forEach((card, i) => {
        const entrance = i === 0 ? 1 : ease(clamp(progress * (cards.length - 1) - (i - 1), 0, 1))
        const center = (availableHeight - heights[i]) / 2
        const y = lerp(availableHeight + 80, center + FINAL_OFFSET_Y[i], entrance)
        const depth = i === cards.length - 1 ? 0 : clamp(progress * (cards.length - 1) - i, 0, 1)
        const scale = lerp(1, FINAL_SCALE[i], depth)
        card.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`
        card.style.filter = `brightness(${lerp(1, 0.72, depth)})`
      })
    }

    function scheduleTick() {
      if (!frameId && stacked) frameId = requestAnimationFrame(tick)
    }

    function measure() {
      // As alturas naturais acompanham quebras de linha, zoom e carregamento de fontes.
      heights = cards.map(card => card.offsetHeight)
      const viewportHeight = window.innerHeight
      const fits = Math.max(...heights) + 72 <= viewportHeight - 160 &&
        heading!.offsetHeight <= viewportHeight - 160
      const nextStacked = media.matches && fits
      if (nextStacked) {
        stacked = true
        section!.dataset.stacked = 'true'
        section!.style.height = `${stage!.offsetHeight + (CARDS.length - 1) * BUDGET + 160}px`
        availableHeight = list!.clientHeight
        tick()
      } else {
        stacked = false
        delete section!.dataset.stacked
        section!.style.removeProperty('height')
        cards.forEach(card => {
          card.style.removeProperty('transform')
          card.style.removeProperty('filter')
        })
      }
    }

    const observer = new ResizeObserver(measure)
    cards.forEach(card => {
      if (card.firstElementChild) observer.observe(card.firstElementChild)
    })
    observer.observe(heading)
    window.addEventListener('scroll', scheduleTick, { passive: true })
    window.addEventListener('resize', measure)
    media.addEventListener('change', measure)
    measure()

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      window.removeEventListener('scroll', scheduleTick)
      window.removeEventListener('resize', measure)
      media.removeEventListener('change', measure)
      delete section.dataset.stacked
      section.style.removeProperty('height')
      cards.forEach(card => {
        card.style.removeProperty('transform')
        card.style.removeProperty('filter')
      })
    }
  }, [])

  return (
    <section ref={sectionRef} id="growth-engine" className={styles.section}>
      <div ref={stageRef} className={styles.stage}>
        <div ref={copyRef} className={styles.copy}>
          <GrowthCopy />
        </div>
        <ol ref={listRef} className={styles.cards} aria-label="Fases do Motor de Crescimento Major">
          {CARDS.map((card, i) => (
            <li
              key={card.index}
              ref={element => { cardRefs.current[i] = element }}
              className={styles.card}
              style={{ zIndex: i + 1 }}
            >
              <CardVisual card={card} isLast={i === CARDS.length - 1} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
