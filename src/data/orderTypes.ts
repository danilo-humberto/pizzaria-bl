import orderAcaiIceCreamImage from '../assets/images/order-acai-icecream.png'
import orderAcaiImage from '../assets/images/order-acai.png'
import orderIceCreamImage from '../assets/images/order-icecream.png'
import type { OrderTypeId, OrderTypeOption } from '../types/order'

export const orderTypes: OrderTypeOption[] = [
  {
    id: 'acai',
    name: 'Só açaí',
    description: 'Açaí puro como base do pote',
    image: orderAcaiImage,
  },
  {
    id: 'acai-icecream',
    name: 'Açaí + 1 creme',
    description: 'Açaí com um sabor de creme',
    image: orderAcaiIceCreamImage,
  },
  {
    id: 'icecream',
    name: 'Só creme',
    description: 'Escolha até dois sabores de creme',
    image: orderIceCreamImage,
  },
]

export function orderTypeNeedsIceCreamFlavor(orderTypeId: OrderTypeId | '') {
  return getIceCreamFlavorLimit(orderTypeId) > 0
}

export function getIceCreamFlavorLimit(orderTypeId: OrderTypeId | '') {
  if (orderTypeId === 'icecream') {
    return 2
  }

  return orderTypeId === 'acai-icecream' ? 1 : 0
}
