import { useMemo } from 'react'
import SeatRow from './SeatRow'
import { ROW_LABELS } from '../../../constants/seatTypes'
import type { Seat } from '../../../types'

interface SeatMapProps {
  selectedSeats: Seat[]
  onToggle: (seat: Seat) => void
  rows?: number
  cols?: number
  premiumCols?: number[]     // 1-based column indices
  aisleAfterCol?: number     // 1-based column index
  regularPrice?: number
  premiumPrice?: number
  bookedSeats?: Set<string>
}

export default function SeatMap({
  selectedSeats,
  onToggle,
  rows = 8,
  cols = 12,
  premiumCols = [5, 6, 7, 8],
  aisleAfterCol = 6,
  regularPrice = 14.99,
  premiumPrice = 24.99,
  bookedSeats,
}: SeatMapProps) {
  const booked = bookedSeats ?? new Set<string>()

  const seatMap = useMemo(() => {
    return ROW_LABELS.slice(0, rows).map((row) =>
      Array.from({ length: cols }, (_, i) => {
        const col = i + 1
        const seatId = `${row}${col}`
        const isPremium = premiumCols.includes(col)

        if (booked.has(seatId)) {
          return { row, col, type: 'booked' as const, price: 0 }
        }
        return {
          row,
          col,
          type: isPremium ? ('premium' as const) : ('available' as const),
          price: isPremium ? premiumPrice : regularPrice,
        }
      })
    )
  }, [rows, cols, premiumCols, regularPrice, premiumPrice, booked])

  const seatMapWithSelection = useMemo(
    () =>
      seatMap.map((rowSeats) =>
        rowSeats.map((seat) => {
          const isSelected = selectedSeats.some((s) => s.row === seat.row && s.col === seat.col)
          return isSelected ? { ...seat, type: 'selected' as const } : seat
        })
      ),
    [seatMap, selectedSeats]
  )

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <div className="w-full max-w-[480px] mb-6">
        <div className="bg-gradient-to-b from-[var(--color-bg-elevated)] to-[var(--color-bg-card)] rounded-t-full px-8 py-3 text-center text-xs font-bold tracking-[3px] text-[var(--color-text-muted)] uppercase">
          SCREEN
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {seatMapWithSelection.map((rowSeats) => (
          <SeatRow
            key={rowSeats[0].row}
            row={rowSeats[0].row}
            seats={rowSeats}
            aisleAfterCol={aisleAfterCol}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  )
}
