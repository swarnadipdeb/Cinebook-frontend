import { SEAT_TYPES } from '../../../constants/seatTypes'
import type { Seat } from '../../../types'

interface SeatRowProps {
  row: string
  seats: Seat[]
  onToggle: (seat: Seat) => void
}

export default function SeatRow({ row, seats, onToggle }: SeatRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-7 text-center font-bold text-[--color-text-muted] text-sm flex-shrink-0">{row}</span>
      {seats.map((seat) => {
        const isAvailable = seat.type === SEAT_TYPES.AVAILABLE || seat.type === SEAT_TYPES.PREMIUM
        return (
          <button
            key={seat.col}
            className={`w-8 h-8 rounded border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-offset-2 focus:ring-offset-[--color-bg-card] ${
              seat.type === 'available'
                ? 'bg-[--color-seat-available] border-[--color-seat-available] hover:bg-green-600 hover:scale-110'
                : seat.type === 'selected'
                ? 'bg-[--color-seat-selected] border-[--color-seat-selected] scale-110'
                : seat.type === 'booked'
                ? 'bg-[--color-seat-booked] cursor-not-allowed opacity-60'
                : seat.type === 'premium'
                ? 'bg-[--color-seat-premium] border-[--color-seat-premium] hover:bg-amber-600 hover:scale-110'
                : 'bg-[--color-seat-disabled] cursor-not-allowed opacity-30'
            }`}
            onClick={() => isAvailable && onToggle(seat)}
            disabled={!isAvailable}
            aria-label={`Seat ${row}${seat.col} - ${seat.type}`}
            title={`${row}${seat.col} - ${isAvailable ? `$${seat.price}` : 'Unavailable'}`}
          />
        )
      })}
    </div>
  )
}
