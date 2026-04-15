import { Link } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'
import { APP_NAME } from '../../../constants/config'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 h-[72px] bg-[rgba(13,13,18,0.95)] backdrop-blur-[12px]">
      <div className="max-w-[1280px] h-full mx-auto px-4 flex items-center justify-between">
        <Link to={ROUTES.HOME} className="text-2xl font-extrabold text-[var(--color-text-heading)] tracking-tight">
          Cine<span className="text-[var(--color-primary)]">Book</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to={ROUTES.PROFILE}
            className="relative text-[var(--color-text)] text-[15px] font-medium transition-colors duration-150 hover:text-[var(--color-text-heading)] before:absolute before:bottom-[-4px] before:left-0 before:w-0 before:h-[2px] before:bg-[var(--color-primary)] before:transition-all before:duration-150 hover:before:w-full"
          >
            My Bookings
          </Link>
          <Link
            to={ROUTES.ADMIN}
            className="relative text-[var(--color-text)] text-[15px] font-medium transition-colors duration-150 hover:text-[var(--color-text-heading)] before:absolute before:bottom-[-4px] before:left-0 before:w-0 before:h-[2px] before:bg-[var(--color-primary)] before:transition-all before:duration-150 hover:before:w-full"
          >
            Admin
          </Link>
          <Link
            to={ROUTES.LOGIN}
            className="px-5 py-2 bg-[var(--color-primary)] text-white rounded-lg font-semibold text-sm transition-colors duration-150 hover:bg-[var(--color-primary-hover)]"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  )
}
