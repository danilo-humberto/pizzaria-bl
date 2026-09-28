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
        <p className="text-sm font-bold text-[var(--brand-primary)]">
          Feito com carinho para cada copo.
        </p>
      </Container>
    </footer>
  );
}
