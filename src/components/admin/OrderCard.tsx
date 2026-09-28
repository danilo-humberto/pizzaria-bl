import { CheckCircle2, ChevronRight, Trash2 } from 'lucide-react'
import type { Order, OrderStatus } from '../../types/order'
import { cn } from '../../utils/cn'
import { formatCurrency } from '../../utils/formatCurrency'
import {
  canCancelOrder,
  formatOrderPortions,
  formatOrderSyrup,
  formatOrderShortDateTime,
  getOrderFruitPortions,
  getOrderIceCreamFlavors,
  getOrderToppingPortions,
  getNextOrderActionLabel,
  getNextOrderStatus,
  orderStatusTheme,
} from '../../utils/orderDisplay'

type OrderCardProps = {
  order: Order
  isUpdating: boolean
  onOpenDetails: (trackingCode: string) => void
  onStatusChange: (trackingCode: string, status: OrderStatus) => void
}

export function OrderCard({ order, isUpdating, onOpenDetails, onStatusChange }: OrderCardProps) {
  const nextStatus = getNextOrderStatus(order.status)
  const nextActionLabel = getNextOrderActionLabel(order.status)
  const theme = orderStatusTheme[order.status]
  const isCompleted = order.status === 'completed'
  const itemSummary = `${order.items.size ?? 'Sem tamanho'} • ${order.items.productName ?? 'Produto não informado'}`
  const portionSummary = formatOrderPortions(
    [...getOrderFruitPortions(order.items), ...getOrderToppingPortions(order.items)],
    '',
  )
  const detailsSummary = [
    ...getOrderIceCreamFlavors(order.items),
    portionSummary,
    formatOrderSyrup(order.items),
  ]
    .filter(Boolean)
    .join(', ') || 'Sem complementos'

  return (
    <article className="rounded-2xl border border-[oklch(89%_0.015_326_/_84%)] bg-[oklch(99%_0.006_326_/_86%)] p-4 shadow-[0_12px_30px_oklch(14%_0.05_326_/_8%)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={cn('font-display text-xl font-extrabold leading-none', theme.text)}>{order.publicCode}</p>
          <p className="mt-3 truncate text-sm font-extrabold text-[var(--admin-ink)]">{order.customer.name}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-[var(--admin-muted)]">{formatOrderShortDateTime(order.createdAt)}</p>
          <p className={cn('mt-2 text-base font-extrabold', theme.text)}>{formatCurrency(order.total)}</p>
        </div>
      </div>

      <div className="mt-3 min-w-0 text-sm font-semibold leading-5 text-[var(--admin-muted)]">
        <p className="truncate">{itemSummary}</p>
        <p className="truncate">{detailsSummary}</p>
      </div>

      <div className="mt-4 border-t border-[oklch(89%_0.015_326_/_70%)] pt-3">
        <div className="grid grid-cols-2 gap-3">
          {isCompleted ? (
            <button
              type="button"
              className={cn(
                'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-extrabold text-[var(--cream-50)]',
                theme.button,
              )}
              disabled
            >
              <CheckCircle2 size={15} />
              Concluído
            </button>
          ) : (
            nextStatus &&
            nextActionLabel && (
              <button
                type="button"
                className={cn(
                  'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-extrabold text-[var(--cream-50)] transition disabled:cursor-not-allowed disabled:opacity-60',
                  theme.button,
                )}
                disabled={isUpdating}
                onClick={() => onStatusChange(order.trackingCode, nextStatus)}
              >
                {isUpdating ? 'Atualizando...' : nextActionLabel}
                {!isUpdating && <ChevronRight size={15} />}
              </button>
            )
          )}

          <button
            type="button"
            className="min-h-10 rounded-xl border border-[oklch(78%_0.024_326_/_74%)] bg-[oklch(99%_0.006_326_/_62%)] px-3 text-sm font-extrabold text-[var(--admin-muted)] transition hover:bg-[var(--admin-muted-bg)] hover:text-[var(--admin-ink)]"
            onClick={() => onOpenDetails(order.trackingCode)}
          >
            Ver detalhes
          </button>
        </div>

        {canCancelOrder(order.status) && (
          <button
            type="button"
            className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[oklch(63%_0.18_26_/_36%)] bg-[oklch(99%_0.006_326_/_42%)] px-3 text-sm font-extrabold text-[var(--admin-danger)] transition hover:bg-[var(--admin-danger-bg)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isUpdating}
            onClick={() => onStatusChange(order.trackingCode, 'cancelled')}
          >
            <Trash2 size={15} />
            Cancelar pedido
          </button>
        )}
      </div>
    </article>
  )
}
