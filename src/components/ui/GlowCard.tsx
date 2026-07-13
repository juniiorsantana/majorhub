'use client'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface GlowCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  layoutId?: string
}

export function GlowCard({ children, className, onClick, layoutId }: GlowCardProps) {
  return (
    <motion.div
      layoutId={layoutId}
      onClick={onClick}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ y: -3, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={clsx(
        'glassmorphism p-8 cursor-pointer',
        'hover:border-[rgba(0,229,255,0.5)]',
        'hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.7),0_20px_60px_-12px_rgba(0,0,0,0.5),0_0_50px_-10px_rgba(0,229,255,0.5)]',
        'transition-[border-color,box-shadow] duration-300',
        className
      )}
    >
      {children}
    </motion.div>
  )
}
