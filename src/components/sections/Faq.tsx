import { RevealWrapper } from '@/components/ui/RevealWrapper'
import { copy } from '@/content/copy'

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: copy.faq.items.map(item => ({
    '@type': 'Question',
    name: item.pergunta,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.resposta,
    },
  })),
}

export function Faq() {
  return (
    <section id="faq" className="relative py-24 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="max-w-3xl mx-auto">
        <RevealWrapper>
          <h2 className="font-sora font-extrabold text-[clamp(26px,4vw,40px)] leading-[1.15] text-center mb-4 text-text-primary">
            {copy.faq.titulo}
          </h2>
        </RevealWrapper>

        <RevealWrapper delay={0.1}>
          <p className="text-text-secondary text-lg text-center mb-12">
            {copy.faq.subtitulo}
          </p>
        </RevealWrapper>

        <div className="flex flex-col gap-4">
          {copy.faq.items.map((item, i) => (
            <RevealWrapper key={item.pergunta} delay={0.1 + i * 0.05}>
              <details className="group rounded-xl border border-[rgba(0,229,255,0.15)] bg-[rgba(10,37,64,0.5)] open:border-[rgba(0,229,255,0.4)] transition-colors">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-6 py-5 font-sora font-bold text-text-primary [&::-webkit-details-marker]:hidden">
                  {item.pergunta}
                  <span className="shrink-0 text-brand-cyan transition-transform group-open:rotate-45 text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-6 text-text-secondary leading-relaxed">
                  {item.resposta}
                </p>
              </details>
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  )
}
