import SeatRow from './SeatRow'
import { ROW_LABELS } from '../../../constants/seatTypes'
import type { Seat } from '../../../types'

const COLS = 12

interface SeatMapProps {
  selectedSeats: Seat[]
  onToggle: (seat: Seat) => void
}

function generateSeatMap(premiumCols = [4, 5, 6, 7], bookedSeats = new Set<string>()) {
  return ROW_LABELS.slice(0, 8).map((row) => {
    return Array.from({ length: COLS }, (_, col) => {
      const isPremium = premiumCols.includes(col)
      const seatId = `${row}${col + 1}`
      if (bookedSeats.has(seatId)) {
        return { row, col: col + 1, type: 'booked' as const, price: 0 }
      }
      return {
        row,
        col: col + 1,
        type: isPremium ? ('premium' as const) : ('available' as const),
        price: isPremium ? 24.99 : 14.99,
      }
    })
  })
}

export default function SeatMap({ selectedSeats, onToggle }: SeatMapProps) {
  const seatMap = generateSeatMap()

  const seatMapWithSelection = seatMap.map((rowSeats) =>
    rowSeats.map((seat) => {
      const isSelected = selectedSeats.some((s) => s.row === seat.row && s.col === seat.col)
      if (isSelected) {
        return { ...seat, type: 'selected' as const }
      }
      return seat
    })
  )

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <div className="w-full max-w-[480px] mb-6">
        <div className="bg-gradient-to-b from-white/15 to-white/5 rounded-t-full px-8 py-3 text-center text-xs font-bold tracking-[3px] text-white/50 uppercase border border-white/10 border-b-none">
          SCREEN
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {seatMapWithSelection.map((rowSeats) => (
          <SeatRow
            key={rowSeats[0].row}
            row={rowSeats[0].row}
            seats={rowSeats}
            onToggle={onToggle}
          />
        ))}
      </div>

      <p className="text-xs text-[--color-text-muted] text-center mt-2">Aisle</p>
    </div>
  )
}
