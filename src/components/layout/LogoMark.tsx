import { cn } from "../../utils/cn";
import pizzariaLogo from "../../../assets/logo-transparent.png";

type LogoMarkProps = {
  compact?: boolean;
  className?: string;
  href?: string;
  brand?: "original" | "pizzaria";
};

export function LogoMark({
  compact = false,
  className,
  href = "#inicio",
  brand = "original",
}: LogoMarkProps) {
  if (brand === "pizzaria") {
    return (
      <a href={href} className={cn("inline-flex items-center", className)} aria-label="Pizzaria BL">
        <img
          src={pizzariaLogo}
          alt="Pizzaria BL"
          className="h-14 w-14 object-contain sm:h-16 sm:w-16"
        />
      </a>
    );
  }

  return (
    <a
      href={href}
      className={cn("inline-flex items-center gap-3", className)}
      aria-label="Shalom Açaí"
    >
      <span className="relative grid h-9 w-9 place-items-center">
        <span className="absolute left-1 top-3 h-4 w-4 rounded-full bg-[var(--berry-600)] shadow-[0_6px_18px_var(--legacy-logo-shadow-left)]" />
        <span className="absolute right-1 top-3 h-4 w-4 rounded-full bg-[var(--plum-800)] shadow-[0_6px_18px_var(--legacy-logo-shadow-right)]" />
        <span className="absolute right-2 top-0 h-4 w-2 rotate-45 rounded-full bg-[var(--leaf-500)]" />
      </span>
      {!compact && (
        <span className="font-display text-2xl font-extrabold text-[var(--cream-50)]">
          Shalom Açaí
        </span>
      )}
    </a>
  );
}
