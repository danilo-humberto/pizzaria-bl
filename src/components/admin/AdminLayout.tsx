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
    <div className="admin-app-shell min-h-dvh overflow-x-hidden bg-[linear-gradient(180deg,var(--surface),var(--surface)_72%,var(--surface-muted))] text-[var(--admin-ink)]">
      <header className="bg-[linear-gradient(180deg,var(--surface-dark-deep),var(--surface-dark))] text-[var(--text-on-dark)] shadow-[0_18px_42px_var(--shadow-color-strong)]">
        <div className="mx-auto flex min-h-[5.35rem] w-full max-w-[100rem] flex-col justify-between gap-4 px-6 py-4 lg:flex-row lg:items-center lg:px-9">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
            <LogoMark
              brand="pizzaria"
              href="/admin/pedidos"
              className="shrink-0 [&>span:first-child]:h-11 [&>span:first-child]:w-11 [&>span:last-child]:text-[1.65rem] [&>span:last-child]:text-[var(--text-on-dark)]"
            />

            <div className="hidden h-12 w-px bg-[var(--border-on-dark)] sm:block" />

            <div className="min-w-0">
              <h1 className="font-display text-xl font-extrabold leading-none text-[var(--text-on-dark)]">
                Pizzaria BL • Administrativo
              </h1>
              {user?.email && (
                <p className="mt-2 text-sm font-semibold text-[var(--text-on-dark)]">Acesso: {user.email}</p>
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
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-[var(--border-on-dark)] bg-[var(--hover-on-dark)] px-6 text-sm font-extrabold text-[var(--text-on-dark)] transition duration-300 ease-out hover:bg-[var(--overlay-light-16)]"
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
            ? 'border-[var(--admin-border)] bg-[var(--brand-primary)] text-[var(--text-on-dark)] shadow-[inset_0_1px_0_var(--border-on-dark),0_10px_28px_var(--shadow-color-strong)]'
            : 'border-[var(--border-on-dark)] bg-[var(--hover-on-dark)] text-[var(--text-on-dark)] hover:bg-[var(--overlay-light-16)]',
        )
      }
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[var(--admin-border)] px-2 text-xs text-[var(--admin-ink)]">
          {badge}
        </span>
      )}
    </NavLink>
  )
}
