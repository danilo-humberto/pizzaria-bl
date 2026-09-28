import { Ban, ClipboardList, LogOut, PackageOpen } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { LogoMark } from '../layout/LogoMark'
import { useAuth } from '../../contexts/AuthContext'
import { logout } from '../../services/authService'
import { cn } from '../../utils/cn'
import { formatStatusCount } from '../../utils/orderDisplay'

type AdminLayoutProps = {
  children: React.ReactNode
  cancelledCount?: number
}

export function AdminLayout({ children, cancelledCount = 0 }: AdminLayoutProps) {
  const { user } = useAuth()

  return (
    <div className="admin-app-shell min-h-dvh overflow-x-hidden bg-[linear-gradient(180deg,oklch(98%_0.014_326),oklch(95%_0.03_326)_72%,oklch(91%_0.045_326))] text-[var(--admin-ink)]">
      <header className="bg-[linear-gradient(180deg,var(--plum-950),var(--plum-900))] text-[var(--cream-50)] shadow-[0_18px_42px_oklch(12%_0.04_326_/_16%)]">
        <div className="mx-auto flex min-h-[5.35rem] w-full max-w-[100rem] flex-col justify-between gap-4 px-6 py-4 lg:flex-row lg:items-center lg:px-9">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
            <LogoMark
              href="/admin/pedidos"
              className="shrink-0 [&>span:first-child]:h-11 [&>span:first-child]:w-11 [&>span:last-child]:text-[1.65rem] [&>span:last-child]:text-[var(--cream-50)]"
            />

            <div className="hidden h-12 w-px bg-[oklch(98%_0.012_326_/_28%)] sm:block" />

            <div className="min-w-0">
              <h1 className="font-display text-xl font-extrabold leading-none text-[var(--cream-50)]">
                Painel administrativo
              </h1>
              {user?.email && (
                <p className="mt-2 text-sm font-semibold text-[oklch(92%_0.018_326)]">Acesso: {user.email}</p>
              )}
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-3">
            <AdminNavLink to="/admin/pedidos" icon={<ClipboardList size={18} />} label="Pedidos" />
            <AdminNavLink
              to="/admin/disponibilidade"
              icon={<PackageOpen size={18} />}
              label="Disponibilidade"
            />
            <AdminNavLink
              to="/admin/cancelados"
              icon={<Ban size={18} />}
              label="Cancelados"
              badge={formatStatusCount(cancelledCount)}
            />
            <button
              type="button"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-[oklch(98%_0.012_326_/_24%)] bg-[oklch(98%_0.012_326_/_4%)] px-6 text-sm font-extrabold text-[var(--cream-50)] transition duration-300 ease-out hover:bg-[oklch(98%_0.012_326_/_10%)]"
              onClick={() => void logout()}
            >
              <LogOut size={18} />
              Sair
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[100rem] px-6 py-7 lg:px-9">{children}</main>
    </div>
  )
}

type AdminNavLinkProps = {
  to: string
  icon: React.ReactNode
  label: string
  badge?: string
}

function AdminNavLink({ to, icon, label, badge }: AdminNavLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border px-6 text-sm font-extrabold transition duration-300 ease-out',
          isActive
            ? 'border-[oklch(78%_0.08_326_/_32%)] bg-[oklch(38%_0.11_326_/_84%)] text-[var(--cream-50)] shadow-[inset_0_1px_0_oklch(98%_0.012_326_/_20%),0_10px_28px_oklch(12%_0.04_326_/_22%)]'
            : 'border-[oklch(98%_0.012_326_/_22%)] bg-[oklch(98%_0.012_326_/_4%)] text-[oklch(94%_0.018_326)] hover:bg-[oklch(98%_0.012_326_/_10%)]',
        )
      }
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[oklch(78%_0.08_326_/_24%)] px-2 text-xs text-[var(--cream-50)]">
          {badge}
        </span>
      )}
    </NavLink>
  )
}
