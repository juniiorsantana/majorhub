'use client'
import { useEffect, useRef } from 'react'

interface BrilhoButtonProps {
  href: string
  label: string
  icon?: string
  target?: '_blank' | '_self'
  onClick?: () => void
}

export function BrilhoButton({
  href,
  label,
  icon = '→',
  target = '_blank',
  onClick,
}: BrilhoButtonProps) {
  const brilho1Ref = useRef<HTMLDivElement>(null)
  const btnRef     = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const brilho1 = brilho1Ref.current
    const btn     = btnRef.current
    if (!brilho1 || !btn) return

    let timeoutId: ReturnType<typeof setTimeout>

    const handleMouseMove = (event: MouseEvent) => {
      clearTimeout(timeoutId)
      btn.classList.add('hovering')

      const brilho1Rect    = brilho1.getBoundingClientRect()
      const mouseX         = event.clientX - brilho1Rect.left
      const mousePercentage = Math.min(Math.max(mouseX / brilho1Rect.width, 0), 1)

      brilho1.style.setProperty('--before-opacity', mousePercentage.toFixed(2))
      brilho1.style.setProperty('--after-opacity',  (1 - mousePercentage).toFixed(2))

      const btnRect      = btn.getBoundingClientRect()
      const relativeX    = event.clientX - btnRect.left
      const translateX   = ((relativeX / btnRect.width) * 100) - 100
      btn.style.setProperty('--button-translate-x', `${translateX}%`)
    }

    const handleMouseLeave = () => {
      btn.classList.remove('hovering')
      timeoutId = setTimeout(() => {
        brilho1.style.setProperty('--before-opacity', '1')
        brilho1.style.setProperty('--after-opacity',  '0')
        btn.style.setProperty('--button-translate-x', '-10%')
      }, 500)
    }

    btn.addEventListener('mousemove', handleMouseMove)
    btn.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      btn.removeEventListener('mousemove', handleMouseMove)
      btn.removeEventListener('mouseleave', handleMouseLeave)
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <div ref={brilho1Ref} className="brilho1 mx-auto md:mx-0">
      <div className="brilho2">
        <a
          ref={btnRef}
          href={href}
          target={target}
          rel="noopener noreferrer"
          className="elementor-button"
          onClick={onClick}
        >
          <span className="elementor-button-icon">{icon}</span>
          <span className="elementor-button-text">{label}</span>
        </a>
      </div>
    </div>
  )
}
