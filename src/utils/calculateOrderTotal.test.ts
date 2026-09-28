import { describe, expect, it } from 'vitest'
import type { OrderDraft, OrderTypeId } from '../types/order'
import { calculateOrderTotal } from './calculateOrderTotal'

const baseOrder: OrderDraft = {
  sizeId: '',
  orderTypeId: '',
  iceCreamFlavorIds: [],
  fruitSelections: [],
  toppingSelections: [],
  syrupSelection: null,
  observation: '',
  customer: {
    name: '',
    phone: '',
  },
  payment: {
    method: '',
    needsChange: false,
    changeFor: '',
  },
}

describe('calculateOrderTotal', () => {
  it.each([
    ['p', 8],
    ['m', 10],
    ['g', 12],
    ['barca-p', 20],
    ['barca-m', 30],
  ])('retorna o preço fixo do tamanho %s', (sizeId, expectedTotal) => {
    expect(calculateOrderTotal({ ...baseOrder, sizeId })).toBe(expectedTotal)
  })

  it.each<OrderTypeId>(['acai', 'acai-icecream', 'icecream'])(
    'mantém o preço ao trocar o tipo para %s',
    (orderTypeId) => {
      expect(calculateOrderTotal({ ...baseOrder, sizeId: 'g', orderTypeId })).toBe(12)
    },
  )

  it('retorna zero enquanto nenhum tamanho foi escolhido', () => {
    expect(calculateOrderTotal(baseOrder)).toBe(0)
  })

  it('mantém a primeira porção da calda incluída no tamanho', () => {
    expect(
      calculateOrderTotal({
        ...baseOrder,
        sizeId: 'm',
        syrupSelection: { id: 'chocolate', quantity: 1 },
      }),
    ).toBe(10)
  })

  it('cobra somente as porções adicionais de frutas, guloseimas e calda', () => {
    expect(
      calculateOrderTotal({
        ...baseOrder,
        sizeId: 'm',
        fruitSelections: [
          { id: 'banana', quantity: 1 },
          { id: 'morango', quantity: 3 },
        ],
        toppingSelections: [{ id: 'pacoca', quantity: 2 }],
        syrupSelection: { id: 'chocolate', quantity: 3 },
      }),
    ).toBe(12.5)
  })

  it('permite quantidades altas sem aplicar limite de porções', () => {
    expect(
      calculateOrderTotal({
        ...baseOrder,
        sizeId: 'p',
        fruitSelections: [{ id: 'banana', quantity: 21 }],
      }),
    ).toBe(18)
  })
})
