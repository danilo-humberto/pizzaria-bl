import { doc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { IngredientAvailability, IngredientCategory } from '../types/availability'
import {
  availabilityFieldByCategory,
  emptyIngredientAvailability,
  normalizeIngredientAvailability,
} from '../utils/ingredientAvailability'

const AVAILABILITY_DOCUMENT_PATH = ['storeSettings', 'ingredientAvailability'] as const

export function getIngredientAvailabilityReference() {
  return doc(db, ...AVAILABILITY_DOCUMENT_PATH)
}

export function listenIngredientAvailability(
  callback: (availability: IngredientAvailability) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(
    getIngredientAvailabilityReference(),
    (snapshot) => {
      callback(
        snapshot.exists()
          ? normalizeIngredientAvailability(snapshot.data())
          : emptyIngredientAvailability,
      )
    },
    (error) => {
      console.error('[disponibilidade] Falha ao acompanhar ingredientes:', error)
      onError?.(error)
    },
  )
}

export async function setIngredientAvailability(
  category: IngredientCategory,
  ingredientId: string,
  isAvailable: boolean,
) {
  const reference = getIngredientAvailabilityReference()
  const field = availabilityFieldByCategory[category]

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference)
    const current = snapshot.exists()
      ? normalizeIngredientAvailability(snapshot.data())
      : { ...emptyIngredientAvailability }
    const nextIds = new Set(current[field])

    if (isAvailable) {
      nextIds.delete(ingredientId)
    } else {
      nextIds.add(ingredientId)
    }

    transaction.set(reference, {
      ...current,
      [field]: [...nextIds],
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser?.uid ?? null,
    })
  })
}
