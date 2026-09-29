import { Menu, MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { storeConfig } from "../../data/storeConfig";
import { cn } from "../../utils/cn";
import { Button } from "../ui/Button";
import { Container } from "./Container";
import { LogoMark } from "./LogoMark";

const navItems = [
  { href: "#inicio", label: "Início" },
  { href: "#monte", label: "Montar pedido" },
  { href: "#contato", label: "Contato" },
];

const SCROLL_THRESHOLD = 16;

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateHeaderState = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateHeaderState);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[padding,background-color,border-color] duration-300 ease-out",
        isScrolled
          ? "px-2 pt-3 sm:px-3"
          : "border-b border-[var(--overlay-light-10)] bg-[var(--surface-dark-glass)] backdrop-blur-md",
      )}
    >
      <Container className="relative">
        <div
          className={cn(
            "relative flex items-center justify-between gap-4 transition-[min-height,padding,border-radius,background-color,border-color,box-shadow] duration-300 ease-out",
            isScrolled
              ? "min-h-16 rounded-[1.75rem] border border-[var(--border-on-dark-soft)] bg-[var(--surface-dark-glass)] px-4 shadow-[0_18px_45px_var(--shadow-color)] backdrop-blur-md sm:px-5"
              : "min-h-20 px-0",
          )}
        >
          <LogoMark brand="pizzaria" className="shrink-0" />

          <nav
            className={cn(
              "hidden items-center text-sm font-extrabold",
              isScrolled ? "absolute left-1/2 -translate-x-1/2 gap-8 lg:flex" : "gap-9 md:flex",
            )}
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="header-nav-link"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className={cn("hidden items-center gap-2", isScrolled ? "lg:flex" : "md:flex")}>
            <Button
              href={storeConfig.contact.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              variant="leaf"
              size={isScrolled ? "sm" : "md"}
              className={cn("focus-visible:outline-[var(--focus-on-dark)]", isScrolled && "ml-1 rounded-full px-5")}
              icon={<MessageCircle size={isScrolled ? 16 : 18} />}
            >
              WhatsApp
            </Button>
          </div>

          <button
            type="button"
            className={cn(
              "grid h-11 w-11 place-items-center border border-[var(--border-on-dark)] text-[var(--surface)] transition hover:bg-[var(--hover-on-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-on-dark)]",
              isScrolled ? "rounded-full lg:hidden" : "rounded-2xl md:hidden",
            )}
            onClick={() => setIsOpen((current) => !current)}
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={21} /> : <Menu size={21} />}
          </button>

          <div
            className={cn(
              "absolute top-[calc(100%+0.75rem)] border border-[var(--border-on-dark-soft)] bg-[var(--surface-dark)] p-4 shadow-[var(--shadow-large)]",
              isScrolled ? "left-0 right-0 rounded-[1.5rem] lg:hidden" : "left-4 right-4 rounded-3xl md:hidden",
              isOpen ? "block" : "hidden",
            )}
          >
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl px-4 py-3 font-bold text-[var(--surface)] hover:bg-[var(--hover-on-dark)]"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <Button
              href={storeConfig.contact.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              variant="leaf"
              className="mt-3 w-full rounded-full focus-visible:outline-[var(--focus-on-dark)]"
              icon={<MessageCircle size={18} />}
              onClick={() => setIsOpen(false)}
            >
              Falar no WhatsApp
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}
