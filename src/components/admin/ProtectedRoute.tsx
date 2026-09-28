import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

type ProtectedRouteProps = {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoadingAuth } = useAuth()
  const location = useLocation()

  if (isLoadingAuth) {
    return (
      <div className="admin-app-shell grid min-h-dvh place-items-center px-4">
        <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-4 text-sm font-semibold text-[var(--admin-muted)] shadow-sm">
          Verificando acesso...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return children
}
