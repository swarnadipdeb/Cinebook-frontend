import { useMovies } from '../../hooks/useMovies'

export default function AdminPage() {
  const { movies, loading } = useMovies()

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-[var(--color-text-heading)] mb-1">Admin Panel</h1>
        <p className="text-[var(--color-text-muted)]">Manage movies, theaters, and bookings</p>
      </div>

      <div className="flex flex-col gap-10">
        <div className="bg-[var(--color-bg-card)] rounded-xl p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-[var(--color-text-heading)]">Movies</h2>
            <button className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-semibold text-sm transition-colors duration-150 hover:bg-[var(--color-primary-hover)]">
              + Add Movie
            </button>
          </div>

          {loading ? (
            <p className="text-center py-8 text-[var(--color-text-muted)]">Loading...</p>
          ) : (
            <div className="flex flex-col gap-3">
              {movies.map((movie) => (
                <div key={movie.id} className="flex items-center gap-4 p-3 rounded-lg transition-all duration-150 hover:bg-[var(--color-bg-hover)]">
                  <img src={movie.poster} alt={movie.title} className="w-12 h-[72px] object-cover rounded flex-shrink-0" />
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <span className="font-bold text-[var(--color-text-heading)] whitespace-nowrap overflow-hidden text-ellipsis">{movie.title}</span>
                    <span className="text-[var(--color-text-muted)] text-[13px]">{movie.rating} · {movie.duration} min · {movie.language}</span>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button className="px-3 py-2 rounded text-[13px] font-semibold bg-[var(--color-bg-elevated)] text-[var(--color-text)] transition-all duration-150 hover:bg-[var(--color-primary)] hover:text-white">Edit</button>
                    <button className="px-3 py-2 rounded text-[13px] font-semibold bg-[var(--color-error)] text-white transition-all duration-150 hover:opacity-90">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[var(--color-bg-card)] rounded-xl p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-[var(--color-text-heading)]">Recent Bookings</h2>
          </div>
          <p className="text-center py-8 text-[var(--color-text-muted)]">No bookings found</p>
        </div>
      </div>
    </div>
  )
}
