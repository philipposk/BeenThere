import { useState, useEffect, useCallback } from 'react'

const KEY = 'beenthere.hidden'

// Set of country numeric-ISO IDs the user has chosen to remove from the map.
function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr)) return new Set(arr.map(String))
    }
  } catch (e) { /* ignore */ }
  return new Set()
}

export function useHidden() {
  const [hidden, setHidden] = useState(load)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(Array.from(hidden))) } catch (e) { /* ignore */ }
  }, [hidden])

  const hide = useCallback((id) => {
    setHidden((prev) => {
      const next = new Set(prev)
      next.add(String(id))
      return next
    })
  }, [])

  const unhide = useCallback((id) => {
    setHidden((prev) => {
      const next = new Set(prev)
      next.delete(String(id))
      return next
    })
  }, [])

  const restoreAll = useCallback(() => setHidden(new Set()), [])
  const isHidden = useCallback((id) => hidden.has(String(id)), [hidden])

  return { hidden, isHidden, hide, unhide, restoreAll }
}
