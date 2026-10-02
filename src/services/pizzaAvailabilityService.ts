import { doc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { PizzaAvailability } from '../types/pizzaAvailability'
import { normalizePizzaAvailability, pizzaAvailabilityCategories, type PizzaAvailabilityCategory } from '../utils/pizzaAvailability'

export function getPizzaAvailabilityReference() {
  return doc(db, 'storeSettings', 'pizzaAvailability')
}

export function listenPizzaAvailability(callback: (availability: PizzaAvailability) => void, onError?: (error: Error) => void) {
  return onSnapshot(getPizzaAvailabilityReference(), (snapshot) => {
    callback(normalizePizzaAvailability(snapshot.data()))
  }, onError)
}

export async function setPizzaAvailability(category: PizzaAvailabilityCategory, id: string, isAvailable: boolean) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Entre com uma conta administrativa para alterar a disponibilidade.')
  if (!pizzaAvailabilityCategories.find((item) => item.id === category)?.items.some((item) => item.id === id)) {
    throw new Error('Opção de cardápio inválida.')
  }
  const reference = getPizzaAvailabilityReference()
  // As regras do Firestore verificam admins/{uid}.active; o login sozinho não autoriza a gravação.
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference)
    const current = normalizePizzaAvailability(snapshot.data())
    const nextIds = new Set(current[category])
    if (isAvailable) nextIds.delete(id)
    else nextIds.add(id)
    transaction.set(reference, { ...current, [category]: [...nextIds], updatedAt: serverTimestamp(), updatedBy: uid })
  })
}
