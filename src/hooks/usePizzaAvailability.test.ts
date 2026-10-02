import { beforeEach, describe, expect, it, vi } from 'vitest'

const mock = vi.hoisted(() => ({ demo: false, effect: undefined as undefined | (() => () => void), setters: [] as ReturnType<typeof vi.fn>[], listen: vi.fn(), imported: vi.fn() }))
vi.mock('../config/demoMode', () => ({ get isDemoMode() { return mock.demo } }))
vi.mock('react', () => ({
  useState: (initial: unknown) => { const setter = vi.fn(); mock.setters.push(setter); return [initial, setter] },
  useEffect: (effect: () => () => void) => { mock.effect = effect },
}))
vi.mock('../services/pizzaAvailabilityService', () => { mock.imported(); return { listenPizzaAvailability: mock.listen } })

beforeEach(() => { vi.resetModules(); vi.clearAllMocks(); mock.demo = false; mock.setters = [] })

describe('assinatura da disponibilidade', () => {
  it('propaga atualizações e encerra assinatura ao desmontar', async () => {
    const unsubscribe = vi.fn()
    mock.listen.mockReturnValue(unsubscribe)
    const { usePizzaAvailability } = await import('./usePizzaAvailability')
    usePizzaAvailability()
    const cleanup = mock.effect!()
    await vi.waitFor(() => expect(mock.listen).toHaveBeenCalledOnce())
    const [onValue, onError] = mock.listen.mock.calls[0]
    const available = { pizzaFlavorIds: [], borderIds: [], esfihaIds: [], beverageIds: [] }
    const unavailable = { ...available, pizzaFlavorIds: ['mussarela'] }
    onValue(available); onValue(unavailable); onValue(available)
    expect(mock.setters[0].mock.calls.map(([value]) => value)).toEqual([available, unavailable, available])
    onError(new Error('permission-denied'))
    expect(mock.setters[2]).toHaveBeenLastCalledWith(expect.stringContaining('Recarregue'))
    cleanup()
    expect(unsubscribe).toHaveBeenCalledOnce()
    onValue(unavailable)
    expect(mock.setters[0]).toHaveBeenCalledTimes(3)
  })

  it('não importa Firebase nem assina durante demonstração', async () => {
    mock.demo = true
    const { usePizzaAvailability } = await import('./usePizzaAvailability')
    expect(usePizzaAvailability().isLoading).toBe(false)
    mock.effect!()()
    await Promise.resolve(); await Promise.resolve()
    expect(mock.imported).not.toHaveBeenCalled()
    expect(mock.listen).not.toHaveBeenCalled()
  })

  it('não inicia assinatura se desmontar durante o import', async () => {
    const { usePizzaAvailability } = await import('./usePizzaAvailability')
    usePizzaAvailability()
    mock.effect!()()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(mock.listen).not.toHaveBeenCalled()
  })
})
