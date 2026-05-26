// Status entry can be either:
//  - legacy string (categoryId), e.g. "visited"
//  - new object { cat: string, visits: [{ date: "YYYY-MM-DD", note?: string }] }
// Helpers normalize reads/writes.

export function getCat(entry) {
  if (!entry) return null
  if (typeof entry === 'string') return entry
  return entry.cat || null
}

export function getVisits(entry) {
  if (!entry || typeof entry === 'string') return []
  return Array.isArray(entry.visits) ? entry.visits : []
}

export function withCat(entry, cat) {
  // Setting cat preserves visits if any.
  const visits = getVisits(entry)
  if (cat === null || cat === undefined) return null
  return { cat, visits }
}

export function withVisits(entry, visits) {
  const cat = getCat(entry)
  if (!cat) return null
  return { cat, visits }
}

export function addVisit(entry, visit) {
  const visits = [...getVisits(entry), visit].sort((a, b) => (a.date || '').localeCompare(b.date || ''))
  return withVisits(entry, visits)
}

export function removeVisit(entry, idx) {
  const visits = getVisits(entry).filter((_, i) => i !== idx)
  return withVisits(entry, visits)
}

export function updateVisit(entry, idx, patch) {
  const visits = getVisits(entry).map((v, i) => (i === idx ? { ...v, ...patch } : v))
  return withVisits(entry, visits)
}

// Build a { [id]: categoryId } map for code paths that only care about
// category (rail counts, map fills, KML).
export function catMap(statuses) {
  const out = {}
  for (const [id, entry] of Object.entries(statuses || {})) {
    const cat = getCat(entry)
    if (cat) out[id] = cat
  }
  return out
}
