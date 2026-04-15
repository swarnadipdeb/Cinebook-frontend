import { useState, useEffect } from 'react'
import { getMovies } from '../services/movieService'
import type { Movie } from '../types'

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getMovies()
      .then((data) => {
        setMovies(data)
        setLoading(false)
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return { movies, loading, error }
}
