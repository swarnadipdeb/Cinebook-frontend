import type { Showtime, Theater } from '../types'
import { theaters } from './theaters'

const t1: Theater = { id: 't1', name: 'IMAX Downtown', address: '123 Main St, Downtown', screens: 8, amenities: ['IMAX', 'Dolby Atmos', 'Recliner Seats', 'VIP Lounge'] }
const t2: Theater = { id: 't2', name: 'Cineplex Central', address: '456 Broadway Ave, Central', screens: 12, amenities: ['4DX', 'Dolby Cinema', 'Gold Class', 'Play Area'] }
const t3: Theater = { id: 't3', name: 'Starlite Megaplex', address: '789 Park Blvd, Westside', screens: 15, amenities: ['ScreenX', 'RealD 3D', 'Beanbags', 'Bar'] }

const allShowtimes: Showtime[] = [
  // Dune: Part Three (movie 1)
  { id: 'st-1-t1', movieId: '1', theater: t1, date: '2026-04-24', times: ['10:30', '13:45', '17:00', '20:15', '23:30'], screen: '1', format: 'IMAX' },
  { id: 'st-1-t2', movieId: '1', theater: t2, date: '2026-04-24', times: ['11:00', '14:30', '18:00', '21:30'], screen: '3', format: 'Dolby Cinema' },
  { id: 'st-1-t3', movieId: '1', theater: t3, date: '2026-04-24', times: ['12:00', '16:15', '19:45', '23:00'], screen: '7', format: 'ScreenX' },
  { id: 'st-1-t1-25', movieId: '1', theater: t1, date: '2026-04-25', times: ['11:30', '15:00', '18:30', '22:00'], screen: '1', format: 'IMAX' },
  { id: 'st-1-t2-25', movieId: '1', theater: t2, date: '2026-04-25', times: ['10:00', '13:30', '17:00', '20:30'], screen: '3', format: 'Dolby Cinema' },

  // The Midnight Express (movie 2)
  { id: 'st-2-t1', movieId: '2', theater: t1, date: '2026-04-24', times: ['11:00', '14:00', '17:30', '20:45'], screen: '3', format: '2D' },
  { id: 'st-2-t2', movieId: '2', theater: t2, date: '2026-04-24', times: ['12:30', '16:00', '19:30', '22:45'], screen: '5', format: 'Gold Class' },
  { id: 'st-2-t3', movieId: '2', theater: t3, date: '2026-04-24', times: ['10:00', '13:15', '16:45', '20:00', '23:15'], screen: '2', format: '2D' },
  { id: 'st-2-t1-25', movieId: '2', theater: t1, date: '2026-04-25', times: ['12:00', '15:30', '19:00', '22:15'], screen: '3', format: '2D' },
  { id: 'st-2-t3-25', movieId: '2', theater: t3, date: '2026-04-25', times: ['11:00', '14:30', '18:00', '21:15'], screen: '2', format: '2D' },

  // Neon Samurai (movie 3)
  { id: 'st-3-t1', movieId: '3', theater: t1, date: '2026-04-24', times: ['10:00', '13:00', '16:30', '19:45', '23:00'], screen: '2', format: 'IMAX' },
  { id: 'st-3-t2', movieId: '3', theater: t2, date: '2026-04-24', times: ['11:30', '15:00', '18:30', '22:00'], screen: '1', format: '4DX' },
  { id: 'st-3-t3', movieId: '3', theater: t3, date: '2026-04-24', times: ['10:30', '14:00', '17:30', '21:00'], screen: '10', format: 'RealD 3D' },
  { id: 'st-3-t1-25', movieId: '3', theater: t1, date: '2026-04-25', times: ['11:00', '14:15', '17:45', '21:00'], screen: '2', format: 'IMAX' },
  { id: 'st-3-t2-25', movieId: '3', theater: t2, date: '2026-04-25', times: ['10:30', '14:00', '17:30', '21:00'], screen: '1', format: '4DX' },

  // Whispers in the Rain (movie 4)
  { id: 'st-4-t1', movieId: '4', theater: t1, date: '2026-04-24', times: ['11:30', '14:30', '17:00', '20:00', '22:30'], screen: '5', format: '2D' },
  { id: 'st-4-t2', movieId: '4', theater: t2, date: '2026-04-24', times: ['12:00', '15:15', '18:30', '21:45'], screen: '8', format: 'Gold Class' },
  { id: 'st-4-t3', movieId: '4', theater: t3, date: '2026-04-24', times: ['11:00', '14:00', '16:45', '19:30', '22:15'], screen: '4', format: '2D' },
  { id: 'st-4-t2-25', movieId: '4', theater: t2, date: '2026-04-25', times: ['11:00', '14:00', '17:30', '20:45'], screen: '8', format: 'Gold Class' },

  // Gravity Well (movie 5)
  { id: 'st-5-t1', movieId: '5', theater: t1, date: '2026-04-24', times: ['10:00', '13:30', '17:00', '20:30'], screen: '1', format: 'IMAX' },
  { id: 'st-5-t2', movieId: '5', theater: t2, date: '2026-04-24', times: ['11:00', '15:00', '19:00', '23:00'], screen: '2', format: 'Dolby Cinema' },
  { id: 'st-5-t3', movieId: '5', theater: t3, date: '2026-04-24', times: ['10:30', '14:30', '18:30', '22:30'], screen: '12', format: 'ScreenX' },
  { id: 'st-5-t1-25', movieId: '5', theater: t1, date: '2026-04-25', times: ['10:30', '14:00', '17:30', '21:00'], screen: '1', format: 'IMAX' },
  { id: 'st-5-t3-25', movieId: '5', theater: t3, date: '2026-04-25', times: ['11:30', '15:30', '19:30', '23:00'], screen: '12', format: 'ScreenX' },

  // The Last Kingdom (movie 6)
  { id: 'st-6-t1', movieId: '6', theater: t1, date: '2026-04-24', times: ['12:00', '15:30', '19:00', '22:30'], screen: '6', format: '2D' },
  { id: 'st-6-t2', movieId: '6', theater: t2, date: '2026-04-24', times: ['11:00', '14:45', '18:15', '21:45'], screen: '9', format: 'Dolby Cinema' },
  { id: 'st-6-t3', movieId: '6', theater: t3, date: '2026-04-24', times: ['10:30', '14:00', '17:45', '21:15'], screen: '11', format: 'RealD 3D' },
  { id: 'st-6-t1-25', movieId: '6', theater: t1, date: '2026-04-25', times: ['11:00', '15:00', '18:45', '22:15'], screen: '6', format: '2D' },
  { id: 'st-6-t3-25', movieId: '6', theater: t3, date: '2026-04-25', times: ['10:00', '13:45', '17:30', '21:00'], screen: '11', format: 'RealD 3D' },
]

export const getShowtimesForMovie = (movieId: string): Promise<Showtime[]> => {
  return Promise.resolve(allShowtimes.filter((st) => st.movieId === movieId))
}

export const getShowtimeById = (showtimeId: string): Promise<Showtime | null> => {
  return Promise.resolve(allShowtimes.find((st) => st.id === showtimeId) || null)
}
