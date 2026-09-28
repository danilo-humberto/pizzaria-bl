import { Check } from 'lucide-react'
import { cn } from '../../utils/cn'
import { formatCurrency } from '../../utils/formatCurrency'

type OptionCardProps = {
  title: string
  description: string
  price?: number
  image?: string
  selected?: boolean
  onClick: () => void
}

export function OptionCard({ title, description, price, image, selected = false, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'touch-card relative flex min-h-44 w-full min-w-0 flex-col items-center justify-between rounded-2xl border bg-[var(--surface)] p-4 text-center transition duration-300 ease-out hover:-translate-y-1 active:translate-y-0 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-primary-hover)]',
        selected
          ? 'border-[var(--brand-primary)] bg-[var(--card-selected)] shadow-[0_18px_36px_var(--shadow-brand)]'
          : 'border-[var(--border)] shadow-[0_14px_30px_var(--shadow-color-faint)] hover:border-[var(--focus)]',
      )}
    >
      {selected && (
        <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-[var(--brand-primary)] text-[var(--surface)]">
          <Check size={16} />
        </span>
      )}
      {image && <img src={image} alt="" className="h-20 w-full object-contain" loading="lazy" />}
      <span className="mt-2 block font-extrabold text-[var(--text-primary)]">{title}</span>
      <span className="text-xs font-bold text-[var(--text-muted)]">{description}</span>
      {price !== undefined && (
        <span className="mt-2 text-sm font-extrabold text-[var(--text-secondary)]">
          {formatCurrency(price)}
        </span>
      )}
    </button>
  )
}
