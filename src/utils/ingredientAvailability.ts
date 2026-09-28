import { fruits } from '../data/fruits'
import { iceCreamFlavors } from '../data/iceCreamFlavors'
import { syrups } from '../data/syrups'
import { toppings } from '../data/toppings'
import type {
  AvailabilityCategoryDefinition,
  AvailabilityField,
  IngredientAvailability,
  IngredientCategory,
} from '../types/availability'
import type { OrderDraft } from '../types/order'
import { getPortionSelectionIds } from './portionSelections'

export const emptyIngredientAvailability: IngredientAvailability = {
  creamFlavorIds: [],
  fruitIds: [],
  toppingIds: [],
  syrupIds: [],
}

export const availabilityFieldByCategory: Record<IngredientCategory, AvailabilityField> = {
  creamFlavors: 'creamFlavorIds',
  fruits: 'fruitIds',
  toppings: 'toppingIds',
  syrups: 'syrupIds',
}

export const availabilityCategories: AvailabilityCategoryDefinition[] = [
  {
    id: 'creamFlavors',
    title: 'Sabores de creme',
    description: 'Sabores oferecidos nos pedidos com creme.',
    items: iceCreamFlavors,
  },
  {
    id: 'fruits',
    title: 'Frutas',
    description: 'Frutas disponíveis para complementar o pedido.',
    items: fruits,
  },
  {
    id: 'toppings',
    title: 'Guloseimas',
    description: 'Guloseimas e complementos do açaí.',
    items: toppings,
  },
  {
    id: 'syrups',
    title: 'Caldas',
    description: 'A opção “Sem calda” permanece sempre disponível.',
    items: syrups.filter((syrup) => syrup.id !== 'sem-calda'),
  },
]

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return [...new Set(value.filter((item): item is string => typeof item === 'string'))]
}

export function normalizeIngredientAvailability(value: unknown): IngredientAvailability {
  const data = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

  return {
    creamFlavorIds: normalizeStringArray(data.creamFlavorIds),
    fruitIds: normalizeStringArray(data.fruitIds),
    toppingIds: normalizeStringArray(data.toppingIds),
    syrupIds: normalizeStringArray(data.syrupIds).filter((id) => id !== 'sem-calda'),
  }
}

export function isIngredientAvailable(
  availability: IngredientAvailability,
  category: IngredientCategory,
  ingredientId: string,
) {
  if (category === 'syrups' && ingredientId === 'sem-calda') {
    return true
  }

  return !availability[availabilityFieldByCategory[category]].includes(ingredientId)
}

export type UnavailableOrderIngredient = {
  category: IngredientCategory
  id: string
  name: string
}

export function getUnavailableOrderIngredients(
  order: OrderDraft,
  availability: IngredientAvailability,
): UnavailableOrderIngredient[] {
  const selectedByCategory: Record<IngredientCategory, string[]> = {
    creamFlavors: order.iceCreamFlavorIds,
    fruits: getPortionSelectionIds(order.fruitSelections),
    toppings: getPortionSelectionIds(order.toppingSelections),
    syrups: order.syrupSelection ? [order.syrupSelection.id] : [],
  }

  return availabilityCategories.flatMap((category) => {
    const selectedIds = selectedByCategory[category.id]

    return category.items
      .filter(
        (item) =>
          selectedIds.includes(item.id) &&
          !isIngredientAvailable(availability, category.id, item.id),
      )
      .map((item) => ({ category: category.id, id: item.id, name: item.name }))
  })
}

export function removeUnavailableIngredients(
  order: OrderDraft,
  availability: IngredientAvailability,
) {
  const unavailableItems = getUnavailableOrderIngredients(order, availability)

  if (unavailableItems.length === 0) {
    return { order, removedItems: unavailableItems }
  }

  const unavailableIds = new Set(unavailableItems.map((item) => `${item.category}:${item.id}`))

  return {
    order: {
      ...order,
      iceCreamFlavorIds: order.iceCreamFlavorIds.filter(
        (id) => !unavailableIds.has(`creamFlavors:${id}`),
      ),
      fruitSelections: order.fruitSelections.filter(
        (selection) => !unavailableIds.has(`fruits:${selection.id}`),
      ),
      toppingSelections: order.toppingSelections.filter(
        (selection) => !unavailableIds.has(`toppings:${selection.id}`),
      ),
      syrupSelection:
        order.syrupSelection && unavailableIds.has(`syrups:${order.syrupSelection.id}`)
          ? null
          : order.syrupSelection,
    },
    removedItems: unavailableItems,
  }
}

export class UnavailableIngredientsError extends Error {
  readonly ingredientNames: string[]

  constructor(ingredientNames: string[]) {
    super(`Ingredientes indisponíveis: ${ingredientNames.join(', ')}`)
    this.name = 'UnavailableIngredientsError'
    this.ingredientNames = ingredientNames
  }
}
