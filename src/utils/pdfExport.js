/**
 * PDF "passport" export — A5 landscape, one country per card row.
 * Requires jspdf (npm install jspdf).
 *
 * Layout (per row):
 *   FLAG  COUNTRY NAME                       CATEGORY  VISITS
 *   ───────────────────────────────────────────────────────────
 *   🇫🇷   France           Europe / Paris / EUR   Visited   3 trips  2019-06, 2021-09, 2023-07
 */
import { jsPDF } from 'jspdf'
import { COUNTRY_INFO } from './countryInfo'
import { getCat, getVisits } from './statusSchema'
import { continentOf } from './countryData'

export function downloadPassportPDF({ statuses, categories, nameMap }) {
  // A5 landscape: 210 × 148 mm
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' })
  const W = 210, H = 148
  const PAD = 12
  const ROW_H = 9
  const HEADER_H = 16

  const catById = Object.fromEntries(categories.map((c) => [c.id, c]))

  // Group by category then sort by name.
  const grouped = {}
  for (const [id, entry] of Object.entries(statuses)) {
    const cat = getCat(entry)
    if (!cat) continue
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push({ id, entry })
  }

  let firstPage = true
  let y = PAD

  const checkPage = (needed = ROW_H) => {
    if (y + needed > H - PAD) {
      doc.addPage()
      y = PAD
    }
  }

  for (const cat of categories) {
    const rows = grouped[cat.id]
    if (!rows || rows.length === 0) continue

    rows.sort((a, b) => (nameMap.get(a.id) || a.id).localeCompare(nameMap.get(b.id) || b.id))

    if (!firstPage) checkPage(HEADER_H + ROW_H)
    firstPage = false

    // Category header
    doc.setFontSize(13)
    doc.setTextColor(60, 60, 60)
    doc.setFont(undefined, 'bold')
    doc.text(`${cat.label} (${rows.length})`, PAD, y + 5)
    doc.setDrawColor(200, 200, 200)
    doc.line(PAD, y + 7, W - PAD, y + 7)
    y += HEADER_H

    // Column headers
    doc.setFontSize(7)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(140, 140, 140)
    doc.text('COUNTRY', PAD + 10, y)
    doc.text('CONTINENT · CAPITAL · CURRENCY', PAD + 70, y)
    doc.text('TRIPS', W - PAD - 20, y)
    y += 5

    for (const { id, entry } of rows) {
      checkPage(ROW_H)

      const name    = nameMap.get(id) || id
      const info    = COUNTRY_INFO[id] || {}
      const visits  = getVisits(entry)
      const vStr    = visits.length > 0 ? visits.map((v) => v.date?.slice(0, 7) || '?').join(', ') : '—'
      const subLine = [continentOf(id), info.capital, info.currency].filter(Boolean).join(' · ')

      doc.setFontSize(9)
      doc.setTextColor(20, 20, 20)
      doc.setFont(undefined, 'bold')
      // Flag (emoji fonts often missing in jsPDF; fall back gracefully)
      const flagText = info.flag ? `${info.flag} ` : ''
      doc.text(flagText + name, PAD + 2, y)

      doc.setFont(undefined, 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(100, 100, 100)
      doc.text(subLine, PAD + 70, y)

      doc.setFontSize(7.5)
      doc.setTextColor(60, 60, 60)
      // Right-align trip count
      doc.text(String(visits.length || 0), W - PAD - 14, y, { align: 'right' })

      // Visit dates — wrap if too long
      const vTrunc = vStr.length > 55 ? vStr.slice(0, 53) + '…' : vStr
      doc.setFontSize(6.5)
      doc.setTextColor(130, 130, 130)
      doc.text(vTrunc, W - PAD - 12, y)

      // Light separator
      doc.setDrawColor(230, 230, 230)
      doc.line(PAD, y + 2, W - PAD, y + 2)

      y += ROW_H
    }

    y += 4 // spacer between categories
  }

  // Cover header on first page (add before all pages are written would need
  // a different approach; keep it simple — title at top of first page).
  // We already wrote to first page, so we leave it.

  const totalMarked = Object.keys(statuses).length
  doc.setPage(1)
  doc.setFontSize(18)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(30, 30, 30)
  // If first page still has room at top (it does — PAD=12, title above table)
  // Actually we started at y=PAD so title overwrites data.
  // Instead: insert a cover page.
  // Simplest: prepend by adding page 1 as a cover and having content on page 2+.
  // Since we've already built the doc, just add a cover page at the end and
  // note the page number — or just put the title in the footer.

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(180, 180, 180)
    doc.text(
      `BeenThere passport · ${totalMarked} countries · generated ${new Date().toLocaleDateString()}`,
      PAD, H - 4
    )
    doc.text(`${i} / ${pageCount}`, W - PAD, H - 4, { align: 'right' })
  }

  doc.save('beenthere-passport.pdf')
}
