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
    border: 'border-[oklch(48%_0.14_126_/_24%)]',
    topBorder: 'border-t-[var(--admin-leaf)]',
    accent: 'bg-[var(--admin-leaf)]',
    soft: 'bg-[oklch(72%_0.14_126_/_16%)]',
    text: 'text-[var(--admin-leaf)]',
    badge: 'bg-[oklch(72%_0.14_126_/_18%)] text-[var(--admin-leaf)]',
    button: 'bg-[var(--admin-leaf)] hover:bg-[var(--admin-leaf-hover)]',
  },
  preparing: {
    border: 'border-[oklch(62%_0.17_46_/_24%)]',
    topBorder: 'border-t-[oklch(62%_0.17_46)]',
    accent: 'bg-[oklch(62%_0.17_46)]',
    soft: 'bg-[oklch(86%_0.12_72_/_24%)]',
    text: 'text-[oklch(48%_0.16_46)]',
    badge: 'bg-[oklch(86%_0.12_72_/_24%)] text-[oklch(48%_0.16_46)]',
    button: 'bg-[oklch(55%_0.18_46)] hover:bg-[oklch(61%_0.18_46)]',
  },
  ready_for_pickup: {
    border: 'border-[oklch(43%_0.13_286_/_24%)]',
    topBorder: 'border-t-[oklch(43%_0.13_286)]',
    accent: 'bg-[oklch(43%_0.13_286)]',
    soft: 'bg-[oklch(78%_0.08_286_/_20%)]',
    text: 'text-[oklch(39%_0.13_286)]',
    badge: 'bg-[oklch(78%_0.08_286_/_22%)] text-[oklch(39%_0.13_286)]',
    button: 'bg-[oklch(43%_0.13_286)] hover:bg-[oklch(49%_0.14_286)]',
  },
  completed: {
    border: 'border-[oklch(52%_0.11_176_/_24%)]',
    topBorder: 'border-t-[oklch(52%_0.11_176)]',
    accent: 'bg-[oklch(52%_0.11_176)]',
    soft: 'bg-[oklch(82%_0.08_176_/_20%)]',
    text: 'text-[oklch(39%_0.1_176)]',
    badge: 'bg-[oklch(82%_0.08_176_/_22%)] text-[oklch(39%_0.1_176)]',
    button: 'bg-[oklch(52%_0.11_176)] hover:bg-[oklch(57%_0.12_176)]',
  },
  cancelled: {
    border: 'border-[var(--admin-danger-border)]',
    topBorder: 'border-t-[var(--admin-danger)]',
    accent: 'bg-[var(--admin-danger)]',
    soft: 'bg-[var(--admin-danger-bg)]',
    text: 'text-[var(--admin-danger)]',
    badge: 'bg-[var(--admin-danger-bg)] text-[var(--admin-danger)]',
    button: 'bg-[var(--admin-danger)] hover:bg-[oklch(50%_0.18_26)]',
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
