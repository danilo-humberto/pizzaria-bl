import type { OrderValidation, SizeOption } from '../../types/order'
import { OptionCard } from '../ui/OptionCard'

type SizeSelectorProps = {
  sizes: SizeOption[]
  selectedSizeId: string
  fieldErrors: OrderValidation['fieldErrors']
  stepNumber: number
  onSelect: (sizeId: string) => void
}

export function SizeSelector({
  sizes,
  selectedSizeId,
  fieldErrors,
  stepNumber,
  onSelect,
}: SizeSelectorProps) {
  return (
    <section id="builder-size" className="scroll-mt-28">
      <div className="mb-5">
        <p className="text-sm font-extrabold text-[var(--brand-primary)]">{stepNumber}. Escolha o tamanho</p>
        <h3 className="break-words font-display text-3xl font-extrabold leading-tight text-[var(--text-primary)]">Qual vai ser o tamanho?</h3>
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-6">
        {sizes.map((size) => (
          <div
            key={size.id}
            className={size.id.startsWith('barca-') ? 'sm:col-span-3' : 'sm:col-span-2'}
          >
            <OptionCard
              title={size.name}
              description={size.description}
              price={size.price}
              image={size.image}
              selected={size.id === selectedSizeId}
              onClick={() => onSelect(size.id)}
            />
          </div>
        ))}
      </div>
      {fieldErrors.sizeId && (
        <p className="mt-3 text-sm font-bold text-[var(--error)]">{fieldErrors.sizeId}</p>
      )}
    </section>
  )
}
