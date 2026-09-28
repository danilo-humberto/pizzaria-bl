import { AlertTriangle, Ban, Clock, Eye, Phone } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { OrderDetailsModal } from '../../components/admin/OrderDetailsModal'
import { listenOrders } from '../../services/orderService'
import type { Order, OrderStatus } from '../../types/order'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatOrderDate, formatOrderTime, getPaymentLabel, orderStatusTheme } from '../../utils/orderDisplay'

export function AdminCancelledOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTrackingCode, setSelectedTrackingCode] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = listenOrders(
      (currentOrders) => {
        setOrders(currentOrders)
        setIsLoading(false)
      },
      () => {
        setError('Não foi possível carregar os pedidos cancelados. Verifique seu acesso e tente novamente.')
        setIsLoading(false)
      },
    )

    return unsubscribe
  }, [])

  const cancelledOrders = useMemo(() => orders.filter((order) => order.status === 'cancelled'), [orders])

  const selectedOrder = useMemo(
    () => cancelledOrders.find((order) => order.trackingCode === selectedTrackingCode) ?? null,
    [cancelledOrders, selectedTrackingCode],
  )

  const handleReadOnlyStatusChange = async (_trackingCode: string, _status: OrderStatus) => {
    return undefined
  }

  return (
    <AdminLayout cancelledCount={cancelledOrders.length}>
      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="flex items-center gap-2 text-sm font-extrabold text-[var(--admin-danger)]">
            <Ban size={16} />
            Histórico separado
          </p>
          <h2 className="mt-1 font-display text-4xl font-extrabold tracking-tight">Pedidos cancelados</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--admin-muted)]">
            Pedidos retirados do Kanban operacional para consulta e conferência.
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--admin-danger-border)] bg-[oklch(99%_0.006_326_/_66%)] px-5 py-4 shadow-[0_16px_40px_oklch(14%_0.05_326_/_7%)] backdrop-blur-xl">
          <p className="font-display text-4xl font-extrabold leading-none text-[var(--admin-danger)]">
            {cancelledOrders.length}
          </p>
          <p className="mt-1 text-sm font-extrabold text-[var(--admin-muted)]">cancelados</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-2xl border border-[var(--admin-danger-border)] bg-[var(--admin-danger-bg)] px-4 py-3 text-sm font-bold text-[var(--admin-danger)]">
          <AlertTriangle className="mt-0.5 shrink-0" size={17} />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-52 rounded-3xl border border-[oklch(89%_0.015_326_/_68%)] bg-[oklch(99%_0.006_326_/_60%)] p-4 shadow-[0_18px_48px_oklch(14%_0.05_326_/_8%)] backdrop-blur-xl"
            >
              <div className="h-5 w-28 rounded-full bg-[var(--admin-muted-bg)]" />
              <div className="mt-5 h-24 rounded-2xl bg-[var(--admin-muted-bg)]" />
              <div className="mt-4 h-10 rounded-xl bg-[var(--admin-muted-bg)]" />
            </div>
          ))}
        </div>
      ) : cancelledOrders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[oklch(89%_0.015_326_/_82%)] bg-[oklch(99%_0.006_326_/_62%)] px-5 py-14 text-center shadow-[0_18px_48px_oklch(14%_0.05_326_/_7%)] backdrop-blur-xl">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--admin-danger-bg)] text-[var(--admin-danger)]">
            <Ban size={24} />
          </div>
          <h3 className="mt-4 font-display text-2xl font-extrabold">Nenhum pedido cancelado</h3>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-[var(--admin-muted)]">
            Quando um pedido for cancelado, ele sairá do Kanban e aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cancelledOrders.map((order) => (
            <CancelledOrderCard key={order.trackingCode} order={order} onOpenDetails={setSelectedTrackingCode} />
          ))}
        </div>
      )}

      <OrderDetailsModal
        order={selectedOrder}
        isUpdating={false}
        onClose={() => setSelectedTrackingCode(null)}
        onStatusChange={handleReadOnlyStatusChange}
      />
    </AdminLayout>
  )
}

type CancelledOrderCardProps = {
  order: Order
  onOpenDetails: (trackingCode: string) => void
}

function CancelledOrderCard({ order, onOpenDetails }: CancelledOrderCardProps) {
  return (
    <article className="rounded-3xl border border-[var(--admin-danger-border)] bg-[oklch(99%_0.006_326_/_74%)] p-4 shadow-[0_18px_48px_oklch(14%_0.05_326_/_8%)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-extrabold">{order.publicCode}</p>
          <p className="mt-0.5 text-sm font-bold text-[var(--admin-muted)]">{order.customer.name}</p>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold ${orderStatusTheme.cancelled.badge}`}>
          <Ban size={13} />
          Cancelado
        </span>
      </div>

      <div className="mt-4 space-y-1.5 text-sm">
        <p className="flex items-center gap-1.5 font-semibold text-[var(--admin-muted)]">
          <Clock size={14} />
          {formatOrderDate(order.createdAt)}
        </p>
        <p className="flex items-center gap-1.5 font-semibold text-[var(--admin-muted)]">
          <Phone size={14} />
          {order.customer.phone}
        </p>
        <p className="font-bold">{order.items.productName ?? 'Produto não informado'}</p>
        <p className="text-[var(--admin-muted)]">
          {order.items.size ?? 'Sem tamanho'} • {getPaymentLabel(order.payment.method)} • {formatOrderTime(order.updatedAt)}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[oklch(89%_0.015_326_/_70%)] pt-4">
        <div>
          <span className="text-xs font-extrabold text-[var(--admin-muted)]">Total</span>
          <strong className="block text-lg text-[var(--admin-leaf)]">{formatCurrency(order.total)}</strong>
        </div>
        <button
          type="button"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[oklch(89%_0.015_326_/_82%)] px-3 text-sm font-bold text-[var(--admin-ink)] transition hover:bg-[var(--admin-muted-bg)]"
          onClick={() => onOpenDetails(order.trackingCode)}
        >
          <Eye size={15} />
          Ver detalhes
        </button>
      </div>
    </article>
  )
}
