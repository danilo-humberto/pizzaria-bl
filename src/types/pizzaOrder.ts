import type { CustomerData, OrderStatus, PaymentData, PaymentMethod } from './order'
import type { PizzaAvailability } from './pizzaAvailability'

export type PizzaOrderItem = {
  id: string
  kind: 'pizza' | 'esfiha' | 'beverage'
  optionId: string
  quantity: number
  borderId?: string
}

export type PizzaOrderDraft = {
  items: PizzaOrderItem[]
  customer: CustomerData
  payment: PaymentData
  observation: string
}

export type PizzaBorderQuantities = Record<string, number>

export type PersistedPizzaOrderItem = Omit<PizzaOrderItem, 'id'> & {
  name: string
  unitPriceCents: number
  subtotalCents: number
  borderName?: string
}

// Contrato para as etapas 6 e 7; não conecta o envio da demonstração.
export type PizzaOrderDocument = {
  schemaVersion: 1
  publicCode: string
  trackingCode: string
  status: OrderStatus
  customer: CustomerData
  fulfillment: 'pickup'
  items: PizzaAvailability & {
    lines: PersistedPizzaOrderItem[]
    observation: string
  }
  payment: { method: PaymentMethod; needsChange: boolean; changeFor?: number }
  total: number
  createdAt: unknown
  updatedAt: unknown
}

export type PizzaAdditionResult =
  | { ok: true; addedItems: PizzaOrderItem[] }
  | { ok: false; error: string }

export type PizzaOrderValidation = {
  isValid: boolean
  errors: string[]
  fieldErrors: Partial<Record<'items' | 'customer.name' | 'customer.phone' | 'payment.method', string>>
}
