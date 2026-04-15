// Domain types for the movie ticket booking system

export interface Movie {
  id: string
  title: string
  tagline: string
  poster: string
  backdrop: string
  rating: number
  duration: number
  genre: string[]
  language: string
  releaseDate: string
  director: string
  cast: string[]
  description: string
  premiumPrice: number
  regularPrice: number
}

export interface Theater {
  id: string
  name: string
  address: string
  screens: number
  amenities: string[]
}

export interface Showtime {
  id: string
  movieId: string
  theater: Theater
  date: string
  times: string[]
  screen: string
  format: string
}

export type SeatType = 'available' | 'selected' | 'booked' | 'premium' | 'disabled'

export interface Seat {
  row: string
  col: number
  type: SeatType
  price: number
}

export interface Booking {
  id: string
  movie: Movie
  showtime: Showtime
  time: string
  seats: Seat[]
  totalPrice: number
  status: string
  createdAt: string
  userId?: string
}

export interface BookingData {
  movie: Movie
  showtime: Showtime
  time: string
  seats: Seat[]
  totalPrice: number
}

export interface User {
  id: string
  name: string
  email: string
}

export interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean }>
  logout: () => void
}

export interface BookingContextValue {
  selectedMovie: Movie | null
  selectedShowtime: Showtime | null
  selectedSeats: Seat[]
  totalPrice: number
  bookingId: string | null
  selectMovie: (movie: Movie) => void
  selectShowtime: (showtime: Showtime) => void
  toggleSeat: (seat: Seat) => void
  clearBooking: () => void
  confirmBooking: (id: string) => void
}
