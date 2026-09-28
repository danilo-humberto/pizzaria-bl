import type { Order, OrderStatus } from '../../types/order'
import { operationalOrderStatusColumns } from '../../utils/orderDisplay'
import { KanbanColumn } from './KanbanColumn'

type KanbanBoardProps = {
  orders: Order[]
  isLoading: boolean
  updatingTrackingCode: string | null
  onOpenDetails: (trackingCode: string) => void
  onStatusChange: (trackingCode: string, status: OrderStatus) => void
}

export function KanbanBoard({
  orders,
  isLoading,
  updatingTrackingCode,
  onOpenDetails,
  onStatusChange,
}: KanbanBoardProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 xl:grid-cols-4">
        {operationalOrderStatusColumns.map((status) => (
          <div
            key={status}
            className="min-h-64 rounded-3xl border border-[oklch(89%_0.015_326_/_68%)] bg-[oklch(99%_0.006_326_/_60%)] p-4 shadow-[0_18px_48px_oklch(14%_0.05_326_/_8%)] backdrop-blur-xl"
          >
            <div className="h-5 w-28 rounded-full bg-[var(--admin-muted-bg)]" />
            <div className="mt-4 space-y-3">
              <div className="h-28 rounded-2xl bg-[var(--admin-muted-bg)]" />
              <div className="h-24 rounded-2xl bg-[var(--admin-muted-bg)]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {operationalOrderStatusColumns.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          orders={orders.filter((order) => order.status === status)}
          updatingTrackingCode={updatingTrackingCode}
          onOpenDetails={onOpenDetails}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  )
}
