import MovieGrid from '../../components/features/movies/MovieGrid'
import { useMovies } from '../../hooks/useMovies'

export default function HomePage() {
  const { movies, loading } = useMovies()

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">
      <section>
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[--color-text-heading] mb-2">
            Now Showing
          </h1>
          <p className="text-[--color-text-muted]">
            Book tickets for the latest movies
          </p>
        </header>

        <MovieGrid movies={movies} loading={loading} />
      </section>
    </div>
  )
}
