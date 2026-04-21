import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import FormInput from '../components/FormInput'
import { getErrorMessage, loginUser } from '../services/api'

function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await loginUser(formData)
      onLogin(response.access_token, response.user)
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Login failed.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <AuthCard
        error={error}
        footer={
          <>
            Need an account?{' '}
            <Link className="font-medium text-[#468432]" to="/register">
              Register
            </Link>
          </>
        }
        onSubmit={handleSubmit}
        submitLabel={loading ? 'Logging in...' : 'Login'}
        subtitle="Use your account credentials to get a JWT token."
        title="Login"
      >
        <FormInput
          autoComplete="email"
          label="Email"
          name="email"
          onChange={handleChange}
          required
          type="email"
          value={formData.email}
        />
        <FormInput
          autoComplete="current-password"
          label="Password"
          minLength="8"
          name="password"
          onChange={handleChange}
          required
          type="password"
          value={formData.password}
        />
      </AuthCard>
    </div>
  )
}

export default LoginPage
