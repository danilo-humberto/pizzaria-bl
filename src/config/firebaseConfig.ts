export const firebaseProjectId = 'pizzaria-bl'

export function getFirebaseConfig(env: Record<string, string | undefined>) {
  const config = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  }
  const missing = Object.entries(config).filter(([, value]) => !value?.trim()).map(([key]) => key)
  if (missing.length) throw new Error(`Firebase sem configuracao: ${missing.join(', ')}`)
  if (config.projectId !== firebaseProjectId || config.authDomain !== `${firebaseProjectId}.firebaseapp.com`) {
    throw new Error('A integração deve usar exclusivamente o projeto Firebase pizzaria-bl.')
  }
  return {
    ...config,
    ...(env.VITE_FIREBASE_MEASUREMENT_ID ? { measurementId: env.VITE_FIREBASE_MEASUREMENT_ID } : {}),
  }
}
