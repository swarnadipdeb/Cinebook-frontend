import api from './api'
import type { Booking, BookingData } from '../types'

// POST /bookings/v1/bookings
export const createBooking = (bookingData: BookingData): Promise<Booking> => {
  return api.post('/bookings/v1/bookings', bookingData).then((r) => r.data)
}

// GET /bookings/v1/bookings/{id}
export const getBookingById = (id: string): Promise<Booking | null> => {
  return api.get(`/bookings/v1/bookings/${id}`).then((r) => r.data).catch(() => null)
}

// GET /bookings/v1/bookings/user/{userId}
export const getBookingsByUser = (userId: string): Promise<Booking[]> => {
  return api.get(`/bookings/v1/bookings/user/${userId}`).then((r) => r.data)
}
