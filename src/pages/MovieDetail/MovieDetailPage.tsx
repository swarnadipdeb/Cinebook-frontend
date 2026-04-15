import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getMovieById } from '../../services/movieService'
import { getShowtimesForMovie } from '../../data/showtimes'
import { formatPrice } from '../../utils/formatPrice'
import type { Movie, Showtime } from '../../types'

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [showtimes, setShowtimes] = useState<Showtime[]>([])
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([getMovieById(id), getShowtimesForMovie(id)]).then(
      ([movieData, showtimeData]) => {
        setMovie(movieData)
        setShowtimes(showtimeData)
        setLoading(false)
      }
    )
  }, [id])

  const handleProceed = () => {
    if (!selectedShowtime || !selectedTime || !movie) return
    navigate(`/movie/${id}/seats`, {
      state: { movie, showtime: selectedShowtime, time: selectedTime },
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[--color-border] border-t-[--color-primary] rounded-full animate-spin" />
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="text-center py-16 text-[--color-text-muted]">
        <h2>Movie not found</h2>
        <Link to="/" className="text-[--color-primary] mt-4 inline-block">Back to Home</Link>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute top-0 left-0 right-0 h-[60vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${movie.backdrop})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(13,13,18,0.4)] from-0% via-[rgba(13,13,18,0.85)] via-80% to-[--color-bg] to-100%" />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 pb-16">
        <div className="flex gap-8 pt-[32vh] mb-12">
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            className="w-60 rounded-xl shadow-[--shadow-elevated] flex-shrink-0"
          />
          <div className="flex flex-col flex-1">
            <div className="flex gap-2 flex-wrap mb-3">
              {movie.genre.map((g) => (
                <span key={g} className="bg-[--color-primary-bg] text-[--color-primary] text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">{g}</span>
              ))}
            </div>
            <h1 className="text-5xl font-extrabold text-[--color-text-heading] tracking-tight leading-tight mb-2">{movie.title}</h1>
            <p className="text-lg text-[--color-text-muted] italic mb-4">{movie.tagline}</p>

            <div className="flex items-center gap-3 text-[--color-text-muted] text-[15px] mb-5">
              <span className="text-[--color-warning] font-bold">★ {movie.rating}</span>
              <span>·</span>
              <span>{movie.language}</span>
              <span>·</span>
              <span>{movie.duration} min</span>
            </div>

            <p className="text-[--color-text] leading-relaxed max-w-[680px] mb-5">{movie.description}</p>

            <div className="text-[--color-text-muted] text-[15px] mb-1">
              <span className="text-[--color-text] font-semibold">Cast:</span> {movie.cast.join(', ')}
            </div>
            <div className="text-[--color-text-muted] text-[15px]">
              <span className="text-[--color-text] font-semibold">Director:</span> {movie.director}
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-bold text-[--color-text-heading] mb-6">Select Showtime</h2>
          {showtimes.length === 0 ? (
            <p className="text-[--color-text-muted]">No showtimes available</p>
          ) : (
            <div className="flex flex-col gap-4">
              {showtimes.map((st) => (
                <div key={st.id} className="bg-[--color-bg-card] border border-[--color-border] rounded-xl p-5 flex justify-between items-center gap-4 flex-wrap">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-[--color-text-heading] text-[17px]">{st.theater.name}</span>
                    <span className="text-[--color-primary] text-[13px] font-semibold">{st.format} · Screen {st.screen}</span>
                    <span className="text-[--color-text-muted] text-[13px]">{st.theater.amenities.slice(0, 2).join(' · ')}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {st.times.map((time) => (
                      <button
                        key={time}
                        className={`px-4 py-2 rounded-lg font-semibold text-[15px] border transition-all duration-150 cursor-pointer ${
                          selectedShowtime?.id === st.id && selectedTime === time
                            ? 'bg-[var(--color-blue)] border-[var(--color-blue)] text-white'
                            : 'bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[--color-text] hover:bg-[var(--color-blue)] hover:border-[var(--color-blue)] hover:text-white'
                        }`}
                        onClick={() => { setSelectedShowtime(st); setSelectedTime(time) }}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedShowtime && selectedTime && (
            <div className="mt-6 bg-[--color-bg-card] border border-[--color-primary] rounded-xl p-5 flex items-center gap-6 flex-wrap">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-[--color-text-heading]">{selectedShowtime.theater.name}</span>
                <span className="text-2xl font-extrabold text-[--color-primary]">{selectedTime}</span>
                <span className="text-[--color-text-muted] text-sm">{selectedShowtime.format}</span>
              </div>
              <div className="ml-auto text-[--color-text-muted] text-[15px]">
                <span>From {formatPrice(movie.regularPrice)}</span>
              </div>
              <button
                className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-lg font-bold text-base transition-colors duration-150 hover:bg-[var(--color-primary-hover)] cursor-pointer"
                onClick={handleProceed}
              >
                Proceed to Seats
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
