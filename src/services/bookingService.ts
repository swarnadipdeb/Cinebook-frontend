import { generateTicketId } from '../utils/generateTicketId'
import type { Movie, Showtime, Seat } from '../types'

interface BookingData {
  movie: Movie
  showtime: Showtime
  time: string
  seats: Seat[]
  totalPrice: number
}

interface Booking extends BookingData {
  id: string
  status: string
  createdAt: string
  userId?: string
}

const bookings: Booking[] = []

export const createBooking = (bookingData: BookingData): Promise<Booking> => {
  const booking: Booking = {
    id: generateTicketId(),
    ...bookingData,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  }
  bookings.push(booking)
  return Promise.resolve(booking)
}

export const getBookingById = (id: string): Promise<Booking | null> => {
  const booking = bookings.find((b) => b.id === id)
  return Promise.resolve(booking || null)
}

export const getBookingsByUser = (userId: string): Promise<Booking[]> => {
  return Promise.resolve(bookings.filter((b) => b.userId === userId))
}
