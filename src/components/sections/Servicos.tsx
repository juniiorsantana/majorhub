'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { copy } from '@/content/copy'

// ─── WhatsApp helper ─────────────────────────────────────────────────────────
const PHONE = '5565992178164'
const WA_MESSAGES: Record<string, string> = {
  comercial: 'Olá! Vi o site da MajorHub e quero entender como funciona a Estruturação Comercial.',
  site:      'Olá! Vi o site da MajorHub e quero saber mais sobre o serviço de Site Profissional.',
  identidade:'Olá! Vi o site da MajorHub e tenho interesse na Identidade Visual.',
}
function buildWhatsappUrl(serviceId: string) {
  const msg = WA_MESSAGES[serviceId] ?? 'Olá! Vim pelo site da MajorHub e quero saber mais.'
  const params = new URLSearchParams({
    text: msg,
    utm_source:   'site',
    utm_medium:   'cta',
    utm_campaign: 'servicos',
    utm_content:  serviceId,
  })
  return `https://wa.me/${PHONE}?${params.toString()}`
}

// ─── Accent colours — all from the Major brand palette ───────────────────────
const ACCENTS = [
  { border: '#00e5ff', glow: 'rgba(0,229,255,0.40)',  ring: 'rgba(0,229,255,0.12)',  text: '#00e5ff',  idx: '01' },
  { border: '#0099ff', glow: 'rgba(0,153,255,0.40)',  ring: 'rgba(0,153,255,0.12)',  text: '#0099ff',  idx: '02' },
  { border: '#667eea', glow: 'rgba(102,126,234,0.40)', ring: 'rgba(102,126,234,0.12)', text: '#667eea', idx: '03' },
]



// ─── Icon with pulsing ring ────────────────────────────────────────────────────
function PulsingIcon({ icon, accent }: { icon: string; accent: typeof ACCENTS[0] }) {
  return (
    <div className="relative inline-flex items-center justify-center mb-6 w-16 h-16">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ border: `1px solid ${accent.border}` }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.55, 0, 0.55] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-2 rounded-full"
        style={{ border: `1px solid ${accent.border}55` }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0.1, 0.7] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      <div
        className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
        style={{ background: `radial-gradient(circle, ${accent.ring} 0%, transparent 70%)` }}
      >
        {icon}
      </div>
    </div>
  )
}

// ─── Individual Service Card ───────────────────────────────────────────────────
function ServicoCard({ servico, index, accent, onClick }: {
  servico: typeof copy.servicos[0]
  index: number
  accent: typeof ACCENTS[0]
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      layoutId={servico.id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="relative group cursor-pointer h-full"
      role="button"
      tabIndex={0}
      aria-label={`Ver detalhes: ${servico.titulo}`}
      onClick={onClick}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {/* Animated conic border */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none z-0"
        style={{
          padding: '1px',
          borderRadius: '1rem',
          background: `conic-gradient(from var(--angle, 0deg), transparent 60%, ${accent.border} 80%, transparent 100%)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          animation: 'spin-border 3s linear infinite',
          opacity: hovered ? 1 : 0.35,
          transition: 'opacity 0.3s',
        }}
      />

      {/* Glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none z-0"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ boxShadow: `0 0 50px -10px ${accent.glow}, 0 0 100px -20px ${accent.glow}` }}
      />

      {/* Scan line */}
      <div className={`absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-10 transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        <motion.div
          className="absolute left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${accent.border}, transparent)` }}
          animate={hovered ? { top: ['0%', '100%'] } : { top: '-2px' }}
          transition={hovered ? { duration: 1.4, ease: 'linear', repeat: Infinity, repeatDelay: 0.5 } : {}}
        />
      </div>

      {/* Body */}
      <div
        className="relative z-20 h-full rounded-2xl p-8 flex flex-col"
        style={{
          background: 'linear-gradient(135deg, rgba(10,37,64,0.95) 0%, rgba(0,26,46,0.98) 100%)',
          border: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Watermark index */}
        <div
          className="absolute top-4 right-5 font-sora font-black text-[80px] leading-none select-none pointer-events-none z-0"
          style={{ color: accent.border, opacity: 0.05 }}
        >
          {accent.idx}
        </div>

        <PulsingIcon icon={servico.icon} accent={accent} />

        <motion.h3
          className="font-sora font-bold text-[clamp(18px,2.2vw,22px)] mb-3 tracking-wide"
          animate={{ color: hovered ? accent.text : '#ffffff' }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
        >
          {servico.titulo.toUpperCase()}
        </motion.h3>

        <p className="text-text-secondary text-sm leading-relaxed flex-1">
          {servico.resumo}
        </p>

        <div
          className="mt-6 pt-5 flex justify-between items-center"
          style={{ borderTop: `1px solid ${accent.ring}` }}
        >
          <span
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{ color: accent.text, background: accent.ring, border: `1px solid ${accent.border}30` }}
          >
            {servico.tag}
          </span>
          <motion.span
            className="text-sm font-semibold"
            style={{ color: accent.text }}
            animate={hovered ? { x: 4 } : { x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {(servico as any).cta ?? 'Ver mais →'}
          </motion.span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
function ServicoModal({ servico, accent, onClose }: {
  servico: typeof copy.servicos[0]
  accent: typeof ACCENTS[0]
  onClose: () => void
}) {
  // Lock page scroll (native) while modal is open + fechar com ESC
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/75 z-40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Centering wrapper — flex so the panel is vertically centered */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none">
        {/* Panel — pointer-events-auto re-enables interaction */}
        <motion.div
          layoutId={servico.id}
          role="dialog"
          aria-modal="true"
          aria-label={servico.titulo}
          className="relative w-full max-w-xl rounded-2xl pointer-events-auto"
          style={{
            maxHeight: '85vh',
            overflowY: 'auto',
            // data-lenis-prevent stops Lenis from hijacking scroll inside the panel
            background: 'linear-gradient(135deg, rgba(8,8,22,0.98) 0%, rgba(10,37,64,0.99) 100%)',
            border: `1px solid ${accent.border}40`,
            boxShadow: `0 0 60px -15px ${accent.glow}, 0 30px 60px rgba(0,0,0,0.7)`,
          }}
          // Tell Lenis to ignore wheel/touch events on this element
          data-lenis-prevent
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Progress bar */}
          <motion.div
            className="sticky top-0 left-0 right-0 h-[3px] z-10 rounded-t-2xl"
            style={{ background: `linear-gradient(90deg, ${accent.border}, ${accent.glow}, transparent)` }}
            initial={{ scaleX: 0, transformOrigin: 'left' }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          />

          {/* Dot-grid texture */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(${accent.border}12 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10 p-6 md:p-8">
            {/* Header: icon + title + close */}
            <div className="flex items-start gap-4 mb-5">
              <div
                className="text-3xl w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: accent.ring, border: `1px solid ${accent.border}40` }}
              >
                {servico.icon}
              </div>
              <div className="flex-1 min-w-0">
                <motion.h3
                  layoutId={`${servico.id}-title`}
                  className="font-sora font-black text-xl md:text-2xl text-text-primary leading-tight"
                >
                  {servico.titulo}
                </motion.h3>
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                  className="text-[11px] font-semibold mt-1 inline-block px-2 py-0.5 rounded-full"
                  style={{ color: accent.text, background: accent.ring, border: `1px solid ${accent.border}30` }}
                >
                  {servico.tag}
                </motion.span>
              </div>
              {/* Close button in header */}
              <button
                onClick={onClose}
                autoFocus
                className="shrink-0 text-text-meta hover:text-text-primary transition-colors text-lg leading-none -mt-1 -mr-1 p-2 rounded-lg hover:bg-white/5"
                aria-label="Fechar detalhes do serviço"
              >
                ✕
              </button>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="text-text-secondary leading-relaxed text-sm mb-6"
            >
              {servico.descricao}
            </motion.p>

            {/* Deliverables label */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28 }}
              className="text-[10px] uppercase tracking-widest font-bold mb-4"
              style={{ color: accent.text }}
            >
              O que está incluído
            </motion.p>

            {/* Sequential reveal list */}
            <ul className="space-y-3 mb-8">
              {servico.entregas.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.32 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: accent.border }}
                  />
                  <span className="text-text-secondary text-sm leading-relaxed">{item}</span>
                </motion.li>
              ))}
            </ul>

            {/* CTA → WhatsApp */}
            <motion.a
              href={buildWhatsappUrl(servico.id)}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 + servico.entregas.length * 0.07 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="block w-full py-3 rounded-full text-sm font-bold text-white text-center"
              style={{
                background: `linear-gradient(135deg, ${accent.border}, ${accent.text}bb)`,
                boxShadow: `0 0 20px ${accent.glow}`,
              }}
            >
              {(servico as any).cta ?? 'Ver como funciona →'}
            </motion.a>
          </div>
        </motion.div>
      </div>
    </>
  )
}

// ─── Section ───────────────────────────────────────────────────────────────────
export function Servicos() {
  const [selected, setSelected] = useState<string | null>(null)
  const activeIdx = copy.servicos.findIndex(s => s.id === selected)
  const activeServico = activeIdx >= 0 ? copy.servicos[activeIdx] : null
  const activeAccent = activeIdx >= 0 ? ACCENTS[activeIdx] : ACCENTS[0]

  return (
    <>
      <style>{`
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes spin-border {
          to { --angle: 360deg; }
        }
      `}</style>

      <section id="servicos" className="relative py-28 px-6 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto">

          {/* Headline */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-brand-cyan text-xs font-bold uppercase tracking-[0.25em] mb-5">
              Serviços
            </p>
            <h2 className="font-sora font-extrabold text-[clamp(28px,4.5vw,52px)] text-text-primary leading-[1.15] max-w-2xl mx-auto">
              Crescer não depende de mais esforço.{' '}
              <span className="text-text-secondary">Depende de estrutura.</span>
            </h2>
          </motion.div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {copy.servicos.map((servico, i) => (
              <ServicoCard
                key={servico.id}
                servico={servico}
                index={i}
                accent={ACCENTS[i]}
                onClick={() => setSelected(servico.id)}
              />
            ))}
          </div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {selected && activeServico && (
            <ServicoModal
              servico={activeServico}
              accent={activeAccent}
              onClose={() => setSelected(null)}
            />
          )}
        </AnimatePresence>
      </section>
    </>
  )
}
