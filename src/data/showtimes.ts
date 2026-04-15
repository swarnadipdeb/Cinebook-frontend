import type { Showtime } from '../types'
import { theaters } from './theaters'

const generateShowtimes = (movieId: string): Showtime[] => {
  const times = ['10:30', '13:45', '16:00', '19:15', '21:30', '23:45']
  return theaters.map((theater) => ({
    id: `${movieId}-${theater.id}-${Date.now()}`,
    movieId,
    theater,
    date: new Date().toISOString().split('T')[0],
    times: times.filter((_, i) => i < 4 + Math.floor(Math.random() * 3)),
    screen: `${theater.screens > 10 ? Math.floor(Math.random() * theater.screens) + 1 : Math.floor(Math.random() * theater.screens) + 1}`,
    format: ['2D', '3D', 'IMAX', '4DX'][Math.floor(Math.random() * 4)],
  }))
}

export const getShowtimesForMovie = (movieId: string): Promise<Showtime[]> => {
  return Promise.resolve(generateShowtimes(movieId))
}

export const getShowtimeById = (_showtimeId: string): Promise<Showtime | null> => {
  return Promise.resolve(null)
}
