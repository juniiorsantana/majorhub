import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Serviços', href: '/#servicos' },
  { label: 'Portfólio', href: '/#portfolio' },
  { label: 'Processo', href: '/#processo' },
  { label: 'Blog', href: '/blog' },
  { label: 'Diagnóstico Grátis', href: '/diagnostico' },
]

export function Navbar() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 py-4"
      style={{ background: 'rgba(0, 26, 46, 0.75)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,229,255,0.08)' }}
    >
      {/* Logo */}
      <Link href="/" className="text-white font-sora font-bold text-xl tracking-wide" aria-label="MajorHub — voltar ao topo">
        MAJOR<span className="text-[#00e5ff]">HUB</span>
      </Link>

      {/* Links de seção — desktop */}
      <div className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-[#bae6fd] hover:text-white transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* CTA */}
      <a
        href="https://wa.me/5565992178164"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#00e5ff] text-sm font-semibold px-4 py-2 rounded-full border border-[rgba(0,229,255,0.35)] bg-[rgba(0,229,255,0.08)] hover:bg-[rgba(0,229,255,0.18)] hover:border-[rgba(0,229,255,0.6)] transition-colors"
      >
        Falar com a MajorHub →
      </a>
    </nav>
  )
}
