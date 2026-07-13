'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(SplitText, ScrollTrigger)

export function useTextReveal(type: 'chars' | 'words' | 'lines' = 'chars') {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const split = new SplitText(el, { type })

    const targets = type === 'chars' ? split.chars
                  : type === 'words' ? split.words
                  : split.lines

    gsap.from(targets, {
      opacity: 0,
      y: 40,
      rotateX: -90,
      stagger: 0.03,
      duration: 0.6,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
      },
    })

    return () => {
      split.revert()
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [type])

  return ref
}
