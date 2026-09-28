import type { Order } from '../types/order'

export type OrderSizeLabel = 'P' | 'M' | 'G'

export type OrderSizeCount = {
  size: OrderSizeLabel
  count: number
}

const orderSizeLabels: OrderSizeLabel[] = ['P', 'M', 'G']

function normalizeOrderSize(size?: string): OrderSizeLabel | null {
  const normalizedSize = size?.trim().toLowerCase()

  if (!normalizedSize) {
    return null
  }

  if (normalizedSize === 'p' || normalizedSize.includes('pequeno') || normalizedSize.includes('300')) {
    return 'P'
  }

  if (normalizedSize === 'm' || normalizedSize.includes('medio') || normalizedSize.includes('médio') || normalizedSize.includes('500')) {
    return 'M'
  }

  if (normalizedSize === 'g' || normalizedSize.includes('grande') || normalizedSize.includes('700')) {
    return 'G'
  }

  return null
}

export function countOrdersBySize(orders: Order[]): OrderSizeCount[] {
  const counts = orderSizeLabels.reduce<Record<OrderSizeLabel, number>>(
    (accumulator, size) => ({
      ...accumulator,
      [size]: 0,
    }),
    {
      P: 0,
      M: 0,
      G: 0,
    },
  )

  orders.forEach((order) => {
    const size = normalizeOrderSize(order.items.size)

    if (size) {
      counts[size] += 1
    }
  })

  return orderSizeLabels.map((size) => ({
    size,
    count: counts[size],
  }))
}
