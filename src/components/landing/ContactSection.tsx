import type { ReactNode } from "react";
import { Clock, CreditCard, MapPin, MessageCircle } from "lucide-react";
import { storeConfig } from "../../data/storeConfig";
import { Container } from "../layout/Container";

const linkClassName =
  "font-bold underline decoration-[var(--contact-icon)] underline-offset-4 hover:text-[var(--contact-icon)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-on-dark)]";

export function ContactSection() {
  const addressLines = [
    storeConfig.address.street,
    `${storeConfig.address.city} - ${storeConfig.address.state}`,
    storeConfig.address.zipCode
      ? `CEP: ${storeConfig.address.zipCode}`
      : null,
  ].filter((line): line is string => Boolean(line));

  return (
    <section id="contato" className="bg-[var(--surface)] pb-10 pt-4">
      <Container>
        <div
          data-reveal
          className="rounded-[2rem] bg-[linear-gradient(135deg,var(--surface-dark),var(--surface-dark-raised))] p-6 text-[var(--surface)] panel-shadow md:p-9"
        >
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
            <InfoBlock
              icon={<MapPin size={28} />}
              title="Onde estamos"
              lines={addressLines}
            />
            <InfoBlock
              icon={<Clock size={28} />}
              title="Horário de funcionamento"
              lines={[storeConfig.hours.weekdays, storeConfig.hours.sunday]}
            />
            <InfoBlock
              icon={<CreditCard size={28} />}
              title="Formas de pagamento"
              lines={[storeConfig.paymentMethods.join(", ")]}
            />
            <InfoBlock
              icon={<MessageCircle size={28} />}
              title="Fale com a gente"
              lines={[
                <a href={storeConfig.contact.whatsappUrl} target="_blank" rel="noreferrer" className={`${linkClassName} inline-flex items-center gap-2`}>
                  <MessageCircle size={17} aria-hidden="true" />
                  {storeConfig.contact.phone}
                </a>,
                <a
                  href={storeConfig.contact.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`${linkClassName} inline-flex items-center gap-2`}
                >
                  <InstagramIcon />
                  {storeConfig.contact.instagramHandle}
                </a>,
              ]}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

type InfoBlockProps = {
  icon: ReactNode;
  title: string;
  lines: ReactNode[];
};

function InfoBlock({ icon, title, lines }: InfoBlockProps) {
  return (
    <div className="flex gap-4">
      <span className="text-[var(--contact-icon)]">{icon}</span>
      <div className="min-w-0">
        <h3 className="font-extrabold">{title}</h3>
        <div className="mt-3 space-y-1 text-sm leading-6 text-[var(--contact-text)]">
          {lines.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-[17px] shrink-0" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.7" r=".8" fill="currentColor" stroke="none" />
    </svg>
  );
}
