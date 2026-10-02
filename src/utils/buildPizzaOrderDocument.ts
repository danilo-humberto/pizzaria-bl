import { pizzaBorders } from '../data/pizzaMenu'
import { SHOW_CASH_CHANGE_DETAILS } from '../data/paymentMethods'
import type { PaymentMethod } from '../types/order'
import type { PizzaOrderDocument, PizzaOrderDraft } from '../types/pizzaOrder'
import { parseBRLCurrencyInput } from './formatCurrency'
import { getPizzaFlavorIds, getPizzaItemTotalCents, getPizzaOption, validatePizzaOrder } from './pizzaOrder'

// A etapa de integração fornecerá serverTimestamp() sem inicializar Firebase aqui.
export function buildPizzaOrderDocument(
  draft: PizzaOrderDraft,
  publicCode: string,
  trackingCode: string,
  timestamp: unknown,
): PizzaOrderDocument {
  const validation = validatePizzaOrder(draft)
  if (!validation.isValid) throw new Error(validation.errors.join(' '))
  if (!publicCode.trim() || !trackingCode.trim()) throw new Error('Código do pedido obrigatório.')

  const lines = draft.items.map((item) => {
    if (!['pizza', 'esfiha', 'beverage'].includes(item.kind) || (item.kind !== 'pizza' && item.borderId)) {
      throw new Error('Tipo de item ou borda inválida.')
    }
    const option = getPizzaOption(item)!
    const border = item.borderId ? pizzaBorders.find((candidate) => candidate.id === item.borderId) : undefined
    const subtotalCents = getPizzaItemTotalCents(item)
    if (!Number.isSafeInteger(subtotalCents)) throw new Error('Valor do item fora do intervalo suportado.')
    return {
      kind: item.kind,
      optionId: item.optionId,
      name: option.name,
      quantity: item.quantity,
      unitPriceCents: getPizzaItemTotalCents({ ...item, quantity: 1 }),
      subtotalCents,
      ...(border ? { borderId: border.id, borderName: border.name } : {}),
    }
  })
  const totalCents = lines.reduce((sum, item) => sum + item.subtotalCents, 0)
  if (!Number.isSafeInteger(totalCents)) throw new Error('Total fora do intervalo suportado.')
  const unique = (values: string[]) => [...new Set(values)]
  const needsChange = SHOW_CASH_CHANGE_DETAILS && draft.payment.method === 'cash' && draft.payment.needsChange

  return {
    schemaVersion: 1,
    publicCode,
    trackingCode,
    status: 'received',
    customer: { name: draft.customer.name.trim(), phone: draft.customer.phone.trim() },
    fulfillment: 'pickup',
    items: {
      lines,
      pizzaFlavorIds: unique(lines.filter((item) => item.kind === 'pizza').flatMap((item) => getPizzaFlavorIds(item.optionId))),
      borderIds: unique(lines.flatMap((item) => item.borderId ? [item.borderId] : [])),
      esfihaIds: unique(lines.filter((item) => item.kind === 'esfiha').map((item) => item.optionId)),
      beverageIds: unique(lines.filter((item) => item.kind === 'beverage').map((item) => item.optionId)),
      observation: draft.observation.trim(),
    },
    payment: {
      method: draft.payment.method as PaymentMethod,
      needsChange,
      ...(needsChange ? { changeFor: parseBRLCurrencyInput(draft.payment.changeFor) } : {}),
    },
    total: totalCents / 100,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}
