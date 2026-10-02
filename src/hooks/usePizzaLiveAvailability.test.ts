import { createElement, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePizzaOrderBuilder } from './usePizzaOrderBuilder'
import { emptyPizzaAvailability } from '../types/pizzaAvailability'
import { isPizzaOrderItemAvailable } from '../utils/pizzaAvailability'
import { MenuOptionCards } from '../components/order/MenuOptionCards'

const live = vi.hoisted(() => ({ availability: { pizzaFlavorIds: [] as string[], borderIds: [] as string[], esfihaIds: [] as string[], beverageIds: [] as string[] }, isLoading: false, error: null as string | null }))
vi.mock('./usePizzaAvailability', () => ({ usePizzaAvailability: () => live }))
vi.mock('../config/demoMode', () => ({ isDemoMode: false }))

beforeEach(() => { live.availability = { ...emptyPizzaAvailability }; live.isLoading = false; live.error = null })

function capture() {
  let result: ReturnType<typeof usePizzaOrderBuilder>
  function Component() { result = usePizzaOrderBuilder(); return null }
  renderToString(createElement(Component))
  return result!
}

describe('disponibilidade na montagem pública', () => {
  it('bloqueia sabores inteiros, meio a meio, bordas, esfihas e bebidas', () => {
    live.availability = { pizzaFlavorIds: ['mussarela'], borderIds: ['catupiry'], esfihaIds: ['calabresa'], beverageIds: ['fanta-2l'] }
    const builder = capture()
    expect(builder.isItemAvailable('pizza', 'mussarela')).toBe(false)
    expect(builder.isItemAvailable('pizza', 'calabresa-mussarela')).toBe(false)
    expect(builder.addPizzas('calabresa-mussarela', 1, {})).toMatchObject({ ok: false })
    expect(builder.addPizzas('calabresa', 1, { catupiry: 1 })).toMatchObject({ ok: false })
    expect(builder.addItem('esfiha', 'calabresa', 1)).toMatchObject({ ok: false })
    expect(builder.addItem('beverage', 'fanta-2l', 1)).toMatchObject({ ok: false })
    expect(builder.addPizzas('calabresa', 1, {})).toMatchObject({ ok: true })
  })

  it.each(['loading', 'error'])('bloqueia adições durante %s', (state) => {
    live.isLoading = state === 'loading'
    live.error = state === 'error' ? 'Falha de conexão' : null
    const builder = capture()
    expect(builder.addItem('pizza', 'mussarela', 1)).toMatchObject({ ok: false })
    expect(builder.validation.isValid).toBe(false)
  })

  it('preserva o pedido, bloqueia envio ao esgotar e libera ao reativar', () => {
    const states: boolean[] = []
    function Component() {
      const [phase, setPhase] = useState(0)
      const builder = usePizzaOrderBuilder()
      if (phase === 0) {
        builder.addItem('pizza', 'mussarela', 1)
        builder.updateCustomerData('name', 'Cliente teste')
        builder.updateCustomerData('phone', '81999991234')
        builder.setPaymentMethod('pix')
        setPhase(1)
      } else {
        states.push(builder.validation.isValid)
        expect(builder.order.items).toHaveLength(1)
        if (phase === 1) { live.availability = { ...emptyPizzaAvailability, pizzaFlavorIds: ['mussarela'] }; setPhase(2) }
        if (phase === 2) { expect(builder.validation.fieldErrors.items).toContain('Mussarela'); live.availability = { ...emptyPizzaAvailability }; setPhase(3) }
      }
      return null
    }
    renderToString(createElement(Component))
    expect(states).toEqual([true, false, true])
  })

  it('renderiza item esgotado desabilitado e sem ação de adicionar', () => {
    const html = renderToString(createElement(MenuOptionCards, { legend: 'Sabor', name: 'pizza', options: [{ id: 'mussarela', name: 'Mussarela', price: 30 }], selectedId: 'mussarela', onSelect: () => {}, unavailableIds: ['mussarela'], selectedAction: createElement('button', null, 'Adicionar pizza') }))
    expect(html).toContain('disabled=""')
    expect(html).toContain('Esgotado')
    expect(html).not.toContain('Adicionar pizza')
  })

  it('borda esgotada invalida a linha, sem borda permanece permitida', () => {
    const stock = { ...emptyPizzaAvailability, borderIds: ['catupiry'] }
    expect(isPizzaOrderItemAvailable({ kind: 'pizza', optionId: 'calabresa', borderId: 'catupiry' }, stock)).toBe(false)
    expect(isPizzaOrderItemAvailable({ kind: 'pizza', optionId: 'calabresa' }, stock)).toBe(true)
  })
})
