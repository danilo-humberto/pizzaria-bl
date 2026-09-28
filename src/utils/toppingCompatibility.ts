import type { PortionSelection } from '../types/order'

const SMALL_SIZE_RESTRICTED_TOPPING_IDS = new Set(['pacoca', 'canudo'])

export function isToppingAllowedForSize(sizeId: string, toppingId: string) {
  return sizeId !== 'p' || !SMALL_SIZE_RESTRICTED_TOPPING_IDS.has(toppingId)
}

export function filterToppingSelectionsForSize(
  sizeId: string,
  selections: PortionSelection[],
) {
  return selections.filter((selection) => isToppingAllowedForSize(sizeId, selection.id))
}

export function getDisallowedToppingIdsForSize(
  sizeId: string,
  selections: PortionSelection[],
) {
  return selections
    .filter((selection) => !isToppingAllowedForSize(sizeId, selection.id))
    .map((selection) => selection.id)
}
