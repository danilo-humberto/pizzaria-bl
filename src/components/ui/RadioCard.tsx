import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { formatCurrency } from '../../utils/formatCurrency'

type RadioCardProps = {
  title: string
  description: string
  selected: boolean
  price?: number
  icon?: ReactNode
  disabled?: boolean
  statusLabel?: string
  onClick: () => void
}

export function RadioCard({
  title,
  description,
  selected,
  price,
  icon,
  disabled = false,
  statusLabel,
  onClick,
}: RadioCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'touch-card flex min-h-24 w-full min-w-0 items-center gap-3 rounded-2xl border p-4 text-left transition duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-primary-hover)]',
        disabled
          ? 'cursor-not-allowed border-[var(--border)] bg-[var(--surface-muted)] opacity-65'
          : selected
          ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-soft)] shadow-[0_14px_28px_var(--shadow-selection)]'
          : 'border-[var(--border)] bg-[var(--surface)] hover:-translate-y-0.5 hover:border-[var(--focus)] active:translate-y-0 active:scale-[0.99]',
      )}
    >
      <span
        className={cn(
          'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
          selected ? 'bg-[var(--brand-primary)] text-[var(--surface)]' : 'bg-[var(--surface-muted)] text-[var(--brand-primary)]',
        )}
      >
        {selected ? <Check size={18} /> : icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-extrabold text-[var(--text-primary)]">{title}</span>
        <span className="block text-sm leading-5 text-[var(--text-muted)]">{description}</span>
      </span>
      {statusLabel && (
        <span className="shrink-0 rounded-full bg-[var(--error-soft)] px-2.5 py-1 text-xs font-extrabold text-[var(--error)]">
          {statusLabel}
        </span>
      )}
      {price !== undefined && <span className="shrink-0 text-sm font-extrabold text-[var(--brand-primary)]">{formatCurrency(price)}</span>}
    </button>
  )
}
