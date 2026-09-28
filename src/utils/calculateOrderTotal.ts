import { sizes } from '../data/sizes'
import type { OrderDraft } from '../types/order'
import { getExtraPortionsTotalCents } from './portionSelections'

export function calculateExtraPortionsTotal(order: OrderDraft) {
  const extraTotalCents =
    getExtraPortionsTotalCents(order.fruitSelections) +
    getExtraPortionsTotalCents(order.toppingSelections) +
    getExtraPortionsTotalCents(order.syrupSelection ? [order.syrupSelection] : [])

  return extraTotalCents / 100
}

export function calculateOrderTotal(order: OrderDraft) {
  const selectedSize = sizes.find((size) => size.id === order.sizeId)
  const sizePriceCents = Math.round((selectedSize?.price ?? 0) * 100)
  const extraPortionsTotalCents = Math.round(calculateExtraPortionsTotal(order) * 100)

  return (sizePriceCents + extraPortionsTotalCents) / 100
}
