// GeoJSON / GPX exporters.
// GeoJSON: clone marked features, attach category + visits to properties.
// GPX:     wpt per country centroid (rough), name = country, desc = category.

import { geoCentroid } from 'd3-geo'
import { getCat, getVisits } from './statusSchema'

function escapeXML(s) {
  if (!s) return ''
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

export function exportMarkedGeoJSON({ countries, statuses, categories }) {
  const catLabel = (id) => categories.find((c) => c.id === id)?.label || id
  const out = { type: 'FeatureCollection', features: [] }
  for (const f of countries.features) {
    const id = String(f.id)
    const entry = statuses[id]
    const cat = getCat(entry)
    if (!cat) continue
    out.features.push({
      type: 'Feature',
      id,
      geometry: f.geometry,
      properties: {
        name: f.properties?.name || id,
        category: cat,
        categoryLabel: catLabel(cat),
        visits: getVisits(entry),
      },
    })
  }
  return JSON.stringify(out)
}

export function exportMarkedGPX({ countries, statuses, categories }) {
  const catLabel = (id) => categories.find((c) => c.id === id)?.label || id
  const parts = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<gpx version="1.1" creator="BeenThere" xmlns="http://www.topografix.com/GPX/1/1">',
  ]
  for (const f of countries.features) {
    const id = String(f.id)
    const entry = statuses[id]
    const cat = getCat(entry)
    if (!cat) continue
    let lon, lat
    try { [lon, lat] = geoCentroid(f) } catch (e) { continue }
    if (!isFinite(lon) || !isFinite(lat)) continue
    const name = f.properties?.name || id
    const visits = getVisits(entry)
    const desc = [
      `Category: ${catLabel(cat)}`,
      `ISO: ${id}`,
      ...visits.map((v) => `Visit ${v.date}${v.note ? ' — ' + v.note : ''}`),
    ].join('\n')
    parts.push(`  <wpt lat="${lat.toFixed(5)}" lon="${lon.toFixed(5)}">`)
    parts.push(`    <name>${escapeXML(name)}</name>`)
    parts.push(`    <desc>${escapeXML(desc)}</desc>`)
    parts.push(`    <type>${escapeXML(catLabel(cat))}</type>`)
    parts.push(`  </wpt>`)
  }
  parts.push('</gpx>')
  return parts.join('\n')
}
