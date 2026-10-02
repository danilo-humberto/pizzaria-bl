import { useEffect, useRef } from "react";
import { pizzaOrderRules } from "../../data/pizzaMenu";
import { pizzaItemLabels } from "../../utils/pizzaOrderDisplay";
import type { PizzaOrderDocument as Order } from "../../types/pizzaOrder";
import { ExternalLink, X } from "lucide-react";
import type { OrderStatus } from "../../types/order";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  canCancelOrder,
  formatOrderDate,
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isOpen = Boolean(order);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    const previousFocus = document.activeElement;
    if (!dialog.open) dialog.showModal();
    return () => {
      dialog.close();
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [isOpen]);

  if (!order) {
    return null;
  }

  const trackingUrl = `/pedido/${order.trackingCode}`;
  const nextStatus = getNextOrderStatus(order.status);
  const nextActionLabel = getNextOrderActionLabel(order.status);

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl overflow-hidden rounded-2xl bg-[var(--admin-surface)] p-0 backdrop:bg-[var(--admin-overlay)]"
      aria-modal="true"
      aria-labelledby="admin-order-modal-title"
    >
      <div className="mx-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-[var(--admin-surface)] text-[var(--admin-ink)] shadow-2xl">
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
            className="grid h-12 w-12 place-items-center rounded-lg text-[var(--admin-muted)] transition hover:bg-[var(--admin-muted-bg)] hover:text-[var(--admin-ink)]"
            onClick={onClose}
            aria-label="Fechar detalhes"
            autoFocus
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
              <DetailLine label="Atendimento" value="Retirada na loja" />
              <ul className="divide-y divide-[var(--admin-border)]">
                {order.items.lines.map((item, index) => (
                  <li key={index} className="space-y-2 py-3 first:pt-0">
                    <p className="break-words font-extrabold">{item.quantity}× {pizzaItemLabels[item.kind]}: {item.name}</p>
                    {item.kind === "pizza" && <>
                      <DetailLine label="Tamanho" value={pizzaOrderRules.size} />
                      <DetailLine label="Borda" value={item.borderName || "Sem borda recheada"} />
                    </>}
                    <DetailLine label="Unitário" value={formatCurrency(item.unitPriceCents / 100)} />
                    <DetailLine label="Subtotal" value={formatCurrency(item.subtotalCents / 100)} />
                  </li>
                ))}
              </ul>
              <DetailLine label="Observação" value={order.items.observation || "Sem observação"} />
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
              className="min-h-12 rounded-lg bg-[var(--admin-plum)] px-4 text-sm font-extrabold text-[var(--text-on-dark)] transition hover:bg-[var(--admin-plum-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isUpdating}
              onClick={() => onStatusChange(order.trackingCode, nextStatus)}
            >
              {isUpdating ? "Atualizando..." : nextActionLabel}
            </button>
          )}
          {canCancelOrder(order.status) && (
            <button
              type="button"
              className="min-h-12 rounded-lg border border-[var(--admin-danger-border)] px-4 text-sm font-bold text-[var(--admin-danger)] transition hover:bg-[var(--admin-danger-bg)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isUpdating}
              onClick={() => onStatusChange(order.trackingCode, "cancelled")}
            >
              Cancelar pedido
            </button>
          )}
          <button
            type="button"
            className="min-h-12 rounded-lg border border-[var(--admin-border)] px-4 text-sm font-bold text-[var(--admin-ink)] transition hover:bg-[var(--admin-muted-bg)]"
            onClick={onClose}
          >
            Fechar
          </button>
        </footer>
      </div>
    </dialog>
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
