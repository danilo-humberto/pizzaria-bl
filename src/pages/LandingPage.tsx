import { useRef } from 'react'
import { Footer } from '../components/layout/Footer'
import { Header } from '../components/layout/Header'
import { BuilderSection } from '../components/landing/BuilderSection'
import { ContactSection } from '../components/landing/ContactSection'
import { HeroSection } from '../components/landing/HeroSection'
import { useGsapReveal } from '../hooks/useGsapReveal'
import { usePizzaOrderBuilder } from '../hooks/usePizzaOrderBuilder'

export function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const builder = usePizzaOrderBuilder()

  useGsapReveal(pageRef)

  return (
    <div ref={pageRef} className="pizzaria-theme min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <BuilderSection builder={builder} />
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}
