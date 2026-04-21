import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import {
  fetchCurrentUser,
  getStoredToken,
  getStoredUser,
  removeStoredToken,
  storeToken,
  storeUser,
} from './services/api'

function App() {
  const [token, setToken] = useState(() => getStoredToken())
  const [user, setUser] = useState(() => getStoredUser())

  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }

    if (user) {
      return
    }

    let ignore = false

    const loadCurrentUser = async () => {
      try {
        const currentUser = await fetchCurrentUser()
        if (!ignore) {
          storeUser(currentUser)
          setUser(currentUser)
        }
      } catch {
        if (!ignore) {
          removeStoredToken()
          setToken(null)
          setUser(null)
        }
      }
    }

    loadCurrentUser()

    return () => {
      ignore = true
    }
  }, [token, user])

  const handleLogin = (nextToken, nextUser) => {
    storeToken(nextToken)
    storeUser(nextUser)
    setToken(nextToken)
    setUser(nextUser)
  }

  const handleLogout = () => {
    removeStoredToken()
    setToken(null)
    setUser(null)
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={token ? '/dashboard' : '/login'} replace />}
      />
      <Route
        path="/login"
        element={
          token ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />
        }
      />
      <Route
        path="/register"
        element={token ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute token={token}>
            <DashboardPage onLogout={handleLogout} user={user} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
