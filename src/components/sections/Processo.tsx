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
  const stepsWrapRef = useRef<HTMLOListElement>(null)
  const stepRefs = useRef<(HTMLLIElement | null)[]>([])
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const dotRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const container = containerRef.current
    const wrap = stepsWrapRef.current
    const track = lineTrackRef.current
    const fill = lineFillRef.current
    const glow = glowDotRef.current
    if (!container || !wrap || !track || !fill || !glow) return

    const steps = stepRefs.current.filter(Boolean) as HTMLLIElement[]
    const dots = dotRefs.current.filter(Boolean) as HTMLDivElement[]
    if (!steps.length || !dots.length) return

    const media = gsap.matchMedia()
    media.add({
      desktop: '(min-width: 768px)',
      mobile: '(max-width: 767px)',
      reducedMotion: '(prefers-reduced-motion: reduce)',
    }, context => {
      const { desktop, reducedMotion } = context.conditions!

      // Measure stable dot containers, outside the animated card content.
      const measureTrack = () => {
        const wrapTop = wrap.getBoundingClientRect().top
        const firstDot = dots[0].getBoundingClientRect()
        const lastDot = dots[dots.length - 1].getBoundingClientRect()
        const firstCenter = firstDot.top - wrapTop + firstDot.height / 2
        const lastCenter = lastDot.top - wrapTop + lastDot.height / 2
        gsap.set(track, {
          top: firstCenter,
          bottom: 'auto',
          height: Math.max(0, lastCenter - firstCenter),
        })
      }
      measureTrack()
      ScrollTrigger.addEventListener('refreshInit', measureTrack)

      if (!reducedMotion) {
        steps.forEach((step, index) => {
          const card = cardRefs.current[index]
          const dot = dots[index]?.firstElementChild
          if (card) {
            gsap.from(card, {
              opacity: 0,
              x: desktop ? (index % 2 === 0 ? 50 : -50) : 0,
              y: desktop ? 0 : 20,
              ease: 'power3.out',
              duration: 0.65,
              scrollTrigger: {
                trigger: step,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            })
          }
          if (dot) {
            gsap.from(dot, {
              scale: 0,
              opacity: 0,
              ease: 'back.out(2.5)',
              duration: 0.45,
              scrollTrigger: {
                trigger: step,
                start: 'top 83%',
                toggleActions: 'play none none reverse',
              },
            })
          }
        })
        gsap.timeline({
          scrollTrigger: {
            trigger: steps[0],
            start: 'center 65%',
            endTrigger: steps[steps.length - 1],
            end: 'center 50%',
            scrub: 1.5,
            invalidateOnRefresh: true,
          },
        })
          .fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: 'none' }, 0)
          .fromTo(glow, { y: 0 }, { y: () => track.offsetHeight, ease: 'none' }, 0)
      }

      // Fonts, images and viewport changes can move the section after mount.
      let refreshTimer: ReturnType<typeof setTimeout> | undefined
      const scheduleRefresh = () => {
        clearTimeout(refreshTimer)
        refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 180)
      }
      const resizeObserver = new ResizeObserver(scheduleRefresh)
      resizeObserver.observe(document.body)
      resizeObserver.observe(wrap)
      window.addEventListener('load', scheduleRefresh)

      return () => {
        clearTimeout(refreshTimer)
        resizeObserver.disconnect()
        window.removeEventListener('load', scheduleRefresh)
        ScrollTrigger.removeEventListener('refreshInit', measureTrack)
      }
    }, container)

    return () => media.revert()
  }, [])

  return (
    <section id="processo" aria-labelledby="processo-title" className="relative py-16 md:py-20 px-6 bg-[#001a2e] overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto" ref={containerRef}>
        <div className="text-center mb-12">
          <p
            className="inline-block font-mono text-[11px] tracking-[3px] uppercase mb-5 px-3 py-1"
            style={{ background: '#00e5ff', color: '#001a2e', fontWeight: 900 }}
          >
            Como funciona
          </p>
          <h2
            id="processo-title"
            className="font-sora font-extrabold text-white"
            style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 1.1 }}
          >
            {copy.processo.titulo ?? 'Nosso processo'}
          </h2>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute left-2.5 md:left-1/2 -translate-x-1/2 pointer-events-none"
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
            <div
              ref={glowDotRef}
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 motion-reduce:hidden"
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: '#00e5ff',
                boxShadow: '0 0 20px 6px rgba(0,229,255,0.8)',
                zIndex: 30,
              }}
            />
          </div>

          <ol ref={stepsWrapRef} role="list" className="relative space-y-8 md:space-y-10">
            {copy.processo.etapas.map((etapa, index) => {
              const isEven = index % 2 === 0
              return (
                <li
                  key={etapa.num}
                  ref={element => { stepRefs.current[index] = element }}
                  className="relative grid grid-cols-[20px_minmax(0,1fr)] gap-x-4 items-center md:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] md:gap-x-0"
                >
                  <div
                    ref={element => { dotRefs.current[index] = element }}
                    aria-hidden="true"
                    className="relative col-start-1 row-start-1 mt-7 self-start justify-self-center flex h-5 w-5 items-center justify-center md:col-start-2 md:mt-0 md:self-center"
                  >
                    <div className="relative flex h-5 w-5 items-center justify-center">
                      <span
                        className="absolute motion-safe:animate-ping rounded-full"
                        style={{ width: 28, height: 28, background: 'rgba(0,229,255,0.25)' }}
                      />
                      <span
                        className="relative z-10 rounded-full"
                        style={{ width: 16, height: 16, background: '#001a2e', border: '2.5px solid #00e5ff', boxShadow: '0 0 14px rgba(0,229,255,0.8)' }}
                      />
                    </div>
                  </div>
                  <div
                    ref={element => { cardRefs.current[index] = element }}
                    className={`col-start-2 row-start-1 min-w-0 ${isEven ? 'md:col-start-3 md:pl-10' : 'md:col-start-1 md:pr-10'}`}
                  >
                    <StepCard etapa={etapa} side={isEven ? 'left' : 'right'} />
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}

interface StepCardProps {
  etapa: { num: string; titulo: string; texto: string; prazo?: string }
  side: 'left' | 'right'
}

function StepCard({ etapa, side }: StepCardProps) {
  const isRight = side === 'right'
  return (
    <div
      className={`relative overflow-hidden rounded-xl p-5 sm:p-7 w-full text-left ${isRight ? 'md:text-right' : ''}`}
      style={{
        background: 'rgba(10, 37, 64, 0.88)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,229,255,0.12)',
        boxShadow: '0 8px 40px -8px rgba(0,0,0,0.6)',
      }}
    >
      <span
        className={`absolute font-black text-[#00e5ff] select-none pointer-events-none leading-none right-[-0.05em] ${isRight ? 'md:right-auto md:left-[-0.05em]' : ''}`}
        style={{ fontSize: 'clamp(5rem,12vw,8rem)', opacity: 0.04, top: '-0.15em' }}
        aria-hidden="true"
      >
        {etapa.num}
      </span>
      <div className={`flex flex-wrap items-center gap-3 mb-2 ${isRight ? 'md:flex-row-reverse' : ''}`}>
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
      <h3 className="font-sora font-bold text-xl sm:text-2xl text-white mb-3 leading-tight">{etapa.titulo}</h3>
      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.58)' }}>{etapa.texto}</p>
      <div className="absolute bottom-0 left-0 right-0" style={{
        height: 2,
        background: 'linear-gradient(to right, transparent, rgba(0,229,255,0.4), transparent)',
      }} />
    </div>
  )
}
