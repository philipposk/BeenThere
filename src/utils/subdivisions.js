import { feature } from 'topojson-client'

// Optional subdivision overlay. Each subdivision provider exposes:
//   loadFeatures() -> Promise<FeatureCollection> with feature.id namespaced
// State IDs are prefixed with `us:` so the existing status map can store both
// country-level and state-level marks without collisions.

const US_TOPO = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

export async function loadUSStates() {
  const res = await fetch(US_TOPO)
  if (!res.ok) throw new Error('Failed to fetch US states topojson')
  const topo = await res.json()
  const fc = feature(topo, topo.objects.states)
  for (const f of fc.features) {
    f.id = `us:${f.id}`
    // us-atlas puts name on properties.name.
    if (!f.properties) f.properties = {}
    f.properties.name = f.properties.name || String(f.id)
    f.properties.subdivision = 'US state'
  }
  return fc
}
