import { describe, expect, it } from 'vitest'
import type { PizzaOrderDraft } from '../types/pizzaOrder'
import { buildPizzaAddition, calculatePizzaOrderTotal, getFlavorQuantity, getPizzaItemTotalCents, validatePizzaOrder } from './pizzaOrder'

const base: PizzaOrderDraft = {
  items: [],
  customer: { name: 'Ana', phone: '(81) 99999-9999' },
  payment: { method: 'pix', needsChange: false, changeFor: '' },
  observation: '',
}

describe('pedido de pizzas em demonstração', () => {
  it('prepara uma pizza sem borda ou com uma borda do cardápio', () => {
    expect(buildPizzaAddition([], 'calabresa', 1, {})).toEqual({ ok: true, items: [{ kind: 'pizza', optionId: 'calabresa', quantity: 1 }] })
    expect(buildPizzaAddition([], 'calabresa', 1, { mussarela: 1 })).toEqual({ ok: true, items: [{ kind: 'pizza', optionId: 'calabresa', quantity: 1, borderId: 'mussarela' }] })
  })

  it('distribui bordas diferentes e mantém as restantes sem borda', () => {
    const result = buildPizzaAddition([], 'calabresa', 3, { catupiry: 1, cheddar: 1 })
    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.error)
    expect(result.items).toEqual([
      { kind: 'pizza', optionId: 'calabresa', quantity: 1, borderId: 'catupiry' },
      { kind: 'pizza', optionId: 'calabresa', quantity: 1, borderId: 'cheddar' },
      { kind: 'pizza', optionId: 'calabresa', quantity: 1 },
    ])
    expect(result.items.reduce((sum, item) => sum + getPizzaItemTotalCents(item), 0)).toBe(10000)
  })

  it('agrupa todas as pizzas com a mesma borda', () => {
    expect(buildPizzaAddition([], 'calabresa', 3, { catupiry: 3 })).toEqual({ ok: true, items: [{ kind: 'pizza', optionId: 'calabresa', quantity: 3, borderId: 'catupiry' }] })
  })

  it('rejeita distribuição excessiva, opções desconhecidas e quantidades inválidas', () => {
    for (const [optionId, quantity, borders] of [
      ['calabresa', 2, { catupiry: 2, cheddar: 1 }],
      ['calabresa', 1, { fantasma: 1 }],
      ['fantasma', 1, {}],
      ['calabresa', 0, {}],
      ['calabresa', 1.5, {}],
      ['calabresa', 2, { catupiry: -1 }],
      ['calabresa', 2, { catupiry: 0.5 }],
    ] as const) expect(buildPizzaAddition([], optionId, quantity, borders).ok).toBe(false)
  })

  it('valida o lote inteiro e conta meio a meio para ambos os sabores, sem alterar o pedido em erro', () => {
    const existing = [{ id: '1', kind: 'pizza' as const, optionId: 'mussarela', quantity: 3 }]
    const original = structuredClone(existing)
    const rejected = buildPizzaAddition(existing, 'calabresa-mussarela', 3, { catupiry: 1, cheddar: 1 })
    expect(rejected.ok).toBe(false)
    expect(existing).toEqual(original)
    expect(buildPizzaAddition(existing, 'calabresa-mussarela', 2, { catupiry: 1 }).ok).toBe(true)
  })

  it('calcula pizzas inteiras, meio a meio, bordas, esfihas e bebidas em centavos', () => {
    const order: PizzaOrderDraft = { ...base, items: [
      { id: '1', kind: 'pizza', optionId: 'calabresa', borderId: 'catupiry', quantity: 2 },
      { id: '2', kind: 'pizza', optionId: 'calabresa-mussarela', quantity: 1 },
      { id: '3', kind: 'esfiha', optionId: 'frango', quantity: 3 },
      { id: '4', kind: 'beverage', optionId: 'coca-cola-lata', quantity: 2 },
    ] }
    expect(calculatePizzaOrderTotal(order)).toBe(119)
    expect(getFlavorQuantity(order.items, 'calabresa')).toBe(3)
    expect(getFlavorQuantity(order.items, 'mussarela')).toBe(1)
    expect(validatePizzaOrder(order).isValid).toBe(true)
  })

  it('conta cada meio a meio para ambos os sabores no limite de cinco', () => {
    const order: PizzaOrderDraft = { ...base, items: [
      { id: '1', kind: 'pizza', optionId: 'calabresa', quantity: 5 },
      { id: '2', kind: 'pizza', optionId: 'calabresa-mussarela', quantity: 1 },
    ] }
    expect(validatePizzaOrder(order).fieldErrors.items).toMatch(/Calabresa/i)
  })

  it('recalcula quando a quantidade ou a borda muda e quando um item é removido', () => {
    const pizza = { id: '1', kind: 'pizza' as const, optionId: 'mussarela', quantity: 2 }
    const drink = { id: '2', kind: 'beverage' as const, optionId: 'coca-cola-lata', quantity: 1 }
    expect(calculatePizzaOrderTotal({ ...base, items: [pizza, drink] })).toBe(65)
    expect(calculatePizzaOrderTotal({ ...base, items: [{ ...pizza, quantity: 3, borderId: 'cheddar' }, drink] })).toBe(110)
    expect(calculatePizzaOrderTotal({ ...base, items: [drink] })).toBe(5)
  })

  it('permite esfiha e bebida sem limite e bloqueia dados obrigatórios', () => {
    const order: PizzaOrderDraft = { ...base, items: [
      { id: '1', kind: 'esfiha', optionId: 'frango', quantity: 12 },
      { id: '2', kind: 'beverage', optionId: 'coca-cola-lata', quantity: 10 },
    ] }
    expect(validatePizzaOrder(order).isValid).toBe(true)
    expect(validatePizzaOrder({ ...order, customer: { name: '', phone: '' }, payment: { ...order.payment, method: '' } }).isValid).toBe(false)
  })

  it('rejeita opções, bordas e quantidades fora do cardápio', () => {
    const order: PizzaOrderDraft = { ...base, items: [{ id: '1', kind: 'pizza', optionId: 'calabresa', borderId: 'fantasma', quantity: 0 }] }
    expect(validatePizzaOrder(order).isValid).toBe(false)
    expect(validatePizzaOrder({ ...order, items: [{ ...order.items[0], quantity: 1 }] }).isValid).toBe(false)
  })
})
