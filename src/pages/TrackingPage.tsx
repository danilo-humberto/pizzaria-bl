import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CookingPot,
  PackageCheck,
  ReceiptText,
  User,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { paymentMethods } from '../data/paymentMethods'
import { listenOrderByTrackingCode } from '../services/orderService'
import type { OrderStatus } from '../types/order'
import type { PizzaOrderDocument } from '../types/pizzaOrder'
import { formatCurrency } from '../utils/formatCurrency'
import { formatPizzaOrderLine } from '../utils/pizzaOrderDisplay'

const statusSteps: Array<{
  id: Exclude<OrderStatus, 'cancelled'>
  label: string
  icon: React.ReactNode
}> = [
  {
    id: 'received',
    label: 'Recebido',
    icon: <CheckCircle2 size={20} />,
  },
  {
    id: 'preparing',
    label: 'Em preparo',
    icon: <CookingPot size={20} />,
  },
  {
    id: 'ready_for_pickup',
    label: 'Pronto para retirada',
    icon: <PackageCheck size={20} />,
  },
  {
    id: 'completed',
    label: 'Concluído',
    icon: <CheckCircle2 size={20} />,
  },
]

const statusLabels: Record<OrderStatus, string> = {
  received: 'Recebido',
  preparing: 'Em preparo',
  ready_for_pickup: 'Pronto para retirada',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

function getPaymentLabel(method?: PizzaOrderDocument['payment']['method']) {
  return paymentMethods.find((paymentMethod) => paymentMethod.id === method)?.name ?? 'Não informado'
}

function getStatusStepStyle(status: OrderStatus, stepId: Exclude<OrderStatus, 'cancelled'>) {
  if (status === 'cancelled') {
    return 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]'
  }

  const currentIndex = statusSteps.findIndex((step) => step.id === status)
  const stepIndex = statusSteps.findIndex((step) => step.id === stepId)
  const isActive = stepId === status
  const isCompleted = stepIndex < currentIndex

  if (isActive || isCompleted) {
    return 'border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]'
  }

  return 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]'
}

export function TrackingPage() {
  const { trackingCode } = useParams()
  const [order, setOrder] = useState<PizzaOrderDocument | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setOrder(null)
    setError(null)
    if (!trackingCode) {
      setError('Link de acompanhamento inválido.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const unsubscribe = listenOrderByTrackingCode(
      trackingCode,
      (orderData) => {
        setOrder(orderData)
        setError(null)
        setIsLoading(false)
      },
      () => {
        setOrder(null)
        setError('Não foi possível carregar este pedido agora.')
        setIsLoading(false)
      },
    )

    return unsubscribe
  }, [trackingCode, retry])

  const status = order?.status ?? 'received'

  return (
    <div className="pizzaria-theme bg-[var(--surface-dark)] min-h-dvh text-[var(--text-primary)]">
      <main className="grid min-h-dvh place-items-center px-4 py-5 sm:px-6 lg:px-8">
        <section className="w-full max-w-4xl overflow-hidden rounded-[2rem] bg-[var(--surface)] panel-shadow">
          <div className="bg-[linear-gradient(135deg,var(--surface-dark-raised),var(--brand-primary))] px-6 py-6 text-[var(--surface)] sm:px-8">
            <p className="flex items-center gap-2 text-sm font-extrabold text-[var(--contact-text)]">
              <Clock size={18} />
              Acompanhamento do pedido
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              {isLoading ? 'Carregando...' : error ? 'Acompanhamento indisponível' : order?.publicCode ?? 'Pedido não encontrado'}
            </h1>
            <p aria-live="polite" className="mt-2 max-w-2xl leading-7 text-[var(--contact-text)]">
              {order
                ? `Status atual: ${statusLabels[status]}. Retirada no local.`
                : 'Confira seu link de acompanhamento para ver os detalhes do pedido.'}
            </p>
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            {isLoading && (
              <StateMessage
                icon={<Clock size={22} />}
                title="Buscando seu pedido"
                description="Só um instante enquanto carregamos os dados em tempo real."
              />
            )}

            {!isLoading && error && (
              <div className="space-y-4">
                <StateMessage
                  icon={<AlertTriangle size={22} />}
                  title="Não conseguimos carregar"
                  description={error}
                  tone="error"
                />
                <Button onClick={() => setRetry((value) => value + 1)}>Tentar novamente</Button>
              </div>
            )}

            {!isLoading && !error && !order && (
              <StateMessage
                icon={<AlertTriangle size={22} />}
                title="Pedido não encontrado"
                description="Verifique se o link foi copiado corretamente ou faça um novo pedido."
                tone="error"
              />
            )}

            {!isLoading && !error && order && (
              <>
                {status === 'cancelled' && (
                  <div className="rounded-2xl border border-[var(--error)] bg-[var(--error-soft)] p-4 text-sm font-bold leading-6 text-[var(--error)]">
                    Este pedido foi cancelado. Fale com a loja se precisar de ajuda.
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-4">
                  {statusSteps.map((step) => (
                    <div
                      key={step.id}
                      aria-current={step.id === status ? 'step' : undefined}
                      className={`rounded-2xl border p-4 ${getStatusStepStyle(status, step.id)}`}
                    >
                      <span className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-[var(--surface)]">
                        {step.icon}
                      </span>
                      <p className="text-sm font-extrabold leading-5">{step.label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-2xl bg-[var(--surface-muted)] p-5">
                    <p className="flex items-center gap-2 text-sm font-extrabold text-[var(--text-primary)]">
                      <User size={18} />
                      Dados do pedido
                    </p>
                    <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
                      <InfoLine label="Cliente" value={order.customer.name} />
                      <InfoLine label="Pagamento" value={getPaymentLabel(order.payment.method)} />
                      {order.payment.method === 'cash' && (
                        <InfoLine
                          label="Troco"
                          value={order.payment.needsChange ? formatCurrency(order.payment.changeFor ?? 0) : 'Não precisa'}
                        />
                      )}
                      <InfoLine label="Total" value={formatCurrency(order.total)} strong />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[var(--surface-muted)] p-5">
                    <p className="flex items-center gap-2 text-sm font-extrabold text-[var(--text-primary)]">
                      <ReceiptText size={18} />
                      Resumo do pedido
                    </p>
                    <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
                      <ul className="space-y-3">{order.items.lines.map((line, index) => <li key={index}>
                        <p className="font-bold">{formatPizzaOrderLine(line)}</p>
                        <p>{formatCurrency(line.unitPriceCents / 100)} por unidade · {formatCurrency(line.subtotalCents / 100)}</p>
                      </li>)}</ul>
                      <InfoLine label="Observação" value={order.items.observation || 'Sem observação'} />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-[var(--surface-muted)] p-5">
                  <p className="text-sm font-extrabold text-[var(--text-primary)]">Código de acompanhamento</p>
                  <p className="mt-1 break-all text-sm leading-6 text-[var(--text-secondary)]">
                    {trackingCode ?? 'Código não informado na URL.'}
                  </p>
                </div>
              </>
            )}

            <div className="flex justify-center">
              <Button href="/" variant="leaf" className="w-full sm:w-auto" icon={<PackageCheck size={18} />}>
                Fazer outro pedido
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

type StateMessageProps = {
  icon: React.ReactNode
  title: string
  description: string
  tone?: 'default' | 'error'
}

function StateMessage({ icon, title, description, tone = 'default' }: StateMessageProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-2xl border p-5 ${
        tone === 'error'
          ? 'border-[var(--error)] bg-[var(--error-soft)] text-[var(--error)]'
          : 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)]'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">{icon}</span>
        <div>
          <p className="font-extrabold">{title}</p>
          <p className="mt-1 text-sm leading-6">{description}</p>
        </div>
      </div>
    </div>
  )
}

type InfoLineProps = {
  label: string
  value: string
  strong?: boolean
}

function InfoLine({ label, value, strong = false }: InfoLineProps) {
  return (
    <div className="flex gap-3">
      <span className="w-24 shrink-0 font-extrabold text-[var(--text-primary)]">{label}</span>
      <span className={`min-w-0 break-words ${strong ? 'font-extrabold text-[var(--success)]' : 'text-[var(--text-secondary)]'}`}>
        {value}
      </span>
    </div>
  )
}
