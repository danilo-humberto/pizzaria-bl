import { describe, expect, it, vi } from 'vitest'
import { getFirebaseConfig } from './firebaseConfig'
import { getIsDemoMode } from './demoMode'

const config = {
  VITE_FIREBASE_API_KEY: 'test-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'pizzaria-bl.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'pizzaria-bl',
  VITE_FIREBASE_STORAGE_BUCKET: 'pizzaria-bl.firebasestorage.app',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '123',
  VITE_FIREBASE_APP_ID: 'test-app',
}

describe('destino Firebase exclusivo', () => {
  it('configuração ausente ou de outro projeto mantém demonstração mesmo com flag false', () => {
    expect(getIsDemoMode({ VITE_DEMO_MODE: 'false' })).toBe(true)
    expect(getIsDemoMode({ ...config, VITE_DEMO_MODE: 'false', VITE_FIREBASE_PROJECT_ID: 'other-project' })).toBe(true)
    expect(getIsDemoMode({ ...config, VITE_DEMO_MODE: 'false' })).toBe(false)
    expect(getIsDemoMode(config)).toBe(true)
  })
  it('aceita o projeto confirmado sem exigir Analytics', () => {
    expect(getFirebaseConfig(config).projectId).toBe('pizzaria-bl')
    expect(getFirebaseConfig(config)).not.toHaveProperty('measurementId')
  })
  it.each(['VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_AUTH_DOMAIN'])('recusa outro destino em %s', (key) => {
    expect(() => getFirebaseConfig({ ...config, [key]: 'another-project' })).toThrow('exclusivamente')
  })
  it.each(Object.keys(config))('recusa configuração incompleta: %s', (key) => {
    expect(() => getFirebaseConfig({ ...config, [key]: '' })).toThrow('sem configuracao')
  })
  it('continua em demonstração sem configuração', async () => {
    vi.stubEnv('VITE_DEMO_MODE', undefined)
    vi.resetModules()
    try {
      expect((await import('./demoMode')).isDemoMode).toBe(true)
    } finally {
      vi.unstubAllEnvs()
    }
  })
})
