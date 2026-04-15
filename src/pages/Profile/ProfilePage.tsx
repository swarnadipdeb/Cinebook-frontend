import { useAuth } from '../../store/AuthContext'

export default function ProfilePage() {
  const { user, logout } = useAuth()

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-[--color-text-heading]">My Profile</h1>
      </div>

      {user ? (
        <div className="max-w-[600px]">
          <div className="bg-[--color-bg-card] border border-[--color-border] rounded-xl p-6 flex items-center gap-5 mb-8">
            <div className="w-[72px] h-[72px] bg-[--color-primary] rounded-full flex items-center justify-center text-2xl font-extrabold text-white flex-shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[--color-text-heading] mb-0.5">{user.name}</h2>
              <p className="text-[--color-text-muted]">{user.email}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-[--color-text-heading] mb-4 pb-3 border-b border-[--color-border]">Booking History</h3>
            <p className="text-center text-[--color-text-muted] py-8">No bookings yet</p>
          </div>

          <button
            onClick={logout}
            className="px-6 py-3 bg-transparent border border-[--color-error] text-[--color-error] rounded-lg font-semibold transition-all duration-150 hover:bg-[--color-error] hover:text-white"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="text-center py-16 text-[--color-text-muted]">
          <p>You are not signed in.</p>
        </div>
      )}
    </div>
  )
}
