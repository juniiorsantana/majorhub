import { Navbar }        from '@/components/ui/Navbar'
import { Hero }          from '@/components/sections/Hero'
import { GrowthEngine }  from '@/components/sections/GrowthEngine'
import { DorSection }    from '@/components/sections/DorSection'
import { Servicos }      from '@/components/sections/Servicos'
import { Portfolio }     from '@/components/sections/Portfolio'
import { Diferencial }   from '@/components/sections/Diferencial'
import { Processo }      from '@/components/sections/Processo'
import { CtaFinal }      from '@/components/sections/CtaFinal'
import { Footer }        from '@/components/sections/Footer'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <DorSection />
      <GrowthEngine />
      <Servicos />
      <Portfolio />
      <Diferencial />
      <Processo />
      <CtaFinal />
      <Footer />
    </main>
  )
}
