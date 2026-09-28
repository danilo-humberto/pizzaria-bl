import { useEffect, useState } from 'react'
import { isDemoMode } from '../config/demoMode'
import type { IngredientAvailability } from '../types/availability'
import { emptyIngredientAvailability } from '../utils/ingredientAvailability'

export async function loadIngredientAvailabilityListener() {
  if (isDemoMode) {
    return null
  }

  const { listenIngredientAvailability } = await import('../services/ingredientAvailabilityService')
  return listenIngredientAvailability
}

export function useIngredientAvailability() {
  const [availability, setAvailability] = useState<IngredientAvailability>(
    emptyIngredientAvailability,
  )
  const [isLoading, setIsLoading] = useState(!isDemoMode)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false
    let unsubscribe: (() => void) | undefined

    void loadIngredientAvailabilityListener().then(
      (listenIngredientAvailability) => {
        if (isCancelled || !listenIngredientAvailability) {
          return
        }

        unsubscribe = listenIngredientAvailability(
          (currentAvailability) => {
            setAvailability(currentAvailability)
            setIsLoading(false)
            setError(null)
          },
          () => {
            setIsLoading(false)
            setError('Não foi possível carregar a disponibilidade dos ingredientes.')
          },
        )
      },
      () => {
        if (!isCancelled) {
          setIsLoading(false)
          setError('Não foi possível carregar a disponibilidade dos ingredientes.')
        }
      },
    )

    return () => {
      isCancelled = true
      unsubscribe?.()
    }
  }, [])

  return { availability, isLoading, error }
}
