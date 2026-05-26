// Import / export BeenThere state as CSV or full JSON.
// CSV columns: id,name,category,date,note
//   - one row per country (no visits) OR one row per visit (multiple rows
//     for a country if it has multiple trips)
//   - country without visits emits one row with empty date/note
// JSON format: { v:1, statuses, customCategories, hidden, settings }

import { getCat, getVisits } from './statusSchema'

function csvEscape(s) {
  if (s === null || s === undefined) return ''
  const str = String(s)
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

export function exportCSV({ statuses, nameMap, categories }) {
  const catLabel = (id) => {
    const c = categories.find((x) => x.id === id)
    return c ? c.label : id
  }
  const rows = ['id,name,category,date,note']
  for (const [id, entry] of Object.entries(statuses || {})) {
    const cat = getCat(entry)
    if (!cat) continue
    const name = nameMap?.get(String(id)) || id
    const visits = getVisits(entry)
    if (visits.length === 0) {
      rows.push([id, name, catLabel(cat), '', ''].map(csvEscape).join(','))
    } else {
      for (const v of visits) {
        rows.push([id, name, catLabel(cat), v.date || '', v.note || ''].map(csvEscape).join(','))
      }
    }
  }
  return rows.join('\n')
}

// Parse CSV using a permissive tokenizer (handles quoted fields w/ commas + escaped quotes).
function parseCSV(text) {
  const out = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') inQuotes = false
      else field += c
    } else {
      if (c === '"') inQuotes = true
      else if (c === ',') { row.push(field); field = '' }
      else if (c === '\n') { row.push(field); out.push(row); row = []; field = '' }
      else if (c === '\r') { /* ignore */ }
      else field += c
    }
  }
  if (field.length || row.length) { row.push(field); out.push(row) }
  return out
}

/**
 * Parse CSV into a statuses-merge object. Matches category by label (case-
 * insensitive) against the existing `categories` list; rows whose category
 * doesn't exist are skipped and reported.
 *
 * Returns { statuses, skipped, addedVisits }
 */
export function importCSV(text, categories) {
  const rows = parseCSV(text).filter((r) => r.some((c) => c.trim().length))
  if (rows.length === 0) return { statuses: {}, skipped: [], addedVisits: 0 }
  // Optional header detection.
  let start = 0
  const header = rows[0].map((c) => c.toLowerCase().trim())
  if (header[0] === 'id' && header.includes('category')) start = 1
  const col = (name) => header.indexOf(name)
  const idIdx = col('id') !== -1 ? col('id') : 0
  const catIdx = col('category') !== -1 ? col('category') : 2
  const dateIdx = col('date') !== -1 ? col('date') : 3
  const noteIdx = col('note') !== -1 ? col('note') : 4

  const catByLabel = new Map(categories.map((c) => [c.label.toLowerCase(), c.id]))
  const statuses = {}
  const skipped = []
  let addedVisits = 0
  for (let i = start; i < rows.length; i++) {
    const r = rows[i]
    const id = (r[idIdx] || '').trim()
    const catLabel = (r[catIdx] || '').trim().toLowerCase()
    if (!id || !catLabel) continue
    const catId = catByLabel.get(catLabel)
    if (!catId) { skipped.push({ row: i + 1, reason: `unknown category "${r[catIdx]}"` }); continue }
    const date = (r[dateIdx] || '').trim()
    const note = (r[noteIdx] || '').trim()
    if (!statuses[id]) statuses[id] = { cat: catId, visits: [] }
    if (date) {
      statuses[id].visits.push({ date, ...(note ? { note } : {}) })
      addedVisits++
    }
  }
  return { statuses, skipped, addedVisits }
}

export function exportJSON({ statuses, customCategories, hidden, settings }) {
  return JSON.stringify({
    v: 1,
    exportedAt: new Date().toISOString(),
    statuses,
    customCategories,
    hidden: Array.from(hidden || []),
    settings,
  }, null, 2)
}

export function parseJSON(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object') throw new Error('Invalid JSON')
  return data
}

export function downloadText(filename, content, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime + ';charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function pickFile({ accept = '.csv,.json,.geojson,.gpx,.kml' } = {}) {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = () => {
      const f = input.files?.[0]
      if (!f) return reject(new Error('No file chosen'))
      const reader = new FileReader()
      reader.onload = () => resolve({ name: f.name, text: String(reader.result) })
      reader.onerror = () => reject(reader.error || new Error('Read failed'))
      reader.readAsText(f)
    }
    input.click()
  })
}
