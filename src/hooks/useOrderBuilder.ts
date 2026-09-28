import { useEffect, useMemo, useState } from 'react'
import { demoOrderNotice, isDemoMode } from '../config/demoMode'
import { fruits } from '../data/fruits'
import { getIceCreamFlavorsByIds } from '../data/iceCreamFlavors'
import { getIceCreamFlavorLimit, orderTypeNeedsIceCreamFlavor, orderTypes } from '../data/orderTypes'
import { SHOW_CASH_CHANGE_DETAILS } from '../data/paymentMethods'
import { sizes } from '../data/sizes'
import { syrups } from '../data/syrups'
import { toppings } from '../data/toppings'
import type {
  CustomerData,
  OrderConfirmationData,
  OrderDraft,
  OrderTypeId,
  PaymentData,
  PaymentMethod,
} from '../types/order'
import { calculateExtraPortionsTotal, calculateOrderTotal } from '../utils/calculateOrderTotal'
import {
  getUnavailableOrderIngredients,
  isIngredientAvailable,
  removeUnavailableIngredients,
  UnavailableIngredientsError,
} from '../utils/ingredientAvailability'
import { validateOrder } from '../utils/validateOrder'
import {
  filterToppingSelectionsForSize,
  isToppingAllowedForSize,
} from '../utils/toppingCompatibility'
import {
  buildPortionOrderItems,
  decrementPortionSelection,
  incrementPortionSelection,
  togglePortionSelection,
} from '../utils/portionSelections'
import { useIngredientAvailability } from './useIngredientAvailability'

const initialOrder: OrderDraft = {
  sizeId: '',
  orderTypeId: '',
  iceCreamFlavorIds: [],
  fruitSelections: [],
  toppingSelections: [],
  syrupSelection: null,
  observation: '',
  customer: {
    name: '',
    phone: '',
  },
  payment: {
    method: '',
    needsChange: false,
    changeFor: '',
  },
}

export function useOrderBuilder() {
  const [order, setOrder] = useState<OrderDraft>(initialOrder)
  const [confirmationData, setConfirmationData] = useState<OrderConfirmationData | null>(null)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [finalizeError, setFinalizeError] = useState<string | null>(null)
  const [availabilityNotice, setAvailabilityNotice] = useState<string | null>(null)
  const {
    availability,
    isLoading: isAvailabilityLoading,
    error: availabilityError,
  } = useIngredientAvailability()
  const isAvailabilityReady = !isAvailabilityLoading && !availabilityError

  const selectedSize = useMemo(() => sizes.find((size) => size.id === order.sizeId), [order.sizeId])
  const selectedOrderType = useMemo(
    () => orderTypes.find((orderType) => orderType.id === order.orderTypeId),
    [order.orderTypeId],
  )
  const shouldChooseIceCreamFlavor = orderTypeNeedsIceCreamFlavor(order.orderTypeId)
  const maxIceCreamFlavorSelections = getIceCreamFlavorLimit(order.orderTypeId)
  const selectedIceCreamFlavors = useMemo(
    () => getIceCreamFlavorsByIds(order.iceCreamFlavorIds),
    [order.iceCreamFlavorIds],
  )
  const selectedFruits = useMemo(
    () => buildPortionOrderItems(fruits, order.fruitSelections),
    [order.fruitSelections],
  )
  const selectedToppings = useMemo(
    () => buildPortionOrderItems(toppings, order.toppingSelections),
    [order.toppingSelections],
  )
  const selectedSyrup = useMemo(() => {
    if (order.syrupSelection) {
      const selectedPortion = buildPortionOrderItems(syrups, [order.syrupSelection])[0]

      if (selectedPortion) {
        return selectedPortion
      }
    }

    return {
      id: 'sem-calda',
      name: syrups.find((syrup) => syrup.id === 'sem-calda')?.name ?? 'Sem calda',
      quantity: 0,
      extraUnitPriceCents: 0,
      extraSubtotalCents: 0,
    }
  }, [order.syrupSelection])

  const total = useMemo(() => calculateOrderTotal(order), [order])
  const extraPortionsTotal = useMemo(() => calculateExtraPortionsTotal(order), [order])
  const validation = useMemo(() => {
    const currentValidation = validateOrder(order)

    if (isAvailabilityLoading) {
      currentValidation.errors.push('Aguarde o carregamento dos ingredientes disponíveis.')
    } else if (availabilityError) {
      currentValidation.errors.push(availabilityError)
    } else {
      const unavailableItems = getUnavailableOrderIngredients(order, availability)

      if (unavailableItems.length > 0) {
        currentValidation.errors.push(
          `Escolha novamente: ${unavailableItems.map((item) => item.name).join(', ')} ${unavailableItems.length === 1 ? 'está indisponível' : 'estão indisponíveis'}.`,
        )
      }
    }

    currentValidation.isValid = currentValidation.errors.length === 0

    return currentValidation
  }, [availability, availabilityError, isAvailabilityLoading, order])

  useEffect(() => {
    if (!isAvailabilityReady) {
      return
    }

    const result = removeUnavailableIngredients(order, availability)

    if (result.removedItems.length === 0) {
      return
    }

    setOrder(result.order)
    setAvailabilityNotice(
      `${result.removedItems.map((item) => item.name).join(', ')} ${result.removedItems.length === 1 ? 'ficou indisponível e foi removido' : 'ficaram indisponíveis e foram removidos'} do pedido.`,
    )
  }, [availability, isAvailabilityReady, order])

  const setSize = (sizeId: string) => {
    setOrder((current) => ({
      ...current,
      sizeId,
      toppingSelections: filterToppingSelectionsForSize(sizeId, current.toppingSelections),
    }))
  }

  const setOrderType = (orderTypeId: OrderTypeId) => {
    setOrder((current) => ({
      ...current,
      orderTypeId,
      iceCreamFlavorIds: current.iceCreamFlavorIds.slice(
        0,
        getIceCreamFlavorLimit(orderTypeId),
      ),
    }))
  }

  const toggleIceCreamFlavor = (iceCreamFlavorId: string) => {
    if (
      !isAvailabilityReady ||
      !isIngredientAvailable(availability, 'creamFlavors', iceCreamFlavorId)
    ) {
      return
    }

    setOrder((current) => {
      const alreadySelected = current.iceCreamFlavorIds.includes(iceCreamFlavorId)
      const maxSelections = getIceCreamFlavorLimit(current.orderTypeId)
      const iceCreamFlavorIds = alreadySelected
        ? current.iceCreamFlavorIds.filter((id) => id !== iceCreamFlavorId)
        : current.iceCreamFlavorIds.length < maxSelections
          ? [...current.iceCreamFlavorIds, iceCreamFlavorId]
          : current.iceCreamFlavorIds

      return { ...current, iceCreamFlavorIds }
    })
  }

  const toggleFruit = (fruitId: string) => {
    if (!isAvailabilityReady || !isIngredientAvailable(availability, 'fruits', fruitId)) {
      return
    }

    setOrder((current) => {
      return {
        ...current,
        fruitSelections: togglePortionSelection(current.fruitSelections, fruitId),
      }
    })
  }

  const incrementFruit = (fruitId: string) => {
    if (!isAvailabilityReady || !isIngredientAvailable(availability, 'fruits', fruitId)) {
      return
    }

    setOrder((current) => ({
      ...current,
      fruitSelections: incrementPortionSelection(current.fruitSelections, fruitId),
    }))
  }

  const decrementFruit = (fruitId: string) => {
    setOrder((current) => ({
      ...current,
      fruitSelections: decrementPortionSelection(current.fruitSelections, fruitId),
    }))
  }

  const toggleTopping = (toppingId: string) => {
    if (!isAvailabilityReady || !isIngredientAvailable(availability, 'toppings', toppingId)) {
      return
    }

    setOrder((current) => {
      if (!isToppingAllowedForSize(current.sizeId, toppingId)) {
        return current
      }

      return {
        ...current,
        toppingSelections: togglePortionSelection(current.toppingSelections, toppingId),
      }
    })
  }

  const incrementTopping = (toppingId: string) => {
    if (!isAvailabilityReady || !isIngredientAvailable(availability, 'toppings', toppingId)) {
      return
    }

    setOrder((current) => {
      if (!isToppingAllowedForSize(current.sizeId, toppingId)) {
        return current
      }

      return {
        ...current,
        toppingSelections: incrementPortionSelection(current.toppingSelections, toppingId),
      }
    })
  }

  const decrementTopping = (toppingId: string) => {
    setOrder((current) => ({
      ...current,
      toppingSelections: decrementPortionSelection(current.toppingSelections, toppingId),
    }))
  }

  const setSyrup = (syrupId: string) => {
    if (syrupId === 'sem-calda') {
      setOrder((current) => ({ ...current, syrupSelection: null }))
      return
    }

    if (!isAvailabilityReady || !isIngredientAvailable(availability, 'syrups', syrupId)) {
      return
    }

    setOrder((current) =>
      current.syrupSelection?.id === syrupId
        ? current
        : { ...current, syrupSelection: { id: syrupId, quantity: 1 } },
    )
  }

  const incrementSyrup = (syrupId: string) => {
    if (!isAvailabilityReady || !isIngredientAvailable(availability, 'syrups', syrupId)) {
      return
    }

    setOrder((current) => {
      if (current.syrupSelection?.id !== syrupId) {
        return { ...current, syrupSelection: { id: syrupId, quantity: 1 } }
      }

      return {
        ...current,
        syrupSelection: incrementPortionSelection([current.syrupSelection], syrupId)[0],
      }
    })
  }

  const decrementSyrup = (syrupId: string) => {
    setOrder((current) => {
      if (current.syrupSelection?.id !== syrupId) {
        return current
      }

      const selections = decrementPortionSelection([current.syrupSelection], syrupId)

      return { ...current, syrupSelection: selections[0] ?? null }
    })
  }

  const setObservation = (observation: string) => {
    setOrder((current) => ({ ...current, observation }))
  }

  const updateCustomerData = (field: keyof CustomerData, value: string) => {
    setOrder((current) => ({
      ...current,
      customer: { ...current.customer, [field]: value },
    }))
  }

  const setPaymentMethod = (method: PaymentMethod) => {
    setOrder((current) => ({
      ...current,
      payment: {
        ...current.payment,
        method,
        needsChange:
          SHOW_CASH_CHANGE_DETAILS && method === 'cash'
            ? current.payment.needsChange
            : false,
        changeFor:
          SHOW_CASH_CHANGE_DETAILS && method === 'cash'
            ? current.payment.changeFor
            : '',
      },
    }))
  }

  const updatePaymentData = (field: keyof PaymentData, value: string | boolean) => {
    setOrder((current) => ({
      ...current,
      payment: { ...current.payment, [field]: value },
    }))
  }

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false)
  }

  const finalizeOrder = async () => {
    if (isDemoMode) {
      setFinalizeError(demoOrderNotice)
      return false
    }

    if (!validation.isValid) {
      return false
    }

    setIsFinalizing(true)
    setFinalizeError(null)

    try {
      const { createOrder } = await import('../services/orderService')
      const createdOrder = await createOrder(order)

      setConfirmationData(createdOrder)
      setIsConfirmationModalOpen(true)

      return true
    } catch (error) {
      console.error('[pedido] Falha ao finalizar pedido no Firestore:', error)
      setFinalizeError(
        error instanceof UnavailableIngredientsError
          ? `${error.ingredientNames.join(', ')} ficou indisponível. Ajuste o pedido para continuar.`
          : 'Não foi possível finalizar o pedido agora. Tente novamente em instantes.',
      )

      return false
    } finally {
      setIsFinalizing(false)
    }
  }

  const resetOrder = () => {
    setOrder(initialOrder)
    setConfirmationData(null)
    setIsConfirmationModalOpen(false)
    setFinalizeError(null)
    setAvailabilityNotice(null)
  }

  return {
    order,
    selectedSize,
    selectedOrderType,
    selectedIceCreamFlavors,
    shouldChooseIceCreamFlavor,
    maxIceCreamFlavorSelections,
    selectedFruits,
    selectedToppings,
    selectedSyrup,
    total,
    extraPortionsTotal,
    validation,
    confirmationData,
    isConfirmationModalOpen,
    isFinalizing,
    finalizeError,
    availability,
    isAvailabilityLoading,
    isAvailabilityReady,
    availabilityError,
    availabilityNotice,
    setSize,
    setOrderType,
    toggleIceCreamFlavor,
    toggleFruit,
    incrementFruit,
    decrementFruit,
    toggleTopping,
    incrementTopping,
    decrementTopping,
    setSyrup,
    incrementSyrup,
    decrementSyrup,
    setObservation,
    updateCustomerData,
    setPaymentMethod,
    updatePaymentData,
    finalizeOrder,
    closeConfirmationModal,
    resetOrder,
  }
}

export type OrderBuilder = ReturnType<typeof useOrderBuilder>
