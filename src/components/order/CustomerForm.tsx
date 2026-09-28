import type { CustomerData, OrderValidation } from '../../types/order'
import { formatPhoneNumber, PHONE_MASK_MAX_LENGTH } from '../../utils/phone'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'

type CustomerFormProps = {
  customer: CustomerData
  observation: string
  fieldErrors: OrderValidation['fieldErrors']
  stepNumber: number
  onCustomerChange: (field: keyof CustomerData, value: string) => void
  onObservationChange: (observation: string) => void
}

export function CustomerForm({
  customer,
  observation,
  fieldErrors,
  stepNumber,
  onCustomerChange,
  onObservationChange,
}: CustomerFormProps) {
  return (
    <section id="builder-customer" className="scroll-mt-28">
      <div className="mb-5">
        <p className="text-sm font-extrabold text-[var(--brand-primary)]">{stepNumber}. Dados do cliente</p>
        <h3 className="break-words font-display text-3xl font-extrabold leading-tight text-[var(--text-primary)]">Para identificar seu pedido</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="customer-name"
          label="Nome"
          value={customer.name}
          placeholder="Seu nome"
          required
          error={fieldErrors['customer.name']}
          onChange={(event) => onCustomerChange('name', event.target.value)}
        />
        <Input
          id="customer-phone"
          label="Telefone"
          value={customer.phone}
          placeholder="(81) 99999-9999"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={PHONE_MASK_MAX_LENGTH}
          required
          error={fieldErrors['customer.phone']}
          onChange={(event) => onCustomerChange('phone', formatPhoneNumber(event.target.value))}
        />
      </div>
      <div className="mt-4">
        <Textarea
          id="order-notes"
          label="Observação"
          value={observation}
          placeholder="Ex: pouca granola, sem banana..."
          onChange={(event) => onObservationChange(event.target.value)}
        />
      </div>
    </section>
  )
}
