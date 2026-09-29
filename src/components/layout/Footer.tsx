import { MessageCircle } from "lucide-react";
import { storeConfig } from "../../data/storeConfig";
import { LogoMark } from "./LogoMark";
import { Container } from "./Container";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--surface)] py-8 text-[var(--text-secondary)]">
      <Container className="flex flex-col items-start justify-between gap-5 border-t border-[var(--border)] pt-7 sm:flex-row sm:items-center">
        <LogoMark brand="pizzaria" />
        <p className="text-sm">
          © {year} Helio3Tech. Todos os direitos reservados.
        </p>
        <div className="text-sm font-bold text-[var(--brand-primary)]">
          <p className="flex gap-3">
            <a
              href={storeConfig.contact.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
            >
              <span className="inline-flex items-center gap-1.5"><MessageCircle size={16} aria-hidden="true" />WhatsApp</span>
            </a>
            <a
              href={storeConfig.contact.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
            >
              <span className="inline-flex items-center gap-1.5"><InstagramIcon />{storeConfig.contact.instagramHandle}</span>
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-4 shrink-0" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.7" r=".8" fill="currentColor" stroke="none" />
    </svg>
  );
}
