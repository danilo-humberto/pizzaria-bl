import { Leaf, ShoppingBasket, Sparkles, Timer } from 'lucide-react'
import acaiSplashImage from '../../assets/images/acai-splash.png'
import fruitBananaImage from '../../assets/images/fruit-banana.png'
import fruitBlueberryImage from '../../assets/images/fruit-blueberry.png'
import fruitKiwiImage from '../../assets/images/fruit-kiwi.png'
import fruitStrawberryImage from '../../assets/images/fruit-strawberry.png'
import heroBowlImage from '../../assets/images/hero-bowl.png'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Container } from '../layout/Container'

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="bg-(--surface-dark) pb-10 pt-5 md:pb-14 md:pt-6"
    >
      <Container>
        <div className="hero-glow relative overflow-hidden rounded-[1.6rem] p-5 text-(--text-primary) panel-shadow sm:rounded-4xl sm:p-8 lg:p-10">
          <div className="relative z-10 grid items-center gap-7 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8">
            <div className="max-w-xl">
              <div data-hero-item>
                <Badge icon={<Sparkles size={17} />} className="mb-5">
                  Feito com açaí premium
                </Badge>
              </div>

              <h1
                data-hero-item
                className="font-display text-[clamp(2.75rem,12vw,4.5rem)] font-extrabold leading-[0.95] text-(--surface-dark) lg:text-7xl"
              >
                Monte seu açaí do seu{" "}
                <span className="text-(--brand-primary)">jeito.</span>
              </h1>

              <p
                data-hero-item
                className="mt-5 max-w-md text-base leading-7 text-(--text-secondary) sm:mt-6 sm:text-lg sm:leading-8"
              >
                Escolha o tamanho, frutas, adicionais e caldas. Depois finalize
                tudo pelo site e acompanhe seu pedido.
              </p>

              <div
                data-hero-item
                className="mt-7 flex flex-col gap-3 sm:flex-row"
              >
                <div className="hero-mobile-cta relative isolate w-full sm:contents">
                  <Button
                    href="#monte"
                    size="lg"
                    variant="plum"
                    className="w-full sm:w-auto"
                    icon={<ShoppingBasket size={19} />}
                  >
                    Montar meu açaí
                  </Button>
                </div>
              </div>
            </div>

            <div data-hero-item className="relative">
              <div className="relative mx-auto min-h-[20rem] max-w-2xl sm:min-h-[25rem] lg:min-h-[30rem]">
                <div
                  className="absolute inset-x-[12%] bottom-[10%] h-20 rounded-full bg-[var(--shadow-color)] blur-2xl"
                  aria-hidden="true"
                />

                <img
                  src={acaiSplashImage}
                  alt=""
                  className="absolute bottom-[6%] left-[12%] z-0 w-[76%] opacity-[0.45]"
                  aria-hidden="true"
                />

                <div
                  className="absolute inset-0 z-10 flex items-center justify-center pb-5"
                  data-hero-bowl
                >
                  <img
                    src={heroBowlImage}
                    alt="Pote de açaí com banana, morango, granola e calda cremosa"
                    className="w-[min(88%,34rem)] object-contain drop-shadow-[0_26px_34px_var(--shadow-color)]"
                  />
                </div>

                <span
                  className="fruit-float hero-fruit-strawberry hidden sm:block"
                  data-float
                  data-float-x="10"
                  data-float-y="-18"
                  data-float-rotate="5"
                  data-float-duration="3.1"
                  aria-hidden="true"
                >
                  <img
                    src={fruitStrawberryImage}
                    alt=""
                    className="-rotate-12"
                  />
                </span>

                <span
                  className="fruit-float hero-fruit-kiwi hidden sm:block"
                  data-float
                  data-float-x="-8"
                  data-float-y="14"
                  data-float-rotate="-5"
                  data-float-duration="3.35"
                  data-float-delay="0.08"
                  aria-hidden="true"
                >
                  <img src={fruitKiwiImage} alt="" className="rotate-10" />
                </span>

                <span
                  className="fruit-float hero-fruit-blueberry hidden md:block"
                  data-float
                  data-float-x="9"
                  data-float-y="-12"
                  data-float-rotate="7"
                  data-float-duration="2.95"
                  data-float-delay="0.16"
                  aria-hidden="true"
                >
                  <img
                    src={fruitBlueberryImage}
                    alt=""
                    className="-rotate-6"
                  />
                </span>

                <span
                  className="fruit-float hero-fruit-banana hidden md:block"
                  data-float
                  data-float-x="-7"
                  data-float-y="13"
                  data-float-rotate="-6"
                  data-float-duration="3.45"
                  data-float-delay="0.24"
                  aria-hidden="true"
                >
                  <img src={fruitBananaImage} alt="" className="rotate-12" />
                </span>

                <span
                  className="fruit-float hero-fruit-blueberry-top hidden md:block"
                  data-float
                  data-float-x="-10"
                  data-float-y="-18"
                  data-float-rotate="-8"
                  data-float-duration="2.9"
                  data-float-delay="0.12"
                  aria-hidden="true"
                >
                  <img
                    src={fruitBlueberryImage}
                    alt=""
                    className="rotate-12"
                  />
                </span>

                <span
                  className="fruit-float hero-fruit-strawberry-right hidden lg:block"
                  data-float
                  data-float-x="-12"
                  data-float-y="16"
                  data-float-rotate="7"
                  data-float-duration="3.6"
                  data-float-delay="0.2"
                  aria-hidden="true"
                >
                  <img
                    src={fruitStrawberryImage}
                    alt=""
                    className="rotate-[18deg]"
                  />
                </span>

                <span
                  className="fruit-float hero-fruit-kiwi-left hidden lg:block"
                  data-float
                  data-float-x="11"
                  data-float-y="-15"
                  data-float-rotate="-6"
                  data-float-duration="3.4"
                  data-float-delay="0.28"
                  aria-hidden="true"
                >
                  <img src={fruitKiwiImage} alt="" className="-rotate-12" />
                </span>

                <span
                  className="fruit-float hero-fruit-banana-top hidden lg:block"
                  data-float
                  data-float-x="8"
                  data-float-y="14"
                  data-float-rotate="9"
                  data-float-duration="3.15"
                  data-float-delay="0.36"
                  aria-hidden="true"
                >
                  <img
                    src={fruitBananaImage}
                    alt=""
                    className="-rotate-[22deg]"
                  />
                </span>
              </div>

              <div className="relative z-20 mt-3 grid gap-3 sm:grid-cols-3 lg:mt-0">
                <Badge
                  tone="leaf"
                  icon={<Leaf size={17} />}
                  className="justify-center text-center shadow-[0_12px_28px_var(--shadow-color-soft)]"
                >
                  Ingredientes selecionados
                </Badge>
                <Badge
                  tone="plum"
                  icon={<Sparkles size={17} />}
                  className="justify-center text-center shadow-[0_12px_28px_var(--shadow-color-soft)]"
                >
                  Tudo fresquinho
                </Badge>
                <Badge
                  tone="light"
                  icon={<Timer size={17} />}
                  className="justify-center text-center shadow-[0_12px_28px_var(--shadow-color-soft)]"
                >
                  Preparo na hora
                </Badge>
              </div>
            </div>
          </div>

          <a
            href="#monte"
            data-hero-item
            className="absolute bottom-5 right-5 hidden rounded-full bg-(--brand-primary) p-3 text-(--text-on-dark) shadow-[var(--shadow-small)] transition hover:bg-(--brand-primary-hover) md:grid"
            aria-label="Ir para montagem do pedido"
          >
            <ShoppingBasket size={22} />
          </a>
        </div>
      </Container>
    </section>
  )
}
