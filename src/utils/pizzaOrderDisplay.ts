import { pizzaOrderRules } from '../data/pizzaMenu'
import type { PersistedPizzaOrderItem, PizzaOrderDocument } from '../types/pizzaOrder'

export const pizzaItemLabels = { pizza: 'Pizza', esfiha: 'Esfiha', beverage: 'Bebida' } as const

export function formatPizzaOrderLine(item: PersistedPizzaOrderItem) {
  const size = item.kind === 'pizza' ? ` ${pizzaOrderRules.size}` : ''
  const border = item.kind === 'pizza' ? ` • ${item.borderName || 'Sem borda recheada'}` : ''
  return `${item.quantity}× ${pizzaItemLabels[item.kind]}${size}: ${item.name}${border}`
}

export function getPizzaOrderSummary(order: PizzaOrderDocument) {
  return order.items.lines.map(formatPizzaOrderLine).join('; ')
}
