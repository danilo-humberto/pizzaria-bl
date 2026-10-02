import { buildPizzaOrderDocument } from '../../src/utils/buildPizzaOrderDocument'

export function createTestPizzaOrder() {
  return buildPizzaOrderDocument({
    items: [
      { id: '1', kind: 'pizza', optionId: 'calabresa-mussarela', quantity: 2, borderId: 'catupiry' },
      { id: '2', kind: 'pizza', optionId: 'portuguesa', quantity: 1 },
      { id: '3', kind: 'esfiha', optionId: 'frango', quantity: 8 },
      { id: '4', kind: 'beverage', optionId: 'agua-mineral', quantity: 3 },
    ],
    customer: { name: 'Cliente de teste', phone: '(81) 99999-1234' },
    payment: { method: 'pix', needsChange: false, changeFor: '' },
    observation: 'Sem cebola na portuguesa.',
  }, 'BL-TESTE', 'test-pizza-order', new Date('2026-10-02T18:30:00-03:00'))
}
