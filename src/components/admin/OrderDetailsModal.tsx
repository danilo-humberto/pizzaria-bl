import { ExternalLink, X } from "lucide-react";
import type { Order, OrderStatus } from "../../types/order";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  canCancelOrder,
  formatOrderDate,
  formatOrderPortions,
  formatOrderSyrup,
  getOrderFruitPortions,
  getOrderIceCreamFlavors,
  getOrderToppingPortions,
  getNextOrderActionLabel,
  getNextOrderStatus,
  getPaymentLabel,
  orderStatusSingularLabels,
} from "../../utils/orderDisplay";

type OrderDetailsModalProps = {
  order: Order | null;
  isUpdating: boolean;
  onClose: () => void;
  onStatusChange: (trackingCode: string, status: OrderStatus) => void;
};

export function OrderDetailsModal({
  order,
  isUpdating,
  onClose,
  onStatusChange,
}: OrderDetailsModalProps) {
  if (!order) {
    return null;
  }

  const trackingUrl = `/pedido/${order.trackingCode}`;
  const nextStatus = getNextOrderStatus(order.status);
  const nextActionLabel = getNextOrderActionLabel(order.status);
  const selectedIceCreamFlavors = getOrderIceCreamFlavors(order.items);

  return (
    <div
      className="fixed inset-0 z-[90] bg-[oklch(12%_0.04_326_/_62%)] px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-order-modal-title"
    >
      <div className="mx-auto flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-[var(--admin-surface)] text-[var(--admin-ink)] shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-4">
          <div>
            <p className="text-sm font-bold text-[var(--admin-muted)]">
              Detalhes do pedido
            </p>
            <h2
              id="admin-order-modal-title"
              className="text-2xl font-extrabold"
            >
              {order.publicCode}
            </h2>
          </div>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-lg text-[var(--admin-muted)] transition hover:bg-[var(--admin-muted-bg)] hover:text-[var(--admin-ink)]"
            onClick={onClose}
            aria-label="Fechar detalhes"
          >
            <X size={20} />
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <DetailsSection title="Dados do cliente">
              <DetailLine label="Nome" value={order.customer.name} />
              <DetailLine label="Telefone" value={order.customer.phone} />
              <DetailLine
                label="Criado em"
                value={formatOrderDate(order.createdAt)}
              />
            </DetailsSection>

            <DetailsSection title="Status">
              <DetailLine
                label="Atual"
                value={orderStatusSingularLabels[order.status]}
              />
              <DetailLine label="Código" value={order.trackingCode} />
              <a
                href={trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[var(--admin-plum)] hover:underline"
              >
                Link público de acompanhamento
                <ExternalLink size={14} />
              </a>
            </DetailsSection>

            <DetailsSection title="Itens do pedido">
              <DetailLine
                label="Produto"
                value={order.items.productName ?? "Não informado"}
              />
              <DetailLine
                label="Tamanho"
                value={order.items.size ?? "Não informado"}
              />
              {selectedIceCreamFlavors.length > 0 && (
                <DetailLine
                  label={
                    selectedIceCreamFlavors.length > 1 ? "Sabores" : "Sabor"
                  }
                  value={selectedIceCreamFlavors.join(", ")}
                />
              )}
              <DetailLine
                label="Frutas"
                value={formatOrderPortions(getOrderFruitPortions(order.items))}
              />
              <DetailLine
                label="Guloseimas"
                value={formatOrderPortions(getOrderToppingPortions(order.items))}
              />
              <DetailLine
                label="Calda"
                value={formatOrderSyrup(order.items)}
              />
              <DetailLine
                label="Observação"
                value={order.items.observation ?? "Sem observação"}
              />
            </DetailsSection>

            <DetailsSection title="Pagamento">
              <DetailLine
                label="Forma"
                value={getPaymentLabel(order.payment.method)}
              />
              {order.payment.method === "cash" && (
                <DetailLine
                  label="Troco"
                  value={
                    order.payment.needsChange
                      ? formatCurrency(order.payment.changeFor ?? 0)
                      : "Não precisa"
                  }
                />
              )}
              <DetailLine
                label="Total"
                value={formatCurrency(order.total)}
                strong
              />
            </DetailsSection>
          </div>
        </div>

        <footer className="flex flex-col gap-2 border-t border-[var(--admin-border)] px-5 py-4 sm:flex-row sm:justify-end">
          {nextStatus && nextActionLabel && (
            <button
              type="button"
              className="min-h-10 rounded-lg bg-[var(--admin-plum)] px-4 text-sm font-extrabold text-[var(--cream-50)] transition hover:bg-[var(--admin-plum-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isUpdating}
              onClick={() => onStatusChange(order.trackingCode, nextStatus)}
            >
              {isUpdating ? "Atualizando..." : nextActionLabel}
            </button>
          )}
          {canCancelOrder(order.status) && (
            <button
              type="button"
              className="min-h-10 rounded-lg border border-[var(--admin-danger-border)] px-4 text-sm font-bold text-[var(--admin-danger)] transition hover:bg-[var(--admin-danger-bg)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isUpdating}
              onClick={() => onStatusChange(order.trackingCode, "cancelled")}
            >
              Cancelar pedido
            </button>
          )}
          <button
            type="button"
            className="min-h-10 rounded-lg border border-[var(--admin-border)] px-4 text-sm font-bold text-[var(--admin-ink)] transition hover:bg-[var(--admin-muted-bg)]"
            onClick={onClose}
          >
            Fechar
          </button>
        </footer>
      </div>
    </div>
  );
}

type DetailsSectionProps = {
  title: string;
  children: React.ReactNode;
};

function DetailsSection({ title, children }: DetailsSectionProps) {
  return (
    <section className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-4">
      <h3 className="mb-3 text-sm font-extrabold">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

type DetailLineProps = {
  label: string;
  value: string;
  strong?: boolean;
};

function DetailLine({ label, value, strong = false }: DetailLineProps) {
  return (
    <div className="grid gap-1 text-sm sm:grid-cols-[7rem_minmax(0,1fr)]">
      <span className="font-bold text-[var(--admin-muted)]">{label}</span>
      <span
        className={`break-words ${strong ? "font-extrabold text-[var(--admin-leaf)]" : "font-semibold"}`}
      >
        {value}
      </span>
    </div>
  );
}
