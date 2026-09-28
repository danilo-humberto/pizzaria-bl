export const PHONE_MAX_DIGITS = 11
export const PHONE_MASK_MAX_LENGTH = 15

const PHONE_MIN_DIGITS = 10

export function getPhoneDigits(value: string) {
  const digits = value.replace(/\D/g, '')
  const normalizedDigits = digits.length > PHONE_MAX_DIGITS && digits.startsWith('55') ? digits.slice(2) : digits

  return normalizedDigits.slice(0, PHONE_MAX_DIGITS)
}

export function formatPhoneNumber(value: string) {
  const digits = getPhoneDigits(value)

  if (!digits) {
    return ''
  }

  if (digits.length <= 2) {
    return `(${digits}`
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function isCompletePhoneNumber(value: string) {
  return getPhoneDigits(value).length >= PHONE_MIN_DIGITS
}
