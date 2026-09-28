import { describe, expect, it } from 'vitest'
import { formatCurrency } from './formatCurrency'
import {
  formatOrderPortions,
  formatOrderSyrup,
  getOrderFruitPortions,
  getOrderIceCreamFlavors,
} from './orderDisplay'

describe('getOrderIceCreamFlavors', () => {
  it('retorna os sabores plurais dos pedidos novos', () => {
    expect(
      getOrderIceCreamFlavors({
        iceCreamFlavors: ['Morango', 'Chocomenta'],
        iceCreamFlavor: 'Morango',
      }),
    ).toEqual(['Morango', 'Chocomenta'])
  })

  it('mantém compatibilidade com o sabor singular dos pedidos antigos', () => {
    expect(getOrderIceCreamFlavors({ iceCreamFlavor: 'Morango' })).toEqual(['Morango'])
  })
})

describe('order portions display', () => {
  it('exibe quantidade e subtotal adicional nos pedidos novos', () => {
    const portions = getOrderFruitPortions({
      fruitPortions: [
        {
          id: 'banana',
          name: 'Banana',
          quantity: 3,
          extraUnitPriceCents: 50,
          extraSubtotalCents: 100,
        },
      ],
      fruits: ['Banana'],
    })

    expect(formatOrderPortions(portions)).toBe(`Banana 3x (+ ${formatCurrency(1)})`)
  })

  it('trata cada item legado como uma porção incluída', () => {
    const portions = getOrderFruitPortions({ fruits: ['Banana', 'Morango'] })

    expect(formatOrderPortions(portions)).toBe('Banana 1x, Morango 1x')
  })
})

describe('order syrup display', () => {
  it('exibe quantidade e adicional da calda nos pedidos novos', () => {
    expect(
      formatOrderSyrup({
        syrup: 'Chocolate',
        syrupPortion: {
          id: 'chocolate',
          name: 'Chocolate',
          quantity: 3,
          extraUnitPriceCents: 50,
          extraSubtotalCents: 100,
        },
      }),
    ).toBe(`Chocolate 3x (+ ${formatCurrency(1)})`)
  })

  it('mantém compatibilidade com caldas de pedidos antigos', () => {
    expect(formatOrderSyrup({ syrupId: 'chocolate', syrup: 'Chocolate' })).toBe(
      'Chocolate 1x',
    )
    expect(formatOrderSyrup({ syrupId: 'sem-calda', syrup: 'Sem calda' })).toBe(
      'Sem calda',
    )
  })
})
