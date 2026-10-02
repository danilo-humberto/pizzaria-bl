import { paymentMethods } from '../data/paymentMethods'
import type { Order, OrderStatus, PaymentMethod, PortionOrderItem } from '../types/order'
import { formatCurrency } from './formatCurrency'

export type OperationalOrderStatus = Exclude<OrderStatus, 'cancelled'>

export const orderStatusLabels: Record<OrderStatus, string> = {
  received: 'Recebidos',
  preparing: 'Em preparo',
  ready_for_pickup: 'Prontos para retirada',
  completed: 'Concluídos',
  cancelled: 'Cancelados',
}

export const orderStatusSingularLabels: Record<OrderStatus, string> = {
  received: 'Recebido',
  preparing: 'Em preparo',
  ready_for_pickup: 'Pronto para retirada',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

export const operationalOrderStatusColumns: OperationalOrderStatus[] = [
  'received',
  'preparing',
  'ready_for_pickup',
  'completed',
]

export const orderStatusColumns = operationalOrderStatusColumns

export const orderStatusTheme: Record<
  OrderStatus,
  {
    border: string
    topBorder: string
    accent: string
    soft: string
    text: string
    badge: string
    button: string
  }
> = {
  received: {
    border: 'border-[var(--admin-success-border)]',
    topBorder: 'border-t-[var(--admin-leaf)]',
    accent: 'bg-[var(--admin-leaf)]',
    soft: 'bg-[var(--success-soft)]',
    text: 'text-[var(--admin-leaf)]',
    badge: 'bg-[var(--success-soft)] text-[var(--admin-leaf)]',
    button: 'bg-[var(--admin-leaf)] hover:bg-[var(--admin-leaf-hover)]',
  },
  preparing: {
    border: 'border-[var(--admin-warning-soft)]',
    topBorder: 'border-t-[var(--admin-warning)]',
    accent: 'bg-[var(--admin-warning)]',
    soft: 'bg-[var(--admin-warning-soft)]',
    text: 'text-[var(--admin-warning)]',
    badge: 'bg-[var(--admin-warning-soft)] text-[var(--admin-warning)]',
    button: 'bg-[var(--admin-warning)] hover:bg-[var(--admin-warning-hover)]',
  },
  ready_for_pickup: {
    border: 'border-[var(--brand-primary-soft)]',
    topBorder: 'border-t-[var(--brand-primary)]',
    accent: 'bg-[var(--brand-primary)]',
    soft: 'bg-[var(--brand-primary-soft)]',
    text: 'text-[var(--brand-primary)]',
    badge: 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]',
    button: 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)]',
  },
  completed: {
    border: 'border-[var(--success-soft)]',
    topBorder: 'border-t-[var(--success)]',
    accent: 'bg-[var(--success)]',
    soft: 'bg-[var(--success-soft)]',
    text: 'text-[var(--success)]',
    badge: 'bg-[var(--success-soft)] text-[var(--success)]',
    button: 'bg-[var(--success)] hover:bg-[var(--admin-leaf-hover)]',
  },
  cancelled: {
    border: 'border-[var(--admin-danger-border)]',
    topBorder: 'border-t-[var(--admin-danger)]',
    accent: 'bg-[var(--admin-danger)]',
    soft: 'bg-[var(--admin-danger-bg)]',
    text: 'text-[var(--admin-danger)]',
    badge: 'bg-[var(--admin-danger-bg)] text-[var(--admin-danger)]',
    button: 'bg-[var(--admin-danger)] hover:bg-[var(--error)]',
  },
}

export function formatStatusCount(count: number) {
  return count >= 10 ? String(count) : String(count).padStart(2, '0')
}

export function getPaymentLabel(method?: PaymentMethod) {
  return paymentMethods.find((paymentMethod) => paymentMethod.id === method)?.name ?? 'Não informado'
}

export function formatOrderList(items?: string[], emptyText = 'Nenhum') {
  return items?.length ? items.join(', ') : emptyText
}

function getOrderPortions(
  portions: PortionOrderItem[] | undefined,
  legacyNames: string[] | undefined,
): PortionOrderItem[] {
  if (portions?.length) {
    return portions
  }

  return (legacyNames ?? []).map((name, index) => ({
    id: `legacy-${index}`,
    name,
    quantity: 1,
    extraUnitPriceCents: 0,
    extraSubtotalCents: 0,
  }))
}

export function getOrderFruitPortions(items: Order['items']) {
  return getOrderPortions(items.fruitPortions, items.fruits)
}

export function getOrderToppingPortions(items: Order['items']) {
  return getOrderPortions(items.toppingPortions, items.toppings)
}

export function getOrderSyrupPortion(items: Order['items']): PortionOrderItem | null {
  if (items.syrupPortion) {
    return items.syrupPortion
  }

  if (items.syrup && items.syrup !== 'Sem calda') {
    return {
      id: items.syrupId ?? 'legacy-syrup',
      name: items.syrup,
      quantity: 1,
      extraUnitPriceCents: 0,
      extraSubtotalCents: 0,
    }
  }

  return null
}

export function formatOrderPortions(portions: PortionOrderItem[], emptyText = 'Nenhum') {
  if (portions.length === 0) {
    return emptyText
  }

  return portions
    .map((portion) => {
      const extraText = portion.extraSubtotalCents
        ? ` (+ ${formatCurrency(portion.extraSubtotalCents / 100)})`
        : ''

      return `${portion.name} ${portion.quantity}x${extraText}`
    })
    .join(', ')
}

export function formatOrderSyrup(items: Order['items']) {
  const syrupPortion = getOrderSyrupPortion(items)

  return syrupPortion
    ? formatOrderPortions([syrupPortion])
    : items.syrup ?? 'Sem calda'
}

export function getOrderIceCreamFlavors(items: Order['items']) {
  if (items.iceCreamFlavors?.length) {
    return items.iceCreamFlavors
  }

  return items.iceCreamFlavor ? [items.iceCreamFlavor] : []
}

export function parseOrderDate(value?: unknown) {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return value
  }

  if (typeof value === 'string') {
    const date = new Date(value)

    return Number.isNaN(date.getTime()) ? null : date
  }

  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate() as Date
  }

  return null
}

export function formatOrderDate(value?: unknown) {
  const date = parseOrderDate(value)

  if (!date) {
    return 'Data não informada'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatOrderTime(value?: unknown) {
  const date = parseOrderDate(value)

  if (!date) {
    return '--:--'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatOrderShortDateTime(value?: unknown) {
  const date = parseOrderDate(value)

  if (!date) {
    return '--:--'
  }

  const time = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)

  const today = new Date()
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()

  if (isToday) {
    return `Hoje, ${time}`
  }

  const day = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date)

  return `${day}, ${time}`
}

export function getNextOrderStatus(status: OrderStatus): OrderStatus | null {
  if (status === 'received') {
    return 'preparing'
  }

  if (status === 'preparing') {
    return 'ready_for_pickup'
  }

  if (status === 'ready_for_pickup') {
    return 'completed'
  }

  return null
}

export function getNextOrderActionLabel(status: OrderStatus) {
  if (status === 'received') {
    return 'Iniciar'
  }

  if (status === 'preparing') {
    return 'Pronto'
  }

  if (status === 'ready_for_pickup') {
    return 'Concluir'
  }

  return null
}

export function canCancelOrder(status: OrderStatus) {
  return status === 'received' || status === 'preparing' || status === 'ready_for_pickup'
}
