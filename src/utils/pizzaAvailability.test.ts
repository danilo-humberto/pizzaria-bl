import { describe, expect, it } from 'vitest'
import { emptyPizzaAvailability } from '../types/pizzaAvailability'
import { isPizzaItemAvailable, normalizePizzaAvailability, pizzaAvailabilityCategories } from './pizzaAvailability'

describe('disponibilidade da pizzaria', () => {
  it('documento ausente significa todas as opções disponíveis', () => {
    expect(normalizePizzaAvailability(undefined)).toEqual(emptyPizzaAvailability)
    for (const category of pizzaAvailabilityCategories) {
      expect(category.items.every((item) => isPizzaItemAvailable(emptyPizzaAvailability, category.id, item.id))).toBe(true)
    }
  })
  it('usa as quatro listas do contrato, sem confundir IDs entre pizza, borda e esfiha', () => {
    expect(pizzaAvailabilityCategories.map((category) => category.id)).toEqual(['pizzaFlavorIds', 'borderIds', 'esfihaIds', 'beverageIds'])
    const availability = normalizePizzaAvailability({ pizzaFlavorIds: ['mussarela', 'mussarela', 1], borderIds: [], esfihaIds: [], beverageIds: null })
    expect(availability.pizzaFlavorIds).toEqual(['mussarela'])
    expect(isPizzaItemAvailable(availability, 'pizzaFlavorIds', 'mussarela')).toBe(false)
    expect(isPizzaItemAvailable(availability, 'borderIds', 'mussarela')).toBe(true)
    expect(isPizzaItemAvailable(availability, 'esfihaIds', 'mussarela')).toBe(true)
  })
})
