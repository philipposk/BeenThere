// Serialize/parse a compact read-only share state via URL hash (`#s=<base64>`).
// Payload is JSON.stringified then base64-encoded (URL-safe). No dependency on
// lz-string — JSON is already short for typical 200-country sets.

function b64UrlEncode(str) {
  // btoa handles latin1; encode UTF-8 first.
  const utf8 = unescape(encodeURIComponent(str))
  return btoa(utf8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64UrlDecode(s) {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
  const std = s.replace(/-/g, '+').replace(/_/g, '/') + pad
  return decodeURIComponent(escape(atob(std)))
}

// Build minimal payload: only cat per country + custom categories + visits.
export function encodeShareState({ statuses, categories, hidden }) {
  const custom = categories.filter((c) => !c.builtin).map((c) => ({ id: c.id, label: c.label, color: c.color }))
  const payload = {
    v: 1,
    s: statuses, // raw (may include visits)
    c: custom,
    h: Array.from(hidden || []),
  }
  return b64UrlEncode(JSON.stringify(payload))
}

export function decodeShareState(hashFragment) {
  const m = /[?#&]s=([A-Za-z0-9_-]+)/.exec(hashFragment || '')
  if (!m) return null
  try {
    const json = b64UrlDecode(m[1])
    const data = JSON.parse(json)
    if (!data || typeof data !== 'object') return null
    return data
  } catch (e) {
    return null
  }
}

export function buildShareURL(state) {
  const encoded = encodeShareState(state)
  return `${window.location.origin}${window.location.pathname}#s=${encoded}`
}
