import type { PizzaOrderDocument } from '../types/pizzaOrder'

export type OrderItemCount = { kind: 'pizza' | 'esfiha' | 'beverage'; label: string; count: number }

export function countOrderItems(orders: PizzaOrderDocument[]): OrderItemCount[] {
  const counts: OrderItemCount[] = [
    { kind: 'pizza', label: 'Pizzas grandes', count: 0 },
    { kind: 'esfiha', label: 'Esfihas', count: 0 },
    { kind: 'beverage', label: 'Bebidas', count: 0 },
  ]
  for (const order of orders) {
    if (order.status === 'cancelled') continue
    for (const item of order.items.lines) {
      const group = counts.find((entry) => entry.kind === item.kind)
      if (group) group.count += item.quantity
    }
  }
  return counts
}
