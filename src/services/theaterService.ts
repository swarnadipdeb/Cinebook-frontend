import { theaters } from '../data/theaters'
import type { Theater } from '../types'

// Mirrors the API contract: GET /theaters
export const getTheaters = (): Promise<Theater[]> => {
  return Promise.resolve([...theaters])
}

// Mirrors the API contract: GET /theaters/:id
export const getTheater = (id: string): Promise<Theater | null> => {
  const theater = theaters.find((t) => t.id === id)
  return Promise.resolve(theater || null)
}
