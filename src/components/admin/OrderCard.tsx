import { formatPizzaOrderLine } from '../../utils/pizzaOrderDisplay'
import type { PizzaOrderDocument as Order } from "../../types/pizzaOrder";
import { CheckCircle2, ChevronRight, Trash2 } from 'lucide-react'
import type { OrderStatus } from '../../types/order'
import { cn } from '../../utils/cn'
import { formatCurrency } from '../../utils/formatCurrency'
import {
  canCancelOrder,
  formatOrderShortDateTime,
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

  return (
    <article className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 shadow-[0_12px_30px_var(--shadow-color-soft)]">
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
        <p className="mb-1 font-bold">Retirada na loja</p>
        {order.items.lines.map((item, index) => (
          <p key={index} className="break-words">{formatPizzaOrderLine(item)}</p>
        ))}
      </div>

      <div className="mt-4 border-t border-[var(--admin-border)] pt-3">
        <div className="grid grid-cols-2 gap-3">
          {isCompleted ? (
            <button
              type="button"
              className={cn(
                'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-extrabold text-[var(--text-on-dark)]',
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
                  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-extrabold text-[var(--text-on-dark)] transition disabled:cursor-not-allowed disabled:opacity-60',
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
            className="min-h-12 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-sm font-extrabold text-[var(--admin-muted)] transition hover:bg-[var(--admin-muted-bg)] hover:text-[var(--admin-ink)]"
            onClick={() => onOpenDetails(order.trackingCode)}
          >
            Ver detalhes
          </button>
        </div>

        {canCancelOrder(order.status) && (
          <button
            type="button"
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[var(--admin-danger-border)] bg-[var(--admin-surface)] px-3 text-sm font-extrabold text-[var(--admin-danger)] transition hover:bg-[var(--admin-danger-bg)] disabled:cursor-not-allowed disabled:opacity-60"
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
