'use client'
import { useEffect, useRef } from 'react'
import { motion, type Variants } from 'framer-motion'

import { ContainerTextFlip } from '@/components/ui/container-text-flip'
import { BrilhoButton } from '@/components/ui/BrilhoButton'
import { WHATSAPP_URL } from '@/lib/analytics'
import { cn } from '../../lib/utils'

const flipWords = ["vende.", "converte.", "cresce."]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const line: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] as const } },
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
 
  useEffect(() => {
    const video = videoRef.current
    const section = sectionRef.current
    if (!video || !section) return

    let frameId: number
    let ticking = false

    const updateVideo = () => {
      const rect = section.getBoundingClientRect()
      // -rect.top = pixels scrolled past the section top
      // Use rect.height as the range so it covers the full section scroll distance
      const scrolled = -rect.top
      const scrollProgress = Math.max(0, Math.min(1, scrolled / rect.height))

      if (video.duration) {
        const speed = 2
        const progress = Math.min(scrollProgress * speed, 1)
        video.currentTime = progress * (video.duration - 0.1)
      }

      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        frameId = requestAnimationFrame(updateVideo)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <div className="relative w-full bg-[#030712]">
      <section 
        ref={sectionRef}
        className="relative h-screen min-h-screen flex items-center justify-center overflow-hidden isolation-isolate bg-[#030712]"
      >
        <video
          ref={videoRef}
          src="/hero-bg-optimized.mp4"
          className="absolute top-0 left-0 w-full h-full object-cover z-[0]"
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className="absolute inset-0 bg-black/30 z-[1]"></div>
        {/* Fade inferior — assenta a borda do vídeo antes da próxima seção */}
        <div className="absolute bottom-0 left-0 right-0 h-32 z-[1] bg-gradient-to-b from-transparent to-[#030712]"></div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col items-center justify-center h-full py-20 pt-28 lg:pt-24 text-center">
          
          <div className="flex flex-col items-center gap-10 max-w-[900px]">
            <motion.h1
              variants={container}
              initial="hidden"
              animate="visible"
              className="font-sora text-[clamp(32px,5.5vw,76px)] font-bold leading-[1.05] tracking-tight text-[#e0e7ff]"
            >
              <motion.span variants={line} className="block">
                Sua empresa merece
              </motion.span>
              <motion.span variants={line} className="block mt-2">
                uma marca que
              </motion.span>
              <motion.span variants={line} className="mt-2 flex justify-center">
                {/* Leitores de tela recebem a frase completa; o flip animado é decorativo */}
                <span className="sr-only">vende.</span>
                <span aria-hidden="true" className="flex justify-center">
                  <ContainerTextFlip
                    words={flipWords}
                    className="mt-2 md:mt-4"
                    textClassName={cn(
                      'font-bold text-[#00e5ff]',
                      'drop-shadow-[0_0_25px_rgba(0,229,255,0.7)]'
                    )}
                  />
                </span>
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="max-w-[600px] mx-auto text-[#bae6fd]"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(16px, 1.8vw, 20px)',
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              A MajorHub estrutura o comercial, constrói o site e lapida a
              identidade visual de empresas que querem crescer no digital com seriedade.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.4, 0, 0.2, 1] }}
              className="flex justify-center mt-4"
            >
              <BrilhoButton
                href={WHATSAPP_URL}
                label="Quero estruturar meu negócio"
                target="_blank"
              />
            </motion.div>
          </div>

        </div>

        {/* Indicador de scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none"
          aria-hidden="true"
        >
          <span className="text-[10px] font-mono uppercase tracking-[3px] text-[#7dd3fc]/60">Role para ver</span>
          <motion.svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M6 9l6 6 6-6" />
          </motion.svg>
        </motion.div>
      </section>
    </div>
  )
}
