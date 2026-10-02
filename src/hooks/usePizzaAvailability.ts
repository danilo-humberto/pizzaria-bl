import { useEffect, useState } from 'react'
import { listenPizzaAvailability } from '../services/pizzaAvailabilityService'
import { emptyPizzaAvailability } from '../types/pizzaAvailability'

// Usado apenas no administrativo autenticado, que não é carregado no modo demonstração.
export function usePizzaAvailability() {
  const [availability, setAvailability] = useState(emptyPizzaAvailability)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => listenPizzaAvailability((value) => {
    setAvailability(value)
    setIsLoading(false)
    setError(null)
  }, () => {
    setIsLoading(false)
    setError('Não foi possível carregar a disponibilidade do cardápio.')
  }), [])
  return { availability, isLoading, error }
}
