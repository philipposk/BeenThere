import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { continentOf } from '../utils/countryData'

const SearchIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

/**
 * Floating search pill — substring match on country name, max 8 results,
 * Cmd/Ctrl-K focuses, Esc closes.
 */
const SearchBar = forwardRef(function SearchBar({ countries, statuses, categories, onSelect }, externalRef) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const inputRef = useRef(null)
  useImperativeHandle(externalRef, () => ({
    focus: () => { inputRef.current?.focus(); setOpen(true) },
  }), [])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const onMouseDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const catById = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories])

  const results = useMemo(() => {
    if (!q.trim() || !countries) return []
    const Q = q.trim().toLowerCase()
    return countries.features
      .filter((f) => ((f.properties?.name || '').toLowerCase().includes(Q)))
      .slice(0, 8)
      .map((f) => ({ id: String(f.id), name: f.properties.name }))
  }, [q, countries])

  return (
    <div className="search-wrap" ref={wrapRef}>
      <div className="search-bar">
        <SearchIcon />
        <input
          ref={inputRef}
          placeholder="Search any country…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
        />
        <span className="kbd">⌘K</span>
      </div>
      {open && results.length > 0 && (
        <div className="search-results">
          {results.map((r) => {
            const catId = statuses[r.id]
            const cat = catId ? catById[catId] : null
            return (
              <div
                key={r.id}
                className="row"
                onClick={() => { onSelect(r.id, r.name); setQ(''); setOpen(false) }}
              >
                <div className="row-text">
                  <div className="name">{r.name}</div>
                  <div className="meta">{continentOf(r.id)}</div>
                </div>
                {cat && <span className="dot" style={{ background: cat.color }} />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})

export default SearchBar
