import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMovies, createMovie, updateMovie, deleteMovie } from '../../services/movieService'
import type { Movie } from '../../types'

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const emptyForm: MovieForm = {
  title: '',
  tagline: '',
  poster: '',
  backdrop: '',
  rating: 0,
  duration: 0,
  genre: '',
  language: '',
  releaseDate: '',
  director: '',
  cast: '',
  description: '',
}

type MovieForm = Pick<Movie, 'title' | 'tagline' | 'poster' | 'backdrop' | 'rating' | 'duration' | 'language' | 'releaseDate' | 'director' | 'description'> & {
  genre: string
  cast: string
}

type ModalMode = 'create' | 'edit' | null

export default function AdminPage() {
  const navigate = useNavigate()
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState('')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
  const [form, setForm] = useState<MovieForm>(emptyForm)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [posterPreview, setPosterPreview] = useState<string>('')
  const [backdropPreview, setBackdropPreview] = useState<string>('')
  const [imageLoading, setImageLoading] = useState(false)
  const posterInputRef = useRef<HTMLInputElement | null>(null)
  const backdropInputRef = useRef<HTMLInputElement | null>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchMovies = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: '0', size: '100' }
      if (genreFilter) params.genre = genreFilter
      const res = await getMovies(params)
      setMovies(res.content ?? [])
    } catch {
      setMovies([])
    } finally {
      setLoading(false)
    }
  }, [genreFilter])

  useEffect(() => {
    fetchMovies()
  }, [fetchMovies])

  const handleSearch = (q: string) => {
    setSearch(q)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      if (!q.trim()) {
        fetchMovies()
        return
      }
      setLoading(true)
      try {
        const res = await getMovies({ page: 0, size: 50 })
        const results = (res.content ?? []).filter(
          (m) =>
            m.title.toLowerCase().includes(q.toLowerCase()) ||
            m.genre.some((g) => g.toLowerCase().includes(q.toLowerCase()))
        )
        setMovies(results)
      } catch {
        setMovies([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  // Collect all unique genres for filter dropdown
  const allGenres = [...new Set(movies.flatMap((m) => m.genre))].sort()

  const openCreate = () => {
    setForm(emptyForm)
    setFormError('')
    setEditingMovie(null)
    setModalMode('create')
  }

  const openEdit = (movie: Movie) => {
    setEditingMovie(movie)
    setForm({
      title: movie.title,
      tagline: movie.tagline,
      poster: movie.poster,
      backdrop: movie.backdrop,
      rating: movie.rating,
      duration: movie.duration,
      genre: movie.genre.join(', '),
      language: movie.language,
      releaseDate: movie.releaseDate,
      director: movie.director,
      cast: movie.cast.join(', '),
      description: movie.description,
    })
    setPosterPreview(movie.poster)
    setBackdropPreview(movie.backdrop)
    setFormError('')
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setEditingMovie(null)
    setFormError('')
    setPosterPreview('')
    setBackdropPreview('')
  }

  const updateField = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async () => {
    if (submitting) return
    setFormError('')

    if (!form.title.trim() || !form.description.trim()) {
      setFormError('Title and description are required')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        title: form.title.trim(),
        tagline: form.tagline.trim(),
        poster: form.poster.trim(),
        backdrop: form.backdrop.trim(),
        rating: form.rating,
        duration: form.duration,
        genre: form.genre
          .split(',')
          .map((g) => g.trim())
          .filter(Boolean),
        language: form.language.trim(),
        releaseDate: form.releaseDate,
        director: form.director.trim(),
        cast: form.cast
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
        description: form.description.trim(),
      }

      if (modalMode === 'create') {
        const created = await createMovie(payload)
        setMovies((prev) => [created, ...prev])
      } else if (modalMode === 'edit' && editingMovie) {
        const updated = await updateMovie(editingMovie.id, payload)
        setMovies((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
      }
      closeModal()
    } catch (err: unknown) {
      // Check if user is logged out (no auth token)
      if (!localStorage.getItem('access_token')) {
        navigate('/auth/login')
        return
      }
      const axiosErr = err as { response?: { status?: number; data?: unknown } } | undefined
      if (axiosErr?.response?.status === 403) {
        setFormError('You do not have permission to perform this action')
      } else {
        const message = err instanceof Error ? err.message : 'Failed to save movie'
        setFormError(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleImageUpload = async (file: File, field: 'poster' | 'backdrop') => {
    setImageLoading(true)
    try {
      const base64 = await fileToBase64(file)
      setForm((f) => ({ ...f, [field]: base64 }))
      if (field === 'poster') setPosterPreview(base64)
      else setBackdropPreview(base64)
    } catch {
      setFormError('Failed to process image')
    } finally {
      setImageLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteMovie(id)
      setMovies((prev) => prev.filter((m) => m.id !== id))
      setDeleteConfirm(null)
    } catch (err: unknown) {
      if (!localStorage.getItem('access_token')) {
        navigate('/auth/login')
        return
      }
      setDeleteConfirm(null)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-[var(--color-text-heading)] mb-1">Admin Panel</h1>
        <p className="text-[var(--color-text-muted)]">Manage movies, theaters, and bookings</p>
      </div>

      {/* Movies Section */}
      <div className="bg-[var(--color-bg-card)] rounded-xl p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
          <h2 className="text-xl font-bold text-[var(--color-text-heading)]">Movies ({movies.length})</h2>
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="px-4 py-2 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-sm outline-none placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            <select
              value={genreFilter}
              onChange={(e) => { setGenreFilter(e.target.value); setSearch('') }}
              className="px-3 py-2 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="">All Genres</option>
              {allGenres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <button
              onClick={openCreate}
              className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-semibold text-sm transition-colors duration-150 hover:bg-[var(--color-primary-hover)]"
            >
              + Add Movie
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-8 text-[var(--color-text-muted)]">Loading...</p>
        ) : movies.length === 0 ? (
          <p className="text-center py-8 text-[var(--color-text-muted)]">No movies found</p>
        ) : (
          <div className="flex flex-col gap-3">
            {movies.map((movie) => (
              <div key={movie.id} className="flex items-center gap-4 p-3 rounded-lg transition-all duration-150 hover:bg-[var(--color-bg-hover)]">
                <img src={movie.poster} alt={movie.title} className="w-12 h-[72px] object-cover rounded flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <span className="font-bold text-[var(--color-text-heading)] whitespace-nowrap overflow-hidden text-ellipsis">{movie.title}</span>
                  <span className="text-[var(--color-text-muted)] text-[13px]">
                    {movie.genre.join(', ')} &middot; {movie.duration} min &middot; Rating: {movie.rating}
                  </span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(movie)}
                    className="px-3 py-2 rounded text-[13px] font-semibold bg-[var(--color-bg-elevated)] text-[var(--color-text)] transition-all duration-150 hover:bg-[var(--color-primary)] hover:text-white"
                  >
                    Edit
                  </button>
                  {deleteConfirm === movie.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(movie.id)}
                        disabled={deletingId !== null}
                        className="px-3 py-2 rounded text-[13px] font-semibold bg-[var(--color-warning)] text-white transition-all duration-150 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {deletingId === movie.id ? 'Deleting...' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        disabled={deletingId !== null}
                        className="px-3 py-2 rounded text-[13px] font-semibold bg-[var(--color-bg-elevated)] text-[var(--color-text)] transition-all duration-150 hover:bg-[var(--color-bg)] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(movie.id)}
                      className="px-3 py-2 rounded text-[13px] font-semibold bg-[var(--color-error)] text-white transition-all duration-150 hover:opacity-90"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div
            className="bg-[var(--color-bg-card)] rounded-xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto p-6 shadow-[var(--shadow-elevated)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-extrabold text-[var(--color-text-heading)]">
                {modalMode === 'create' ? 'Add Movie' : 'Edit Movie'}
              </h2>
              <button onClick={closeModal} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] text-2xl leading-none">&times;</button>
            </div>

            {formError && (
              <div className="mb-4 px-4 py-3 bg-[var(--color-error-bg)] rounded-lg text-[var(--color-error)] text-sm">{formError}</div>
            )}

            <div className="flex flex-col gap-4">
              <FormField label="Title" field="title" value={form.title} onChange={(v) => updateField('title', v)} placeholder="Inception" required />
              <FormField label="Tagline" field="tagline" value={form.tagline} onChange={(v) => updateField('tagline', v)} placeholder="Your mind is the scene of the crime" />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Poster</label>
                  {posterPreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-[var(--color-border)]">
                      <img src={posterPreview} alt="Poster preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => { setPosterPreview(''); setForm((f) => ({ ...f, poster: '' })); posterInputRef.current && (posterInputRef.current.value = '') }}
                        className="absolute top-2 right-2 bg-[var(--color-error)] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:opacity-80"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <input
                    ref={posterInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, 'poster') }}
                    disabled={imageLoading}
                    className="hidden"
                    id="poster-upload"
                  />
                  <label
                    htmlFor="poster-upload"
                    className={`w-full py-2.5 border-2 border-dashed border-[var(--color-border)] rounded-lg text-center cursor-pointer text-sm transition-colors duration-150 hover:border-[var(--color-primary)] ${imageLoading ? 'cursor-not-allowed opacity-60' : 'text-[var(--color-text-muted)]'}`}
                  >
                    {imageLoading ? 'Loading...' : posterPreview ? 'Change Image' : 'Upload Image'}
                  </label>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Backdrop</label>
                  {backdropPreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-[var(--color-border)]">
                      <img src={backdropPreview} alt="Backdrop preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => { setBackdropPreview(''); setForm((f) => ({ ...f, backdrop: '' })); backdropInputRef.current && (backdropInputRef.current.value = '') }}
                        className="absolute top-2 right-2 bg-[var(--color-error)] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:opacity-80"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <input
                    ref={backdropInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, 'backdrop') }}
                    disabled={imageLoading}
                    className="hidden"
                    id="backdrop-upload"
                  />
                  <label
                    htmlFor="backdrop-upload"
                    className={`w-full py-2.5 border-2 border-dashed border-[var(--color-border)] rounded-lg text-center cursor-pointer text-sm transition-colors duration-150 hover:border-[var(--color-primary)] ${imageLoading ? 'cursor-not-allowed opacity-60' : 'text-[var(--color-text-muted)]'}`}
                  >
                    {imageLoading ? 'Loading...' : backdropPreview ? 'Change Image' : 'Upload Image'}
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <NumericField label="Rating" field="rating" value={form.rating} onChange={(v) => updateField('rating', v)} max={10} step={0.1} />
                <NumericField label="Duration (min)" field="duration" value={form.duration} onChange={(v) => updateField('duration', v)} />
                <FormField label="Language" field="language" value={form.language} onChange={(v) => updateField('language', v)} placeholder="English" />
              </div>

              <FormField label="Genre (comma-separated)" field="genre" value={form.genre} onChange={(v) => updateField('genre', v)} placeholder="Sci-Fi, Action, Drama" />
              <FormField label="Release Date" field="releaseDate" value={form.releaseDate} onChange={(v) => updateField('releaseDate', v)} type="date" />
              <FormField label="Director" field="director" value={form.director} onChange={(v) => updateField('director', v)} placeholder="Christopher Nolan" />
              <FormField label="Cast (comma-separated)" field="cast" value={form.cast} onChange={(v) => updateField('cast', v)} placeholder="Leonardo DiCaprio, Joseph Gordon-Levitt" />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[var(--color-text)]">Description</label>
                <textarea
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="px-4 py-3 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-base outline-none placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                  placeholder="Brief movie description..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 bg-[var(--color-primary)] text-white rounded-lg font-bold transition-colors duration-150 hover:bg-[var(--color-primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : modalMode === 'create' ? 'Add Movie' : 'Save Changes'}
                </button>
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-[var(--color-bg-elevated)] text-[var(--color-text)] rounded-lg font-semibold transition-colors duration-150 hover:bg-[var(--color-bg)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---- Small form helpers ---- */

function FormField({ label, field, value, onChange, type, placeholder, required }: {
  label: string
  field: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={field} className="text-sm font-semibold text-[var(--color-text)]">
        {label} {required && <span className="text-[var(--color-error)]">*</span>}
      </label>
      <input
        id={field}
        type={type || 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-4 py-2.5 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-sm outline-none placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-primary)]"
      />
    </div>
  )
}

function NumericField({ label, field, value, onChange, max, step }: {
  label: string
  field: string
  value: number
  onChange: (v: string) => void
  max?: number
  step?: number
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={field} className="text-sm font-semibold text-[var(--color-text)]">{label}</label>
      <input
        id={field}
        type="number"
        max={max}
        step={step || 1}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2.5 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      />
    </div>
  )
}
