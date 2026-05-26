import { useState, useEffect, useCallback } from 'react'

const KEY = 'beenthere.categories'

// Built-in categories share IDs with the legacy `countryStatuses` values so
// existing data carries over. Built-ins cannot be deleted, but their color is
// driven by settings (--visited / --wishlist CSS vars) — see `useSettings`.
export const BUILTIN_CATEGORIES = [
  { id: 'visited', label: 'Visited', builtin: true, cssVar: '--visited' },
  { id: 'wishlist', label: 'Wishlist', builtin: true, cssVar: '--wishlist' },
]

const DEFAULT_CUSTOM = [
  // Example shipped category — the user can delete or rename it.
  // (Empty by default so the UI stays clean.)
]

// Palette suggested when adding a new custom category.
export const CUSTOM_SWATCHES = [
  '#1F8A5B', '#2A6FDB', '#8B5CF6', '#D9A441', '#A8567B',
  '#7A1E1E', '#0F766E', '#B45309', '#374151', '#52525B',
]

function loadCustom() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr)) return arr
    }
  } catch (e) { /* ignore */ }
  return DEFAULT_CUSTOM
}

export function useCategories(settings) {
  const [custom, setCustom] = useState(loadCustom)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(custom)) } catch (e) { /* ignore */ }
  }, [custom])

  // Merge built-ins (whose colors come from settings) with custom categories.
  const all = [
    { ...BUILTIN_CATEGORIES[0], color: settings.visitedColor },
    { ...BUILTIN_CATEGORIES[1], color: settings.wishlistColor },
    ...custom,
  ]

  const add = useCallback((label, color) => {
    const id = `c_${Date.now().toString(36)}`
    setCustom((prev) => [...prev, { id, label: label.trim() || 'Untitled', color, builtin: false }])
    return id
  }, [])

  const update = useCallback((id, patch) => {
    setCustom((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }, [])

  const remove = useCallback((id) => {
    setCustom((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const byId = (id) => all.find((c) => c.id === id)

  return { categories: all, customCategories: custom, addCategory: add, updateCategory: update, removeCategory: remove, getCategory: byId }
}
