'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
function PortfolioCard({ item, index }: { item: PortfolioItem; index: number }) {
  const [hovered, setHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const isWide = item.size === 'wide'
  const isTall = item.size === 'tall'

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={[
        'relative overflow-hidden rounded-2xl cursor-pointer group',
        'border border-white/[0.06]',
        isWide ? 'md:col-span-2' : '',
        isTall ? 'md:row-span-2' : '',
      ].join(' ')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minHeight: isTall ? undefined : 280,
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
          alt={`${item.title} — ${item.client}`}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
          animate={{ scale: hovered ? 1.06 : 1 }}
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
        animate={hovered ? { top: ['20%', '80%'], opacity: [0, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
      />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        {/* Tags */}
        <motion.div
          className="flex flex-wrap gap-1.5 mb-3"
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
          transition={{ duration: 0.3 }}
        >
          {item.tags.map(tag => (
            <span
              key={tag}
              className="font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              {tag}
            </span>
          ))}
        </motion.div>

        <h3
          className="font-sora font-bold text-white leading-tight mb-1"
          style={{ fontSize: 'clamp(15px, 1.6vw, 19px)' }}
        >
          {item.title}
        </h3>

        <motion.p
          className="text-sm leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}
          animate={{ opacity: hovered ? 1 : 0, height: hovered ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
        >
          {item.description}
        </motion.p>

        <div
          className="flex items-center justify-between mt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 10 }}
        >
          <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {item.client}
          </span>
          <motion.span
            className="text-[#00e5ff] font-mono text-xs flex items-center gap-1"
            animate={{ x: hovered ? 0 : -4, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.25 }}
          >
            Ver projeto →
          </motion.span>
        </div>
      </div>

      {/* Corner accent */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: 60,
          height: 60,
          background: 'linear-gradient(225deg, rgba(0,229,255,0.08) 0%, transparent 70%)',
        }}
      />
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Section
// ─────────────────────────────────────────────────────────────────────────────
export function Portfolio() {
  const [active, setActive] = useState<Category>('Todos')
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  const filtered =
    active === 'Todos'
      ? PORTFOLIO_ITEMS
      : PORTFOLIO_ITEMS.filter(i => i.category === active)

  // Scroll-triggered header entrance
  useEffect(() => {
    const el = headerRef.current
    if (!el) return
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
  }, [])

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
            transition: 'opacity 0.7s ease, transform 0.7s ease',
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
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {CATEGORIES.map(cat => {
            const isActive = active === cat
            return (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-full font-mono text-[11px] tracking-[2px] uppercase transition-all duration-300"
                style={{
                  background: isActive ? 'rgba(0,229,255,0.12)' : 'rgba(255,255,255,0.04)',
                  border: isActive ? '1px solid rgba(0,229,255,0.45)' : '1px solid rgba(255,255,255,0.08)',
                  color: isActive ? '#00e5ff' : 'rgba(255,255,255,0.45)',
                  boxShadow: isActive ? '0 0 20px -8px rgba(0,229,255,0.5)' : 'none',
                }}
              >
                <span style={{ fontSize: 10 }}>{categoryIcons[cat]}</span>
                {cat}
                {isActive && (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ border: '1px solid rgba(0,229,255,0.45)' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Bento Grid */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={active}
            layout
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            style={{ gridAutoRows: '300px' }}
          >
            {filtered.map((item, i) => (
              <PortfolioCard key={item.id} item={item} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mt-16"
        >
          <p className="font-mono text-[11px] tracking-[3px] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Quer fazer parte do portfólio?
          </p>
          <a
            href="https://wa.me/5565992178164?text=Vim%20do%20site%20(portfolio)&utm_source=site&utm_medium=botao&utm_campaign=portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-sora font-bold text-[#001a2e] transition-all duration-300 hover:scale-105"
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
    </section>
  )
}
