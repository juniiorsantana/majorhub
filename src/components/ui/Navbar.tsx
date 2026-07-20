'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const NAV_LINKS = [
  { label: 'Serviços', href: '/#servicos' },
  { label: 'Portfólio', href: '/#portfolio' },
  { label: 'Processo', href: '/#processo' },
  { label: 'Blog', href: '/blog' },
  { label: 'Diagnóstico Grátis', href: '/diagnostico', highlight: true },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fecha o menu ao navegar para outra rota
  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(false), 0)
    return () => window.clearTimeout(timer)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const isActive = (href: string) =>
    !href.startsWith('/#') && (pathname === href || pathname.startsWith(`${href}/`))

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav
        aria-label="Navegação principal"
        className={`flex items-center justify-between px-6 lg:px-12 transition-all duration-300 ${
          scrolled || open ? 'py-3' : 'py-4 md:py-5'
        }`}
        style={{
          background: scrolled || open ? 'rgba(0, 26, 46, 0.92)' : 'rgba(0, 26, 46, 0.55)',
          backdropFilter: 'blur(14px)',
          borderBottom: `1px solid rgba(0,229,255,${scrolled || open ? 0.14 : 0.08})`,
          transition: 'background 0.3s ease, border-color 0.3s ease, padding 0.3s ease',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="text-white font-sora font-bold text-xl tracking-wide"
          aria-label="MajorHub — voltar ao início"
        >
          MAJOR<span className="text-brand-cyan">HUB</span>
        </Link>

        {/* Links — desktop */}
        <div className="hidden md:flex items-center gap-7 lg:gap-8">
          {NAV_LINKS.map(link => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`group relative inline-flex items-center gap-2 text-sm font-medium transition-colors py-1 ${
                  active ? 'text-white' : 'text-text-secondary hover:text-white'
                }`}
              >
                {link.highlight && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
                )}
                {link.label}
                <span
                  className={`absolute left-0 -bottom-0.5 h-px w-full origin-left bg-gradient-to-r from-brand-cyan to-brand-blue transition-transform duration-300 ${
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            )
          })}
        </div>

        {/* CTA — desktop */}
        <a
          href="https://wa.me/5565992178164"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex text-brand-cyan text-sm font-semibold px-4 py-2 rounded-full border border-[rgba(0,229,255,0.35)] bg-[rgba(0,229,255,0.08)] hover:bg-[rgba(0,229,255,0.18)] hover:border-[rgba(0,229,255,0.6)] transition-colors"
        >
          Falar com a MajorHub →
        </a>

        {/* Hambúrguer — mobile */}
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          className="md:hidden relative flex items-center justify-center w-11 h-11 -mr-2 rounded-full text-white"
        >
          <span
            className={`absolute h-[2px] w-5 rounded-full bg-current transition-transform duration-300 ${
              open ? 'rotate-45' : '-translate-y-[3.5px]'
            }`}
          />
          <span
            className={`absolute h-[2px] w-5 rounded-full bg-current transition-transform duration-300 ${
              open ? '-rotate-45' : 'translate-y-[3.5px]'
            }`}
          />
        </button>
      </nav>

      {/* Menu mobile */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
              className="md:hidden fixed inset-0 -z-10 bg-black/50"
            />

            <motion.div
              key="panel"
              id="menu-mobile"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="md:hidden px-6 pt-2 pb-8"
              style={{
                background: 'rgba(0, 26, 46, 0.97)',
                backdropFilter: 'blur(14px)',
                borderBottom: '1px solid rgba(0,229,255,0.14)',
              }}
            >
              <ul>
                {NAV_LINKS.map((link, i) => {
                  const active = isActive(link.href)
                  return (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.05, duration: 0.3 }}
                      className="border-b border-[rgba(0,229,255,0.08)]"
                    >
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center gap-3 py-4 font-sora font-bold text-lg ${
                          active ? 'text-brand-cyan' : 'text-text-primary'
                        }`}
                      >
                        {link.highlight && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
                        )}
                        {link.label}
                      </Link>
                    </motion.li>
                  )
                })}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + NAV_LINKS.length * 0.05, duration: 0.3 }}
                className="mt-6"
              >
                <a
                  href="https://wa.me/5565992178164"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full px-6 py-4 rounded-full text-sm font-bold text-white bg-gradient-to-r from-brand-blue to-brand-indigo hover:brightness-110 transition-all"
                >
                  Falar com a MajorHub →
                </a>
                <p className="mt-3 text-center text-xs text-text-meta">
                  Respondemos em até 24 horas.
                </p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
