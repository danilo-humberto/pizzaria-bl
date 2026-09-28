import {
  AlertTriangle,
  CircleCheck,
  Clock3,
  Inbox,
  PackageCheck,
  RefreshCw,
  Soup,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { KanbanBoard } from "../../components/admin/KanbanBoard";
import { OrderDetailsModal } from "../../components/admin/OrderDetailsModal";
import { useAuth } from "../../contexts/AuthContext";
import { listenOrders, updateOrderStatus } from "../../services/orderService";
import type { Order, OrderStatus } from "../../types/order";
import { cn } from "../../utils/cn";
import {
  countOrdersBySize,
  type OrderSizeCount,
} from "../../utils/orderMetrics";
import {
  formatOrderShortDateTime,
  formatStatusCount,
  operationalOrderStatusColumns,
  orderStatusLabels,
  orderStatusTheme,
  type OperationalOrderStatus,
} from "../../utils/orderDisplay";

const statusStats: Record<
  OperationalOrderStatus,
  {
    icon: React.ReactNode;
  }
> = {
  received: {
    icon: <Inbox size={27} />,
  },
  preparing: {
    icon: <Soup size={27} />,
  },
  ready_for_pickup: {
    icon: <PackageCheck size={27} />,
  },
  completed: {
    icon: <CircleCheck size={27} />,
  },
};

const SIZE_METRICS_ALLOWED_EMAIL =
  import.meta.env.VITE_SIZE_METRICS_ALLOWED_EMAIL?.trim().toLowerCase() || "";

export function AdminOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTrackingCode, setSelectedTrackingCode] = useState<
    string | null
  >(null);
  const [updatingTrackingCode, setUpdatingTrackingCode] = useState<
    string | null
  >(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = listenOrders(
      (currentOrders) => {
        setOrders(currentOrders);
        setLastUpdatedAt(new Date());
        setIsLoading(false);
      },
      () => {
        setError(
          "Não foi possível carregar os pedidos. Verifique seu acesso e tente novamente.",
        );
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const selectedOrder = useMemo(
    () =>
      orders.find((order) => order.trackingCode === selectedTrackingCode) ??
      null,
    [orders, selectedTrackingCode],
  );

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status !== "cancelled"),
    [orders],
  );
  const cancelledCount = useMemo(
    () => orders.filter((order) => order.status === "cancelled").length,
    [orders],
  );
  const sizeCounts = useMemo(
    () => countOrdersBySize(activeOrders),
    [activeOrders],
  );
  const canViewSizeMetrics =
    user?.email?.trim().toLowerCase() === SIZE_METRICS_ALLOWED_EMAIL;

  const orderCounts = useMemo(
    () =>
      operationalOrderStatusColumns.reduce<Record<OrderStatus, number>>(
        (accumulator, status) => ({
          ...accumulator,
          [status]: activeOrders.filter((order) => order.status === status)
            .length,
        }),
        {
          received: 0,
          preparing: 0,
          ready_for_pickup: 0,
          completed: 0,
          cancelled: 0,
        },
      ),
    [activeOrders],
  );

  const handleStatusChange = async (
    trackingCode: string,
    status: OrderStatus,
  ) => {
    setUpdatingTrackingCode(trackingCode);
    setError("");

    try {
      await updateOrderStatus(trackingCode, status);
    } catch {
      setError("Não foi possível atualizar o status do pedido.");
    } finally {
      setUpdatingTrackingCode(null);
    }
  };

  const handleRefresh = () => {
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    refreshTimeoutRef.current = setTimeout(() => {
      setLastUpdatedAt(new Date());
      setIsRefreshing(false);
      refreshTimeoutRef.current = null;
    }, 1500);
  };

  return (
    <AdminLayout cancelledCount={cancelledCount}>
      <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(18rem,1fr)_minmax(42rem,64rem)] lg:items-center">
        <div className="flex min-w-0 gap-5">
          <span className="mt-1 h-14 w-1 shrink-0 rounded-full bg-[var(--admin-leaf)]" />
          <div className="h-fit mt-2">
            <h2 className="font-display text-5xl font-extrabold leading-none tracking-tight text-[var(--admin-ink)]">
              Pedidos
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {operationalOrderStatusColumns.map((status) => (
            <StatusStatCard
              key={status}
              status={status}
              count={orderCounts[status]}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-2xl border border-[var(--admin-danger-border)] bg-[var(--admin-danger-bg)] px-4 py-3 text-sm font-bold text-[var(--admin-danger)]">
          <AlertTriangle className="mt-0.5 shrink-0" size={17} />
          {error}
        </div>
      )}

      {canViewSizeMetrics && <SizeMetrics counts={sizeCounts} />}

      <KanbanBoard
        orders={activeOrders}
        isLoading={isLoading}
        updatingTrackingCode={updatingTrackingCode}
        onOpenDetails={setSelectedTrackingCode}
        onStatusChange={handleStatusChange}
      />

      <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-[oklch(89%_0.015_326_/_72%)] bg-[oklch(99%_0.006_326_/_76%)] px-5 py-4 text-sm font-semibold text-[var(--admin-muted)] shadow-[0_18px_42px_oklch(14%_0.05_326_/_8%)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-2">
            <Clock3 size={18} />
            Última atualização:{" "}
            {lastUpdatedAt ? formatOrderShortDateTime(lastUpdatedAt) : "--:--"}
          </span>
          <span className="text-[var(--admin-muted)]">•</span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--admin-leaf)]" />
            Atualização automática ativa
          </span>
        </div>

        <button
          type="button"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border-l border-[oklch(89%_0.015_326_/_80%)] px-4 font-extrabold text-[var(--admin-plum)] transition hover:bg-[var(--admin-plum-soft)] disabled:cursor-wait disabled:opacity-75 sm:pl-6"
          disabled={isRefreshing}
          onClick={handleRefresh}
        >
          <RefreshCw size={18} className={cn(isRefreshing && "animate-spin")} />
          {isRefreshing ? "Atualizando..." : "Atualizar agora"}
        </button>
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        isUpdating={Boolean(
          selectedOrder && updatingTrackingCode === selectedOrder.trackingCode,
        )}
        onClose={() => setSelectedTrackingCode(null)}
        onStatusChange={handleStatusChange}
      />
    </AdminLayout>
  );
}

type SizeMetricsProps = {
  counts: OrderSizeCount[];
};

function SizeMetrics({ counts }: SizeMetricsProps) {
  return (
    <section className="mb-5 rounded-2xl border border-[oklch(89%_0.015_326_/_72%)] bg-[oklch(99%_0.006_326_/_72%)] px-5 py-4 shadow-[0_14px_36px_oklch(14%_0.05_326_/_7%)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-xl font-extrabold text-[var(--admin-ink)]">
            Pedidos por tamanho
          </h3>
          <p className="mt-1 text-sm font-semibold text-[var(--admin-muted)]">
            Contagem interna dos pedidos válidos.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:min-w-[24rem]">
          {counts.map((item) => (
            <div
              key={item.size}
              className="rounded-2xl border border-[oklch(89%_0.015_326_/_72%)] bg-[oklch(99%_0.006_326_/_68%)] px-4 py-3 text-center"
            >
              <p className="text-sm font-extrabold text-[var(--admin-muted)]">
                Tamanho {item.size}
              </p>
              <p className="mt-1 font-display text-3xl font-extrabold leading-none text-[var(--admin-leaf)]">
                {formatStatusCount(item.count)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type StatusStatCardProps = {
  status: OperationalOrderStatus;
  count: number;
};

function StatusStatCard({ status, count }: StatusStatCardProps) {
  const theme = orderStatusTheme[status];
  const stats = statusStats[status];

  return (
    <article className="flex min-h-[5.65rem] items-center gap-4 rounded-2xl border border-[oklch(98%_0.012_326_/_88%)] bg-[oklch(99%_0.006_326_/_78%)] px-4 shadow-[0_14px_38px_oklch(14%_0.05_326_/_8%)] backdrop-blur-xl">
      <div
        className={cn(
          "grid h-14 w-14 shrink-0 place-items-center rounded-full",
          theme.soft,
          theme.text,
        )}
      >
        {stats.icon}
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "font-display text-3xl font-extrabold leading-none",
            theme.text,
          )}
        >
          {formatStatusCount(count)}
        </p>
        <p className="mt-1 truncate text-sm font-extrabold text-[var(--admin-ink)]">
          {orderStatusLabels[status]}
        </p>
      </div>
    </article>
  );
}
