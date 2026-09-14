'use client'
import { motion, useReducedMotion, Variants } from 'framer-motion'
import React from 'react'

interface SectionTitleProps {
  children: React.ReactNode
  className?: string
  type?: 'chars' | 'words' | 'lines'
}

export function SectionTitle({ children, className, type = 'chars' }: SectionTitleProps) {
  const reducedMotion = useReducedMotion()
  // Extract text if it's a simple ReactNode array or string
  const textContent = Array.isArray(children) 
    ? children.join('') 
    : typeof children === 'string' ? children : null

  // If it's not a plain string, fallback to a simple fade up
  if (!textContent || reducedMotion || type === 'lines') {
    return (
      <motion.h2
        initial={reducedMotion ? false : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className={className}
      >
        {children}
      </motion.h2>
    )
  }

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: type === 'chars' ? 0.02 : 0.08, 
        delayChildren: 0.1 
      },
    },
  }

  const child: Variants = {
    hidden: { opacity: 0, y: 40, rotateX: -60 },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0, 
      transition: { type: 'spring', damping: 14, stiffness: 100 } 
    },
  }

  // Mantém cada palavra inteira nas quebras, mesmo quando suas letras são animadas.
  const elements = textContent.split(/(\s+)/)

  return (
    <motion.h2
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10%' }}
      className={className}
      style={{ perspective: 1000 }}
      aria-label={textContent}
    >
      <span aria-hidden="true">
        {elements.map((word, index) => {
          if (/^\s+$/.test(word)) return word
          if (type === 'words') {
            return <motion.span key={index} variants={child} className="inline-block">{word}</motion.span>
          }
          return (
            <span key={index} className="inline-block whitespace-nowrap">
              {Array.from(word).map((letter, letterIndex) => (
                <motion.span key={letterIndex} variants={child} className="inline-block">{letter}</motion.span>
              ))}
            </span>
          )
        })}
      </span>
    </motion.h2>
  )
}
