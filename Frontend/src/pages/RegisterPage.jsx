import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import FormInput from '../components/FormInput'
import { getErrorMessage, registerUser } from '../services/api'

function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await registerUser(formData)
      setSuccess('Registration successful. You can log in now.')
      setTimeout(() => navigate('/login', { replace: true }), 800)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Registration failed.'))
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
            Already registered?{' '}
            <Link className="font-medium text-[#468432]" to="/login">
              Login
            </Link>
          </>
        }
        onSubmit={handleSubmit}
        submitLabel={loading ? 'Registering...' : 'Register'}
        subtitle="Create a user account for API testing."
        success={success}
        title="Register"
      >
        <FormInput
          autoComplete="name"
          label="Full Name"
          minLength="2"
          name="full_name"
          onChange={handleChange}
          required
          type="text"
          value={formData.full_name}
        />
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
          autoComplete="new-password"
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

export default RegisterPage
