import { useMemo, useState } from 'react'
import { getVisits } from '../utils/statusSchema'

/**
 * Look-back timeline. Aggregates visits[].date across all countries into
 * per-year bars (count of distinct countries that year). Click a year ->
 * expand a list of countries from that year. Click a country -> close modal
 * and select on map.
 */
function Timeline({ open, onClose, statuses, nameMap, onSelectCountry }) {
  const [activeYear, setActiveYear] = useState(null)

  // { [year]: Set<countryId> }
  const byYear = useMemo(() => {
    const out = {}
    for (const [id, entry] of Object.entries(statuses || {})) {
      for (const v of getVisits(entry)) {
        if (!v.date) continue
        const y = String(v.date).slice(0, 4)
        if (!/^\d{4}$/.test(y)) continue
        if (!out[y]) out[y] = new Set()
        out[y].add(id)
      }
    }
    return out
  }, [statuses])

  const years = Object.keys(byYear).sort()
  const counts = years.map((y) => byYear[y].size)
  const max = counts.length ? Math.max(...counts) : 0
  const totalTrips = useMemo(() => {
    let n = 0
    for (const e of Object.values(statuses || {})) n += getVisits(e).length
    return n
  }, [statuses])

  if (!open) return null

  return (
    <div className="stats-backdrop" onClick={onClose}>
      <div className="timeline-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Look back">
        <div className="stats-head">
          <h3>Look back</h3>
          <button className="close" onClick={onClose} aria-label="close">×</button>
        </div>

        <div className="stats-bigrow">
          <div className="stats-big">
            <div className="n">{totalTrips}</div>
            <div className="label">trips total</div>
          </div>
          <div className="stats-big">
            <div className="n">{years.length}</div>
            <div className="label">years</div>
          </div>
          <div className="stats-big">
            <div className="n">{max}</div>
            <div className="label">best year (countries)</div>
          </div>
        </div>

        {years.length === 0 ? (
          <p className="muted" style={{ padding: '24px 4px' }}>
            No dated trips yet. Add a date to a country in the Detail card to populate this view.
          </p>
        ) : (
          <>
            <div className="timeline-bars">
              {years.map((y) => {
                const n = byYear[y].size
                const h = max ? (n / max) * 100 : 0
                return (
                  <button
                    key={y}
                    className={`timeline-bar ${activeYear === y ? 'active' : ''}`}
                    onClick={() => setActiveYear(activeYear === y ? null : y)}
                    title={`${y} · ${n} ${n === 1 ? 'country' : 'countries'}`}
                  >
                    <span className="bar" style={{ height: `${Math.max(4, h)}%` }} />
                    <span className="bar-n">{n}</span>
                    <span className="bar-y">{y}</span>
                  </button>
                )
              })}
            </div>

            {activeYear && (
              <div className="timeline-detail">
                <h4>{activeYear}</h4>
                <ul>
                  {Array.from(byYear[activeYear]).map((id) => (
                    <li key={id}>
                      <button
                        className="link"
                        onClick={() => { onSelectCountry(id, nameMap.get(id) || id); onClose() }}
                      >
                        {nameMap.get(id) || id}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Timeline
