'use client'

import { useEffect, useRef, useState } from 'react'


// ─── Helpers ──────────────────────────────────────────────────────────────────
function clamp(v: number, a: number, b: number) { return Math.min(Math.max(v, a), b) }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function ease(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }

// ─── Constantes ───────────────────────────────────────────────────────────────
function getCardDimensions() {
  if (typeof window === 'undefined') return { w: 480, h: 340 }
  return { w: Math.min(Math.round(window.innerWidth * 0.55 * 0.82), 520), h: 340 }
}
const BUDGET = 600
const FINAL_OFFSET_Y = [36, 18, 0]
const FINAL_SCALE = [0.92, 0.96, 1.0]

// ─── Cards ────────────────────────────────────────────────────────────────────
const CARDS = [
  {
    index: '01', label: 'Fase 1', title: 'Atrair',
    accent: 'Tráfego qualificado',
    description: 'Colocamos a mensagem certa na frente das pessoas certas — no canal certo, no momento certo.',
    metrics: [{ value: '3.2×', label: 'Retorno em anúncios' }, { value: '-40%', label: 'Custo por lead' }],
    tags: ['Meta Ads', 'Google Ads', 'SEO', 'Conteúdo'],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></svg>,
  },
  {
    index: '02', label: 'Fase 2', title: 'Converter',
    accent: 'Do lead ao cliente',
    description: 'Funis, páginas e sequências testadas para transformar interesse em decisão de compra real.',
    metrics: [{ value: '+68%', label: 'Taxa de conversão' }, { value: '24h', label: 'Tempo de resposta' }],
    tags: ['Landing Pages', 'CRM', 'Follow-up', 'Automação'],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
  },
  {
    index: '03', label: 'Fase 3', title: 'Escalar',
    accent: 'Crescimento previsível',
    description: 'Com a máquina rodando, aumentamos o volume sem aumentar o custo proporcional — estrutura que sustenta.',
    metrics: [{ value: '5×', label: 'Volume em 90 dias' }, { value: '92%', label: 'Retenção de clientes' }],
    tags: ['Análise de Dados', 'Otimização', 'Escalada', 'Previsibilidade'],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
  },
]

// ─── Visual do card (compartilhado entre desktop e mobile) ────────────────────
function CardVisual({ card, isLast, className = 'absolute inset-0' }: {
  card: typeof CARDS[0]
  isLast: boolean
  className?: string
}) {
  return (
    <div
      className={`${className} flex flex-col`}
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
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5ff] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e5ff]" />
          </span>
        )}
      </div>

      {/* BODY */}
      <div className="flex flex-col flex-1 px-6 pt-5 pb-5 gap-4 min-h-0">
        <div className="flex items-start gap-4 flex-shrink-0">
          <div className="flex-shrink-0 flex items-center justify-center text-[#00e5ff]" style={{ width: 44, height: 44, border: '1px solid rgba(0,229,255,0.2)', borderRadius: 8, background: 'rgba(0,229,255,0.05)' }}>
            {card.icon}
          </div>
          <div>
            <p className="font-mono text-[11px] tracking-[2px] uppercase mb-1" style={{ color: 'rgba(0,229,255,0.65)' }}>{card.accent}</p>
            <h3 className="font-['Sora'] font-black text-white leading-none tracking-tighter uppercase" style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)' }}>{card.title}</h3>
          </div>
        </div>

        <p className="font-['Inter'] leading-relaxed pl-0 md:pl-[60px] flex-shrink-0" style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{card.description}</p>

        <div className="flex gap-3 pl-0 md:pl-[60px] flex-shrink-0">
          {card.metrics.map((m, mi) => (
            <div key={mi} className="flex-1 p-3" style={{ border: '1px solid rgba(0,229,255,0.1)', borderRadius: 6, background: 'rgba(0,229,255,0.04)' }}>
              <p className="font-['Sora'] font-black leading-none" style={{ fontSize: 20, color: '#00e5ff' }}>{m.value}</p>
              <p className="font-mono tracking-wider uppercase mt-1" style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{m.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 pl-0 md:pl-[60px]">
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
      <h2 className="font-['Sora'] text-3xl md:text-[2.2rem] font-black text-[#e8f4f8] leading-[1.1] tracking-tighter mb-8">
        A maioria das empresas tenta crescer{' '}
        <span className="inline-block text-[#001a2e] bg-[#00e5ff] px-2 shadow-[4px_4px_0_0_#fff]">
          aumentando o investimento.
        </span>{' '}
        Mas o crescimento real vem da estrutura por trás disso.
      </h2>
    </>
  )
}

// ─── GrowthEngine ─────────────────────────────────────────────────────────────
export function GrowthEngine() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])

  // A animação de scroll só roda no desktop; no mobile os cards são estáticos
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!isDesktop) return

    const section = sectionRef.current
    const sticky = stickyRef.current
    const cards = cardRefs.current
    if (!section || !sticky || cards.some(c => !c)) return

    const N = CARDS.length
    const { w: CARD_W, h: CARD_H } = getCardDimensions()

    cards.forEach((card, i) => {
      if (!card) return
      card.style.position = 'absolute'
      card.style.top = '0px'
      card.style.width = `${CARD_W}px`
      card.style.height = `${CARD_H}px`
      card.style.left = `calc((100% - ${CARD_W}px) / 2)`
      card.style.zIndex = String(i + 1)
      card.style.transform = `translate3d(0, ${sticky!.offsetHeight + 100}px, 0) scale(1)`
      card.style.filter = 'brightness(1)'
      card.style.willChange = 'transform, filter'
    })


    function tick() {
      const sectionTop = section!.getBoundingClientRect().top + window.scrollY
      const scrolled = window.scrollY - sectionTop
      const totalScroll = section!.offsetHeight - window.innerHeight

      if (scrolled < 0 || totalScroll <= 0) {
        const centerY = sticky!.offsetHeight / 2 - CARD_H / 2
        cards.forEach((card, i) => {
          if (!card) return
          if (i === 0) {
            card.style.transform = `translate3d(0, ${centerY + FINAL_OFFSET_Y[0]}px, 0) scale(1)`
            card.style.filter = 'brightness(1)'
          } else {
            card.style.transform = `translate3d(0, ${sticky!.offsetHeight + 100}px, 0) scale(1)`
          }
        })
        return
      }

      const progress = clamp(scrolled / totalScroll, 0, 1)
      const centerY = sticky!.offsetHeight / 2 - CARD_H / 2

      cards.forEach((card, i) => {
        if (!card) return

        const winStart = i === 0 ? -1 : (i - 1) / (N - 1)
        const winEnd = i === 0 ? 0 : i / (N - 1)
        const t = clamp((progress - winStart) / (winEnd - winStart), 0, 1)
        const eased = ease(t)

        const startY = sticky!.offsetHeight + 80
        const targetY = centerY + FINAL_OFFSET_Y[i]
        const currentY = lerp(startY, targetY, eased)

        if (i < N - 1) {
          let buriedProgress = 0
          for (let j = i + 1; j < N; j++) {
            const jStart = j === 0 ? -1 : (j - 1) / (N - 1)
            const jEnd = j === 0 ? 0 : j / (N - 1)
            buriedProgress += ease(clamp((progress - jStart) / (jEnd - jStart), 0, 1))
          }
          buriedProgress = clamp(buriedProgress, 0, N - 1 - i)
          const depthT = buriedProgress / (N - 1 - i)

          const scale = lerp(1, FINAL_SCALE[i], depthT)
          const brightness = lerp(1, 0.72, depthT)

          card.style.transform = `translate3d(0, ${currentY}px, 0) scale(${scale.toFixed(5)})`
          card.style.filter = `brightness(${brightness.toFixed(4)})`
        } else {
          card.style.transform = `translate3d(0, ${currentY}px, 0) scale(1)`
          card.style.filter = 'brightness(1)'
        }
      })
    }

    function onResize() {
      const { w, h } = getCardDimensions()
      cards.forEach(card => {
        if (!card) return
        card.style.width = `${w}px`
        card.style.height = `${h}px`
        card.style.left = `calc((100% - ${w}px) / 2)`
      })
      tick()
    }

    window.addEventListener('scroll', tick, { passive: true })
    window.addEventListener('resize', onResize)
    const ro = new ResizeObserver(tick)
    ro.observe(section)
    tick()

    return () => {
      window.removeEventListener('scroll', tick)
      window.removeEventListener('resize', onResize)
      ro.disconnect()
    }
  }, [isDesktop])

  // Altura total (desktop) = 100vh + 1 budget por card excedente + padding final
  const totalH = `calc(100vh + ${(CARDS.length - 1) * BUDGET + 160}px)`

  return (
    <section
      ref={sectionRef}
      id="growth-engine"
      className="relative bg-[#001a2e] border-y border-[rgba(0,229,255,0.35)] h-auto md:h-[var(--ge-height)]"
      style={{ '--ge-height': totalH } as React.CSSProperties}
    >
      {/* ══ MOBILE — layout estático empilhado ══════════════════════════════ */}
      <div className="md:hidden px-6 py-20">
        <GrowthCopy />
        <div className="space-y-6 mt-4">
          {CARDS.map((card, i) => (
            <CardVisual
              key={card.index}
              card={card}
              isLast={i === CARDS.length - 1}
              className="relative"
            />
          ))}
        </div>
      </div>

      {/* ══ DESKTOP — sticky com animação de scroll ═════════════════════════ */}
      <div
        ref={stickyRef}
        className="hidden md:flex sticky top-0"
        style={{ height: '100vh', overflow: 'hidden' }}
      >
        {/* Coluna esquerda 45% */}
        <div
          className="relative flex items-center flex-shrink-0"
          style={{ width: '45%', height: '100%', background: '#001a2e', zIndex: 10 }}
        >
          <div className="relative z-10 pl-10 lg:pl-20 xl:pl-28 pr-8">
            <GrowthCopy />
          </div>
        </div>

        {/* Coluna direita 55% — container dos cards */}
        <div
          className="relative flex-shrink-0"
          style={{ width: '55%', height: '100%', background: '#001a2e', overflow: 'hidden' }}
        >
          {/* Divisor esquerdo */}
          <div className="absolute left-0 top-[10%] bottom-[10%]" style={{ width: 1, background: 'linear-gradient(to bottom, transparent, rgba(0,229,255,0.15), transparent)' }} />

          {/* Cards — position:absolute, animados pelo useEffect */}
          {CARDS.map((card, i) => (
            <div key={card.index} ref={element => { cardRefs.current[i] = element }}>
              <CardVisual card={card} isLast={i === CARDS.length - 1} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
