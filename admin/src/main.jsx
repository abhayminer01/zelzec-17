import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ManageAdmins from './pages/ManageAdmins'
import NoPage from './pages/NoPage'
import ManageCategories from './pages/ManageCategories'
import ManageUsers from './pages/ManageUsers'
import ManageProducts from './pages/ManageProducts'
import Settings from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='*' element={<NoPage />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='dashboard/admins' element={<ManageAdmins />} />
            <Route path='dashboard/categories' element={<ManageCategories />} />
            <Route path='dashboard/users' element={<ManageUsers />} />
            <Route path='dashboard/products' element={<ManageProducts />} />
            <Route path='dashboard/settings' element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
