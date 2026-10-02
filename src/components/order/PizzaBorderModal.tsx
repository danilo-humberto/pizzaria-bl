import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { pizzaBorders } from '../../data/pizzaMenu'
import type { MenuOption } from '../../data/pizzaMenu'
import type { PizzaAdditionResult, PizzaBorderQuantities } from '../../types/pizzaOrder'
import { buildPizzaAddition, getPizzaItemTotalCents } from '../../utils/pizzaOrder'
import { formatCurrency } from '../../utils/formatCurrency'
import { Button } from '../ui/Button'
import { MenuOptionCards } from './MenuOptionCards'

type PizzaBorderModalProps = {
  pizza: MenuOption
  quantity: number
  unavailableBorderIds?: string[]
  unavailable?: boolean
  onClose: () => void
  onConfirm: (borderQuantities: PizzaBorderQuantities) => PizzaAdditionResult
}

const stepperClass = 'grid min-h-11 min-w-11 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xl font-bold disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]'

export function PizzaBorderModal({ pizza, quantity, onClose, onConfirm, unavailableBorderIds = [], unavailable = false }: PizzaBorderModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const confirmingRef = useRef(false)
  const [withBorders, setWithBorders] = useState(false)
  const [borderQuantities, setBorderQuantities] = useState<PizzaBorderQuantities>({})
  const [error, setError] = useState('')
  const assigned = Object.values(borderQuantities).reduce((sum, count) => sum + count, 0)
  const activeBorders = withBorders ? borderQuantities : {}
  const selectionUnavailable = unavailable || Object.entries(activeBorders).some(([id, count]) => count > 0 && unavailableBorderIds.includes(id))
  const preview = buildPizzaAddition([], pizza.id, quantity, activeBorders)
  const groups = preview.ok ? preview.items : []
  const total = groups.reduce((sum, item) => sum + getPizzaItemTotalCents(item), 0) / 100

  useEffect(() => {
    const dialog = dialogRef.current!
    const trigger = document.activeElement
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true })
    }
  }, [])

  const chooseMode = (value: boolean) => {
    setWithBorders(value)
    setBorderQuantities({})
    setError('')
  }

  const changeBorderQuantity = (id: string, delta: number) => {
    if (delta > 0 && unavailableBorderIds.includes(id)) return
    setBorderQuantities((current) => {
      const count = (current[id] ?? 0) + delta
      const used = Object.values(current).reduce((sum, value) => sum + value, 0)
      if (count < 0 || used + delta > quantity) return current
      return { ...current, [id]: count }
    })
    setError('')
  }

  const confirm = () => {
    if (confirmingRef.current || selectionUnavailable) return
    if (withBorders && assigned === 0) {
      setError('Escolha a borda de pelo menos uma pizza.')
      return
    }
    confirmingRef.current = true
    const result = onConfirm(activeBorders)
    if (result.ok) {
      onClose()
    } else {
      confirmingRef.current = false
      setError(result.error)
    }
  }

  return <dialog ref={dialogRef} aria-labelledby="pizza-border-title" aria-describedby="pizza-border-description" onCancel={(event) => { event.preventDefault(); onClose() }} className="m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-3xl border-0 bg-[var(--surface)] p-0 text-[var(--text-primary)] panel-shadow backdrop:bg-[var(--surface-dark-translucent)] backdrop:backdrop-blur-sm">
    <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] p-5 sm:p-6">
      <div><h2 id="pizza-border-title" className="font-display text-2xl font-extrabold">Quer adicionar borda?</h2><p id="pizza-border-description" className="mt-2 text-sm text-[var(--text-secondary)]">{quantity}× Pizza grande · {pizza.name}</p></div>
      <button type="button" aria-label="Fechar escolha de bordas" onClick={onClose} className="grid min-h-11 min-w-11 shrink-0 place-items-center rounded-xl hover:bg-[var(--surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus)]"><X size={20} /></button>
    </div>
    <form onSubmit={(event) => { event.preventDefault(); confirm() }} className="space-y-5 p-5 sm:p-6">
      <fieldset><legend className="mb-3 text-sm font-extrabold">Como você prefere?</legend><div className="grid grid-cols-2 gap-3">
        {[false, true].map((value) => <label key={String(value)} className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-2xl border-2 p-3 text-sm font-bold ${withBorders === value ? 'border-[var(--brand-primary)] bg-[var(--surface-muted)]' : 'border-[var(--border)]'}`}><input type="radio" name="pizza-border-mode" checked={withBorders === value} onChange={() => chooseMode(value)} className="accent-[var(--brand-primary)]" />{value ? 'Escolher bordas' : 'Sem borda'}</label>)}
      </div></fieldset>
      {withBorders && (quantity === 1 ? <MenuOptionCards legend="Escolha a borda" name="modal-pizza-border" options={pizzaBorders} unavailableIds={unavailableBorderIds} disabled={unavailable} selectedId={Object.keys(borderQuantities).find((id) => borderQuantities[id] > 0) ?? ''} onSelect={(id) => { setBorderQuantities({ [id]: 1 }); setError('') }} compact /> : <fieldset>
        <legend className="mb-2 text-sm font-extrabold">Quantas pizzas recebem cada borda?</legend>
        <p className="mb-3 text-sm text-[var(--text-secondary)]">Distribua até {quantity} pizzas. As restantes ficam sem borda.</p>
        <div className="space-y-3">{pizzaBorders.map((border) => <div key={border.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] p-3">
          <div><p id={`border-count-${border.id}`} className="text-sm font-extrabold">{border.name}{unavailableBorderIds.includes(border.id) ? ' — Esgotado' : ''}</p><p className="mt-1 text-sm text-[var(--text-secondary)]">+ {formatCurrency(border.price)} por pizza</p></div>
          <div role="group" aria-labelledby={`border-count-${border.id}`} className="inline-flex items-center gap-2">
            <button type="button" aria-label={`Diminuir pizzas com ${border.name.toLowerCase()}`} disabled={!borderQuantities[border.id]} onClick={() => changeBorderQuantity(border.id, -1)} className={stepperClass}>−</button>
            <output aria-live="polite" className="min-w-7 text-center font-extrabold tabular-nums">{borderQuantities[border.id] ?? 0}</output>
            <button type="button" aria-label={`Aumentar pizzas com ${border.name.toLowerCase()}`} disabled={unavailable || unavailableBorderIds.includes(border.id) || assigned >= quantity} onClick={() => changeBorderQuantity(border.id, 1)} className={stepperClass}>+</button>
          </div>
        </div>)}</div>
      </fieldset>)}
      <div className="rounded-2xl bg-[var(--surface-muted)] p-4" aria-live="polite">
        <p className="text-sm font-extrabold">Você vai adicionar</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{quantity}× {pizza.name}</p>
        <ul className="mt-2 space-y-1 text-sm">{groups.map((item) => <li key={item.borderId ?? 'none'}>{item.quantity}× {pizzaBorders.find((border) => border.id === item.borderId)?.name ?? 'Sem borda'}</li>)}</ul>
        <div className="mt-3 flex justify-between gap-3 border-t border-[var(--border)] pt-3"><span className="text-sm font-bold">Total da adição</span><strong className="text-[var(--brand-primary)]">{formatCurrency(total)}</strong></div>
      </div>
      {withBorders && assigned === 0 && <p className="text-sm text-[var(--text-secondary)]">Escolha a borda de pelo menos uma pizza para confirmar.</p>}
      {selectionUnavailable && <p role="status" className="text-sm font-bold text-[var(--error)]">Pizza ou borda esgotada. Ajuste a escolha ou cancele para escolher outra pizza.</p>}
      {error && <p role="alert" className="rounded-2xl bg-[var(--error-soft)] p-3 text-sm font-bold text-[var(--error)]">{error}</p>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row"><Button variant="soft" className="sm:flex-1" onClick={onClose}>Cancelar</Button><Button type="submit" className="sm:flex-1" disabled={selectionUnavailable || (withBorders && assigned === 0)}>Confirmar adição</Button></div>
    </form>
  </dialog>
}
