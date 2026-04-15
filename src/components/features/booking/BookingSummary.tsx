import { formatPrice } from '../../../utils/formatPrice'
import type { Movie, Showtime, Seat } from '../../../types'

interface BookingSummaryProps {
  movie: Movie | null
  showtime: Showtime | null
  time: string | null
  selectedSeats: Seat[]
  totalPrice: number
  onConfirm: () => void
}

export default function BookingSummary({
  movie,
  showtime,
  time,
  selectedSeats,
  totalPrice,
  onConfirm,
}: BookingSummaryProps) {
  const isDisabled = selectedSeats.length === 0

  return (
    <div className="bg-[--color-bg-card] border border-[--color-border] rounded-xl p-5 sticky top-[calc(72px+16px)]">
      <h3 className="text-lg font-bold text-[--color-text-heading] mb-5 pb-4 border-b border-[--color-border]">
        Booking Summary
      </h3>

      {movie && (
        <div className="flex gap-3 mb-5">
          <img src={movie.poster} alt={movie.title} className="w-16 rounded" />
          <div>
            <p className="font-bold text-[--color-text-heading] text-[15px] mb-0.5">{movie.title}</p>
            {showtime && (
              <p className="text-[--color-text-muted] text-[13px]">
                {showtime.theater.name} · {showtime.format} · Screen {showtime.screen}
              </p>
            )}
            {time && <p className="text-[--color-primary] font-bold text-[15px] mt-0.5">{time}</p>}
          </div>
        </div>
      )}

      {selectedSeats.length > 0 ? (
        <div className="mb-5">
          <div className="text-[13px] font-semibold text-[--color-text-muted] uppercase tracking-wide mb-3">
            Selected Seats
          </div>
          {selectedSeats.map((seat) => (
            <div key={`${seat.row}${seat.col}`} className="flex justify-between items-center py-1 text-sm text-[--color-text]">
              <span>
                Row {seat.row}, Seat {seat.col}
                {seat.type === 'premium' && (
                  <span className="ml-2 text-[11px] bg-[--color-seat-premium] text-black px-2 py-0.5 rounded-full font-bold">Premium</span>
                )}
              </span>
              <span className="font-semibold">{formatPrice(seat.price)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-[--color-text-muted] text-sm py-4">No seats selected</p>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-[--color-border] mb-5 font-bold text-[17px] text-[--color-text-heading]">
        <span>Total</span>
        <span className="text-[--color-primary]">{formatPrice(totalPrice)}</span>
      </div>

      <button
        className={`w-full py-4 rounded-lg font-bold text-base transition-colors duration-150 ${
          isDisabled
            ? 'bg-[--color-bg-elevated] text-[--color-text-muted] cursor-not-allowed'
            : 'bg-[--color-primary] text-white hover:bg-[--color-primary-hover]'
        }`}
        disabled={isDisabled}
        onClick={onConfirm}
      >
        {isDisabled ? 'Select Seats to Continue' : `Pay ${formatPrice(totalPrice)}`}
      </button>
    </div>
  )
}
