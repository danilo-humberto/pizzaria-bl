import type { PizzaOrderDocument } from '../types/pizzaOrder'

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

// Valida o formato usado na apresentação, sem recalcular preços de pedidos já salvos.
export function readPizzaOrder(value: unknown): PizzaOrderDocument {
  const items = isRecord(value) && isRecord(value.items) ? value.items : {}
  if (!isRecord(value) || value.schemaVersion !== 1 || value.fulfillment !== 'pickup'
    || typeof value.publicCode !== 'string' || typeof value.trackingCode !== 'string'
    || !['received', 'preparing', 'ready_for_pickup', 'completed', 'cancelled'].includes(String(value.status))
    || !isRecord(value.customer) || typeof value.customer.name !== 'string' || typeof value.customer.phone !== 'string'
    || !isRecord(value.payment) || !['pix', 'card', 'cash'].includes(String(value.payment.method))
    || typeof value.total !== 'number' || !Number.isFinite(value.total)
    || !isRecord(value.items) || !Array.isArray(value.items.lines) || !value.items.lines.length
    || typeof value.items.observation !== 'string'
    || !['pizzaFlavorIds', 'borderIds', 'esfihaIds', 'beverageIds'].every((field) =>
      Array.isArray(items[field]) && items[field].every((id: unknown) => typeof id === 'string'))
    || !value.items.lines.every((line: unknown) => isRecord(line)
      && ['pizza', 'esfiha', 'beverage'].includes(String(line.kind))
      && typeof line.optionId === 'string' && typeof line.name === 'string'
      && typeof line.quantity === 'number' && Number.isSafeInteger(line.quantity) && line.quantity > 0
      && typeof line.unitPriceCents === 'number' && Number.isSafeInteger(line.unitPriceCents)
      && typeof line.subtotalCents === 'number' && Number.isSafeInteger(line.subtotalCents)
      && (line.borderName === undefined || typeof line.borderName === 'string'))) {
    throw new Error('Pedido incompatível com o contrato de pizza.')
  }
  return value as PizzaOrderDocument
}
