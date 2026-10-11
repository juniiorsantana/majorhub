import Link from 'next/link'
import { EMPRESA, enderecoEmLinha } from '@/lib/empresa'

export function BlogFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative py-10 px-6 border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <Link href="/" className="font-sora font-bold text-xl tracking-tight text-[#0a2540]">
          Major<span className="text-[#0099ff]">Hub</span>
        </Link>

        <p className="text-slate-500 text-sm text-center md:text-left">
          &copy; {currentYear} MajorHub. Todos os direitos reservados.
        </p>

        <div className="flex items-center gap-6">
          <Link
            href="/privacidade"
            className="text-slate-500 hover:text-[#0099ff] transition-colors text-sm font-medium"
          >
            Privacidade
          </Link>
          <a
            href="https://wa.me/5565992178164"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0099ff] hover:text-[#667eea] transition-colors text-sm font-semibold"
          >
            Falar com a MajorHub →
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6 pt-5 border-t border-slate-100 text-slate-500 text-xs leading-relaxed text-center md:text-left">
        <p>
          {EMPRESA.razaoSocial} · CNPJ {EMPRESA.cnpj}
        </p>
        <p>
          {enderecoEmLinha} · {EMPRESA.telefone} · {EMPRESA.email}
        </p>
      </div>
    </footer>
  )
}
