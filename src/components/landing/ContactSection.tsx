import { Clock, CreditCard, MapPin } from "lucide-react";
import { storeConfig } from "../../data/storeConfig";
import { Container } from "../layout/Container";

export function ContactSection() {
  return (
    <section id="contato" className="bg-[var(--surface)] pb-10 pt-4">
      <Container>
        <div
          data-reveal
          className="rounded-[2rem] bg-[linear-gradient(135deg,var(--surface-dark),var(--surface-dark-raised))] p-6 text-[var(--surface)] panel-shadow md:p-9"
        >
          <div className="grid gap-6 md:grid-cols-3">
            <InfoBlock
              icon={<MapPin size={28} />}
              title="Onde estamos"
              lines={[
                storeConfig.address.street,
                `${storeConfig.address.city} - ${storeConfig.address.state}`,
                `CEP: ${storeConfig.address.zipCode}`,
              ]}
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
          </div>
        </div>
      </Container>
    </section>
  );
}

type InfoBlockProps = {
  icon: React.ReactNode;
  title: string;
  lines: string[];
};

function InfoBlock({ icon, title, lines }: InfoBlockProps) {
  return (
    <div className="flex gap-4">
      <span className="text-[var(--contact-icon)]">{icon}</span>
      <div>
        <h3 className="font-extrabold">{title}</h3>
        <div className="mt-3 space-y-1 text-sm leading-6 text-[var(--contact-text)]">
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
