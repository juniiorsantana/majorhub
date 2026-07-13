'use client'
import { motion } from 'framer-motion'
import { copy } from '@/content/copy'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { RevealWrapper } from '@/components/ui/RevealWrapper'
import { clsx } from 'clsx'

function LightCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ y: -3, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={clsx(
        'p-8 rounded-2xl cursor-pointer',
        'bg-white border border-[#e2e8f0]',
        'hover:border-[rgba(8,145,178,0.45)]',
        'shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)]',
        'hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.14),0_0_40px_-12px_rgba(8,145,178,0.25)]',
        'transition-[border-color,box-shadow] duration-300',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export function Diferencial() {
  return (
    <section id="diferencial" className="relative py-24 px-6 overflow-hidden bg-[#f8fafc]">

      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(8,145,178,0.10) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">

        <div className="max-w-3xl mx-auto text-center mb-16 space-y-6">
          <SectionTitle
            type="chars"
            className="font-sora font-extrabold text-[clamp(32px,5vw,56px)] text-[#0a1628]"
          >
            {copy.diferencial.titulo}
          </SectionTitle>
          <RevealWrapper delay={0.3}>
            <p className="text-[#475569] text-lg leading-relaxed">
              {copy.diferencial.texto}
            </p>
          </RevealWrapper>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {copy.diferencial.items.map((item, i) => (
            <RevealWrapper key={i} delay={i * 0.1} direction="left">
              <LightCard className="h-full">
                <h3 className="font-sora font-bold text-xl text-[#0891b2] mb-3">
                  {item.titulo}
                </h3>
                <p className="text-[#475569] leading-relaxed">
                  {item.texto}
                </p>
              </LightCard>
            </RevealWrapper>
          ))}
        </div>

      </div>
    </section>
  )
}
