import { useEffect, useState } from 'react'
import { demoOrderNotice, isDemoMode } from '../../config/demoMode'
import type { PizzaOrderBuilder } from '../../hooks/usePizzaOrderBuilder'
import { cn } from '../../utils/cn'
import { formatCurrency } from '../../utils/formatCurrency'
import { Button } from '../ui/Button'

type OrderMobileDockProps = { builder: PizzaOrderBuilder }

export function OrderMobileDock({ builder }: OrderMobileDockProps) {
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    const section = document.getElementById('monte')
    if (!section) return
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { rootMargin: '0px 0px -18% 0px', threshold: 0 })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])
  return <div className={cn('order-mobile-dock rounded-3xl border border-[var(--border)] bg-[var(--surface-glass-strong)] p-3 text-[var(--text-primary)] shadow-[0_18px_45px_var(--shadow-color)] backdrop-blur transition duration-300 ease-out lg:hidden', isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-5 opacity-0')}>
    <div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-xs font-extrabold text-[var(--text-muted)]">{isDemoMode ? 'Total estimado' : 'Total'}</p><p className="font-display text-2xl font-extrabold text-[var(--brand-primary)]">{formatCurrency(builder.total)}</p></div><p className="max-w-[11rem] text-right text-xs font-bold leading-5 text-[var(--text-muted)]">{isDemoMode ? demoOrderNotice : 'Retirada no local'}</p></div>
    {isDemoMode ? <Button variant="leaf" className="w-full" disabled>Finalizar pedido</Button>
      : builder.confirmationData ? <Button variant="leaf" className="w-full" onClick={builder.finalizeOrder}>Ver confirmação do pedido</Button>
      : <Button variant="leaf" className="w-full" href="#builder-review">{builder.isFinalizing ? 'Enviando pedido...' : 'Revisar e finalizar'}</Button>}
  </div>
}
