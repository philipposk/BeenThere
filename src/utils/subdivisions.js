import { feature } from 'topojson-client'

// Optional subdivision overlays. Each provider returns a GeoJSON
// FeatureCollection with feature.id namespaced so country and subdivision
// marks coexist in the same statuses map.

const US_TOPO = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'
// Canada: Natural Earth admin-1 (provinces and territories). Hosted via
// CDN as a small TopoJSON.
const CA_TOPO = 'https://cdn.jsdelivr.net/gh/codeforgermany/click_that_hood/main/public/data/canada.geo.json'

export async function loadUSStates() {
  const res = await fetch(US_TOPO)
  if (!res.ok) throw new Error('Failed to fetch US states topojson')
  const topo = await res.json()
  const fc = feature(topo, topo.objects.states)
  for (const f of fc.features) {
    f.id = `us:${f.id}`
    if (!f.properties) f.properties = {}
    f.properties.name = f.properties.name || String(f.id)
    f.properties.subdivision = 'US state'
  }
  return fc
}

// Canada source is plain GeoJSON keyed by province name.
export async function loadCanadaProvinces() {
  const res = await fetch(CA_TOPO)
  if (!res.ok) throw new Error('Failed to fetch Canada provinces')
  const data = await res.json()
  // Some sources publish TopoJSON, others GeoJSON. Handle both.
  let fc
  if (data.type === 'Topology') {
    const key = Object.keys(data.objects)[0]
    fc = feature(data, data.objects[key])
  } else {
    fc = data
  }
  for (const f of fc.features) {
    const name = f.properties?.name || f.properties?.NAME || String(f.id || 'province')
    f.id = `ca:${name.replace(/\s+/g, '_').toLowerCase()}`
    if (!f.properties) f.properties = {}
    f.properties.name = name
    f.properties.subdivision = 'Canada province'
  }
  return fc
}
