import { getShowtimeEntries, resolveShowtimes } from '../data/showtimes'
import { theaters } from '../data/theaters'
import type { Showtime, ShowtimeEntry } from '../types'

// Mirrors the API contract: GET /movies/:id/showtimes?date=&embed=theater
// When wired to a real backend, this calls api.get(`/movies/${movieId}/showtimes?...`)
export const getShowtimes = (movieId: string, date?: string): Promise<Showtime[]> => {
  const entries = getShowtimeEntries().filter((st) => {
    const movieMatch = st.movieId === movieId
    const dateMatch = date ? st.date === date : true
    return movieMatch && dateMatch
  })
  return Promise.resolve(resolveShowtimes(entries, theaters))
}

// Mirrors the API contract: GET /showtimes/:id?embed=theater
export const getShowtime = (id: string): Promise<Showtime | null> => {
  const entry = getShowtimeEntries().find((st) => st.id === id)
  if (!entry) return Promise.resolve(null)
  return Promise.resolve(resolveShowtimes([entry], theaters)[0])
}
