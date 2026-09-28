import { Droplets } from 'lucide-react'
import type { PortionSelection, SyrupOption } from '../../types/order'
import { getSelectionQuantity } from '../../utils/portionSelections'
import { PortionCard } from '../ui/PortionCard'
import { RadioCard } from '../ui/RadioCard'

type SyrupSelectorProps = {
  syrups: SyrupOption[]
  selection: PortionSelection | null
  unavailableSyrupIds: string[]
  isAvailabilityReady: boolean
  stepNumber: number
  onSelect: (syrupId: string) => void
  onIncrement: (syrupId: string) => void
  onDecrement: (syrupId: string) => void
}

export function SyrupSelector({
  syrups,
  selection,
  unavailableSyrupIds,
  isAvailabilityReady,
  stepNumber,
  onSelect,
  onIncrement,
  onDecrement,
}: SyrupSelectorProps) {
  return (
    <section id="builder-syrup" className="scroll-mt-28">
      <div className="mb-5">
        <p className="text-sm font-extrabold text-[var(--brand-primary)]">{stepNumber}. Calda</p>
        <h3 className="break-words font-display text-3xl font-extrabold leading-tight text-[var(--text-primary)]">Escolha uma calda</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
          A primeira porção é incluída. Cada porção extra custa R$ 0,50.
        </p>
      </div>
      <div className="grid items-start gap-3 sm:grid-cols-2">
        {syrups.map((syrup) => {
          if (syrup.id === 'sem-calda') {
            return (
              <RadioCard
                key={syrup.id}
                title={syrup.name}
                description={syrup.description}
                selected={!selection}
                icon={<Droplets size={18} />}
                onClick={() => onSelect(syrup.id)}
              />
            )
          }

          const isUnavailable = unavailableSyrupIds.includes(syrup.id)

          return (
            <PortionCard
              key={syrup.id}
              title={syrup.name}
              description={syrup.description}
              quantity={getSelectionQuantity(selection ? [selection] : [], syrup.id)}
              disabled={!isAvailabilityReady || isUnavailable}
              statusLabel={isUnavailable ? 'Esgotado' : undefined}
              icon={<Droplets size={18} />}
              onToggle={() => onSelect(syrup.id)}
              onIncrement={() => onIncrement(syrup.id)}
              onDecrement={() => onDecrement(syrup.id)}
            />
          )
        })}
      </div>
    </section>
  )
}
