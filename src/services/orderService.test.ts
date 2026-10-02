import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPizzaOrder, listenOrderByTrackingCode } from './orderService'
import { createTestPizzaOrder } from '../../tests/fixtures/pizzaOrder'
import type { PizzaOrderDraft } from '../types/pizzaOrder'
import { calculatePizzaOrderTotal } from '../utils/pizzaOrder'

const mocks = vi.hoisted(() => ({
  demo: false, availability: {} as Record<string, string[]>,
  transaction: vi.fn(), set: vi.fn(), snapshot: vi.fn(), stop: vi.fn(),
}))
vi.mock('../config/demoMode', () => ({ get isDemoMode() { return mocks.demo }, demoOrderNotice: 'Demonstração: pedidos não são enviados' }))
vi.mock('../lib/firebase', () => ({ db: {}, auth: {} }))
vi.mock('firebase/firestore', () => ({
  doc: (_db: unknown, collection: string, id: string) => `${collection}/${id}`,
  collection: vi.fn(), orderBy: vi.fn(), query: vi.fn(), updateDoc: vi.fn(),
  serverTimestamp: () => 'server-timestamp',
  runTransaction: (...args: unknown[]) => mocks.transaction(...args),
  onSnapshot: (...args: unknown[]) => { mocks.snapshot(...args); return mocks.stop },
}))

const draft: PizzaOrderDraft = {
  items: [
    { id: '1', kind: 'pizza', optionId: 'calabresa-mussarela', quantity: 2, borderId: 'catupiry' },
    { id: '2', kind: 'esfiha', optionId: 'frango', quantity: 8 },
    { id: '3', kind: 'beverage', optionId: 'agua-mineral', quantity: 3 },
  ],
  customer: { name: ' Cliente teste ', phone: '(81) 99999-1234' },
  payment: { method: 'pix', needsChange: false, changeFor: '' },
  observation: ' Bem assada ',
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.demo = false
  mocks.availability = {}
  mocks.transaction.mockImplementation(async (_db, run) => run({
    get: async (reference: string) => ({
      data: () => reference.startsWith('storeSettings/') ? mocks.availability : undefined,
      exists: () => false,
    }),
    set: mocks.set,
  }))
})

describe('envio de pizza', () => {
  it('grava o contrato do admin com o mesmo total da montagem e retorna o link após commit', async () => {
    const confirmation = await createPizzaOrder(draft)
    expect(mocks.set).toHaveBeenCalledTimes(1)
    const [path, saved] = mocks.set.mock.calls[0]
    expect(path).toBe(`orders/${confirmation.trackingCode}`)
    expect(saved).toMatchObject({
      schemaVersion: 1, status: 'received', fulfillment: 'pickup',
      publicCode: confirmation.publicCode, trackingCode: confirmation.trackingCode,
      customer: { name: 'Cliente teste' },
      total: calculatePizzaOrderTotal(draft), createdAt: 'server-timestamp', updatedAt: 'server-timestamp',
      items: { observation: 'Bem assada', pizzaFlavorIds: ['calabresa', 'mussarela'], borderIds: ['catupiry'] },
    })
    expect(saved.items.lines).toHaveLength(3)
    expect(confirmation.publicCode).toMatch(/^BL-/)
    expect(confirmation.trackingUrl).toBe(`/pedido/${confirmation.trackingCode}`)
  })

  it.each([
    ['pizzaFlavorIds', 'mussarela', 'Mussarela'],
    ['borderIds', 'catupiry', 'Borda de catupiry'],
    ['esfihaIds', 'frango', 'Frango'],
    ['beverageIds', 'agua-mineral', 'Água'],
  ])('recusa %s esgotado sem gravar e explica o item', async (category, id, name) => {
    mocks.availability = { [category]: [id] }
    await expect(createPizzaOrder(draft)).rejects.toThrow(name)
    expect(mocks.set).not.toHaveBeenCalled()
  })

  it('propaga falha de commit sem retornar confirmação e sem alterar o rascunho', async () => {
    const original = structuredClone(draft)
    mocks.transaction.mockRejectedValue(new Error('permission-denied'))
    await expect(createPizzaOrder(draft)).rejects.toThrow('permission-denied')
    expect(draft).toEqual(original)
  })

  it('não acessa transação na demonstração nem para rascunho inválido', async () => {
    mocks.demo = true
    await expect(createPizzaOrder(draft)).rejects.toThrow('Demonstração')
    mocks.demo = false
    await expect(createPizzaOrder({ ...draft, items: [] })).rejects.toThrow()
    expect(mocks.transaction).not.toHaveBeenCalled()
  })

  it('não substitui um pedido caso o código já exista', async () => {
    mocks.transaction.mockImplementation(async (_db, run) => run({
      get: async () => ({ data: () => ({}), exists: () => true }), set: mocks.set,
    }))
    await expect(createPizzaOrder(draft)).rejects.toThrow('Código já utilizado')
    expect(mocks.set).not.toHaveBeenCalled()
  })
})

describe('acompanhamento de pizza', () => {
  it('publica mudanças, pedido inexistente e devolve o cancelamento da assinatura', () => {
    const callback = vi.fn()
    const stop = listenOrderByTrackingCode('test', callback)
    const next = mocks.snapshot.mock.calls[0][1]
    const order = createTestPizzaOrder()
    for (const status of ['received', 'preparing', 'ready_for_pickup', 'completed', 'cancelled']) {
      next({ exists: () => true, data: () => ({ ...order, status }) })
      expect(callback).toHaveBeenLastCalledWith({ ...order, status })
    }
    next({ exists: () => false })
    expect(callback).toHaveBeenLastCalledWith(null)
    stop()
    expect(mocks.stop).toHaveBeenCalledOnce()
  })

  it('trata documento incompatível e erro de acesso sem expor um pedido inválido', () => {
    const callback = vi.fn()
    const error = vi.fn()
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    listenOrderByTrackingCode('test', callback, error)
    const [, next, fail] = mocks.snapshot.mock.calls[0]
    next({ exists: () => true, data: () => ({ items: { fruits: [] } }) })
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('incompatível') }))
    const denied = new Error('permission-denied')
    fail(denied)
    expect(error).toHaveBeenLastCalledWith(denied)
    expect(callback).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it.each(['', 'invalid/code'])('trata código inválido %s antes de assinar', (code) => {
    const error = vi.fn()
    listenOrderByTrackingCode(code, vi.fn(), error)
    expect(error).toHaveBeenCalledOnce()
    expect(mocks.snapshot).not.toHaveBeenCalled()
  })
})
