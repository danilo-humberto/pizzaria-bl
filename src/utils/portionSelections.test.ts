import { describe, expect, it } from 'vitest'
import {
  buildPortionOrderItems,
  decrementPortionSelection,
  getExtraPortionsTotalCents,
  incrementPortionSelection,
  togglePortionSelection,
} from './portionSelections'

describe('portionSelections', () => {
  it('seleciona a primeira porção sem cobrar adicional', () => {
    const selections = togglePortionSelection([], 'banana')

    expect(selections).toEqual([{ id: 'banana', quantity: 1 }])
    expect(getExtraPortionsTotalCents(selections)).toBe(0)
  })

  it('incrementa sem limite e cobra R$ 0,50 por porção além da primeira', () => {
    let selections = [{ id: 'banana', quantity: 1 }]

    for (let index = 0; index < 20; index += 1) {
      selections = incrementPortionSelection(selections, 'banana')
    }

    expect(selections).toEqual([{ id: 'banana', quantity: 21 }])
    expect(getExtraPortionsTotalCents(selections)).toBe(1000)
  })

  it('remove o item quando a quantidade diminui de um para zero', () => {
    expect(decrementPortionSelection([{ id: 'pacoca', quantity: 1 }], 'pacoca')).toEqual([])
  })

  it('gera os itens persistidos com quantidade e subtotal', () => {
    expect(
      buildPortionOrderItems(
        [
          { id: 'banana', name: 'Banana' },
          { id: 'morango', name: 'Morango' },
        ],
        [
          { id: 'banana', quantity: 2 },
          { id: 'morango', quantity: 1 },
        ],
      ),
    ).toEqual([
      {
        id: 'banana',
        name: 'Banana',
        quantity: 2,
        extraUnitPriceCents: 50,
        extraSubtotalCents: 50,
      },
      {
        id: 'morango',
        name: 'Morango',
        quantity: 1,
        extraUnitPriceCents: 50,
        extraSubtotalCents: 0,
      },
    ])
  })
})
