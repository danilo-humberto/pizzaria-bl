import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { isDemoMode } from '../config/demoMode'
import { emptyIngredientAvailability } from '../utils/ingredientAvailability'
import { loadIngredientAvailabilityListener, useIngredientAvailability } from './useIngredientAvailability'
import { useOrderBuilder } from './useOrderBuilder'
import type { OrderBuilder } from './useOrderBuilder'

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
  return { createOrder: vi.fn() }
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
})
