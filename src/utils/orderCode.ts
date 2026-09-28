export function generatePublicCode() {
  const code = Math.floor(1000 + Math.random() * 9000)

  return `AC-${code}`
}

export function generateTrackingCode(publicCode: string) {
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase()

  return `${publicCode}-${suffix}`
}
