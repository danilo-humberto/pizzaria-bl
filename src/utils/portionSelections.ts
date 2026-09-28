import type { PortionOrderItem, PortionSelection } from '../types/order'

export const EXTRA_PORTION_PRICE_CENTS = 50

type PortionCatalogItem = {
  id: string
  name: string
}

export function getSelectionQuantity(selections: PortionSelection[], id: string) {
  return selections.find((selection) => selection.id === id)?.quantity ?? 0
}

export function getPortionSelectionIds(selections: PortionSelection[]) {
  return selections.map((selection) => selection.id)
}

export function togglePortionSelection(selections: PortionSelection[], id: string) {
  return getSelectionQuantity(selections, id) > 0
    ? selections.filter((selection) => selection.id !== id)
    : [...selections, { id, quantity: 1 }]
}

export function incrementPortionSelection(selections: PortionSelection[], id: string) {
  const quantity = getSelectionQuantity(selections, id)

  if (quantity === 0) {
    return [...selections, { id, quantity: 1 }]
  }

  return selections.map((selection) =>
    selection.id === id ? { ...selection, quantity: selection.quantity + 1 } : selection,
  )
}

export function decrementPortionSelection(selections: PortionSelection[], id: string) {
  const quantity = getSelectionQuantity(selections, id)

  if (quantity <= 1) {
    return selections.filter((selection) => selection.id !== id)
  }

  return selections.map((selection) =>
    selection.id === id ? { ...selection, quantity: selection.quantity - 1 } : selection,
  )
}

export function getExtraPortionCount(selections: PortionSelection[]) {
  return selections.reduce(
    (total, selection) => total + Math.max(Math.trunc(selection.quantity) - 1, 0),
    0,
  )
}

export function getExtraPortionsTotalCents(selections: PortionSelection[]) {
  return getExtraPortionCount(selections) * EXTRA_PORTION_PRICE_CENTS
}

export function buildPortionOrderItems(
  catalog: PortionCatalogItem[],
  selections: PortionSelection[],
): PortionOrderItem[] {
  const quantityById = new Map(
    selections.map((selection) => [selection.id, Math.max(Math.trunc(selection.quantity), 1)]),
  )

  return catalog.flatMap((item) => {
    const quantity = quantityById.get(item.id)

    if (!quantity) {
      return []
    }

    return [
      {
        id: item.id,
        name: item.name,
        quantity,
        extraUnitPriceCents: EXTRA_PORTION_PRICE_CENTS,
        extraSubtotalCents: Math.max(quantity - 1, 0) * EXTRA_PORTION_PRICE_CENTS,
      },
    ]
  })
}
