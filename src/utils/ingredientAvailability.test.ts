import { describe, expect, it } from 'vitest'
import type { OrderDraft } from '../types/order'
import {
  emptyIngredientAvailability,
  getUnavailableOrderIngredients,
  isIngredientAvailable,
  normalizeIngredientAvailability,
  removeUnavailableIngredients,
} from './ingredientAvailability'

const order: OrderDraft = {
  sizeId: 'm',
  orderTypeId: 'icecream',
  iceCreamFlavorIds: ['chocomenta', 'morango'],
  fruitSelections: [
    { id: 'banana', quantity: 3 },
    { id: 'morango', quantity: 1 },
  ],
  toppingSelections: [
    { id: 'granola', quantity: 1 },
    { id: 'mms', quantity: 2 },
  ],
  syrupSelection: { id: 'chocolate', quantity: 3 },
  observation: '',
  customer: { name: 'Cliente', phone: '(99) 99999-9999' },
  payment: { method: 'pix', needsChange: false, changeFor: '' },
}

describe('ingredientAvailability', () => {
  it('considera todos os ingredientes disponíveis quando não há configuração', () => {
    expect(normalizeIngredientAvailability(undefined)).toEqual(emptyIngredientAvailability)
    expect(isIngredientAvailable(emptyIngredientAvailability, 'creamFlavors', 'chocomenta')).toBe(true)
  })

  it('normaliza somente listas válidas e nunca bloqueia a opção sem calda', () => {
    const availability = normalizeIngredientAvailability({
      creamFlavorIds: ['chocomenta', 'chocomenta'],
      fruitIds: 'banana',
      toppingIds: [null, 'mms'],
      syrupIds: ['sem-calda', 'chocolate'],
    })

    expect(availability).toEqual({
      creamFlavorIds: ['chocomenta'],
      fruitIds: [],
      toppingIds: ['mms'],
      syrupIds: ['chocolate'],
    })
    expect(isIngredientAvailable(availability, 'syrups', 'sem-calda')).toBe(true)
  })

  it('identifica todos os ingredientes indisponíveis selecionados', () => {
    const unavailableItems = getUnavailableOrderIngredients(order, {
      creamFlavorIds: ['chocomenta'],
      fruitIds: ['banana'],
      toppingIds: ['mms'],
      syrupIds: ['chocolate'],
    })

    expect(unavailableItems.map((item) => item.name)).toEqual([
      'Chocomenta',
      'Banana',
      'M&M',
      'Chocolate',
    ])
  })

  it('remove escolhas indisponíveis e preserva as disponíveis', () => {
    const result = removeUnavailableIngredients(order, {
      creamFlavorIds: ['chocomenta'],
      fruitIds: ['banana'],
      toppingIds: ['mms'],
      syrupIds: ['chocolate'],
    })

    expect(result.order).toMatchObject({
      iceCreamFlavorIds: ['morango'],
      fruitSelections: [{ id: 'morango', quantity: 1 }],
      toppingSelections: [{ id: 'granola', quantity: 1 }],
      syrupSelection: null,
    })
    expect(result.removedItems).toHaveLength(4)
  })

  it('mantém a mesma referência do pedido quando nada precisa ser removido', () => {
    const result = removeUnavailableIngredients(order, emptyIngredientAvailability)

    expect(result.order).toBe(order)
    expect(result.removedItems).toEqual([])
  })
})
