import { getFirebaseConfig } from './firebaseConfig'

export function getIsDemoMode(env: Record<string, string | undefined>) {
  if (env.VITE_DEMO_MODE !== 'false') return true
  try {
    getFirebaseConfig(env)
    return false
  } catch {
    return true
  }
}

export const isDemoMode = getIsDemoMode(import.meta.env)

export const demoOrderNotice = 'Demonstração: pedidos não são enviados'
