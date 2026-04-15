import { useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SeatMap from '../../components/features/seats/SeatMap'
import SeatLegend from '../../components/features/seats/SeatLegend'
import BookingSummary from '../../components/features/booking/BookingSummary'
import { createBooking } from '../../services/bookingService'
import type { Movie, Showtime, Seat } from '../../types'

export default function SeatSelectionPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { movie, showtime, time } = (location.state || {}) as {
    movie: Movie
    showtime: Showtime
    time: string
  }

  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])

  const totalPrice = useMemo(
    () => selectedSeats.reduce((sum, seat) => sum + seat.price, 0),
    [selectedSeats]
  )

  const toggleSeat = (seat: Seat) => {
    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.row === seat.row && s.col === seat.col)
      if (exists) {
        return prev.filter((s) => !(s.row === seat.row && s.col === seat.col))
      }
      return [...prev, seat]
    })
  }

  const handleConfirm = async () => {
    if (!movie || !showtime || selectedSeats.length === 0) return
    const booking = await createBooking({
      movie,
      showtime,
      time,
      seats: selectedSeats,
      totalPrice,
    })
    navigate(`/booking/${booking.id}`, { state: { booking, movie, showtime, time, selectedSeats } })
  }

  if (!movie) {
    return (
      <div className="text-center py-16 text-[var(--color-text-muted)]">
        <p>No movie selected. Please go back and choose a movie.</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--color-text-heading)] mb-6">Select Your Seats</h1>
        <SeatLegend />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        <div className="bg-[var(--color-bg-card)] rounded-xl overflow-hidden shadow-[var(--shadow-card)]">
          <SeatMap selectedSeats={selectedSeats} onToggle={toggleSeat} />
        </div>

        <div className="min-w-0">
          <BookingSummary
            movie={movie}
            showtime={showtime}
            time={time}
            selectedSeats={selectedSeats}
            totalPrice={totalPrice}
            onConfirm={handleConfirm}
          />
        </div>
      </div>
    </div>
  )
}
