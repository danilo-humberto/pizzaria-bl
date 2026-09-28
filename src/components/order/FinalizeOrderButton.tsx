import { CheckCircle2, LoaderCircle } from 'lucide-react'
import { demoOrderNotice, isDemoMode } from '../../config/demoMode'
import type { OrderValidation } from '../../types/order'
import { Button } from '../ui/Button'

type FinalizeOrderButtonProps = {
  validation: OrderValidation
  isFinalizing: boolean
  finalizeError: string | null
  onFinalize: () => void
}

export function FinalizeOrderButton({
  validation,
  isFinalizing,
  finalizeError,
  onFinalize,
}: FinalizeOrderButtonProps) {
  if (isDemoMode) {
    return (
      <div className="space-y-3">
        <Button variant="leaf" className="min-h-14 w-full" icon={<CheckCircle2 size={18} />} disabled>
          Finalizar pedido
        </Button>
        <p className="text-sm font-bold" role="status">{demoOrderNotice}</p>
      </div>
    )
  }

  if (!validation.isValid) {
    return (
      <div className="space-y-3">
        <Button variant="leaf" className="min-h-14 w-full" icon={<CheckCircle2 size={18} />} disabled>
          Finalizar pedido
        </Button>
        <div className="rounded-2xl bg-[var(--error-soft)] p-4 text-sm leading-6 text-[var(--error)]">
          <p className="font-extrabold">Preencha os dados obrigatórios para finalizar.</p>
          <ul className="mt-2 list-inside list-disc">
            {validation.errors.slice(0, 4).map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Button
        variant="leaf"
        className="min-h-14 w-full"
        icon={isFinalizing ? <LoaderCircle className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
        onClick={onFinalize}
        disabled={isFinalizing}
      >
        {isFinalizing ? 'Finalizando...' : 'Finalizar pedido'}
      </Button>
      {finalizeError && (
        <div className="rounded-2xl bg-[var(--error-soft)] p-4 text-sm font-bold leading-6 text-[var(--error)]">
          {finalizeError}
        </div>
      )}
    </div>
  )
}
