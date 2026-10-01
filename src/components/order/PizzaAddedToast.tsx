import { CheckCircle2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { pizzaBorders } from '../../data/pizzaMenu'
import type { PizzaOrderItem } from '../../types/pizzaOrder'
import { getPizzaItemTotalCents } from '../../utils/pizzaOrder'
import { formatCurrency } from '../../utils/formatCurrency'

export type PizzaAdditionNotice = { id: number; name: string; quantity: number; items: PizzaOrderItem[] }
type PizzaAddedToastProps = { notice: PizzaAdditionNotice | null; onDismiss: () => void }

const productNames = { pizza: ['Pizza', 'Pizzas'], esfiha: ['Esfiha', 'Esfihas'], beverage: ['Bebida', 'Bebidas'] }

export function PizzaAddedToast({ notice, onDismiss }: PizzaAddedToastProps) {
  const toastRef = useRef<HTMLDivElement>(null)
  const timerNoticeId = useRef<number | undefined>(undefined)
  const remaining = useRef(6000)
  const [lastNotice, setLastNotice] = useState(notice)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [bottom, setBottom] = useState(16)
  const paused = hovered || focused
  const visibleNotice = notice ?? lastNotice

  useEffect(() => {
    if (timerNoticeId.current !== notice?.id) {
      timerNoticeId.current = notice?.id
      remaining.current = 6000
    }
    if (!notice) {
      setHovered(false)
      setFocused(false)
      return
    }
    if (paused) return
    const startedAt = performance.now()
    const timer = window.setTimeout(onDismiss, remaining.current)
    return () => {
      window.clearTimeout(timer)
      remaining.current = Math.max(0, remaining.current - (performance.now() - startedAt))
    }
  }, [notice?.id, paused, onDismiss])

  useEffect(() => {
    const toast = toastRef.current
    if (!toast || (!notice && !lastNotice)) return
    const supportsPopover = typeof toast.showPopover === 'function'
    if (notice) {
      setLastNotice(notice)
      if (supportsPopover && !toast.matches(':popover-open')) toast.showPopover()
    }
    const finishExit = () => {
      if (notice) return
      if (supportsPopover && toast.matches(':popover-open')) toast.hidePopover()
      setLastNotice(null)
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof toast.animate !== 'function') {
      finishExit()
      return
    }
    const frames = [
      { opacity: 0, transform: 'translateY(24px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ]
    const animation = toast.animate(notice ? frames : [...frames].reverse(), {
      duration: notice ? 280 : 220,
      easing: notice ? 'cubic-bezier(0.22, 1, 0.36, 1)' : 'ease-in',
      fill: 'both',
    })
    let active = true
    void animation.finished.then(() => { if (active) finishExit() }).catch(() => {})
    return () => {
      active = false
      animation.cancel()
    }
  }, [notice?.id])

  useEffect(() => {
    if (!visibleNotice) return
    const dock = document.querySelector<HTMLElement>('.order-mobile-dock')
    const updatePosition = () => {
      if (!dock || dock.classList.contains('pointer-events-none') || getComputedStyle(dock).display === 'none') {
        setBottom(16)
        return
      }
      setBottom(dock.offsetHeight + (parseFloat(getComputedStyle(dock).bottom) || 0) + 12)
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    const resizeObserver = new ResizeObserver(updatePosition)
    const mutationObserver = new MutationObserver(updatePosition)
    if (dock) {
      resizeObserver.observe(dock)
      mutationObserver.observe(dock, { attributes: true, attributeFilter: ['class'] })
    }
    return () => {
      window.removeEventListener('resize', updatePosition)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [visibleNotice?.id])

  if (typeof document === 'undefined') return null
  const kind = visibleNotice?.items[0]?.kind ?? 'pizza'
  const title = `${productNames[kind][visibleNotice?.quantity === 1 ? 0 : 1]} ${visibleNotice?.quantity === 1 ? 'adicionada' : 'adicionadas'} com sucesso`
  const total = visibleNotice?.items.reduce((sum, item) => sum + getPizzaItemTotalCents(item), 0) ?? 0
  const distribution = visibleNotice?.items.filter((item) => item.kind === 'pizza').map((item) => `${item.quantity}× ${pizzaBorders.find((border) => border.id === item.borderId)?.name ?? 'Sem borda'}`).join(' · ')

  return <>
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {notice && `${title}. ${notice.quantity}× ${notice.name}.${distribution ? ` ${distribution}.` : ''} Adicionado: ${formatCurrency(total / 100)}.`}
    </div>
    {createPortal(<div
      ref={toastRef}
      popover="manual"
      inert={!notice}
      aria-hidden={!notice}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      }}
      style={{ bottom: `max(${bottom}px, env(safe-area-inset-bottom))`, display: visibleNotice ? undefined : 'none' }}
      className="fixed inset-auto left-1/2 z-[60] m-0 w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-[var(--text-primary)] panel-shadow"
    >
      {visibleNotice && <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 shrink-0 text-[var(--success)]" size={24} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-extrabold">{title}</p>
          <p className="mt-1 text-sm font-bold">{visibleNotice.quantity}× {visibleNotice.name}</p>
          {distribution && <p className="mt-1 break-words text-sm text-[var(--text-secondary)]">{distribution}</p>}
          <p className="mt-2 text-sm font-extrabold text-[var(--brand-primary)]">Adicionado: {formatCurrency(total / 100)}</p>
        </div>
        <button type="button" aria-label={`Fechar aviso de ${productNames[kind][0].toLowerCase()} adicionada`} onClick={onDismiss} className="grid min-h-11 min-w-11 shrink-0 place-items-center rounded-xl hover:bg-[var(--surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus)]"><X size={18} /></button>
      </div>}
    </div>, document.body)}
  </>
}
