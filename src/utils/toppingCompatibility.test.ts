import { describe, expect, it } from 'vitest'
import {
  filterToppingSelectionsForSize,
  isToppingAllowedForSize,
} from './toppingCompatibility'

describe('toppingCompatibility', () => {
  it('bloqueia Paçoca e Canudo somente no pote P', () => {
    expect(isToppingAllowedForSize('p', 'pacoca')).toBe(false)
    expect(isToppingAllowedForSize('p', 'canudo')).toBe(false)
    expect(isToppingAllowedForSize('p', 'granola')).toBe(true)
    expect(isToppingAllowedForSize('m', 'pacoca')).toBe(true)
  })

  it('remove somente as guloseimas incompatíveis ao trocar para P', () => {
    expect(
      filterToppingSelectionsForSize('p', [
        { id: 'granola', quantity: 2 },
        { id: 'pacoca', quantity: 3 },
        { id: 'canudo', quantity: 1 },
      ]),
    ).toEqual([{ id: 'granola', quantity: 2 }])
  })
})
