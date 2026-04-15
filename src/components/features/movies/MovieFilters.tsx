import { useState, useMemo } from 'react'
import type { Movie } from '../../../types'

interface MovieFiltersProps {
  movies: Movie[]
  onFilteredMovies: (movies: Movie[]) => void
}

export default function MovieFilters({ movies, onFilteredMovies }: MovieFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [releaseFilter, setReleaseFilter] = useState('all')

  // Extract unique genres from all movies
  const allGenres = useMemo(() => {
    const genres = new Set<string>()
    movies.forEach((m) => m.genre.forEach((g) => genres.add(g)))
    return Array.from(genres).sort()
  }, [movies])

  // Apply filters whenever any filter state changes
  useMemo(() => {
    let filtered = [...movies]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.genre.some((g) => g.toLowerCase().includes(query)) ||
          m.director.toLowerCase().includes(query)
      )
    }

    // Genre filter
    if (selectedGenre) {
      filtered = filtered.filter((m) => m.genre.includes(selectedGenre))
    }

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter((m) => m.rating >= minRating)
    }

    // Release date filter
    if (releaseFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      filtered = filtered.filter((m) => {
        const releaseDate = new Date(m.releaseDate)
        const diffTime = today.getTime() - releaseDate.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

        switch (releaseFilter) {
          case 'today':
            return diffDays === 0
          case 'thisWeek':
            return diffDays >= 0 && diffDays <= 7
          case 'thisMonth':
            return diffDays >= 0 && diffDays <= 30
          case 'upcoming':
            return diffDays < 0
          default:
            return true
        }
      })
    }

    onFilteredMovies(filtered)
  }, [searchQuery, selectedGenre, minRating, releaseFilter, movies, onFilteredMovies])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedGenre('')
    setMinRating(0)
    setReleaseFilter('all')
  }

  const hasActiveFilters = searchQuery || selectedGenre || minRating > 0 || releaseFilter !== 'all'

  return (
    <div className="bg-[--color-bg-card] border border-[--color-border] rounded-xl p-4 mb-8">
      <div className="flex flex-wrap gap-4">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-[--color-text-muted] mb-1">Search</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies, genres, directors..."
              className="w-full bg-[--color-bg] border border-[--color-border] rounded-lg px-4 py-2 text-[--color-text] placeholder-[--color-text-muted] focus:outline-none focus:border-[--color-primary]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[--color-text-muted] hover:text-[--color-text] text-sm"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Genre Filter */}
        <div className="min-w-[150px]">
          <label className="block text-sm text-[--color-text-muted] mb-1">Genre</label>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full bg-[--color-bg] border border-[--color-border] rounded-lg px-4 py-2 text-[--color-text] focus:outline-none focus:border-[--color-primary]"
          >
            <option value="">All Genres</option>
            {allGenres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        {/* Rating Filter */}
        <div className="min-w-[150px]">
          <label className="block text-sm text-[--color-text-muted] mb-1">
            Min Rating: {minRating > 0 ? `${minRating}+` : 'Any'}
          </label>
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="w-full bg-[--color-bg] border border-[--color-border] rounded-lg px-4 py-2 text-[--color-text] focus:outline-none focus:border-[--color-primary]"
          >
            <option value={0}>Any Rating</option>
            <option value={7}>7+</option>
            <option value={8}>8+</option>
            <option value={9}>9+</option>
          </select>
        </div>

        {/* Release Date Filter */}
        <div className="min-w-[150px]">
          <label className="block text-sm text-[--color-text-muted] mb-1">Release</label>
          <select
            value={releaseFilter}
            onChange={(e) => setReleaseFilter(e.target.value)}
            className="w-full bg-[--color-bg] border border-[--color-border] rounded-lg px-4 py-2 text-[--color-text] focus:outline-none focus:border-[--color-primary]"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="text-sm text-[--color-primary] hover:text-[--color-primary]/80"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}