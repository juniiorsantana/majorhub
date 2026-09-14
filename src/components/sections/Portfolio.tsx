'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Category = 'Todos' | 'Sites' | 'Identidade Visual' | 'Criativos'

interface PortfolioItem {
  id: number
  title: string
  client: string
  category: Exclude<Category, 'Todos'>
  imageUrl: string
  /** 'tall' = ocupa 2 linhas na grid, 'wide' = 2 colunas, 'normal' = padrão */
  size: 'tall' | 'wide' | 'normal'
  tags: string[]
  description: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Data — imagens serão adicionadas via link
// ─────────────────────────────────────────────────────────────────────────────
const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 1,
    title: 'Landing Page Conversão',
    client: 'Dr. Lucas Nemes',
    category: 'Sites',
    imageUrl: '/site dr lucas worksho copiar.avif',
    size: 'tall',
    tags: ['Next.js', 'Conversão', 'SEO'],
    description: 'Site focado em conversão com copywriting estratégico e design premium.',
  },
  {
    id: 2,
    title: 'Identidade Visual Completa',
    client: 'Costa Lima Advocacia',
    category: 'Identidade Visual',
    imageUrl: '/Costa Lima Id Visual.avif',
    size: 'normal',
    tags: ['Branding', 'Logo', 'Manual de Marca'],
    description: 'Sistema completo de identidade: logo, paleta, tipografia e aplicações.',
  },
  {
    id: 3,
    title: 'Pack de Criativos Social',
    client: 'Cartão EcoVida+',
    category: 'Criativos',
    imageUrl: '/Pack de Criativos.avif',
    size: 'normal',
    tags: ['Instagram', 'Stories', 'Feed'],
    description: 'Peças para feed, stories e highlights com linguagem visual consistente.',
  },
  {
    id: 4,
    title: 'Site Institucional',
    client: 'Farmácia Vitale',
    category: 'Sites',
    imageUrl: '/Farmacia Vitale.avif',
    size: 'wide',
    tags: ['React', 'Responsivo', 'Performance'],
    description: 'Site institucional com animações suaves e performance otimizada.',
  },
]

const CATEGORIES: Category[] = ['Todos', 'Sites', 'Identidade Visual', 'Criativos']

const categoryIcons: Record<Category, string> = {
  'Todos': '◈',
  'Sites': '⬡',
  'Identidade Visual': '◆',
  'Criativos': '◉',
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
function PortfolioCard({ item, index, onPreview }: {
  item: PortfolioItem
  index: number
  onPreview: (item: PortfolioItem, trigger: HTMLButtonElement) => void
}) {
  const [hovered, setHovered] = useState(false)
  const reduceMotion = useReducedMotion()

  const isWide = item.size === 'wide'
  const isTall = item.size === 'tall'

  return (
    <motion.article
      layout={!reduceMotion}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 40, scale: reduceMotion ? 1 : 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: reduceMotion ? 0 : -20, scale: reduceMotion ? 1 : 0.95 }}
      transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={[
        'relative min-w-0 flex flex-col justify-end overflow-hidden rounded-2xl group',
        'border border-white/[0.06]',
        isWide ? 'xl:col-span-2' : '',
        isTall ? 'xl:row-span-2' : '',
      ].join(' ')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={{
        background: 'rgba(8, 28, 52, 0.9)',
        boxShadow: hovered
          ? '0 0 0 1.5px rgba(0,229,255,0.35), 0 20px 60px -12px rgba(0,0,0,0.8), 0 0 40px -20px rgba(0,229,255,0.25)'
          : '0 4px 24px -8px rgba(0,0,0,0.5)',
        transition: 'box-shadow 0.35s ease',
      }}
    >
      {/* Image */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.img
          src={item.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
          animate={{ scale: hovered && !reduceMotion ? 1.06 : 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Base overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(1,15,32,0.95) 0%, rgba(1,15,32,0.45) 50%, rgba(1,15,32,0.1) 100%)',
          }}
        />
        {/* Hover overlay */}
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'linear-gradient(145deg, rgba(0,229,255,0.08) 0%, rgba(0,107,255,0.1) 100%)',
          }}
        />
      </div>

      {/* Category badge */}
      <div className="absolute top-4 left-4 z-10">
        <span
          className="font-mono text-[9px] tracking-[3px] uppercase px-2.5 py-1 rounded-full"
          style={{
            background: 'rgba(0,229,255,0.12)',
            border: '1px solid rgba(0,229,255,0.25)',
            color: '#00e5ff',
            backdropFilter: 'blur(8px)',
          }}
        >
          {item.category}
        </span>
      </div>

      {/* Scan line animation on hover */}
      <motion.div
        className="absolute left-0 right-0 pointer-events-none z-10"
        style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(0,229,255,0.6), transparent)' }}
        animate={hovered && !reduceMotion ? { top: ['20%', '80%'], opacity: [0, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
      />

      {/* Content */}
      <div className="relative p-5 pt-28 z-10" style={{ background: 'linear-gradient(to top, rgba(1,15,32,0.98), rgba(1,15,32,0.9) 65%, transparent)' }}>
        {/* Tags */}
        <div
          className="flex flex-wrap gap-1.5 mb-3"
        >
          {item.tags.map(tag => (
            <span
              key={tag}
              className="font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <h3
          className="font-sora font-bold text-white leading-tight mb-1"
          style={{ fontSize: 'clamp(15px, 1.6vw, 19px)' }}
        >
          {item.title}
        </h3>

        <p
          className="text-sm leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}
        >
          {item.description}
        </p>

        <div
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 10 }}
        >
          <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {item.client}
          </span>
          <span
            className="text-[#00e5ff] font-mono text-xs flex items-center gap-1"
            aria-hidden="true"
          >
            Ampliar imagem →
          </span>
        </div>
      </div>

      <button
        type="button"
        aria-label={`Ampliar imagem do projeto de ${item.client}`}
        aria-haspopup="dialog"
        onClick={event => onPreview(item, event.currentTarget)}
        className="absolute inset-0 z-20 cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#00e5ff]"
      />

      {/* Corner accent */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: 60,
          height: 60,
          background: 'linear-gradient(225deg, rgba(0,229,255,0.08) 0%, transparent 70%)',
        }}
      />
    </motion.article>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Section
// ─────────────────────────────────────────────────────────────────────────────
export function Portfolio() {
  const [active, setActive] = useState<Category>('Todos')
  const [preview, setPreview] = useState<PortfolioItem | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const previewTriggerRef = useRef<HTMLButtonElement | null>(null)
  const reduceMotion = useReducedMotion()

  function openPreview(item: PortfolioItem, trigger: HTMLButtonElement) {
    previewTriggerRef.current = trigger
    setPreview(item)
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!preview || !dialog) return

    const previousBodyOverflow = document.body.style.overflow
    const previousRootOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    dialog.showModal()
    dialog.scrollTop = 0

    return () => {
      dialog.close()
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousRootOverflow
      previewTriggerRef.current?.focus({ preventScroll: true })
    }
  }, [preview])

  const filtered =
    active === 'Todos'
      ? PORTFOLIO_ITEMS
      : PORTFOLIO_ITEMS.filter(i => i.category === active)

  // Scroll-triggered header entrance
  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    if (reduceMotion) {
      el.style.opacity = '1'
      el.style.transform = 'none'
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
        }
      },
      { threshold: 0.2 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduceMotion])

  return (
    <section
      ref={sectionRef}
      id="portfolio"
      className="relative py-24 px-6 overflow-hidden"
      style={{ background: '#030c1a' }}
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,229,255,0.04) 0%, transparent 70%),' +
            'radial-gradient(ellipse 60% 40% at 80% 100%, rgba(0,107,255,0.05) 0%, transparent 60%)',
        }}
      />

      {/* Grid lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,229,255,0.025) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(0,229,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Header */}
        <div
          ref={headerRef}
          className="text-center mb-16"
          style={{
            opacity: 0,
            transform: 'translateY(32px)',
            transition: reduceMotion ? 'none' : 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <p
            className="inline-block font-mono text-[11px] tracking-[3px] uppercase mb-5 px-3 py-1"
            style={{ background: '#00e5ff', color: '#001a2e', fontWeight: 900 }}
          >
            Portfólio
          </p>
          <h2
            className="font-sora font-extrabold text-white mb-4"
            style={{ fontSize: 'clamp(28px, 4vw, 52px)', lineHeight: 1.1 }}
          >
            Trabalhos que{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #00e5ff, #006bff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              falam por si
            </span>
          </h2>
          <p
            className="max-w-lg mx-auto"
            style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(14px, 1.4vw, 17px)', lineHeight: 1.7 }}
          >
            Do estratégico ao criativo — cada projeto entregue com o Padrão Major.
          </p>
        </div>

        {/* Category tabs */}
        <div role="group" aria-label="Filtrar projetos por categoria" className="flex flex-wrap justify-center gap-2 mb-12">
          {CATEGORIES.map(cat => {
            const isActive = active === cat
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActive(cat)}
                className="relative flex min-h-11 items-center gap-2 px-4 py-2 rounded-full font-mono text-[11px] tracking-[2px] uppercase transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00e5ff]"
                style={{
                  background: isActive ? 'rgba(0,229,255,0.12)' : 'rgba(255,255,255,0.04)',
                  border: isActive ? '1px solid rgba(0,229,255,0.45)' : '1px solid rgba(255,255,255,0.08)',
                  color: isActive ? '#00e5ff' : 'rgba(255,255,255,0.7)',
                  boxShadow: isActive ? '0 0 20px -8px rgba(0,229,255,0.5)' : 'none',
                }}
              >
                <span aria-hidden="true" style={{ fontSize: 10 }}>{categoryIcons[cat]}</span>
                {cat}
                {isActive && (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ border: '1px solid rgba(0,229,255,0.45)' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: reduceMotion ? 0 : 0.4 }}
                  />
                )}
              </button>
            )
          })}
        </div>

        <p className="sr-only" role="status" aria-atomic="true">
          {filtered.length} {filtered.length === 1 ? 'projeto exibido' : 'projetos exibidos'} em {active}.
        </p>

        {/* Bento Grid */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={active}
            layout={!reduceMotion}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 auto-rows-[minmax(340px,auto)] gap-4"
          >
            {filtered.map((item, i) => (
              <PortfolioCard key={item.id} item={item} index={i} onPreview={openPreview} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : 0.2 }}
          className="text-center mt-16"
        >
          <p className="font-mono text-[11px] tracking-[3px] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Quer fazer parte do portfólio?
          </p>
          <a
            href="https://wa.me/5565992178164?text=Vim%20do%20site%20(portfolio)&utm_source=site&utm_medium=botao&utm_campaign=portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 sm:px-8 py-4 rounded-full font-sora font-bold text-[#001a2e] transition-all duration-300 motion-safe:hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00e5ff]"
            style={{
              background: 'linear-gradient(135deg, #00e5ff 0%, #006bff 100%)',
              boxShadow: '0 0 30px -8px rgba(0,229,255,0.5)',
              fontSize: 15,
            }}
          >
            <span>Quero um projeto assim</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </motion.div>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="portfolio-preview-title"
        aria-describedby="portfolio-preview-description"
        data-lenis-prevent
        onCancel={event => {
          event.preventDefault()
          setPreview(null)
        }}
        onClose={() => setPreview(null)}
        className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-5xl overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-[#030c1a] p-0 text-white shadow-2xl backdrop:bg-[#010f20]/90"
      >
        {preview && (
          <>
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-white/10 bg-[#030c1a] p-4 sm:p-6">
              <div className="min-w-0">
                <p className="mb-1 font-mono text-xs text-[#00e5ff]">{preview.client}</p>
                <h2 id="portfolio-preview-title" className="font-sora text-lg font-bold sm:text-2xl">{preview.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="min-h-11 shrink-0 rounded-full border border-white/20 px-4 text-sm hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00e5ff]"
              >
                Fechar
              </button>
            </div>
            <p id="portfolio-preview-description" className="px-4 py-4 text-sm leading-relaxed text-white/70 sm:px-6">{preview.description}</p>
            {/* The original image can be taller than the viewport; keep its full content scrollable. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.imageUrl}
              alt={`${preview.title} — ${preview.client}`}
              className="block h-auto w-full"
              decoding="async"
            />
          </>
        )}
      </dialog>
    </section>
  )
}
