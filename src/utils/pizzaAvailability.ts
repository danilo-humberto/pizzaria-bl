import { beverages, esfihas, pizzaBorders, pizzas } from '../data/pizzaMenu'
import type { PizzaAvailability } from '../types/pizzaAvailability'

export type PizzaAvailabilityCategory = keyof PizzaAvailability
export type PizzaAvailabilityItem = { id: string; name: string }
export type PizzaAvailabilityCategoryDefinition = {
  id: PizzaAvailabilityCategory
  title: string
  description: string
  items: PizzaAvailabilityItem[]
}

export const pizzaAvailabilityCategories: PizzaAvailabilityCategoryDefinition[] = [
  { id: 'pizzaFlavorIds', title: 'Sabores de pizza', description: 'Esgotar um sabor também bloqueia as combinações meio a meio que o utilizam.', items: pizzas },
  { id: 'borderIds', title: 'Bordas', description: 'Bordas recheadas. A opção sem borda permanece disponível.', items: pizzaBorders },
  { id: 'esfihaIds', title: 'Esfihas', description: 'Sabores de esfiha disponíveis na loja.', items: esfihas },
  { id: 'beverageIds', title: 'Bebidas', description: 'Bebidas e tamanhos do cardápio.', items: beverages },
]

export function normalizePizzaAvailability(value: unknown): PizzaAvailability {
  const data = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const ids = (field: PizzaAvailabilityCategory) => Array.isArray(data[field])
    ? [...new Set(data[field].filter((id): id is string => typeof id === 'string'))]
    : []
  return { pizzaFlavorIds: ids('pizzaFlavorIds'), borderIds: ids('borderIds'), esfihaIds: ids('esfihaIds'), beverageIds: ids('beverageIds') }
}

export function isPizzaItemAvailable(availability: PizzaAvailability, category: PizzaAvailabilityCategory, id: string) {
  return !availability[category].includes(id)
}
