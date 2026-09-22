import { RevealWrapper } from '@/components/ui/RevealWrapper'
import { Monograma } from './Monograma'
import type { Orcamento } from '@/content/orcamentos'

interface Props {
  orcamento: Orcamento
  validade: string
}

/** Monta a faixa de contato só com os campos preenchidos no arquivo do cliente. */
function montarContatos(contato: Orcamento['contato']) {
  const itens: { rotulo: string; valor: string; href: string }[] = []

  if (contato.email) {
    itens.push({ rotulo: 'E-mail', valor: contato.email, href: `mailto:${contato.email}` })
  }
  if (contato.telefone) {
    itens.push({
      rotulo: 'Telefone',
      valor: contato.telefone,
      href: `tel:${contato.telefone.replace(/\D/g, '')}`,
    })
  }
  if (contato.site) {
    itens.push({
      rotulo: 'Site',
      valor: contato.site.replace(/^https?:\/\//, ''),
      href: contato.site.startsWith('http') ? contato.site : `https://${contato.site}`,
    })
  }
  if (contato.instagram) {
    const usuario = contato.instagram.replace(/^@/, '')
    itens.push({
      rotulo: 'Instagram',
      valor: `@${usuario}`,
      href: `https://instagram.com/${usuario}`,
    })
  }

  return itens
}

export function CtaAceite({ orcamento, validade }: Props) {
  const primeiroNome = orcamento.cliente.nome.split(' ')[0]
  const contatos = montarContatos(orcamento.contato)

  return (
    <section className="relative bg-[var(--orc-contrast-bg)] text-[var(--orc-contrast-text)]">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-12">
        <div className="grid items-center gap-12 lg:grid-cols-[auto_1fr_auto] lg:gap-16">
          <RevealWrapper>
            <Monograma marca={orcamento.marca} tamanho="md" invertido />
          </RevealWrapper>

          <RevealWrapper delay={0.08}>
            <div className="lg:border-l lg:border-[var(--orc-contrast-soft)]/25 lg:pl-16">
              <p className="orc-display text-[clamp(26px,3.2vw,36px)] leading-snug text-[var(--orc-contrast-text)]">
                Vamos começar, {primeiroNome}?
              </p>
              <p className="mt-5 max-w-md leading-relaxed text-[var(--orc-contrast-soft)]">
                Escolha o plano e a gente inicia o onboarding na mesma semana. Se preferir conversar
                antes de decidir, é só chamar.
              </p>
            </div>
          </RevealWrapper>

          <RevealWrapper delay={0.16}>
            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
              <a
                href="#investimento"
                className="inline-flex items-center justify-center gap-3 border border-[var(--orc-accent)] bg-[var(--orc-accent)] px-9 py-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--orc-contrast-bg)] transition-colors duration-300 hover:bg-transparent hover:text-[var(--orc-accent)]"
              >
                Aceitar proposta
                <span aria-hidden="true">→</span>
              </a>

              <a
                href={`https://wa.me/${orcamento.contato.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 border border-[var(--orc-contrast-soft)]/40 px-9 py-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--orc-contrast-text)] transition-colors duration-300 hover:border-[var(--orc-accent)] hover:text-[var(--orc-accent)]"
              >
                Tirar uma dúvida
              </a>
            </div>
          </RevealWrapper>
        </div>
      </div>

      {/* Faixa de contato e assinatura */}
      <div className="border-t border-[var(--orc-contrast-soft)]/20">
        <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-x-12 gap-y-8 px-6 py-10 md:px-12">
          {contatos.length > 0 && (
            <ul className="flex flex-wrap gap-x-12 gap-y-6">
              {contatos.map(item => (
                <li key={item.rotulo} className="flex flex-col gap-1.5">
                  <span className="orc-label text-[var(--orc-accent)]">{item.rotulo}</span>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--orc-contrast-text)] transition-colors hover:text-[var(--orc-accent)]"
                  >
                    {item.valor}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs leading-relaxed text-[var(--orc-contrast-soft)]">
            Proposta elaborada por {orcamento.contato.responsavel}
            {orcamento.parceria && ` em parceria com ${orcamento.parceria.nome}`}
            <span className="mt-1 block">Válida até {validade}</span>
          </p>
        </div>
      </div>
    </section>
  )
}
