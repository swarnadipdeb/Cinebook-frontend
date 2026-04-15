import { generateTicketId } from '../utils/generateTicketId'

const bookings = []

export const createBooking = (bookingData) => {
  const booking = {
    id: generateTicketId(),
    ...bookingData,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  }
  bookings.push(booking)
  return Promise.resolve(booking)
}

export const getBookingById = (id) => {
  const booking = bookings.find((b) => b.id === id)
  return Promise.resolve(booking || null)
}

export const getBookingsByUser = (userId) => {
  return Promise.resolve(bookings.filter((b) => b.userId === userId))
}
