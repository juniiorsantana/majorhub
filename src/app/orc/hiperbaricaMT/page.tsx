'use client'

import { motion, useReducedMotion } from 'framer-motion'

const checkoutHref = 'https://www.asaas.com/c/h8qkz8tdamv7w9hi'

const scopeItems = [
  {
    index: '01',
    eyebrow: 'Arquitetura',
    title: 'Informação que encontra o caminho certo.',
    text: 'Páginas e conteúdos organizados para que visitantes, Google e sistemas de IA entendam rapidamente o que a HiperbaricaMT oferece.',
  },
  {
    index: '02',
    eyebrow: 'Interface',
    title: 'Uma experiência medical-tech.',
    text: 'Design responsivo, limpo e contemporâneo, com movimento na medida para comunicar precisão sem perder acolhimento.',
  },
  {
    index: '03',
    eyebrow: 'Desenvolvimento',
    title: 'Base técnica para ser descoberta.',
    text: 'Implementação com estrutura semântica, SEO técnico inicial, performance e integrações previstas no escopo aprovado.',
  },
  {
    index: '04',
    eyebrow: 'Pós-publicação',
    title: 'O projeto continua estável.',
    text: 'Três meses de suporte para correções e ajustes do escopo aprovado após a publicação do site.',
  },
]

const processItems = [
  ['01', 'Diagnóstico', 'Entender a HiperbaricaMT, seus serviços e o objetivo do novo site.'],
  ['02', 'Arquitetura', 'Organizar páginas, conteúdos e caminhos para quem está pesquisando.'],
  ['03', 'Design', 'Criar a interface medical-tech e validar a experiência responsiva.'],
  ['04', 'Desenvolvimento', 'Construir, testar, publicar e iniciar o período de suporte.'],
]

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function OrbitNode({ label, className, delay }: { label: string; className: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.82 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`hmt-orbit-node ${className}`}
    >
      <strong>{label}</strong>
    </motion.div>
  )
}

function Spoke({ className, delay }: { className: string; delay: number }) {
  return (
    <span className={`hmt-spoke ${className}`} aria-hidden="true">
      <span className="hmt-spoke-pulse" style={{ animationDelay: `${delay}s` }} />
    </span>
  )
}

function DiscoveryNetwork() {
  return (
    <div className="hmt-network" aria-label="Rede de descoberta digital: HMT conectada a site, Google, IA e lead">
      <div className="hmt-network-grid" aria-hidden="true" />
      <div className="hmt-orbit-ring hmt-orbit-ring-outer" aria-hidden="true" />
      <div className="hmt-orbit-ring hmt-orbit-ring-inner" aria-hidden="true" />
      <div className="hmt-orbit-runner hmt-orbit-runner-one" aria-hidden="true" />
      <div className="hmt-orbit-runner hmt-orbit-runner-two" aria-hidden="true" />
      <Spoke className="hmt-spoke-site" delay={0} />
      <Spoke className="hmt-spoke-google" delay={0.45} />
      <Spoke className="hmt-spoke-ia" delay={0.9} />
      <Spoke className="hmt-spoke-lead" delay={1.35} />
      <div className="hmt-network-core" aria-hidden="true">
        <strong>HMT</strong>
      </div>
      <OrbitNode label="SITE" className="hmt-node-site" delay={0.08} />
      <OrbitNode label="GOOGLE" className="hmt-node-google" delay={0.16} />
      <OrbitNode label="IA" className="hmt-node-ia" delay={0.24} />
      <OrbitNode label="LEAD" className="hmt-node-lead" delay={0.32} />
    </div>
  )
}
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="hmt-section-label">
      <span className="hmt-label-line" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

export default function HmtProposalPage() {
  return (
    <main className="hmt-page">
      <div className="hmt-orb hmt-orb-one" aria-hidden="true" />
      <div className="hmt-orb hmt-orb-two" aria-hidden="true" />

      <header className="hmt-header hmt-container">
        <a className="hmt-brand" href="#top" aria-label="HiperbaricaMT — início da proposta">
          <span className="hmt-brand-mark" aria-hidden="true">
            H
          </span>
          <span>
            <strong>HIPERBARICA</strong>
            <small>MT / PROPOSTA DIGITAL</small>
          </span>
        </a>
        <span className="hmt-header-tag">PROPOSTA 01 / 2026</span>
      </header>

      <section id="top" className="hmt-hero hmt-container">
        <div className="hmt-hero-copy">
          <Reveal>
            <p className="hmt-kicker">NOVA PRESENÇA DIGITAL</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1>
              Um novo site para a <em>HiperbaricaMT.</em>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="hmt-hero-text">
              Uma proposta enxuta para desenvolver um site profissional, responsivo e preparado para a próxima fase digital da empresa.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="hmt-hero-actions">
              <a className="hmt-button hmt-button-primary" href="#investimento">
                Ver o investimento <span aria-hidden="true">↗</span>
              </a>
              <a className="hmt-text-link" href="#escopo">
                Explorar o escopo
              </a>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.14} className="hmt-network-wrap">
          <DiscoveryNetwork />
        </Reveal>
      </section>


      <section className="hmt-section hmt-container hmt-why-section">
        <Reveal>
          <SectionLabel>O papel do novo site</SectionLabel>
        </Reveal>
        <div className="hmt-two-column">
          <Reveal delay={0.08}>
            <h2>Uma presença digital clara, direta e <em>preparada para evoluir.</em></h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="hmt-lead-copy">
              Como já conhecemos o padrão de trabalho do grupo, esta proposta parte de uma base mais enxuta: desenvolver um site profissional, responsivo e alinhado ao posicionamento da HiperbaricaMT.
            </p>
            <p className="hmt-muted-copy">
              A busca por IA entra como cuidado técnico de estrutura e conteúdo — um diferencial da entrega, sem transformar o projeto em uma operação contínua de marketing.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="hmt-ai-section">
        <div className="hmt-container">
          <Reveal>
            <SectionLabel>A camada de descoberta</SectionLabel>
          </Reveal>
          <div className="hmt-two-column hmt-ai-intro">
            <Reveal delay={0.08}>
              <h2>Preparado para a nova forma de <em>pesquisar.</em></h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="hmt-lead-copy">As pessoas já não buscam respostas apenas digitando palavras no Google. Elas também fazem perguntas diretamente para ferramentas de inteligência artificial.</p>
            </Reveal>
          </div>
          <div className="hmt-ai-cards">
            {[
              ['01', 'Ser compreendido', 'Conteúdo claro e organizado para responder às principais dúvidas de quem está pesquisando.'],
              ['02', 'Ser encontrado', 'Estrutura semântica e base de SEO para facilitar a leitura por buscadores e sistemas de IA.'],
              ['03', 'Ser escolhido', 'Uma experiência que transforma informação em confiança e conduz o visitante ao próximo passo.'],
            ].map(([index, title, text], i) => (
              <Reveal key={index} delay={0.08 + i * 0.08} className="hmt-ai-card">
                <span className="hmt-card-index">{index}</span>
                <span className="hmt-card-signal" aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <p className="hmt-disclaimer">A estrutura aumenta a capacidade de o site ser compreendido e encontrado. Nenhum mecanismo de busca garante posições ou recomendações específicas.</p>
          </Reveal>
        </div>
      </section>

      <section id="escopo" className="hmt-section hmt-container">
        <Reveal>
          <SectionLabel>O que será desenvolvido</SectionLabel>
        </Reveal>
        <div className="hmt-scope-heading">
          <Reveal delay={0.08}><h2>Desenvolvimento focado em <em>presença digital.</em></h2></Reveal>
          <Reveal delay={0.16}><p>Uma entrega completa para colocar a HiperbaricaMT em uma nova camada de comunicação digital.</p></Reveal>
        </div>
        <div className="hmt-scope-grid">
          {scopeItems.map((item, i) => (
            <Reveal key={item.index} delay={0.06 + i * 0.06} className="hmt-scope-card">
              <span className="hmt-card-index">{item.index}</span>
              <span className="hmt-scope-eyebrow">{item.eyebrow}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="investimento" className="hmt-investment-section">
        <div className="hmt-container hmt-investment-grid">
          <Reveal>
            <SectionLabel>Investimento</SectionLabel>
            <h2>Um novo site para a próxima etapa da <em>HiperbaricaMT.</em></h2>
            <p className="hmt-investment-copy">Desenvolvimento completo do site conforme o escopo aprovado.</p>
          </Reveal>
          <Reveal delay={0.12} className="hmt-price-card">
            <span className="hmt-price-label">DESENVOLVIMENTO DO SITE</span>
            <strong>R$ 2.100</strong>
            <span className="hmt-price-note">investimento único</span>
            <div className="hmt-price-divider" />
            <ul>
              <li>Site responsivo</li>
              <li>SEO técnico inicial + preparação para busca por IA</li>
              <li>3 meses de suporte após a publicação</li>
              <li>Correções e ajustes dentro do escopo aprovado</li>
              <li>Acompanhamento interno pelo Tracker da MajorHub</li>
            </ul>
            <a className="hmt-button hmt-button-primary" href={checkoutHref} target="_blank" rel="noopener noreferrer">
              Aprovar desenvolvimento <span aria-hidden="true">↗</span>
            </a>
          </Reveal>
        </div>
        <div className="hmt-container">
          <p className="hmt-commercial-note">Novas páginas, funcionalidades, integrações ou alterações fora do escopo inicial poderão ser avaliadas e orçadas separadamente.</p>
        </div>
      </section>

      <section className="hmt-section hmt-container hmt-process-section">
        <Reveal><SectionLabel>Como acontece</SectionLabel></Reveal>
        <div className="hmt-process-heading">
          <Reveal delay={0.08}><h2>Da estrutura à <em>descoberta.</em></h2></Reveal>
          <Reveal delay={0.16}><p>Um fluxo simples para transformar a ideia em uma experiência digital pronta para ir ao ar.</p></Reveal>
        </div>
        <div className="hmt-process-grid">
          {processItems.map(([index, title, text], i) => (
            <Reveal key={index} delay={0.06 + i * 0.06} className="hmt-process-card">
              <span className="hmt-process-number">{index}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="hmt-final-cta">
        <div className="hmt-cta-scan" aria-hidden="true" />
        <div className="hmt-container hmt-final-inner">
          <Reveal>
            <p className="hmt-kicker">HIPERBARICAMT / READY TO BE FOUND</p>
            <h2>A HiperbaricaMT pronta para ser <em>encontrada.</em></h2>
            <p>Um site moderno, responsivo e estruturado para acompanhar a nova forma como as pessoas pesquisam, escolhem e entram em contato.</p>
            <a className="hmt-button hmt-button-primary" href={checkoutHref} target="_blank" rel="noopener noreferrer">
              Aprovar projeto por R$ 2.100 <span aria-hidden="true">↗</span>
            </a>
          </Reveal>
        </div>
      </section>

      <footer className="hmt-footer hmt-container">
        <span>MajorHub / desenvolvimento digital</span>
        <span>HiperbaricaMT / 2026</span>
      </footer>

      <a className="hmt-mobile-cta" href={checkoutHref} target="_blank" rel="noopener noreferrer">
        Aprovar projeto — R$ 2.100 <span aria-hidden="true">↗</span>
      </a>
    </main>
  )
}
