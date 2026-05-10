import { useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SeatMap from '../../components/features/seats/SeatMap'
import SeatLegend from '../../components/features/seats/SeatLegend'
import BookingSummary from '../../components/features/booking/BookingSummary'
import { createBooking } from '../../services/bookingService'
import type { Movie, ShowtimeResponseDTO, ShowSlot, Seat } from '../../types'

export default function SeatSelectionPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { movie, showtime, slot } = (location.state || {}) as {
    movie: Movie
    showtime: ShowtimeResponseDTO
    slot: ShowSlot
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
      slot,
      seats: selectedSeats,
      totalPrice,
    })
    navigate(`/booking/${booking.id}`, { state: { booking, movie, showtime, slot, selectedSeats } })
  }

  if (!movie || !slot) {
    return (
      <div className="text-center py-16 text-[var(--color-text-muted)]">
        <p>No showtime selected. Please go back and choose a showtime.</p>
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
          <SeatMap
            selectedSeats={selectedSeats}
            onToggle={toggleSeat}
            rows={slot.rows}
            cols={slot.cols}
            premiumCols={slot.premiumCols}
            aisleAfterCol={slot.aisleAfterCol}
            regularPrice={slot.regularPrice}
            premiumPrice={slot.premiumPrice}
          />
        </div>

        <div className="min-w-0">
          <BookingSummary
            movie={movie}
            showtime={showtime}
            slot={slot}
            selectedSeats={selectedSeats}
            totalPrice={totalPrice}
            onConfirm={handleConfirm}
          />
        </div>
      </div>
    </div>
  )
}
