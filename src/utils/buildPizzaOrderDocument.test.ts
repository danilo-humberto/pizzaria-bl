import { describe, expect, it } from 'vitest'
import type { PizzaOrderDraft } from '../types/pizzaOrder'
import { buildPizzaOrderDocument } from './buildPizzaOrderDocument'

function draft(): PizzaOrderDraft {
  return {
    items: [
      { id: '1', kind: 'pizza', optionId: 'calabresa-mussarela', quantity: 2, borderId: 'catupiry' },
      { id: '2', kind: 'pizza', optionId: 'calabresa', quantity: 1 },
      { id: '3', kind: 'esfiha', optionId: 'frango', quantity: 10 },
      { id: '4', kind: 'beverage', optionId: 'agua-mineral', quantity: 10 },
    ],
    customer: { name: ' Cliente ', phone: '(81) 99999-1234' },
    payment: { method: 'cash', needsChange: true, changeFor: '200,00' },
    observation: ' Sem cebola ',
  }
}

describe('contrato persistido de pizza', () => {
  it('preserva itens, calcula valores e inclui ambos os sabores do meio a meio', () => {
    const order = buildPizzaOrderDocument(draft(), 'BL-123', 'tracking-123', 'timestamp')
    expect(order.total).toBe(154)
    expect(order.items.lines[0]).toMatchObject({ unitPriceCents: 3200, subtotalCents: 6400, borderName: 'Borda de catupiry' })
    expect(order.items.pizzaFlavorIds).toEqual(['calabresa', 'mussarela'])
    expect(order.items.borderIds).toEqual(['catupiry'])
    expect(order.items.esfihaIds).toEqual(['frango'])
    expect(order.items.beverageIds).toEqual(['agua-mineral'])
    expect(order.customer.name).toBe('Cliente')
    expect(order.items.observation).toBe('Sem cebola')
    expect(order.payment).toEqual({ method: 'cash', needsChange: false })
    expect(order.fulfillment).toBe('pickup')
    expect(order.status).toBe('received')
    expect(order.createdAt).toBe('timestamp')
    expect(order.updatedAt).toBe('timestamp')
    expect(JSON.parse(JSON.stringify(order))).toEqual(order)
    expect(order.items.lines[1]).not.toHaveProperty('borderId')
    expect(order.items.lines[0]).not.toHaveProperty('id')
  })
  it('recusa limite por sabor ultrapassado contando o meio a meio', () => {
    const order = draft()
    order.items[1].quantity = 4
    expect(() => buildPizzaOrderDocument(order, 'BL-123', 'tracking-123', null)).toThrow('limite')
  })
  it.each([0, -1, 1.5, Infinity])('recusa quantidade inválida: %s', (quantity) => {
    const order = draft()
    order.items[2].quantity = quantity
    expect(() => buildPizzaOrderDocument(order, 'BL-123', 'tracking-123', null)).toThrow()
  })
  it('recusa borda em bebida mesmo por chamada direta', () => {
    const order = draft()
    order.items[3].borderId = 'catupiry'
    expect(() => buildPizzaOrderDocument(order, 'BL-123', 'tracking-123', null)).toThrow('borda')
  })
  it('recusa item fora do cardápio', () => {
    const order = draft()
    order.items[0].optionId = 'inexistente'
    expect(() => buildPizzaOrderDocument(order, 'BL-123', 'tracking-123', null)).toThrow()
  })
})
