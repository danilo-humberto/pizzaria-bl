import { fruits } from '../data/fruits'
import { getIceCreamFlavorsByIds } from '../data/iceCreamFlavors'
import { orderTypes } from '../data/orderTypes'
import { paymentMethods, SHOW_CASH_CHANGE_DETAILS } from '../data/paymentMethods'
import { sizes } from '../data/sizes'
import { syrups } from '../data/syrups'
import { toppings } from '../data/toppings'
import type { Order, OrderConfirmationData, OrderDraft } from '../types/order'
import { calculateOrderTotal } from './calculateOrderTotal'
import { parseBRLCurrencyInput } from './formatCurrency'
import { buildPortionOrderItems, getPortionSelectionIds } from './portionSelections'

export type MockOrderResult = OrderConfirmationData & {
  order: Order
}

function createPublicCode() {
  const code = Math.floor(1000 + Math.random() * 9000)

  return `AC-${code}`
}

function createTrackingSuffix() {
  return Math.random().toString(36).slice(2, 7)
}

export function createMockOrder(orderDraft: OrderDraft): MockOrderResult {
  const publicCode = createPublicCode()
  const trackingCode = `${publicCode}-${createTrackingSuffix()}`
  const trackingUrl = `/pedido/${trackingCode}`
  const selectedOrderType = orderTypes.find((orderType) => orderType.id === orderDraft.orderTypeId)
  const selectedSize = sizes.find((size) => size.id === orderDraft.sizeId)
  const selectedIceCreamFlavors = getIceCreamFlavorsByIds(orderDraft.iceCreamFlavorIds)
  const selectedFruits = buildPortionOrderItems(fruits, orderDraft.fruitSelections)
  const selectedToppings = buildPortionOrderItems(toppings, orderDraft.toppingSelections)
  const syrupId = orderDraft.syrupSelection?.id ?? 'sem-calda'
  const selectedSyrup = syrups.find((syrup) => syrup.id === syrupId)
  const selectedSyrupPortion = orderDraft.syrupSelection
    ? buildPortionOrderItems(syrups, [orderDraft.syrupSelection])[0]
    : undefined
  const selectedPayment = paymentMethods.find((payment) => payment.id === orderDraft.payment.method)
  const now = new Date().toISOString()

  return {
    publicCode,
    trackingCode,
    trackingUrl,
    order: {
      id: trackingCode,
      publicCode,
      trackingCode,
      status: 'received',
      customer: {
        name: orderDraft.customer.name.trim(),
        phone: orderDraft.customer.phone.trim(),
      },
      items: {
        productName: selectedOrderType?.name,
        size: selectedSize?.name,
        iceCreamFlavorIds: orderDraft.iceCreamFlavorIds,
        iceCreamFlavors: selectedIceCreamFlavors.map((flavor) => flavor.name),
        iceCreamFlavorId: orderDraft.iceCreamFlavorIds[0] ?? '',
        iceCreamFlavor: selectedIceCreamFlavors[0]?.name,
        fruitIds: getPortionSelectionIds(orderDraft.fruitSelections),
        fruits: selectedFruits.map((fruit) => fruit.name),
        fruitPortions: selectedFruits,
        toppingIds: getPortionSelectionIds(orderDraft.toppingSelections),
        toppings: selectedToppings.map((topping) => topping.name),
        toppingPortions: selectedToppings,
        syrupId,
        syrup: selectedSyrup?.name,
        syrupPortion: selectedSyrupPortion,
        observation: orderDraft.observation.trim() || undefined,
      },
      payment: {
        method: selectedPayment?.id,
        needsChange:
          SHOW_CASH_CHANGE_DETAILS && orderDraft.payment.method === 'cash'
            ? orderDraft.payment.needsChange
            : false,
        changeFor:
          SHOW_CASH_CHANGE_DETAILS &&
          orderDraft.payment.method === 'cash' &&
          orderDraft.payment.needsChange
            ? parseBRLCurrencyInput(orderDraft.payment.changeFor)
            : undefined,
      },
      total: calculateOrderTotal(orderDraft),
      createdAt: now,
      updatedAt: now,
    },
  }
}
