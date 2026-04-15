import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../store/AuthContext'
import { useFormValidation, EMAIL_REGEX } from '../../hooks/useFormValidation'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { form, errors, handleChange, setErrors } = useFormValidation<{ email: string; password: string }>({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.email) errs.email = 'Email is required'
    else if (!EMAIL_REGEX.test(form.email))
      errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6)
      errs.password = 'Password must be at least 6 characters'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs as Partial<Record<keyof typeof form, string>>)
      return
    }
    setSubmitting(true)
    await login(form.email, form.password)
    navigate(ROUTES.HOME)
  }

  return (
    <div className="min-h-[calc(100vh-72px-200px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[420px] bg-[--color-bg-card] border border-[--color-border] rounded-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[--color-text-heading] mb-1">Welcome Back</h1>
          <p className="text-[--color-text-muted]">Sign in to continue booking</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-[--color-text]">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className={`px-4 py-3 bg-[--color-bg-elevated] border rounded-lg text-[--color-text-heading] text-base transition-colors duration-150 outline-none ${
                errors.email ? 'border-[--color-error]' : 'border-[--color-border] focus:border-[--color-primary]'
              }`}
              placeholder="you@example.com"
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span id="email-error" className="text-[13px] text-[--color-error]">{errors.email}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-semibold text-[--color-text]">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              className={`px-4 py-3 bg-[--color-bg-elevated] border rounded-lg text-[--color-text-heading] text-base transition-colors duration-150 outline-none ${
                errors.password ? 'border-[--color-error]' : 'border-[--color-border] focus:border-[--color-primary]'
              }`}
              placeholder="Enter your password"
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <span id="password-error" className="text-[13px] text-[--color-error]">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="mt-1 py-4 bg-[--color-primary] text-white rounded-lg font-bold text-base transition-colors duration-150 hover:bg-[--color-primary-hover] disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-[--color-text-muted] text-[15px]">
          Don&apos;t have an account?{' '}
          <Link to={ROUTES.REGISTER} className="text-[--color-primary] font-semibold hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}
