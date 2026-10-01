import { beverages, esfihas, halfAndHalfPizzas, pizzaBorders, pizzaOrderRules, pizzas } from '../data/pizzaMenu'
import { paymentMethods } from '../data/paymentMethods'
import type { PizzaBorderQuantities, PizzaOrderDraft, PizzaOrderItem, PizzaOrderValidation } from '../types/pizzaOrder'
import { getPhoneDigits, isCompletePhoneNumber } from './phone'

export function getPizzaOption(item: Pick<PizzaOrderItem, 'kind' | 'optionId'>) {
  if (item.kind === 'pizza') return pizzas.find((option) => option.id === item.optionId) ?? halfAndHalfPizzas.find((option) => option.id === item.optionId)
  if (item.kind === 'esfiha') return esfihas.find((option) => option.id === item.optionId)
  return beverages.find((option) => option.id === item.optionId)
}

export function getPizzaFlavorIds(optionId: string): string[] {
  if (pizzas.some((option) => option.id === optionId)) return [optionId]
  return halfAndHalfPizzas.find((option) => option.id === optionId)?.flavorIds ?? []
}

export function getFlavorQuantity(items: PizzaOrderItem[], flavorId: string) {
  return items.reduce((total, item) => total + (item.kind === 'pizza' && getPizzaFlavorIds(item.optionId).includes(flavorId) ? item.quantity : 0), 0)
}

export function getPizzaItemTotalCents(item: Omit<PizzaOrderItem, 'id'>) {
  const price = getPizzaOption(item)?.price ?? 0
  const borderPrice = item.kind === 'pizza' ? pizzaBorders.find((border) => border.id === item.borderId)?.price ?? 0 : 0
  return (Math.round(price * 100) + Math.round(borderPrice * 100)) * item.quantity
}

type PizzaAdditionDraftResult =
  | { ok: true; items: Omit<PizzaOrderItem, 'id'>[] }
  | { ok: false; error: string }

export function buildPizzaAddition(existingItems: PizzaOrderItem[], optionId: string, quantity: number, borderQuantities: PizzaBorderQuantities): PizzaAdditionDraftResult {
  const flavorIds = getPizzaFlavorIds(optionId)
  if (flavorIds.length === 0) return { ok: false, error: 'Escolha uma pizza do cardápio.' }
  if (!Number.isSafeInteger(quantity) || quantity < 1) return { ok: false, error: 'Informe uma quantidade válida de pizzas.' }

  let withBorder = 0
  for (const [borderId, count] of Object.entries(borderQuantities)) {
    if (!pizzaBorders.some((border) => border.id === borderId)) return { ok: false, error: 'Escolha uma borda do cardápio.' }
    if (!Number.isSafeInteger(count) || count < 0 || count > quantity) return { ok: false, error: 'Informe uma quantidade válida para cada borda.' }
    withBorder += count
    if (withBorder > quantity) return { ok: false, error: 'A quantidade de bordas não pode ultrapassar a quantidade de pizzas.' }
  }
  if (flavorIds.some((flavorId) => getFlavorQuantity(existingItems, flavorId) + quantity > pizzaOrderRules.maxQuantityPerFlavorPerOrder)) {
    return { ok: false, error: `Cada sabor pode ter no máximo ${pizzaOrderRules.maxQuantityPerFlavorPerOrder} pizzas por pedido. Meio a meio conta para os dois sabores.` }
  }

  const items: Omit<PizzaOrderItem, 'id'>[] = pizzaBorders.flatMap((border) => {
    const count = borderQuantities[border.id] ?? 0
    return count > 0 ? [{ kind: 'pizza' as const, optionId, quantity: count, borderId: border.id }] : []
  })
  if (withBorder < quantity) items.push({ kind: 'pizza', optionId, quantity: quantity - withBorder })
  return { ok: true, items }
}

export function calculatePizzaOrderTotal(order: PizzaOrderDraft) {
  return order.items.reduce((total, item) => total + getPizzaItemTotalCents(item), 0) / 100
}

export function validatePizzaOrder(order: PizzaOrderDraft): PizzaOrderValidation {
  const errors: string[] = []
  const fieldErrors: PizzaOrderValidation['fieldErrors'] = {}
  const add = (field: keyof typeof fieldErrors, message: string) => {
    errors.push(message)
    fieldErrors[field] ??= message
  }

  if (order.items.length === 0) add('items', 'Adicione pelo menos um item ao pedido.')
  for (const item of order.items) {
    if (!getPizzaOption(item) || !Number.isSafeInteger(item.quantity) || item.quantity < 1) {
      add('items', 'Há um item ou quantidade inválida no pedido.')
      break
    }
    if (item.kind === 'pizza' && item.borderId && !pizzaBorders.some((border) => border.id === item.borderId)) {
      add('items', 'A borda escolhida não está no cardápio.')
      break
    }
  }
  for (const pizza of pizzas) {
    if (getFlavorQuantity(order.items, pizza.id) > pizzaOrderRules.maxQuantityPerFlavorPerOrder) {
      add('items', `O limite de ${pizzaOrderRules.maxQuantityPerFlavorPerOrder} pizzas com sabor ${pizza.name} foi ultrapassado.`)
    }
  }
  if (!order.customer.name.trim()) add('customer.name', 'Informe o nome do cliente.')
  if (!getPhoneDigits(order.customer.phone)) add('customer.phone', 'Informe o telefone do cliente.')
  else if (!isCompletePhoneNumber(order.customer.phone)) add('customer.phone', 'Informe um telefone com DDD.')
  if (!paymentMethods.some((method) => method.id === order.payment.method)) add('payment.method', 'Escolha a forma de pagamento.')

  return { isValid: errors.length === 0, errors, fieldErrors }
}
