/**
 * Adapters for third-party travel-data exports.
 *
 * ## Polarsteps
 * Export from Settings → Privacy → Download data.
 * File: userdata.json
 * Shape: { user_data: { trips: [{ steps: [{ location: { country_code } }] }] } }
 * country_code is ISO alpha-2 (e.g. "GR").
 *
 * ## Google Maps Timeline
 * Export via Google Takeout → Location History.
 * File: Semantic Location History/YYYY/YYYY_MONTH.json
 * Shape: { timelineObjects: [{ placeVisit: { location: {}, duration: { startTimestamp } } }] }
 * We extract country name from location.address and match against our known names.
 */

import { COUNTRY_INFO } from './countryInfo'

// Build alpha-2 → numeric-ISO reverse lookup from COUNTRY_INFO.
const ALPHA2_TO_NUM = Object.fromEntries(
  Object.entries(COUNTRY_INFO).map(([numId, info]) => [info.alpha2, numId])
)

// Build country-name (lower) → numeric-ISO lookup via world-atlas names.
// This is populated lazily when first needed.
let nameToNum = null
export function injectNameMap(nameMap) {
  // Called from App.jsx after countries load: nameMap is Map<numId, name>
  nameToNum = {}
  for (const [id, name] of nameMap.entries()) {
    if (!id.startsWith('us:') && !id.startsWith('ca:'))
      nameToNum[name.toLowerCase()] = id
  }
}

// --------------------------------------------------------------------------

/**
 * Parse a Polarsteps userdata.json.
 * Returns { statuses, countryCodes, skipped }
 *   statuses: { [numericId]: { cat: 'visited', visits: [{date}] } }
 */
export function parsePolarstepsJSON(json) {
  let parsed
  try { parsed = typeof json === 'string' ? JSON.parse(json) : json }
  catch { throw new Error('Invalid JSON') }

  const trips = parsed?.user_data?.trips ?? parsed?.trips ?? []
  if (!Array.isArray(trips)) throw new Error('No trips array found in Polarsteps export')

  const byCountry = {} // alpha2 → Set<dateStr>
  let skipped = 0

  for (const trip of trips) {
    const steps = trip?.steps ?? []
    for (const step of steps) {
      const alpha2 = step?.location?.country_code
      if (!alpha2) { skipped++; continue }
      const ts = step?.creation_time
      const date = ts ? new Date(ts * 1000).toISOString().slice(0, 10) : null
      if (!byCountry[alpha2]) byCountry[alpha2] = new Set()
      if (date) byCountry[alpha2].add(date)
    }
  }

  const statuses = {}
  const unknown = []
  for (const [alpha2, dates] of Object.entries(byCountry)) {
    const numId = ALPHA2_TO_NUM[alpha2.toUpperCase()]
    if (!numId) { unknown.push(alpha2); continue }
    const visits = Array.from(dates).sort().map((d) => ({ date: d }))
    statuses[numId] = { cat: 'visited', visits }
  }

  return { statuses, unknownCodes: unknown, skipped }
}

/**
 * Parse one or more Google Maps Timeline YYYY_MONTH.json files.
 * Pass an array of parsed JSON objects (or a single object).
 * Returns { statuses, skipped }
 */
export function parseGoogleTimelineJSON(input) {
  const files = Array.isArray(input) ? input : [input]

  const byCountry = {} // name-lower → Set<dateStr>
  let skipped = 0

  for (const obj of files) {
    let parsed
    try { parsed = typeof obj === 'string' ? JSON.parse(obj) : obj }
    catch { skipped++; continue }

    const timeline = parsed?.timelineObjects ?? []
    for (const obj of timeline) {
      const pv = obj?.placeVisit
      if (!pv) continue
      const addr = pv?.location?.address ?? ''
      const ts   = pv?.duration?.startTimestamp
      const date = ts ? ts.slice(0, 10) : null // ISO string

      // Last comma-separated component is usually country name (in English).
      const parts = addr.split(',').map((s) => s.trim()).filter(Boolean)
      const countryName = parts[parts.length - 1]?.toLowerCase()
      if (!countryName) { skipped++; continue }

      if (!byCountry[countryName]) byCountry[countryName] = new Set()
      if (date) byCountry[countryName].add(date)
    }
  }

  const statuses = {}
  const unknown  = []
  for (const [nameLower, dates] of Object.entries(byCountry)) {
    const numId = nameToNum ? nameToNum[nameLower] : null
    if (!numId) { unknown.push(nameLower); continue }
    const visits = Array.from(dates).sort().map((d) => ({ date: d }))
    statuses[numId] = { cat: 'visited', visits }
  }

  return { statuses, unknownNames: unknown, skipped }
}
