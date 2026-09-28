const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export const MONEY_INPUT_MAX_DIGITS = 9
export const MONEY_INPUT_MAX_LENGTH = 16

export function formatCurrency(value: number) {
  return brlFormatter.format(value)
}

export function getMoneyDigits(value: string) {
  return value.replace(/\D/g, '').slice(0, MONEY_INPUT_MAX_DIGITS)
}

export function formatBRLCurrencyInput(value: string) {
  const digits = getMoneyDigits(value)

  if (!digits) {
    return ''
  }

  return brlFormatter.format(Number(digits) / 100)
}

export function parseBRLCurrencyInput(value: string) {
  const digits = getMoneyDigits(value)

  if (!digits) {
    return undefined
  }

  return Number(digits) / 100
}
