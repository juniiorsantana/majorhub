'use client'
import Link from 'next/link'
import { RevealWrapper } from '@/components/ui/RevealWrapper'
import { EMPRESA, enderecoEmLinha } from '@/lib/empresa'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative py-12 px-6 border-t border-[rgba(0,229,255,0.1)] bg-brand-deep">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">

        <RevealWrapper delay={0.1} direction="up">
          <div className="font-sora font-bold text-2xl tracking-tighter text-text-primary">
            Major<span className="text-brand-cyan">Hub</span>
          </div>
        </RevealWrapper>

        <RevealWrapper delay={0.2} direction="up">
          <p className="text-text-secondary text-sm text-center md:text-left">
            &copy; {currentYear} MajorHub. Todos os direitos reservados.
          </p>
        </RevealWrapper>

        <RevealWrapper delay={0.3} direction="up">
          <div className="flex gap-6">
            {/* Quando tiver os perfis, adicione aqui:
                <a href="https://instagram.com/..." ...>Instagram</a> */}
            <Link
              href="/privacidade"
              className="text-text-meta hover:text-brand-cyan transition-colors text-sm font-medium"
            >
              Privacidade
            </Link>
            <a
              href="https://wa.me/5565992178164"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-meta hover:text-brand-cyan transition-colors text-sm font-medium"
            >
              WhatsApp
            </a>
          </div>
        </RevealWrapper>

      </div>

      {/* Identificação legal: a revisão do WhatsApp (Meta) confere o site contra o cadastro verificado. */}
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[rgba(0,229,255,0.06)] text-text-meta text-xs leading-relaxed text-center md:text-left">
        <p>
          {EMPRESA.razaoSocial} · CNPJ {EMPRESA.cnpj}
        </p>
        <p>
          {enderecoEmLinha} · {EMPRESA.telefone} ·{' '}
          <a href={`mailto:${EMPRESA.email}`} className="hover:text-brand-cyan transition-colors">
            {EMPRESA.email}
          </a>
        </p>
      </div>
    </footer>
  )
}
