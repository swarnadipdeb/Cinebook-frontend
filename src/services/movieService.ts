import { movies } from '../data/movies'
import type { Movie } from '../types'

export const getMovies = (): Promise<Movie[]> => Promise.resolve([...movies])

export const getMovieById = (id: string): Promise<Movie | null> => {
  const movie = movies.find((m) => m.id === id)
  return Promise.resolve(movie || null)
}

export const searchMovies = (query: string): Promise<Movie[]> => {
  const filtered = movies.filter(
    (m) =>
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.genre.some((g) => g.toLowerCase().includes(query.toLowerCase()))
  )
  return Promise.resolve(filtered)
}
