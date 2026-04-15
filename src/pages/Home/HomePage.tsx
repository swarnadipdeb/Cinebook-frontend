import { useState, useEffect } from 'react'
import MovieGrid from '../../components/features/movies/MovieGrid'
import MovieFilters from '../../components/features/movies/MovieFilters'
import { useMovies } from '../../hooks/useMovies'
import type { Movie } from '../../types'

export default function HomePage() {
  const { movies, loading } = useMovies()
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])

  useEffect(() => {
    if (!loading) {
      setFilteredMovies(movies)
    }
  }, [movies, loading])

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">
      <section>
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[var(--color-text-heading)] mb-2">
            Now Showing
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Book tickets for the latest movies
          </p>
        </header>

        {!loading && movies.length > 0 && (
          <MovieFilters movies={movies} onFilteredMovies={setFilteredMovies} />
        )}

        <MovieGrid movies={filteredMovies} loading={loading} />
      </section>
    </div>
  )
}
