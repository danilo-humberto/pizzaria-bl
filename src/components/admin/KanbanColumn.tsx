import { EllipsisVertical } from 'lucide-react'
import type { Order, OrderStatus } from '../../types/order'
import { cn } from '../../utils/cn'
import { formatStatusCount, orderStatusLabels, orderStatusTheme } from '../../utils/orderDisplay'
import { OrderCard } from './OrderCard'

type KanbanColumnProps = {
  status: OrderStatus
  orders: Order[]
  updatingTrackingCode: string | null
  onOpenDetails: (trackingCode: string) => void
  onStatusChange: (trackingCode: string, status: OrderStatus) => void
}

export function KanbanColumn({
  status,
  orders,
  updatingTrackingCode,
  onOpenDetails,
  onStatusChange,
}: KanbanColumnProps) {
  const theme = orderStatusTheme[status]

  return (
    <section
      className={cn(
        'min-h-[34.5rem] overflow-hidden rounded-2xl border border-t-4 bg-[oklch(99%_0.006_326_/_54%)] shadow-[0_18px_46px_oklch(14%_0.05_326_/_9%)] backdrop-blur-xl',
        theme.border,
        theme.topBorder,
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-[oklch(89%_0.015_326_/_62%)] px-5 py-4">
        <h3 className="truncate font-display text-xl font-extrabold text-[var(--admin-ink)]">
          {orderStatusLabels[status]}
        </h3>
        <div className="flex items-center gap-4">
          <span className={cn('rounded-full px-3 py-1 text-sm font-extrabold', theme.badge)}>
            {formatStatusCount(orders.length)}
          </span>
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-full text-[var(--admin-plum)] transition hover:bg-[var(--admin-muted-bg)]"
            aria-label={`Opções de ${orderStatusLabels[status]}`}
          >
            <EllipsisVertical size={20} />
          </button>
        </div>
      </header>

      <div className="hide-scrollbar max-h-[35.5rem] space-y-3.5 overflow-y-auto p-4">
        {orders.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[oklch(89%_0.015_326_/_80%)] bg-[oklch(99%_0.006_326_/_58%)] px-3 py-10 text-center text-sm font-semibold text-[var(--admin-muted)]">
            Nenhum pedido
          </p>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.trackingCode}
              order={order}
              isUpdating={updatingTrackingCode === order.trackingCode}
              onOpenDetails={onOpenDetails}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>

    </section>
  )
}
