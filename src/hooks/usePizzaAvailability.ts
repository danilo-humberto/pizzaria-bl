import { useEffect, useState } from 'react'
import { isDemoMode } from '../config/demoMode'
import { emptyPizzaAvailability } from '../types/pizzaAvailability'

export async function loadPizzaAvailabilityListener() {
  if (isDemoMode) return null
  return (await import('../services/pizzaAvailabilityService')).listenPizzaAvailability
}

export function usePizzaAvailability() {
  const [availability, setAvailability] = useState(emptyPizzaAvailability)
  const [isLoading, setIsLoading] = useState(!isDemoMode)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    let unsubscribe: (() => void) | undefined
    const fail = () => {
      if (cancelled) return
      setIsLoading(false)
      setError('Não foi possível carregar a disponibilidade do cardápio. Recarregue a página para tentar novamente.')
    }
    void loadPizzaAvailabilityListener().then((listen) => {
      if (cancelled || !listen) return
      unsubscribe = listen((value) => {
        if (cancelled) return
        setAvailability(value)
        setIsLoading(false)
        setError(null)
      }, fail)
    }).catch(fail)
    return () => { cancelled = true; unsubscribe?.() }
  }, [])
  return { availability, isLoading, error }
}
