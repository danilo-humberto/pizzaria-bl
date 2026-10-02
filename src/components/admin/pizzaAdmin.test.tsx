import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { createTestPizzaOrder } from '../../../tests/fixtures/pizzaOrder'
import { OrderCard } from './OrderCard'
import { OrderDetailsModal } from './OrderDetailsModal'
import { countOrderItems } from '../../utils/orderMetrics'
import { canCancelOrder, getNextOrderStatus } from '../../utils/orderDisplay'
import { formatCurrency } from '../../utils/formatCurrency'
import { readPizzaOrder } from '../../utils/readPizzaOrder'

const noop = () => {}

describe('operação de pedidos de pizza', () => {
  it('cartão identifica todas as linhas, quantidades, sabores e bordas', () => {
    const order = createTestPizzaOrder()
    const html = renderToStaticMarkup(<OrderCard order={order} isUpdating={false} onOpenDetails={noop} onStatusChange={noop} />)
    for (const text of ['2× Pizza Grande: Calabresa / Mussarela', 'Borda de catupiry', '1× Pizza Grande: Portuguesa', '8× Esfiha: Frango', '3× Bebida: Água Mineral', 'Retirada na loja', formatCurrency(142)]) {
      expect(html).toContain(text)
    }
    expect(html).not.toMatch(/açaí|Guloseimas|Sem tamanho|Produto não informado/i)
  })

  it('detalhes preservam valores salvos e mostram tamanho, borda, pagamento e observação', () => {
    const order = createTestPizzaOrder()
    // O administrativo deve apresentar os valores históricos, sem consultar preços atuais.
    order.items.lines[0].unitPriceCents = 3300
    order.items.lines[0].subtotalCents = 6600
    order.total = 144
    const html = renderToStaticMarkup(<OrderDetailsModal order={order} isUpdating={false} onClose={noop} onStatusChange={noop} />)
    for (const text of ['Calabresa / Mussarela', 'Portuguesa', 'Grande', 'Borda de catupiry', 'Sem borda recheada', '8× Esfiha: Frango', '3× Bebida: Água Mineral', 'Sem cebola na portuguesa.', 'Retirada na loja', formatCurrency(33), formatCurrency(66), formatCurrency(144)]) {
      expect(html).toContain(text)
    }
    expect(html).not.toMatch(/Frutas|Guloseimas|Calda/)
  })

  it('indicadores contam unidades sem duplicar meio a meio e excluem cancelados', () => {
    const order = createTestPizzaOrder()
    expect(countOrderItems([order, { ...order, status: 'cancelled' }])).toEqual([
      { kind: 'pizza', label: 'Pizzas grandes', count: 3 },
      { kind: 'esfiha', label: 'Esfihas', count: 8 },
      { kind: 'beverage', label: 'Bebidas', count: 3 },
    ])
    expect(countOrderItems([]).every((item) => item.count === 0)).toBe(true)
  })

  it('mantém a sequência de retirada e cancela apenas pedidos ativos', () => {
    expect(getNextOrderStatus('received')).toBe('preparing')
    expect(getNextOrderStatus('preparing')).toBe('ready_for_pickup')
    expect(getNextOrderStatus('ready_for_pickup')).toBe('completed')
    for (const status of ['completed', 'cancelled'] as const) {
      expect(getNextOrderStatus(status)).toBeNull()
      expect(canCancelOrder(status)).toBe(false)
      const html = renderToStaticMarkup(<OrderDetailsModal order={{ ...createTestPizzaOrder(), status }} isUpdating={false} onClose={noop} onStatusChange={noop} />)
      expect(html).not.toContain('Cancelar pedido')
    }
    expect(canCancelOrder('preparing')).toBe(true)
  })

  it('aceita o contrato 05 e informa dados incompatíveis sem tentar renderizá-los', () => {
    const order = createTestPizzaOrder()
    expect(readPizzaOrder(order)).toBe(order)
    for (const data of [null, { ...order, schemaVersion: 2 }, { ...order, status: 'delivery' }, { ...order, items: { ...order.items, lines: [null] } }, { ...order, items: { size: 'M' } }]) {
      expect(() => readPizzaOrder(data)).toThrow('Pedido incompatível')
    }
  })
})
