import { useMemo } from 'react'
import { continentOf } from '../utils/countryData'

/**
 * Left rail: brand, hero stat (primary category = "visited"), per-category
 * subcounts, journal list with one tab per category, footer with Export link.
 */
function Rail({
  statuses,
  categories,
  totalCountries,
  nameMap,
  selectedId,
  onSelect,
  onHover,
  tab,
  setTab,
  onExport,
  onStats,
  onTimeline,
}) {
  // Group country IDs by category.
  const grouped = useMemo(() => {
    const out = Object.fromEntries(categories.map((c) => [c.id, []]))
    for (const [id, catId] of Object.entries(statuses)) {
      if (out[catId]) out[catId].push(id)
    }
    return out
  }, [statuses, categories])

  const visitedCount = (grouped['visited'] || []).length
  const pct = totalCountries ? (visitedCount / totalCountries) * 100 : 0

  const activeTabRows = grouped[tab] || []
  const activeCategory = categories.find((c) => c.id === tab)

  // Subcounts grid: show up to 4 categories (visited, wishlist, +2 custom).
  // Anything beyond shows as compact pills under the grid.
  const subcountCells = categories.slice(0, 4)
  const overflowCells = categories.slice(4)

  return (
    <aside className="rail">
      <div className="brand">
        <div className="wordmark">Been<em>There</em></div>
        <div className="yr">EST. 2026</div>
      </div>

      <div className="hero">
        <div className="label">Countries visited</div>
        <div className="figure">
          <span className="n">{String(visitedCount).padStart(2, '0')}</span>
          <span className="of">of {totalCountries || '—'}</span>
        </div>
        <div className="meter">
          <div className="bar"><span style={{ width: `${pct}%` }} /></div>
          <div className="pct">{pct.toFixed(1)}%</div>
        </div>
      </div>

      <div className="subcounts" style={{ gridTemplateColumns: `repeat(${subcountCells.length}, 1fr)` }}>
        {subcountCells.map((c) => (
          <div key={c.id} className="cell">
            <div className="cell-label">
              <span className="dot" style={{ background: c.color }} />
              {c.label}
            </div>
            <div className="n">{(grouped[c.id] || []).length}</div>
          </div>
        ))}
      </div>

      {overflowCells.length > 0 && (
        <div className="subcounts-overflow">
          {overflowCells.map((c) => (
            <span key={c.id} className="overflow-pill">
              <span className="dot" style={{ background: c.color }} />
              {c.label} · {(grouped[c.id] || []).length}
            </span>
          ))}
        </div>
      )}

      <div className="list-wrap">
        <div className="list-head">
          <h4>Journal</h4>
          <div className="tabs">
            {categories.map((c) => (
              <button
                key={c.id}
                className={tab === c.id ? 'active' : ''}
                onClick={() => setTab(c.id)}
                title={c.label}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="list">
          {activeTabRows.length === 0 ? (
            <div className="empty">
              Nothing marked as “{activeCategory ? activeCategory.label : tab}” yet.
            </div>
          ) : (
            activeTabRows.map((id, i) => {
              const name = nameMap.get(id) || id
              return (
                <div
                  key={id}
                  className={`row ${id === selectedId ? 'selected' : ''}`}
                  onClick={() => onSelect(id, name)}
                  onMouseEnter={() => onHover(id)}
                  onMouseLeave={() => onHover(null)}
                >
                  <div className="idx">{String(i + 1).padStart(2, '0')}</div>
                  <div className="row-text">
                    <div className="name">{name}</div>
                    <div className="meta">{continentOf(id)}</div>
                  </div>
                  <span className="row-dot" style={{ background: activeCategory ? activeCategory.color : 'var(--muted)' }} />
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="rail-foot">
        <span>Saved locally</span>
        <div className="rail-foot-actions">
          {onStats && <button className="link" onClick={onStats}>Stats</button>}
          {onTimeline && <button className="link" onClick={onTimeline}>Look back</button>}
          {onExport && <button className="link" onClick={onExport}>Export ↗</button>}
        </div>
      </div>
    </aside>
  )
}

export default Rail
