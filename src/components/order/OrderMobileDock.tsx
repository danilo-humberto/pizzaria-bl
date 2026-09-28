import { CheckCircle2, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { demoOrderNotice, isDemoMode } from '../../config/demoMode'
import type { OrderBuilder } from '../../hooks/useOrderBuilder'
import { cn } from '../../utils/cn'
import { formatCurrency } from '../../utils/formatCurrency'
import { Button } from '../ui/Button'

type OrderMobileDockProps = {
  builder: OrderBuilder
}

export function OrderMobileDock({ builder }: OrderMobileDockProps) {
  const { total, validation, isFinalizing, finalizeError, finalizeOrder } = builder
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const builderSection = document.getElementById('monte')

    if (!builderSection) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      {
        rootMargin: '0px 0px -18% 0px',
        threshold: 0.08,
      },
    )

    observer.observe(builderSection)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      className={cn(
        'order-mobile-dock rounded-3xl border border-[var(--border)] bg-[var(--surface-glass-strong)] p-3 text-[var(--text-primary)] shadow-[0_18px_45px_var(--shadow-color)] backdrop-blur transition duration-300 ease-out lg:hidden',
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-5 opacity-0',
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold text-[var(--text-muted)]">Total estimado</p>
          <p className="font-display text-2xl font-extrabold text-[var(--brand-primary)]">{formatCurrency(total)}</p>
        </div>
        <p className="max-w-[11rem] text-right text-xs font-bold leading-5 text-[var(--text-muted)]">
          {isFinalizing
            ? 'Salvando pedido...'
            : isDemoMode
              ? demoOrderNotice
            : finalizeError ?? (validation.isValid ? 'Pedido pronto para finalizar.' : validation.errors[0])}
        </p>
      </div>

      {isDemoMode ? (
        <Button variant="leaf" className="w-full" icon={<CheckCircle2 size={18} />} disabled>
          Finalizar pedido
        </Button>
      ) : validation.isValid ? (
        <Button
          variant="leaf"
          className="w-full"
          icon={isFinalizing ? <LoaderCircle className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
          onClick={finalizeOrder}
          disabled={isFinalizing}
        >
          {isFinalizing ? 'Finalizando...' : 'Finalizar pedido'}
        </Button>
      ) : (
        <Button variant="leaf" className="w-full" icon={<CheckCircle2 size={18} />} disabled>
          Complete o pedido
        </Button>
      )}
    </div>
  )
}
