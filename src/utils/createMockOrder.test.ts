import { describe, expect, it } from 'vitest'
import type { OrderDraft } from '../types/order'
import { createMockOrder } from './createMockOrder'

const orderDraft: OrderDraft = {
  sizeId: 'm',
  orderTypeId: 'acai',
  iceCreamFlavorIds: [],
  fruitSelections: [],
  toppingSelections: [],
  syrupSelection: { id: 'chocolate', quantity: 3 },
  observation: '',
  customer: { name: 'Cliente', phone: '(99) 99999-9999' },
  payment: { method: 'pix', needsChange: false, changeFor: '' },
}

describe('createMockOrder syrup portions', () => {
  it('persiste a quantidade nova e mantém os campos legados da calda', () => {
    const result = createMockOrder(orderDraft)

    expect(result.order.items).toMatchObject({
      syrupId: 'chocolate',
      syrup: 'Chocolate',
      syrupPortion: {
        id: 'chocolate',
        name: 'Chocolate',
        quantity: 3,
        extraUnitPriceCents: 50,
        extraSubtotalCents: 100,
      },
    })
    expect(result.order.total).toBe(11)
  })
})

describe('createMockOrder cash payment', () => {
  it('ignora dados de troco enquanto a opção estiver oculta', () => {
    const result = createMockOrder({
      ...orderDraft,
      payment: {
        method: 'cash',
        needsChange: true,
        changeFor: 'R$ 50,00',
      },
    })

    expect(result.order.payment).toEqual({
      method: 'cash',
      needsChange: false,
      changeFor: undefined,
    })
  })
})
