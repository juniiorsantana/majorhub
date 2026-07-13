'use client'
import { motion } from 'framer-motion'

type Direction = 'up' | 'left' | 'right'

interface RevealWrapperProps {
  children: React.ReactNode
  direction?: Direction
  delay?: number
  className?: string
}

const variants = {
  up:    { hidden: { opacity: 0, y: 30 },    visible: { opacity: 1, y: 0 } },
  left:  { hidden: { opacity: 0, x: -24 },   visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 24 },    visible: { opacity: 1, x: 0 } },
}

export function RevealWrapper({
  children,
  direction = 'up',
  delay = 0,
  className,
}: RevealWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={variants[direction]}
      transition={{ duration: 0.8, delay, ease: [0.4, 0, 0.2, 1] as const }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
