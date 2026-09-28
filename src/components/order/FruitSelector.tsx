import { Apple, Banana, Cherry, Grape } from 'lucide-react'
import type { FruitOption, PortionSelection } from '../../types/order'
import { getSelectionQuantity } from '../../utils/portionSelections'
import { PortionCard } from '../ui/PortionCard'

type FruitSelectorProps = {
  fruits: FruitOption[]
  selections: PortionSelection[]
  unavailableFruitIds: string[]
  isAvailabilityReady: boolean
  stepNumber: number
  onToggle: (fruitId: string) => void
  onIncrement: (fruitId: string) => void
  onDecrement: (fruitId: string) => void
}

const fruitIcons = {
  banana: <Banana size={18} />,
  morango: <Cherry size={18} />,
  uva: <Grape size={18} />,
  manga: <Apple size={18} />,
}

export function FruitSelector({
  fruits,
  selections,
  unavailableFruitIds,
  isAvailabilityReady,
  stepNumber,
  onToggle,
  onIncrement,
  onDecrement,
}: FruitSelectorProps) {
  return (
    <section id="builder-fruits" className="scroll-mt-28">
      <div className="mb-5">
        <p className="text-sm font-extrabold text-[var(--brand-primary)]">{stepNumber}. Frutas</p>
        <h3 className="break-words font-display text-3xl font-extrabold leading-tight text-[var(--text-primary)]">Escolha à vontade</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
          A primeira porção de cada fruta é incluída. Porções extras custam R$ 0,50 cada.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {fruits.map((fruit) => (
          <PortionCard
            key={fruit.id}
            title={fruit.name}
            description={fruit.description}
            quantity={getSelectionQuantity(selections, fruit.id)}
            disabled={!isAvailabilityReady || unavailableFruitIds.includes(fruit.id)}
            statusLabel={unavailableFruitIds.includes(fruit.id) ? 'Esgotado' : undefined}
            icon={fruitIcons[fruit.id as keyof typeof fruitIcons]}
            onToggle={() => onToggle(fruit.id)}
            onIncrement={() => onIncrement(fruit.id)}
            onDecrement={() => onDecrement(fruit.id)}
          />
        ))}
      </div>
    </section>
  )
}
