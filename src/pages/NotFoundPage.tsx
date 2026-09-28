import { ArrowLeft, Home, SearchX } from 'lucide-react'
import heroBowlImage from '../assets/images/hero-bowl.png'
import { Container } from '../components/layout/Container'
import { LogoMark } from '../components/layout/LogoMark'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <main className="min-h-dvh bg-[var(--plum-950)] px-0 py-5 text-[var(--cream-50)] sm:py-6">
      <Container className="flex min-h-[calc(100dvh-2.5rem)] flex-col">
        <header className="flex items-center justify-between">
          <LogoMark href="/" />
          <Button href="/" variant="ghost" size="sm" icon={<Home size={16} />}>
            Início
          </Button>
        </header>

        <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-14">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[oklch(98%_0.01_326_/_10%)] px-4 py-2 text-sm font-extrabold text-[var(--cream-100)]">
              <SearchX size={17} />
              Página não encontrada
            </div>

            <p className="font-display text-7xl font-extrabold leading-none text-[var(--leaf-500)] sm:text-8xl">
              404
            </p>
            <h1 className="mt-4 max-w-xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              Essa página não está no cardápio.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-[oklch(90%_0.025_326)] sm:text-lg">
              O link pode ter mudado ou o endereço foi digitado com algum detalhe fora do ponto.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button href="/" variant="leaf" size="lg" icon={<ArrowLeft size={18} />}>
                Voltar para a página inicial
              </Button>
              <Button href="/#monte" variant="ghost" size="lg">
                Montar pedido
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute inset-x-[18%] bottom-[8%] h-20 rounded-full bg-[oklch(12%_0.04_326_/_40%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,oklch(99%_0.012_326),oklch(92%_0.026_326))] p-8 shadow-[0_26px_70px_oklch(8%_0.04_326_/_34%)]">
              <img
                src={heroBowlImage}
                alt="Pote de açaí com frutas e granola"
                className="mx-auto w-[min(88%,28rem)] object-contain drop-shadow-[0_22px_30px_oklch(18%_0.06_326_/_20%)]"
              />
              <div className="mt-4 rounded-2xl bg-[var(--cream-50)] px-4 py-3 text-center text-sm font-extrabold text-[var(--plum-900)]">
                A rota acabou, mas o açaí continua por aqui.
              </div>
            </div>
          </div>
        </section>
      </Container>
    </main>
  )
}
