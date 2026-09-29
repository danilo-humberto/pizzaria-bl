import { MessageCircle } from "lucide-react";
import pizzaHeroImage from "../../assets/images/pizza-hero-pair.png";
import { storeConfig } from "../../data/storeConfig";
import { Button } from "../ui/Button";
import { Container } from "../layout/Container";

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="bg-(--surface-dark) pb-10 pt-5 md:pb-14 md:pt-6"
    >
      <Container>
        <div className="hero-glow relative overflow-hidden rounded-[1.6rem] p-5 text-(--text-primary) panel-shadow sm:rounded-4xl sm:p-8 lg:p-10">
          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
            <div className="max-w-xl">
              <h1 data-hero-item className="font-display text-[clamp(2.75rem,12vw,4.5rem)] font-extrabold leading-[0.95] text-(--surface-dark) lg:text-7xl">
                Pizza boa, feita para compartilhar.
              </h1>

              <p data-hero-item className="mt-5 max-w-md text-base leading-7 text-(--text-secondary) sm:mt-6 sm:text-lg sm:leading-8">
                Pizzas cheias de sabor, com queijo derretido e ingredientes
                deliciosos em cada fatia.
              </p>

              <div data-hero-item className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button
                  href={storeConfig.contact.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  size="lg"
                  variant="plum"
                  className="w-full sm:w-auto"
                  icon={<MessageCircle size={19} />}
                >
                  Falar no WhatsApp
                </Button>
                <a
                  href="#contato"
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl px-5 py-3 font-extrabold text-(--text-primary) transition hover:bg-(--surface-muted) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
                >
                  Ver contato e horários
                </a>
              </div>

            </div>

            <figure data-hero-bowl className="min-w-0">
              <img
                src={pizzaHeroImage}
                alt="Duas pizzas de pepperoni, queijo derretido e manjericão"
                width={1536}
                height={1024}
                fetchPriority="high"
                className="pizza-hero-artwork mx-auto block w-full object-contain"
              />
            </figure>
          </div>
        </div>
      </Container>
    </section>
  );
}
