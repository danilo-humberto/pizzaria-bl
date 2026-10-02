import type { ReactNode } from 'react'
import type { MenuOption } from '../../data/pizzaMenu'
import { formatCurrency } from '../../utils/formatCurrency'

type QuantityControl = {
  value: number
  max?: number
  onChange: (value: number) => void
}

type MenuOptionCardsProps = {
  legend: string
  name: string
  options: MenuOption[]
  selectedId: string
  onSelect: (id: string) => void
  quantityControl?: QuantityControl
  compact?: boolean
  uniformHeight?: boolean
  selectedAction?: ReactNode
  unavailableIds?: string[]
  disabled?: boolean
}

export function MenuOptionCards({ legend, name, options, selectedId, onSelect, quantityControl, compact = false, uniformHeight = !compact, selectedAction, unavailableIds = [], disabled = false }: MenuOptionCardsProps) {
  const contentHeight = uniformHeight ? (compact ? 'h-32' : 'h-48') : (compact ? 'min-h-24' : 'min-h-36')
  const expandedContentHeight = compact ? 'min-h-32' : 'min-h-48'
  return <fieldset>
    <legend className="mb-3 text-sm font-extrabold text-[var(--text-primary)]">{legend}</legend>
    <div className="grid items-start gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const unavailable = unavailableIds.includes(option.id)
        const blocked = disabled || unavailable
        const isSelected = selectedId === option.id && !blocked
        const cardId = `${name}-${option.id || 'none'}`
        return <div key={option.id} className={`min-w-0 overflow-hidden rounded-2xl border-2 bg-[var(--surface)] transition ${uniformHeight ? 'flex flex-col' : ''} ${isSelected ? 'border-[var(--brand-primary)] bg-[var(--surface-muted)]' : 'border-[var(--border)] hover:border-[var(--brand-primary)]'}`}>
          <button type="button" disabled={blocked} aria-pressed={isSelected} aria-labelledby={`${cardId}-name`} aria-describedby={`${option.description ? `${cardId}-description ` : ''}${cardId}-price${unavailable ? ` ${cardId}-availability` : ''}`} onClick={() => onSelect(option.id)} className={`flex w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex-col gap-2 p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus)] ${uniformHeight && isSelected ? expandedContentHeight : contentHeight}`}>
            <span className="flex items-start justify-between gap-2">
              <span id={`${cardId}-name`} className="font-extrabold leading-5 text-[var(--text-primary)]">{option.name}</span>
              <span aria-hidden="true" className={`shrink-0 rounded-full px-2 py-1 text-xs font-extrabold ${isSelected ? 'bg-[var(--brand-primary)] text-[var(--surface)]' : 'bg-[var(--surface-muted)] text-[var(--text-secondary)]'}`}>{unavailable ? 'Esgotado' : disabled ? 'Aguarde' : isSelected ? 'Desmarcar' : 'Escolher'}</span>
            </span>
            {option.description && <span id={`${cardId}-description`} className={`text-sm leading-5 text-[var(--text-secondary)] ${quantityControl && !isSelected ? 'line-clamp-3' : ''}`}>{option.description}</span>}
            {unavailable && <span id={`${cardId}-availability`} className="sr-only">Esgotado</span>}
            <strong id={`${cardId}-price`} className="mt-auto text-base text-[var(--brand-primary)]">{formatCurrency(option.price)}</strong>
          </button>
          {isSelected && quantityControl && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-4 py-3">
            <span id={`${cardId}-quantity-label`} className="text-sm font-bold text-[var(--text-primary)]">Quantidade</span>
            <div role="group" aria-labelledby={`${cardId}-quantity-label`} className="inline-flex items-center gap-2">
              <button type="button" aria-label={`Diminuir quantidade de ${option.name}`} disabled={quantityControl.value <= 1} onClick={() => quantityControl.onChange(quantityControl.value - 1)} className="grid min-h-11 min-w-11 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xl font-bold text-[var(--text-primary)] disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]">−</button>
              <output aria-live="polite" className="min-w-7 text-center font-extrabold tabular-nums">{quantityControl.value}</output>
              <button type="button" aria-label={`Aumentar quantidade de ${option.name}`} disabled={quantityControl.max !== undefined && quantityControl.value >= quantityControl.max} onClick={() => quantityControl.onChange(quantityControl.value + 1)} className="grid min-h-11 min-w-11 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xl font-bold text-[var(--text-primary)] disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]">+</button>
            </div>
          </div>}
          {isSelected && selectedAction && <div className="px-4 pb-4">{selectedAction}</div>}
        </div>
      })}
    </div>
  </fieldset>
}
