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
        const isClickable = seat.type !== SEAT_TYPES.BOOKED && seat.type !== SEAT_TYPES.DISABLED
        return (
          <button
            key={seat.col}
            className={`w-8 h-8 rounded border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-offset-2 focus:ring-offset-[--color-bg-card] ${
              seat.type === 'available'
                ? 'border-[var(--color-seat-available)] hover:border-[var(--color-seat-available)] bg-[var(--color-seat-available)] hover:bg-green-600 hover:scale-110'
                : seat.type === 'selected'
                ? 'bg-[var(--color-seat-selected)] border-[var(--color-seat-selected)] scale-110'
                : seat.type === 'booked'
                ? 'bg-[var(--color-seat-booked)] cursor-not-allowed opacity-60'
                : seat.type === 'premium'
                ? 'border-[var(--color-seat-premium)] hover:border-[var(--color-seat-premium)] bg-[var(--color-seat-premium)] hover:bg-amber-600 hover:scale-110'
                : 'bg-[var(--color-seat-disabled)] cursor-not-allowed opacity-30'
            }`}
            onClick={() => isClickable && onToggle(seat)}
            disabled={!isClickable}
            aria-label={`Seat ${row}${seat.col} - ${seat.type}`}
            title={`${row}${seat.col} - ${isClickable ? `$${seat.price}` : 'Unavailable'}`}
          />
        )
      })}
    </div>
  )
}
