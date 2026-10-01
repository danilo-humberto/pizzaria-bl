import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { usePizzaOrderBuilder } from './usePizzaOrderBuilder'

function captureBuilder() {
  let builder: ReturnType<typeof usePizzaOrderBuilder> | undefined
  function CaptureBuilder() {
    builder = usePizzaOrderBuilder()
    return null
  }
  renderToString(createElement(CaptureBuilder))
  return builder!
}

describe('resultado da adição para avisos de sucesso', () => {
  it('retorna os itens adicionados para esfihas e bebidas sem limite de cinco', () => {
    const builder = captureBuilder()
    expect(builder.addItem('esfiha', 'calabresa', 6)).toMatchObject({
      ok: true,
      addedItems: [{ kind: 'esfiha', optionId: 'calabresa', quantity: 6 }],
    })
    expect(builder.addItem('beverage', 'fanta-2l', 8)).toMatchObject({
      ok: true,
      addedItems: [{ kind: 'beverage', optionId: 'fanta-2l', quantity: 8 }],
    })
  })

  it('retorna erro sem itens de sucesso para produto ou quantidade inválidos', () => {
    const builder = captureBuilder()
    for (const result of [
      builder.addItem('esfiha', 'inexistente', 1),
      builder.addItem('beverage', 'fanta-2l', 0),
      builder.addItem('esfiha', 'calabresa', 1.5),
    ]) {
      expect(result).toEqual({ ok: false, error: expect.any(String) })
      expect(result).not.toHaveProperty('addedItems')
    }
  })
})
