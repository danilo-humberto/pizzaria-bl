import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { isDemoMode } from '../config/demoMode'
import { beverages, esfihas, pizzas } from '../data/pizzaMenu'
import { emptyIngredientAvailability } from '../utils/ingredientAvailability'
import { loadIngredientAvailabilityListener, useIngredientAvailability } from './useIngredientAvailability'
import { useOrderBuilder } from './useOrderBuilder'
import { usePizzaOrderBuilder } from './usePizzaOrderBuilder'
import { BuilderSection } from '../components/landing/BuilderSection'
import type { OrderBuilder } from './useOrderBuilder'

vi.hoisted(() => vi.stubEnv('VITE_DEMO_MODE', 'true'))

const { availabilityServiceLoads, orderServiceLoads } = vi.hoisted(() => ({
  availabilityServiceLoads: vi.fn(),
  orderServiceLoads: vi.fn(),
}))

vi.mock('../services/ingredientAvailabilityService', () => {
  availabilityServiceLoads()
  return { listenIngredientAvailability: vi.fn() }
})

vi.mock('../services/orderService', () => {
  orderServiceLoads()
  return { createOrder: vi.fn(), createPizzaOrder: vi.fn() }
})

vi.mock('../utils/validateOrder', () => ({
  validateOrder: () => ({ isValid: true, errors: [], fieldErrors: {} }),
}))

describe('isolamento da demonstração', () => {
  it('fornece disponibilidade local sem carregar o serviço Firebase', async () => {
    expect(isDemoMode).toBe(true)
    expect(await loadIngredientAvailabilityListener()).toBeNull()

    let availabilityState: ReturnType<typeof useIngredientAvailability> | undefined
    function CaptureAvailability() {
      availabilityState = useIngredientAvailability()
      return null
    }

    renderToString(createElement(CaptureAvailability))
    expect(availabilityState).toEqual({
      availability: emptyIngredientAvailability,
      isLoading: false,
      error: null,
    })
    expect(availabilityServiceLoads).not.toHaveBeenCalled()
  })

  it('bloqueia uma chamada direta a finalizeOrder mesmo com validação válida', async () => {
    let builder: OrderBuilder | undefined
    function CaptureBuilder() {
      builder = useOrderBuilder()
      return null
    }

    renderToString(createElement(CaptureBuilder))
    expect(builder?.validation.isValid).toBe(true)
    expect(await builder?.finalizeOrder()).toBe(false)
    expect(orderServiceLoads).not.toHaveBeenCalled()
  })

  it('renderiza a montagem de pizza sem opções de açaí ou ação de envio', () => {
    function PizzaBuilder() {
      return createElement(BuilderSection, { builder: usePizzaOrderBuilder() })
    }

    const html = renderToString(createElement(PizzaBuilder))
    expect(html).toContain('Meio a meio')
    expect(html).toContain('Calabresa')
    expect(html).toContain('aria-pressed="false" aria-labelledby="pizza-option-mussarela-name"')
    expect(html.match(/aria-labelledby="pizza-option-[^"]+-name"/g)).toHaveLength(pizzas.length)
    expect(html.match(/aria-labelledby="esfiha-option-[^"]+-name"/g)).toHaveLength(esfihas.length)
    expect(html.match(/aria-labelledby="beverage-option-[^"]+-name"/g)).toHaveLength(beverages.length)
    expect(html).not.toMatch(/Ver todos os .* sabores|Ver todas as .* bebidas/)
    expect(html).not.toContain('pizza-search')
    expect(html).not.toContain('Buscar sabor')
    expect(html).not.toMatch(/<img[^>]+\.jpg/)
    expect(html).toContain('Monte seu pedido')
    expect(html).toContain('Demonstração: pedidos não são enviados')
    expect(html).not.toMatch(/açaí|granola|calda|frutas/i)
    expect(html).toMatch(/disabled=""[^>]*>.*?Finalizar pedido/s)
    expect(orderServiceLoads).not.toHaveBeenCalled()
    expect(availabilityServiceLoads).not.toHaveBeenCalled()
  })

  it('bloqueia também a finalização de pizza sem carregar o serviço ou confirmar', async () => {
    let builder: ReturnType<typeof usePizzaOrderBuilder> | undefined
    function CaptureBuilder() {
      builder = usePizzaOrderBuilder()
      if (!builder.order.customer.name) {
        builder.addItem('pizza', 'mussarela', 1)
        builder.updateCustomerData('name', 'Cliente demonstração')
        builder.updateCustomerData('phone', '(81) 99999-1234')
        builder.setPaymentMethod('pix')
      }
      return null
    }
    renderToString(createElement(CaptureBuilder))
    expect(builder!.validation.isValid).toBe(true)
    expect(await builder!.finalizeOrder()).toBe(false)
    expect(builder!.confirmationData).toBeNull()
    expect(orderServiceLoads).not.toHaveBeenCalled()
  })
})
