// KML generator — one <Folder> per category, with the category's color baked
// into a per-category <Style>. Works with the new numeric-ISO ID scheme.

function hexToKmlColor(hex, alpha = 0x7d) {
  // KML colors are AABBGGRR.
  const h = hex.replace('#', '')
  const r = h.slice(0, 2)
  const g = h.slice(2, 4)
  const b = h.slice(4, 6)
  return `${alpha.toString(16).padStart(2, '0')}${b}${g}${r}`.toLowerCase()
}

function escapeXML(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function coordsToString(coords) {
  return coords.map(([lng, lat]) => `${lng},${lat},0`).join(' ')
}

// Emit one <Polygon> per ring set; handle Polygon and MultiPolygon.
function geometryToPolygons(geometry) {
  if (!geometry) return []
  if (geometry.type === 'Polygon') return [geometry.coordinates]
  if (geometry.type === 'MultiPolygon') return geometry.coordinates
  return []
}

function polygonXML(rings) {
  const outer = rings[0] || []
  const inners = rings.slice(1)
  let xml = `        <Polygon>
          <outerBoundaryIs><LinearRing><coordinates>${coordsToString(outer)}</coordinates></LinearRing></outerBoundaryIs>`
  for (const inner of inners) {
    xml += `
          <innerBoundaryIs><LinearRing><coordinates>${coordsToString(inner)}</coordinates></LinearRing></innerBoundaryIs>`
  }
  xml += `
        </Polygon>`
  return xml
}

/**
 * Generate KML covering all categories (built-in + custom).
 * - cats        : { [numericId]: categoryId } — flat map
 * - countries   : GeoJSON FeatureCollection (feature.id = numeric ISO)
 * - categories  : merged list from useCategories
 * - rawStatuses : optional raw statuses (with .visits) for trip-date description
 */
export async function generateKMLWithPolygons(cats, countries, categories = [], rawStatuses = {}) {
  // Resolve color per category id, with fallbacks for legacy data.
  const catById = new Map(categories.map((c) => [c.id, c]))
  const fallback = { visited: '#00ff00', wishlist: '#ff8800' }

  // Bucket country features by category id.
  const buckets = new Map()
  for (const f of countries.features) {
    const id = String(f.id)
    const catId = cats[id]
    if (!catId) continue
    if (!buckets.has(catId)) buckets.set(catId, [])
    buckets.get(catId).push(f)
  }

  let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>BeenThere</name>
    <description>Countries by category</description>
`

  // Per-category style block.
  for (const [catId] of buckets) {
    const cat = catById.get(catId)
    const color = cat?.color || fallback[catId] || '#888888'
    kml += `    <Style id="cat_${catId}">
      <PolyStyle><color>${hexToKmlColor(color)}</color><outline>1</outline></PolyStyle>
      <LineStyle><color>ff333333</color><width>1</width></LineStyle>
    </Style>
`
  }

  // One folder per category.
  for (const [catId, feats] of buckets) {
    const cat = catById.get(catId)
    const folderName = cat?.label || catId
    kml += `    <Folder>
      <name>${escapeXML(folderName)}</name>
      <open>1</open>
`
    for (const f of feats) {
      const name = (f.properties && (f.properties.name || f.properties.NAME)) || String(f.id)
      const polys = geometryToPolygons(f.geometry)
      if (polys.length === 0) continue
      // Build description with ISO + any logged trips.
      const entry = rawStatuses[String(f.id)]
      const visits = (entry && typeof entry === 'object' && Array.isArray(entry.visits)) ? entry.visits : []
      const desc = [`ISO ${f.id}`]
      if (visits.length) {
        desc.push('Trips:')
        for (const v of visits) {
          desc.push(`  ${v.date}${v.note ? ' — ' + v.note : ''}`)
        }
      }
      kml += `      <Placemark>
        <name>${escapeXML(name)}</name>
        <description>${escapeXML(desc.join('\n'))}</description>
        <styleUrl>#cat_${catId}</styleUrl>
        <MultiGeometry>
${polys.map(polygonXML).join('\n')}
        </MultiGeometry>
      </Placemark>
`
    }
    kml += `    </Folder>
`
  }

  kml += `  </Document>
</kml>`

  return kml
}

// Lightweight fallback (kept for callers that don't have geometry handy).
export function generateKML(statuses, categories = []) {
  const catById = new Map(categories.map((c) => [c.id, c]))
  let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>BeenThere</name>
`
  const grouped = new Map()
  for (const [id, catId] of Object.entries(statuses)) {
    if (!grouped.has(catId)) grouped.set(catId, [])
    grouped.get(catId).push(id)
  }
  for (const [catId, ids] of grouped) {
    const cat = catById.get(catId)
    kml += `    <Folder><name>${escapeXML(cat?.label || catId)}</name>\n`
    for (const id of ids) {
      kml += `      <Placemark><name>ISO ${id}</name><Point><coordinates>0,0,0</coordinates></Point></Placemark>\n`
    }
    kml += `    </Folder>\n`
  }
  kml += `  </Document>\n</kml>`
  return kml
}
