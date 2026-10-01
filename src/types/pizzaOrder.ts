import type { CustomerData, PaymentData } from './order'

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

export type PizzaAdditionResult =
  | { ok: true; addedItems: PizzaOrderItem[] }
  | { ok: false; error: string }

export type PizzaOrderValidation = {
  isValid: boolean
  errors: string[]
  fieldErrors: Partial<Record<'items' | 'customer.name' | 'customer.phone' | 'payment.method', string>>
}
