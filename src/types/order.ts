export type PricedOption = {
  id: string
  name: string
  description: string
  price: number
  image?: string
}

export type SizeOption = PricedOption & {
  volume: string
}

export type OrderTypeId = 'acai' | 'acai-icecream' | 'icecream'

export type OrderTypeOption = {
  id: OrderTypeId
  name: string
  description: string
  image?: string
}

export type IceCreamFlavorOption = {
  id: string
  name: string
  description: string
}

export type FruitOption = PricedOption

export type ToppingOption = PricedOption

export type SyrupOption = PricedOption

export type PortionSelection = {
  id: string
  quantity: number
}

export type PortionOrderItem = PortionSelection & {
  name: string
  extraUnitPriceCents: number
  extraSubtotalCents: number
}

export type PaymentMethod = 'pix' | 'card' | 'cash'

export type PaymentMethodId = PaymentMethod

export type PaymentMethodOption = {
  id: PaymentMethodId
  name: string
  description: string
}

export type CustomerData = {
  name: string
  phone: string
}

export type PaymentData = {
  method: PaymentMethod | ''
  needsChange: boolean
  changeFor: string
}

export type OrderDraft = {
  sizeId: string
  orderTypeId: OrderTypeId | ''
  iceCreamFlavorIds: string[]
  fruitSelections: PortionSelection[]
  toppingSelections: PortionSelection[]
  syrupSelection: PortionSelection | null
  observation: string
  customer: CustomerData
  payment: PaymentData
}

export type OrderStatus =
  | 'received'
  | 'preparing'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled'

export type Order = {
  id?: string
  publicCode: string
  trackingCode: string
  status: OrderStatus
  customer: CustomerData
  items: {
    productName?: string
    size?: string
    iceCreamFlavorIds?: string[]
    iceCreamFlavors?: string[]
    iceCreamFlavorId?: string
    iceCreamFlavor?: string
    fruitIds?: string[]
    fruits?: string[]
    fruitPortions?: PortionOrderItem[]
    toppingIds?: string[]
    toppings?: string[]
    toppingPortions?: PortionOrderItem[]
    syrupId?: string
    syrup?: string
    syrupPortion?: PortionOrderItem
    observation?: string
  }
  payment: {
    method?: PaymentMethod
    needsChange?: boolean
    changeFor?: number
  }
  total: number
  createdAt?: unknown
  updatedAt?: unknown
}

export type OrderConfirmationData = {
  publicCode: string
  trackingCode: string
  trackingUrl: string
}

export type OrderValidationField =
  | 'sizeId'
  | 'orderTypeId'
  | 'iceCreamFlavorIds'
  | 'toppingSelections'
  | 'customer.name'
  | 'customer.phone'
  | 'payment.method'
  | 'payment.changeFor'

export type OrderValidation = {
  isValid: boolean
  errors: string[]
  fieldErrors: Partial<Record<OrderValidationField, string>>
}

export type OrderStep = {
  id: string
  title: string
  description: string
}
