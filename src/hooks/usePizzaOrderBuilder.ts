import { useMemo, useRef, useState } from 'react'
import { demoOrderNotice, isDemoMode } from '../config/demoMode'
import { pizzaBorders, pizzaOrderRules } from '../data/pizzaMenu'
import { SHOW_CASH_CHANGE_DETAILS } from '../data/paymentMethods'
import type { CustomerData, OrderConfirmationData, PaymentData, PaymentMethod } from '../types/order'
import { UnavailablePizzaItemsError } from '../utils/pizzaAvailability'
import type { PizzaAdditionResult, PizzaBorderQuantities, PizzaOrderDraft, PizzaOrderItem } from '../types/pizzaOrder'
import { buildPizzaAddition, calculatePizzaOrderTotal, getFlavorQuantity, getPizzaFlavorIds, getPizzaOption, validatePizzaOrder } from '../utils/pizzaOrder'

const initialOrder: PizzaOrderDraft = {
  items: [],
  observation: '',
  customer: { name: '', phone: '' },
  payment: { method: '', needsChange: false, changeFor: '' },
}

function withinFlavorLimit(items: PizzaOrderItem[]) {
  return items.every((item) => item.kind !== 'pizza' || getPizzaFlavorIds(item.optionId).every((flavorId) =>
    getFlavorQuantity(items, flavorId) <= pizzaOrderRules.maxQuantityPerFlavorPerOrder,
  ))
}

export function usePizzaOrderBuilder() {
  const [order, setOrder] = useState<PizzaOrderDraft>(initialOrder)
  const [itemError, setItemError] = useState('')
  const [confirmationData, setConfirmationData] = useState<OrderConfirmationData | null>(null)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [finalizeError, setFinalizeError] = useState<string | null>(null)
  const finalizingRef = useRef(false)
  const confirmationRef = useRef<OrderConfirmationData | null>(null)
  const nextId = useRef(0)
  const itemsRef = useRef(initialOrder.items)
  const total = useMemo(() => calculatePizzaOrderTotal(order), [order])
  const validation = useMemo(() => validatePizzaOrder(order), [order])

  const updateItems = (items: PizzaOrderItem[]) => {
    itemsRef.current = items
    setOrder((current) => ({ ...current, items }))
  }

  const addPizzas = (optionId: string, quantity: number, borderQuantities: PizzaBorderQuantities): PizzaAdditionResult => {
    const result = buildPizzaAddition(itemsRef.current, optionId, quantity, borderQuantities)
    if (!result.ok) {
      setItemError(result.error)
      return result
    }
    const addedItems = result.items.map((item) => ({ ...item, id: String(++nextId.current) }))
    updateItems([...itemsRef.current, ...addedItems])
    setItemError('')
    return { ok: true, addedItems }
  }

  const rejectAddition = (error: string): PizzaAdditionResult => {
    setItemError(error)
    return { ok: false, error }
  }

  const addItem = (kind: PizzaOrderItem['kind'], optionId: string, quantity: number, borderId?: string): PizzaAdditionResult => {
    const item: PizzaOrderItem = { id: String(++nextId.current), kind, optionId, quantity, ...(kind === 'pizza' && borderId ? { borderId } : {}) }
    if (!getPizzaOption(item) || !Number.isSafeInteger(quantity) || quantity < 1) {
      return rejectAddition('Escolha um item e informe uma quantidade válida.')
    }
    if (kind === 'pizza' && getPizzaFlavorIds(optionId).length === 0) {
      return rejectAddition('Escolha uma pizza do cardápio.')
    }
    if (kind === 'pizza' && borderId && !pizzaBorders.some((border) => border.id === borderId)) {
      return rejectAddition('Escolha uma borda do cardápio.')
    }
    const updated = [...itemsRef.current, item]
    if (!withinFlavorLimit(updated)) {
      return rejectAddition(`Cada sabor pode ter no máximo ${pizzaOrderRules.maxQuantityPerFlavorPerOrder} pizzas por pedido. Meio a meio conta para os dois sabores.`)
    }
    updateItems(updated)
    setItemError('')
    return { ok: true, addedItems: [item] }
  }

  const setItemQuantity = (id: string, quantity: number) => {
    if (!Number.isSafeInteger(quantity) || quantity < 1) return
    const items = itemsRef.current.map((item) => item.id === id ? { ...item, quantity } : item)
    if (!withinFlavorLimit(items)) {
      setItemError(`Cada sabor pode ter no máximo ${pizzaOrderRules.maxQuantityPerFlavorPerOrder} pizzas por pedido.`)
      return
    }
    updateItems(items)
    setItemError('')
  }

  const setItemBorder = (id: string, borderId: string) => {
    if (borderId && !pizzaBorders.some((border) => border.id === borderId)) return
    updateItems(itemsRef.current.map((item) => item.id === id && item.kind === 'pizza' ? { ...item, borderId: borderId || undefined } : item))
  }

  const removeItem = (id: string) => {
    updateItems(itemsRef.current.filter((item) => item.id !== id))
    setItemError('')
  }

  const updateCustomerData = (field: keyof CustomerData, value: string) => {
    setOrder((current) => ({ ...current, customer: { ...current.customer, [field]: value } }))
  }

  const setPaymentMethod = (method: PaymentMethod) => {
    setOrder((current) => ({ ...current, payment: {
      ...current.payment,
      method,
      needsChange: SHOW_CASH_CHANGE_DETAILS && method === 'cash' ? current.payment.needsChange : false,
      changeFor: SHOW_CASH_CHANGE_DETAILS && method === 'cash' ? current.payment.changeFor : '',
    } }))
  }

  const updatePaymentData = (field: keyof PaymentData, value: string | boolean) => {
    setOrder((current) => ({ ...current, payment: { ...current.payment, [field]: value } }))
  }

  const finalizeOrder = async () => {
    if (isDemoMode) {
      setFinalizeError(demoOrderNotice)
      return false
    }
    if (finalizingRef.current) return false
    if (confirmationRef.current) {
      setIsConfirmationModalOpen(true)
      return true
    }
    if (!validation.isValid) return false

    // O ref bloqueia dois cliques no mesmo frame, antes de React atualizar os botões.
    finalizingRef.current = true
    setIsFinalizing(true)
    setFinalizeError(null)
    try {
      const { createPizzaOrder } = await import('../services/orderService')
      const confirmation = await createPizzaOrder(order)
      confirmationRef.current = confirmation
      setConfirmationData(confirmation)
      setIsConfirmationModalOpen(true)
      return true
    } catch (error) {
      setFinalizeError(error instanceof UnavailablePizzaItemsError
        ? error.message
        : 'Não foi possível enviar o pedido. Seus dados foram mantidos; confira sua conexão e tente novamente.')
      return false
    } finally {
      finalizingRef.current = false
      setIsFinalizing(false)
    }
  }

  const resetOrder = () => {
    if (finalizingRef.current) return
    itemsRef.current = initialOrder.items
    confirmationRef.current = null
    setOrder(initialOrder)
    setItemError('')
    setFinalizeError(null)
    setConfirmationData(null)
    setIsConfirmationModalOpen(false)
  }

  return {
    order, total, validation, itemError,
    confirmationData, isConfirmationModalOpen, isFinalizing, finalizeError,
    finalizeOrder, resetOrder,
    closeConfirmationModal: () => setIsConfirmationModalOpen(false),
    addItem, addPizzas, setItemQuantity, setItemBorder, removeItem,
    updateCustomerData, setPaymentMethod, updatePaymentData,
    setObservation: (observation: string) => setOrder((current) => ({ ...current, observation })),
  }
}

export type PizzaOrderBuilder = ReturnType<typeof usePizzaOrderBuilder>
