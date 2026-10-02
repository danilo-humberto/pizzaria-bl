import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePizzaOrderBuilder } from './usePizzaOrderBuilder'

const mocks = vi.hoisted(() => ({ create: vi.fn() }))
vi.mock('../config/demoMode', () => ({ isDemoMode: false }))
vi.mock('../services/orderService', () => ({ createPizzaOrder: mocks.create }))

function captureValidBuilder() {
  let builder: ReturnType<typeof usePizzaOrderBuilder>
  function Capture() {
    builder = usePizzaOrderBuilder()
    if (!builder.order.customer.name) {
      builder.addItem('pizza', 'mussarela', 1)
      builder.updateCustomerData('name', 'Cliente teste')
      builder.updateCustomerData('phone', '(81) 99999-1234')
      builder.setPaymentMethod('pix')
    }
    return null
  }
  renderToString(createElement(Capture))
  return builder!
}

beforeEach(() => vi.clearAllMocks())

describe('finalização de pizza', () => {
  it('bloqueia chamadas no mesmo frame e chamadas após sucesso, sem depender do botão', async () => {
    let resolve!: (value: unknown) => void
    mocks.create.mockReturnValue(new Promise((done) => { resolve = done }))
    const builder = captureValidBuilder()
    expect(builder.validation.isValid).toBe(true)
    const first = builder.finalizeOrder()
    expect(await builder.finalizeOrder()).toBe(false)
    await vi.waitFor(() => expect(mocks.create).toHaveBeenCalledOnce())
    resolve({ publicCode: 'BL-TESTE', trackingCode: 'test', trackingUrl: '/pedido/test' })
    expect(await first).toBe(true)
    expect(await builder.finalizeOrder()).toBe(true)
    expect(mocks.create).toHaveBeenCalledOnce()
  })

  it('libera uma nova tentativa após falha com o mesmo rascunho', async () => {
    mocks.create.mockRejectedValueOnce(new Error('network unavailable')).mockResolvedValueOnce({ publicCode: 'BL-TESTE', trackingCode: 'test', trackingUrl: '/pedido/test' })
    const builder = captureValidBuilder()
    const draft = structuredClone(builder.order)
    expect(await builder.finalizeOrder()).toBe(false)
    expect(await builder.finalizeOrder()).toBe(true)
    expect(mocks.create).toHaveBeenCalledTimes(2)
    expect(mocks.create.mock.calls[0][0]).toEqual(draft)
    expect(mocks.create.mock.calls[1][0]).toEqual(draft)
  })
})

vi.mock('./usePizzaAvailability', () => ({ usePizzaAvailability: () => ({ availability: { pizzaFlavorIds: [], borderIds: [], esfihaIds: [], beverageIds: [] }, isLoading: false, error: null }) }))
