import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../store/AuthContext'
import { useFormValidation, EMAIL_REGEX } from '../../hooks/useFormValidation'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { form, errors, handleChange, setErrors } = useFormValidation<{ name: string; email: string; password: string; confirmPassword: string }>({
    name: '', email: '', password: '', confirmPassword: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email) errs.email = 'Email is required'
    else if (!EMAIL_REGEX.test(form.email))
      errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6)
      errs.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match'
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
    await register(form.name, form.email, form.password)
    navigate(ROUTES.HOME)
  }

  return (
    <div className="min-h-[calc(100vh-72px-200px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[420px] bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-elevated)] rounded-xl p-8 shadow-[var(--shadow-elevated)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[var(--color-text-heading)] mb-1">Create Account</h1>
          <p className="text-[var(--color-text-muted)]">Join CineBook and start booking</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-semibold text-[var(--color-text)]">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              className={`px-4 py-3 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-base transition-all duration-150 outline-none ${
                errors.name ? 'ring-2 ring-[var(--color-error)]' : 'focus:ring-2 focus:ring-[var(--color-primary)]'
              }`}
              placeholder="John Doe"
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <span id="name-error" className="text-[13px] text-[var(--color-error)]">{errors.name}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-[var(--color-text)]">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className={`px-4 py-3 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-base transition-all duration-150 outline-none ${
                errors.email ? 'ring-2 ring-[var(--color-error)]' : 'focus:ring-2 focus:ring-[var(--color-primary)]'
              }`}
              placeholder="you@example.com"
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span id="email-error" className="text-[13px] text-[var(--color-error)]">{errors.email}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-semibold text-[var(--color-text)]">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className={`px-4 py-3 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-base transition-all duration-150 outline-none ${
                errors.password ? 'ring-2 ring-[var(--color-error)]' : 'focus:ring-2 focus:ring-[var(--color-primary)]'
              }`}
              placeholder="At least 6 characters"
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <span id="password-error" className="text-[13px] text-[var(--color-error)]">{errors.password}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-[var(--color-text)]">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`px-4 py-3 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-base transition-all duration-150 outline-none ${
                errors.confirmPassword ? 'ring-2 ring-[var(--color-error)]' : 'focus:ring-2 focus:ring-[var(--color-primary)]'
              }`}
              placeholder="Repeat your password"
              aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
            />
            {errors.confirmPassword && (
              <span id="confirm-error" className="text-[13px] text-[var(--color-error)]">{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="mt-1 py-4 bg-[var(--color-primary)] text-white rounded-lg font-bold text-base transition-colors duration-150 hover:bg-[var(--color-primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-[var(--color-text-muted)] text-[15px]">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-[var(--color-primary)] font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
