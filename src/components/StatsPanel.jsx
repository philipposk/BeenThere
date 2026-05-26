import { useMemo } from 'react'
import { continentBreakdown, populationOf, totalPopulation, UN_193 } from '../utils/worldStats'

/**
 * Compact stats popover/modal. Shows:
 *  - Toggle: UN-193 vs all countries (changes denominator)
 *  - Per-continent visited %
 *  - % of world population visited (uses categoryId === "visited")
 *  - Visit-count totals (overall + per category)
 */
function StatsPanel({ open, onClose, cats, statuses, categories, totalCountries, scope, onScopeChange }) {
  if (!open) return null

  const visitedSet = useMemo(() => {
    const out = new Set()
    for (const [id, c] of Object.entries(cats || {})) if (c === 'visited') out.add(id)
    return out
  }, [cats])

  const denom = scope === 'un193' ? UN_193.size : totalCountries
  const visitedCount = Array.from(visitedSet).filter((id) => scope === 'un193' ? UN_193.has(id) : true).length
  const pct = denom ? (visitedCount / denom) * 100 : 0

  const breakdown = useMemo(() => continentBreakdown(cats), [cats])

  const visitedPop = useMemo(() => {
    let n = 0
    for (const id of visitedSet) n += populationOf(id)
    return n
  }, [visitedSet])
  const worldPop = totalPopulation()
  const popPct = worldPop ? (visitedPop / worldPop) * 100 : 0

  // Visit count totals (sum visits across all marked).
  const visitTotals = useMemo(() => {
    let total = 0
    for (const entry of Object.values(statuses || {})) {
      if (entry && typeof entry === 'object' && Array.isArray(entry.visits)) total += entry.visits.length
    }
    return total
  }, [statuses])

  const fmtN = (n) => n.toLocaleString()

  return (
    <div className="stats-backdrop" onClick={onClose}>
      <div className="stats-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Stats">
        <div className="stats-head">
          <h3>Stats</h3>
          <button className="close" onClick={onClose} aria-label="close">×</button>
        </div>

        <div className="stats-scope">
          <span className="muted">Counting:</span>
          <div className="segmented" style={{ gridTemplateColumns: '1fr 1fr', minWidth: 200 }}>
            <button className={scope === 'all' ? 'active' : ''} onClick={() => onScopeChange('all')}>All ({totalCountries})</button>
            <button className={scope === 'un193' ? 'active' : ''} onClick={() => onScopeChange('un193')}>UN-193</button>
          </div>
        </div>

        <div className="stats-bigrow">
          <div className="stats-big">
            <div className="n">{visitedCount}</div>
            <div className="label">visited of {denom}</div>
          </div>
          <div className="stats-big">
            <div className="n">{pct.toFixed(1)}%</div>
            <div className="label">of {scope === 'un193' ? 'UN-193' : 'world'}</div>
          </div>
          <div className="stats-big">
            <div className="n">{popPct.toFixed(1)}%</div>
            <div className="label">of world population</div>
          </div>
          <div className="stats-big">
            <div className="n">{visitTotals}</div>
            <div className="label">trips logged</div>
          </div>
        </div>

        <h4 className="stats-section">By continent</h4>
        <div className="stats-continents">
          {breakdown.map((b) => (
            <div key={b.continent} className="continent-row">
              <div className="continent-name">{b.continent}</div>
              <div className="continent-bar">
                <div className="continent-bar-fill" style={{ width: `${b.pct}%` }} />
              </div>
              <div className="continent-numbers">
                <strong>{b.visited}</strong>/{b.total} · {b.pct.toFixed(0)}%
              </div>
            </div>
          ))}
        </div>

        <h4 className="stats-section">By category</h4>
        <div className="stats-cats">
          {categories.map((c) => {
            const n = Object.values(cats || {}).filter((v) => v === c.id).length
            return (
              <div key={c.id} className="cat-pill">
                <span className="dot" style={{ background: c.color }} />
                <span>{c.label}</span>
                <strong>{n}</strong>
              </div>
            )
          })}
        </div>

        <div className="stats-foot muted">
          UN-193 = United Nations member states. Population estimates from public sources, rounded.
        </div>
      </div>
    </div>
  )
}

export default StatsPanel
