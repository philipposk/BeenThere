import { useState } from 'react'
import { continentOf } from '../utils/countryData'
import { COUNTRY_INFO } from '../utils/countryInfo'
import { getVisits, getPlan } from '../utils/statusSchema'

/**
 * Bottom-right detail card for the selected country.
 *  - Country meta (flag, capital, currency, continent)
 *  - Category pickers (one button per category, mutually exclusive)
 *  - Visit log (date + optional note) once category is set
 *  - "Hide from map" button
 */
function Detail({
  id,
  name,
  entry,
  currentCategoryId,
  categories,
  onSet,
  onAddVisit,
  onRemoveVisit,
  onUpdateVisit,
  onUpdatePlan,
  onClose,
  onHide,
  readOnly = false,
}) {
  if (!id) return null
  const continent = continentOf(id)
  const info    = COUNTRY_INFO[String(id)] || {}
  const visits  = getVisits(entry)
  const plan    = getPlan(entry)
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10))
  const [newNote, setNewNote] = useState('')

  const isWishlist = currentCategoryId === 'wishlist'

  const submitVisit = () => {
    if (!newDate) return
    onAddVisit({ date: newDate, note: newNote.trim() || undefined })
    setNewNote('')
  }

  return (
    <div className="detail">
      <div className="eyebrow">
        <span>
          {info.flag ? `${info.flag}  ` : ''}{continent}
        </span>
        <button className="close" onClick={onClose} aria-label="close">×</button>
      </div>
      <h2>{name}</h2>
      <div className="region">
        ISO {id}
        {info.capital && <> · {info.capital}</>}
        {info.currency && <> · {info.currency}</>}
      </div>

      <div className="picks">
        {categories.map((c) => {
          const active = currentCategoryId === c.id
          return (
            <button
              key={c.id}
              className={`pick ${active ? 'active' : ''}`}
              style={active ? {
                background: c.builtin
                  ? (c.id === 'visited' ? 'var(--visited-soft)' : 'var(--wishlist-soft)')
                  : softenInline(c.color),
                borderColor: c.color,
              } : undefined}
              onClick={() => !readOnly && onSet(active ? null : c.id)}
              disabled={readOnly}
            >
              <span className="dot" style={{ background: c.color }} />
              <span className="t">{c.label}</span>
            </button>
          )
        })}
      </div>

      {currentCategoryId && (
        <div className="visits">
          <div className="visits-label">Trips</div>
          {visits.length > 0 ? (
            <ul className="visits-list">
              {visits.map((v, i) => (
                <li key={`${v.date}-${i}`}>
                  {readOnly ? (
                    <>
                      <span className="v-date">{v.date}</span>
                      {v.note && <span className="v-note">{v.note}</span>}
                    </>
                  ) : (
                    <>
                      <input
                        type="date"
                        value={v.date || ''}
                        onChange={(e) => onUpdateVisit(i, { date: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="note"
                        value={v.note || ''}
                        onChange={(e) => onUpdateVisit(i, { note: e.target.value })}
                      />
                      <button className="icon-btn" onClick={() => onRemoveVisit(i)} aria-label="remove">×</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : !readOnly && (
            <div className="visits-empty">No trips logged.</div>
          )}
          {!readOnly && (
            <div className="visit-add">
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
              <input
                type="text"
                placeholder="add a note…"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitVisit() }}
              />
              <button className="btn small" onClick={submitVisit}>+ Trip</button>
            </div>
          )}
        </div>
      )}

      {isWishlist && (
        <div className="plan-section">
          <div className="visits-label">Plan trip</div>
          <div className="plan-fields">
            <label className="plan-field">
              <span>Target date</span>
              <input
                type="month"
                value={plan?.targetDate || ''}
                onChange={(e) => !readOnly && onUpdatePlan?.({ ...plan, targetDate: e.target.value })}
                disabled={readOnly}
              />
            </label>
            <label className="plan-field">
              <span>Priority</span>
              <select
                value={plan?.priority || ''}
                onChange={(e) => !readOnly && onUpdatePlan?.({ ...plan, priority: e.target.value })}
                disabled={readOnly}
              >
                <option value="">—</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High ⭐</option>
              </select>
            </label>
          </div>
          {plan?.targetDate && (
            <div className="plan-summary muted">
              {plan.priority ? `${plan.priority.charAt(0).toUpperCase() + plan.priority.slice(1)} priority · ` : ''}
              Target: {plan.targetDate}
            </div>
          )}
        </div>
      )}

      {!readOnly && (
        <button className="hide-btn" onClick={() => { onHide(id); onClose() }}>
          Hide {name} from map
        </button>
      )}
    </div>
  )
}

function softenInline(hex) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const mix = (c) => Math.round(c + (255 - c) * 0.78)
  const toHex = (n) => n.toString(16).padStart(2, '0')
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`
}

export default Detail
