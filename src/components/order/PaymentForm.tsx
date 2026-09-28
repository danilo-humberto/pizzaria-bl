import { Banknote, CreditCard, QrCode } from 'lucide-react'
import { paymentMethods, SHOW_CASH_CHANGE_DETAILS } from '../../data/paymentMethods'
import type { OrderValidation, PaymentData, PaymentMethod } from '../../types/order'
import { formatBRLCurrencyInput, MONEY_INPUT_MAX_LENGTH } from '../../utils/formatCurrency'
import { Input } from '../ui/Input'
import { RadioCard } from '../ui/RadioCard'

type PaymentFormProps = {
  payment: PaymentData
  fieldErrors: OrderValidation['fieldErrors']
  stepNumber: number
  onMethodChange: (method: PaymentMethod) => void
  onPaymentChange: (field: keyof PaymentData, value: string | boolean) => void
}

const paymentIcons = {
  pix: <QrCode size={18} />,
  card: <CreditCard size={18} />,
  cash: <Banknote size={18} />,
}

export function PaymentForm({ payment, fieldErrors, stepNumber, onMethodChange, onPaymentChange }: PaymentFormProps) {
  const isCash = payment.method === 'cash'

  return (
    <section id="builder-payment" className="scroll-mt-28">
      <div className="mb-5">
        <p className="text-sm font-extrabold text-[var(--brand-primary)]">{stepNumber}. Pagamento</p>
        <h3 className="break-words font-display text-3xl font-extrabold leading-tight text-[var(--text-primary)]">Escolha a forma de pagamento</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {paymentMethods.map((method) => (
          <RadioCard
            key={method.id}
            title={method.name}
            description={method.description}
            selected={payment.method === method.id}
            icon={paymentIcons[method.id]}
            onClick={() => onMethodChange(method.id)}
          />
        ))}
      </div>
      {fieldErrors['payment.method'] && (
        <p className="mt-3 text-sm font-bold text-[var(--error)]">{fieldErrors['payment.method']}</p>
      )}

      {SHOW_CASH_CHANGE_DETAILS && isCash && (
        <div className="mt-5 grid gap-4 rounded-3xl bg-[var(--surface-muted)] p-4 sm:grid-cols-2">
          <RadioCard
            title="Não preciso de troco"
            description="Pagamento no valor certo"
            selected={!payment.needsChange}
            icon={<Banknote size={18} />}
            onClick={() => onPaymentChange('needsChange', false)}
          />
          <RadioCard
            title="Preciso de troco"
            description="Informe o valor para separarmos"
            selected={payment.needsChange}
            icon={<Banknote size={18} />}
            onClick={() => onPaymentChange('needsChange', true)}
          />
          {payment.needsChange && (
            <div className="sm:col-span-2">
              <Input
                id="change-for"
                label="Troco para quanto?"
                value={payment.changeFor}
                placeholder="Ex: R$ 50,00"
                inputMode="numeric"
                maxLength={MONEY_INPUT_MAX_LENGTH}
                required
                error={fieldErrors['payment.changeFor']}
                onChange={(event) => onPaymentChange('changeFor', formatBRLCurrencyInput(event.target.value))}
              />
            </div>
          )}
        </div>
      )}
    </section>
  )
}
