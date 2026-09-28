import { Snowflake } from 'lucide-react'
import type { IceCreamFlavorOption, OrderValidation } from '../../types/order'
import { CheckboxCard } from '../ui/CheckboxCard'

type IceCreamFlavorSelectorProps = {
  flavors: IceCreamFlavorOption[]
  selectedFlavorIds: string[]
  maxSelections: number
  fieldErrors: OrderValidation['fieldErrors']
  unavailableFlavorIds: string[]
  isAvailabilityReady: boolean
  stepNumber: number
  onToggle: (flavorId: string) => void
}

export function IceCreamFlavorSelector({
  flavors,
  selectedFlavorIds,
  maxSelections,
  fieldErrors,
  unavailableFlavorIds,
  isAvailabilityReady,
  stepNumber,
  onToggle,
}: IceCreamFlavorSelectorProps) {
  const hasReachedLimit = selectedFlavorIds.length >= maxSelections

  return (
    <section id="builder-icecream-flavor" className="scroll-mt-28">
      <div className="mb-5">
        <p className="text-sm font-extrabold text-[var(--brand-primary)]">
          {stepNumber}. Sabor do creme
        </p>
        <h3 className="break-words font-display text-3xl font-extrabold leading-tight text-[var(--text-primary)]">
          {maxSelections === 2 ? 'Escolha até 2 sabores' : 'Escolha 1 sabor'}
        </h3>
        {maxSelections === 2 && (
          <p className="mt-2 text-sm font-bold text-[var(--text-muted)]" aria-live="polite">
            {selectedFlavorIds.length} de 2 sabores selecionados
          </p>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {flavors.map((flavor) => {
          const isSelected = selectedFlavorIds.includes(flavor.id)
          const isUnavailable = unavailableFlavorIds.includes(flavor.id)
          const isDisabledByLimit = hasReachedLimit && !isSelected

          return (
            <CheckboxCard
              key={flavor.id}
              title={flavor.name}
              description={flavor.description}
              selected={isSelected}
              disabled={!isAvailabilityReady || isUnavailable || isDisabledByLimit}
              statusLabel={
                isUnavailable ? 'Esgotado' : isDisabledByLimit ? 'Limite atingido' : undefined
              }
              icon={<Snowflake size={18} />}
              onClick={() => onToggle(flavor.id)}
            />
          )
        })}
      </div>
      {fieldErrors.iceCreamFlavorIds && (
        <p className="mt-3 text-sm font-bold text-[var(--error)]">
          {fieldErrors.iceCreamFlavorIds}
        </p>
      )}
    </section>
  )
}
