import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../../components/admin/ProtectedRoute'
import { AuthProvider } from '../../contexts/AuthContext'
import { NotFoundPage } from '../NotFoundPage'
import { AdminCancelledOrdersPage } from './AdminCancelledOrdersPage'
import { AdminAvailabilityPage } from './AdminAvailabilityPage'
import { AdminLoginPage } from './AdminLoginPage'
import { AdminOrdersPage } from './AdminOrdersPage'

function AdminIndexRoute() {
  return <Navigate to="/admin/pedidos" replace />
}

export function AdminRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route index element={<AdminIndexRoute />} />
        <Route path="login" element={<AdminLoginPage />} />
        <Route
          path="pedidos"
          element={
            <ProtectedRoute>
              <AdminOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="disponibilidade"
          element={
            <ProtectedRoute>
              <AdminAvailabilityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="cancelados"
          element={
            <ProtectedRoute>
              <AdminCancelledOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}
