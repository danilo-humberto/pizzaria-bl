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
import type { Order, OrderStatus } from '../types/order'
import { formatCurrency } from '../utils/formatCurrency'
import {
  formatOrderPortions,
  formatOrderSyrup,
  getOrderFruitPortions,
  getOrderIceCreamFlavors,
  getOrderToppingPortions,
} from '../utils/orderDisplay'

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

function getPaymentLabel(method?: Order['payment']['method']) {
  return paymentMethods.find((paymentMethod) => paymentMethod.id === method)?.name ?? 'Não informado'
}

function getStatusStepStyle(status: OrderStatus, stepId: Exclude<OrderStatus, 'cancelled'>) {
  if (status === 'cancelled') {
    return 'border-[var(--cream-200)] bg-[var(--cream-100)] text-[var(--ink-500)]'
  }

  const currentIndex = statusSteps.findIndex((step) => step.id === status)
  const stepIndex = statusSteps.findIndex((step) => step.id === stepId)
  const isActive = stepId === status
  const isCompleted = stepIndex < currentIndex

  if (isActive || isCompleted) {
    return 'border-[var(--leaf-700)] bg-[oklch(72%_0.14_126_/_12%)] text-[var(--leaf-700)]'
  }

  return 'border-[var(--cream-200)] bg-[var(--cream-100)] text-[var(--ink-500)]'
}

export function TrackingPage() {
  const { trackingCode } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
        setIsLoading(false)
      },
      () => {
        setError('Não foi possível carregar este pedido agora.')
        setIsLoading(false)
      },
    )

    return unsubscribe
  }, [trackingCode])

  const status = order?.status ?? 'received'
  const selectedIceCreamFlavors = order ? getOrderIceCreamFlavors(order.items) : []

  return (
    <div className="tracking-page-bg min-h-dvh text-[var(--ink-900)]">
      <main className="grid min-h-dvh place-items-center px-4 py-5 sm:px-6 lg:px-8">
        <section className="w-full max-w-4xl overflow-hidden rounded-[2rem] bg-[var(--cream-50)] panel-shadow">
          <div className="bg-[linear-gradient(135deg,var(--plum-800),var(--berry-600))] px-6 py-6 text-[var(--cream-50)] sm:px-8">
            <p className="flex items-center gap-2 text-sm font-extrabold text-[oklch(94%_0.02_326)]">
              <Clock size={18} />
              Acompanhamento do pedido
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              {isLoading ? 'Carregando...' : order?.publicCode ?? 'Pedido não encontrado'}
            </h1>
            <p className="mt-2 max-w-2xl leading-7 text-[oklch(96%_0.02_326)]">
              {order
                ? `Status atual: ${statusLabels[status]}. Seu pedido será preparado para retirada no local.`
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
              <StateMessage
                icon={<AlertTriangle size={22} />}
                title="Não conseguimos carregar"
                description={error}
                tone="error"
              />
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
                  <div className="rounded-2xl border border-[var(--berry-600)] bg-[oklch(45%_0.17_346_/_10%)] p-4 text-sm font-bold leading-6 text-[var(--berry-600)]">
                    Este pedido foi cancelado. Fale com a loja se precisar de ajuda.
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-4">
                  {statusSteps.map((step) => (
                    <div
                      key={step.id}
                      className={`rounded-2xl border p-4 ${getStatusStepStyle(status, step.id)}`}
                    >
                      <span className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-[var(--cream-50)]">
                        {step.icon}
                      </span>
                      <p className="text-sm font-extrabold leading-5">{step.label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-2xl bg-[var(--cream-100)] p-5">
                    <p className="flex items-center gap-2 text-sm font-extrabold text-[var(--ink-900)]">
                      <User size={18} />
                      Dados do pedido
                    </p>
                    <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--ink-700)]">
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

                  <div className="rounded-2xl bg-[var(--cream-100)] p-5">
                    <p className="flex items-center gap-2 text-sm font-extrabold text-[var(--ink-900)]">
                      <ReceiptText size={18} />
                      Resumo do pedido
                    </p>
                    <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--ink-700)]">
                      <InfoLine label="Produto" value={order.items.productName ?? 'Não informado'} />
                      <InfoLine label="Tamanho" value={order.items.size ?? 'Não informado'} />
                      {selectedIceCreamFlavors.length > 0 && (
                        <InfoLine
                          label={selectedIceCreamFlavors.length > 1 ? 'Sabores' : 'Sabor'}
                          value={selectedIceCreamFlavors.join(', ')}
                        />
                      )}
                      <InfoLine
                        label="Frutas"
                        value={formatOrderPortions(getOrderFruitPortions(order.items))}
                      />
                      <InfoLine
                        label="Guloseimas"
                        value={formatOrderPortions(getOrderToppingPortions(order.items))}
                      />
                      <InfoLine label="Calda" value={formatOrderSyrup(order.items)} />
                      <InfoLine label="Observação" value={order.items.observation ?? 'Sem observação'} />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-[var(--cream-100)] p-5">
                  <p className="text-sm font-extrabold text-[var(--ink-900)]">Código de acompanhamento</p>
                  <p className="mt-1 break-all text-sm leading-6 text-[var(--ink-700)]">
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
      className={`rounded-2xl border p-5 ${
        tone === 'error'
          ? 'border-[var(--berry-600)] bg-[oklch(45%_0.17_346_/_10%)] text-[var(--berry-600)]'
          : 'border-[var(--cream-200)] bg-[var(--cream-100)] text-[var(--ink-700)]'
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
      <span className="w-24 shrink-0 font-extrabold text-[var(--ink-900)]">{label}</span>
      <span className={strong ? 'font-extrabold text-[var(--leaf-700)]' : 'text-[var(--ink-700)]'}>
        {value}
      </span>
    </div>
  )
}
