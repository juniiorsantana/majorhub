'use client'
import { useEffect, useRef } from 'react'
import { copy } from '@/content/copy'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function Processo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const lineFillRef = useRef<HTMLDivElement>(null)
  const glowDotRef = useRef<HTMLDivElement>(null)
  const lineTrackRef = useRef<HTMLDivElement>(null)
  const stepsWrapRef = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const dotDesktopRefs = useRef<(HTMLDivElement | null)[]>([])
  const dotMobileRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const el = containerRef.current
    const wrap = stepsWrapRef.current
    if (!el || !wrap) return

    const allDots = dotDesktopRefs.current.filter(Boolean) as HTMLDivElement[]
    const allSteps = stepRefs.current.filter(Boolean) as HTMLDivElement[]
    const total = allDots.length
    if (total === 0) return

    // ── Estado inicial da linha ──────────────────────────────────────────
    if (lineFillRef.current) gsap.set(lineFillRef.current, { scaleY: 0, transformOrigin: 'top center' })
    if (glowDotRef.current) gsap.set(glowDotRef.current, { y: 0 })

    // ── Animação de entrada dos cards e dots ─────────────────────────────
    allSteps.forEach((stepEl, i) => {
      const isEven = i % 2 === 0

      gsap.from(stepEl, {
        opacity: 0, x: isEven ? 50 : -50,
        ease: 'power3.out', duration: 0.65,
        scrollTrigger: { trigger: stepEl, start: 'top 85%', toggleActions: 'play none none reverse' },
      })

      const dot = allDots[i]
      if (dot) {
        gsap.from(dot, {
          scale: 0, opacity: 0,
          ease: 'back.out(2.5)', duration: 0.45,
          scrollTrigger: { trigger: stepEl, start: 'top 83%', toggleActions: 'play none none reverse' },
        })
      }

      const mobileDot = dotMobileRefs.current[i]
      if (mobileDot) {
        gsap.from(mobileDot, {
          scale: 0, opacity: 0,
          ease: 'back.out(2.5)', duration: 0.45,
          scrollTrigger: { trigger: stepEl, start: 'top 83%', toggleActions: 'play none none reverse' },
        })
      }
    })

    // ── Refresh antes de calcular posições ───────────────────────────────
    // correção: ScrollTrigger.refresh() ANTES de medir os dots garante que
    // o layout final está calculado. Depois usamos requestAnimationFrame
    // para aguardar um frame extra e só então medir — evitando posições
    // capturadas antes do browser finalizar o paint.
    ScrollTrigger.refresh()

    requestAnimationFrame(() => {
      // correção: medimos a posição de cada dot relativo ao lineTrackRef
      // (não ao stepsWrap), porque o trilho já tem top:8px aplicado —
      // isso elimina o offset que fazia a bolinha ficar entre os pontos.
      const track = lineTrackRef.current
      if (!track) return

      const trackTop = track.getBoundingClientRect().top

      // Posição Y de cada dot relativa ao topo do trilho
      const dotPositions = allDots.map(dot => {
        const dotRect = dot.getBoundingClientRect()
        // centro do dot relativo ao topo do trilho
        return dotRect.top - trackTop + dotRect.height / 2
      })


      // correção: trackHeight é a altura REAL do elemento trilho (offsetHeight).
      // scaleY vai de 0→1 sobre essa altura. Se normalizarmos por totalTravel
      // (distância entre dots em px), o scaleY fica errado porque o trilho
      // tem top:8 e bottom:8 — sua altura é menor que totalTravel.
      // Dividindo por trackHeight, linha e bolinha ficam perfeitamente em sincronia.
      const trackHeight = track.offsetHeight

      allSteps.forEach((stepEl, i) => {
        const prevPos = i === 0 ? dotPositions[0] : dotPositions[i - 1]
        const currPos = dotPositions[i]

        // correção: scaleY normalizado por trackHeight, não por totalTravel
        const prevScale = total > 1 ? prevPos / trackHeight : 0
        const currScale = total > 1 ? currPos / trackHeight : 1

        ScrollTrigger.create({
          trigger: stepEl,
          start: 'top 65%',
          end: 'center 50%',
          scrub: 1.5,
          onUpdate(self) {
            const p = self.progress
            // linha cresce proporcionalmente à altura real do trilho
            const newScaleY = prevScale + (currScale - prevScale) * p
            // bolinha move em px — mesma escala dos dotPositions (relativo ao topo do trilho)
            const newDotY = prevPos + (currPos - prevPos) * p

            if (lineFillRef.current) gsap.set(lineFillRef.current, { scaleY: newScaleY })
            if (glowDotRef.current) gsap.set(glowDotRef.current, { y: newDotY })
          },
        })
      })
    })

    // O layout da página muda depois do mount (imagens lazy, fontes, hidratação),
    // deixando as posições dos ScrollTriggers desatualizadas — os cards ficavam
    // presos em opacity:0. Refaz o refresh quando a altura do documento mudar.
    let refreshTimer: ReturnType<typeof setTimeout>
    const bodyObserver = new ResizeObserver(() => {
      clearTimeout(refreshTimer)
      refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 200)
    })
    bodyObserver.observe(document.body)

    const onLoad = () => ScrollTrigger.refresh()
    if (document.readyState !== 'complete') {
      window.addEventListener('load', onLoad, { once: true })
    }

    return () => {
      clearTimeout(refreshTimer)
      bodyObserver.disconnect()
      window.removeEventListener('load', onLoad)
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
    <section id="processo" className="relative py-24 px-6 bg-[#001a2e] overflow-hidden">



      <div className="relative z-10 max-w-5xl mx-auto" ref={containerRef}>

        {/* correção: título escrito diretamente em JSX, sem depender de
            SectionTitle ou copy externo que podem estar retornando vazio */}
        <div className="text-center mb-20">
          <p
            className="inline-block font-mono text-[11px] tracking-[3px] uppercase mb-5 px-3 py-1"
            style={{ background: '#00e5ff', color: '#001a2e', fontWeight: 900 }}
          >
            Como funciona
          </p>
          <h2
            className="font-sora font-extrabold text-white"
            style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 1.1 }}
          >
            {copy.processo.titulo ?? 'Nosso processo'}
          </h2>
        </div>

        <div className="relative">

          {/* Trilho */}
          <div
            className="hidden md:block absolute left-1/2 -translate-x-1/2 pointer-events-none"
            ref={lineTrackRef}
            style={{ top: 8, bottom: 8, width: 1, zIndex: 5 }}
          >
            <div className="absolute inset-0" style={{ background: 'rgba(0,229,255,0.08)' }} />
            <div
              ref={lineFillRef}
              className="absolute inset-0 origin-top"
              style={{
                background: 'linear-gradient(to bottom, #00e5ff 0%, rgba(0,107,255,0.5) 100%)',
                boxShadow: '0 0 10px 1px rgba(0,229,255,0.5)',
              }}
            />
            {/* correção: glowDot posicionado com top:0 relativo ao trilho.
                O useEffect define y=dotPositions[0] após o refresh, alinhando
                a bolinha exatamente ao centro do primeiro dot. */}
            <div
              ref={glowDotRef}
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%) translateY(-50%)',
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: '#00e5ff',
                boxShadow: '0 0 20px 6px rgba(0,229,255,0.8)',
                zIndex: 30,
              }}
            />
          </div>

          <div ref={stepsWrapRef} className="space-y-16 md:space-y-20">
            {copy.processo.etapas.map((etapa, i) => {
              const isEven = i % 2 === 0
              return (
                <div
                  key={i}
                  ref={el => { stepRefs.current[i] = el }}
                  className="relative flex items-center"
                >
                  <div className="hidden md:flex w-[calc(50%-28px)] justify-end pr-10">
                    {!isEven && <StepCard etapa={etapa} side="right" />}
                  </div>

                  <div className="hidden md:flex flex-shrink-0 items-center justify-center" style={{ width: 56 }}>
                    <div
                      ref={el => { dotDesktopRefs.current[i] = el }}
                      className="relative flex items-center justify-center"
                      style={{ width: 20, height: 20 }}
                    >
                      <span className="absolute animate-ping rounded-full"
                        style={{ width: 28, height: 28, background: 'rgba(0,229,255,0.25)' }} />
                      <span className="relative z-10 rounded-full"
                        style={{ width: 16, height: 16, background: '#001a2e', border: '2.5px solid #00e5ff', boxShadow: '0 0 14px rgba(0,229,255,0.8)' }} />
                    </div>
                  </div>

                  <div className="hidden md:flex w-[calc(50%-28px)] justify-start pl-10">
                    {isEven && <StepCard etapa={etapa} side="left" />}
                  </div>

                  {/* Mobile */}
                  <div className="flex md:hidden w-full gap-5 items-start">
                    <div className="flex flex-col items-center flex-shrink-0 pt-1" style={{ width: 20 }}>
                      <div
                        ref={el => { dotMobileRefs.current[i] = el }}
                        className="relative z-10 rounded-full flex-shrink-0"
                        style={{ width: 16, height: 16, background: '#001a2e', border: '2.5px solid #00e5ff', boxShadow: '0 0 10px rgba(0,229,255,0.7)' }}
                      />
                      {i < copy.processo.etapas.length - 1 && (
                        <div className="flex-1 mt-2" style={{ width: 1, minHeight: 60, background: 'rgba(0,229,255,0.2)' }} />
                      )}
                    </div>
                    <StepCard etapa={etapa} side="left" className="flex-1" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

interface StepCardProps {
  etapa: { num: string; titulo: string; texto: string; prazo?: string }
  side: 'left' | 'right'
  className?: string
}

function StepCard({ etapa, side, className = '' }: StepCardProps) {
  const isRight = side === 'right'
  return (
    <div
      className={`relative overflow-hidden rounded-xl p-7 w-full max-w-md ${className}`}
      style={{
        background: 'rgba(10, 37, 64, 0.88)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,229,255,0.12)', boxShadow: '0 8px 40px -8px rgba(0,0,0,0.6)',
        textAlign: isRight ? 'right' : 'left',
      }}
    >
      <span className="absolute font-black text-[#00e5ff] select-none pointer-events-none leading-none"
        style={{
          fontSize: 'clamp(5rem,12vw,8rem)', opacity: 0.04, top: '-0.15em',
          right: isRight ? 'unset' : '-0.05em', left: isRight ? '-0.05em' : 'unset'
        }}
        aria-hidden="true">{etapa.num}</span>
      <div className={`flex items-center gap-3 mb-2 ${isRight ? 'flex-row-reverse' : ''}`}>
        <span className="font-sora font-bold text-base block" style={{ color: '#00e5ff' }}>{etapa.num}</span>
        {etapa.prazo && (
          <span
            className="font-mono text-[10px] tracking-[2px] uppercase px-2 py-0.5 rounded-full"
            style={{ color: 'rgba(0,229,255,0.8)', border: '1px solid rgba(0,229,255,0.25)', background: 'rgba(0,229,255,0.06)' }}
          >
            {etapa.prazo}
          </span>
        )}
      </div>
      <h3 className="font-sora font-bold text-2xl text-white mb-3 leading-tight">{etapa.titulo}</h3>
      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.58)' }}>{etapa.texto}</p>
      <div className="absolute bottom-0 left-0 right-0" style={{
        height: 2,
        background: isRight
          ? 'linear-gradient(to left, transparent, rgba(0,229,255,0.4), transparent)'
          : 'linear-gradient(to right, transparent, rgba(0,229,255,0.4), transparent)'
      }} />
    </div>
  )
}