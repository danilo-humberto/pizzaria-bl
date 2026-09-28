import { Cookie, Milk, Nut, Sparkles } from "lucide-react";
import type { PortionSelection, ToppingOption } from "../../types/order";
import { getSelectionQuantity } from "../../utils/portionSelections";
import { isToppingAllowedForSize } from "../../utils/toppingCompatibility";
import { PortionCard } from "../ui/PortionCard";

type ToppingSelectorProps = {
  toppings: ToppingOption[];
  selections: PortionSelection[];
  selectedSizeId: string;
  unavailableToppingIds: string[];
  isAvailabilityReady: boolean;
  stepNumber: number;
  onToggle: (toppingId: string) => void;
  onIncrement: (toppingId: string) => void;
  onDecrement: (toppingId: string) => void;
};

const toppingIcons = {
  amendoim: <Nut size={18} />,
  granola: <Sparkles size={18} />,
  "po-de-biscoito": <Cookie size={18} />,
  leite: <Milk size={18} />,
  jujuba: <Sparkles size={18} />,
  mms: <Cookie size={18} />,
  cereais: <Sparkles size={18} />,
  pacoca: <Nut size={18} />,
  canudo: <Cookie size={18} />,
};

export function ToppingSelector({
  toppings,
  selections,
  selectedSizeId,
  unavailableToppingIds,
  isAvailabilityReady,
  stepNumber,
  onToggle,
  onIncrement,
  onDecrement,
}: ToppingSelectorProps) {
  return (
    <section id="builder-toppings" className="scroll-mt-28">
      <div className="mb-5">
        <p className="text-sm font-extrabold text-[var(--brand-primary)]">
          {stepNumber}. Guloseimas
        </p>
        <h3 className="break-words font-display text-3xl font-extrabold leading-tight text-[var(--text-primary)]">
          Capriche nas guloseimas
        </h3>
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
          A primeira porção de cada guloseima é incluída. Porções extras custam R$ 0,50 cada.
        </p>
        {selectedSizeId === "p" && (
          <p className="mt-2 text-sm font-bold leading-6 text-[var(--error)]">
            Paçoca e Canudo não estão disponíveis para o pote P.
          </p>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {toppings.map((topping) => {
          const isUnavailable = unavailableToppingIds.includes(topping.id);
          const isSizeRestricted = !isToppingAllowedForSize(
            selectedSizeId,
            topping.id,
          );

          return (
            <PortionCard
              key={topping.id}
              title={topping.name}
              description={topping.description}
              quantity={getSelectionQuantity(selections, topping.id)}
              disabled={!isAvailabilityReady || isUnavailable || isSizeRestricted}
              statusLabel={
                isUnavailable
                  ? "Esgotado"
                  : isSizeRestricted
                    ? "Indisponível no P"
                    : undefined
              }
              icon={toppingIcons[topping.id as keyof typeof toppingIcons]}
              onToggle={() => onToggle(topping.id)}
              onIncrement={() => onIncrement(topping.id)}
              onDecrement={() => onDecrement(topping.id)}
            />
          );
        })}
      </div>
    </section>
  );
}
