import { ClipboardList, CreditCard, MapPin, Phone, ShoppingBasket, User } from 'lucide-react'
import { isDemoMode } from '../../config/demoMode'
import { paymentMethods } from '../../data/paymentMethods'
import { pizzaBorders } from '../../data/pizzaMenu'
import type { PizzaOrderBuilder } from '../../hooks/usePizzaOrderBuilder'
import { formatCurrency } from '../../utils/formatCurrency'
import { getPizzaItemTotalCents, getPizzaOption } from '../../utils/pizzaOrder'
import { FinalizeOrderButton } from './FinalizeOrderButton'

type OrderSummaryProps = { builder: PizzaOrderBuilder }

export function OrderSummary({ builder }: OrderSummaryProps) {
  const { order, total, validation } = builder
  const payment = paymentMethods.find((method) => method.id === order.payment.method)
  return <aside data-summary className="hidden min-w-0 rounded-3xl bg-[var(--surface)] text-[var(--text-primary)] panel-shadow lg:block lg:self-start">
    <div className="rounded-t-3xl bg-[linear-gradient(135deg,var(--surface-dark-raised),var(--brand-primary))] px-5 py-4 text-[var(--text-on-dark)]"><div className="flex items-center gap-3"><ShoppingBasket size={22} /><h3 className="font-display text-2xl font-extrabold">Seu pedido</h3></div></div>
    <div className="space-y-4 p-4 sm:p-5">
      {order.items.length === 0 ? <p className="text-sm text-[var(--text-muted)]">Nenhum item adicionado.</p> : order.items.map((item) => {
        const option = getPizzaOption(item)
        const border = item.kind === 'pizza' ? pizzaBorders.find((entry) => entry.id === item.borderId) : undefined
        return <div key={item.id} className="flex items-start gap-3"><ClipboardList className="mt-1 shrink-0 text-[var(--surface-dark-raised)]" size={18} /><div className="min-w-0 flex-1"><p className="text-sm font-extrabold">{item.quantity}× {item.kind === 'pizza' ? 'Pizza grande' : item.kind === 'esfiha' ? 'Esfiha' : 'Bebida'}</p><p className="break-words text-sm text-[var(--text-muted)]">{option?.name}{border ? ` · ${border.name}` : ''}</p></div><span className="text-sm font-bold">{formatCurrency(getPizzaItemTotalCents(item) / 100)}</span></div>
      })}
      <SummaryLine icon={<User size={18} />} label="Nome" value={order.customer.name.trim() || 'Não informado'} />
      <SummaryLine icon={<Phone size={18} />} label="Telefone" value={order.customer.phone.trim() || 'Não informado'} />
      <SummaryLine icon={<CreditCard size={18} />} label="Pagamento" value={payment?.name ?? 'Não selecionado'} />
      <SummaryLine icon={<MapPin size={18} />} label="Modalidade" value="Retirada no local" />
      {order.observation.trim() && <div className="rounded-2xl bg-[var(--surface-muted)] p-4"><p className="text-sm font-extrabold">Observação</p><p className="mt-1 text-sm text-[var(--text-secondary)]">{order.observation.trim()}</p></div>}
      <div className="summary-total flex items-center justify-between border-t border-[var(--border)] pt-4"><span className="font-extrabold">{isDemoMode ? 'Total estimado' : 'Total'}</span><strong className="font-display text-3xl text-[var(--brand-primary)]">{formatCurrency(total)}</strong></div>
      <FinalizeOrderButton validation={validation} isFinalizing={builder.isFinalizing} finalizeError={builder.finalizeError} onFinalize={builder.finalizeOrder} isConfirmed={Boolean(builder.confirmationData)} />
    </div>
  </aside>
}

function SummaryLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-start gap-3"><span className="mt-1 text-[var(--surface-dark-raised)]">{icon}</span><div><p className="text-sm font-extrabold">{label}</p><p className="break-words text-sm text-[var(--text-muted)]">{value}</p></div></div>
}
