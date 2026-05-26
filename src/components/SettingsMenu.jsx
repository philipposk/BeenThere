import { useEffect, useRef, useState } from 'react'
import { MAP_TONES, VISITED_SWATCHES, WISHLIST_SWATCHES } from '../utils/useSettings'
import { CUSTOM_SWATCHES } from '../utils/useCategories'

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
)

/**
 * Popover anchored to gear icon. Three sections:
 *  1. Map tone (warm/cool/mono)
 *  2. Visited / Wishlist swatches
 *  3. Custom categories CRUD (add / rename / recolor / delete)
 *  4. Hidden countries list (restore individually or all)
 *
 * Closes on outside click, Esc, or gear toggle.
 */
function SettingsMenu({
  open,
  onClose,
  settings,
  updateSettings,
  customCategories,
  addCategory,
  updateCategory,
  removeCategory,
  hidden,
  nameMap,
  unhide,
  restoreAllHidden,
  anchorRef,
  initialScroll,
  onPullFromDrive,
  onPushToDrive,
  syncStatus,
}) {
  const ref = useRef(null)
  const hiddenSectionRef = useRef(null)
  const [newLabel, setNewLabel] = useState('')
  const [newColor, setNewColor] = useState(CUSTOM_SWATCHES[0])

  useEffect(() => {
    if (!open) return
    if (initialScroll === 'hidden' && hiddenSectionRef.current) {
      hiddenSectionRef.current.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }
  }, [open, initialScroll])

  useEffect(() => {
    if (!open) return
    const onMouseDown = (e) => {
      if (ref.current?.contains(e.target)) return
      if (anchorRef?.current?.contains(e.target)) return
      onClose()
    }
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, anchorRef])

  if (!open) return null

  const hiddenList = Array.from(hidden).map((id) => ({ id, name: nameMap.get(String(id)) || id }))

  return (
    <div ref={ref} className="settings-menu" role="dialog" aria-label="Settings">
      <div className="settings-head">
        <h3>Settings</h3>
        <button className="close" onClick={onClose} aria-label="close">×</button>
      </div>

      <Section label="Map tone">
        <div className="segmented">
          {Object.keys(MAP_TONES).map((tone) => (
            <button
              key={tone}
              className={settings.mapTone === tone ? 'active' : ''}
              onClick={() => updateSettings({ mapTone: tone })}
            >
              {tone}
            </button>
          ))}
        </div>
      </Section>

      <Section label="Visited color">
        <Swatches
          value={settings.visitedColor}
          options={VISITED_SWATCHES}
          onChange={(c) => updateSettings({ visitedColor: c })}
        />
      </Section>

      <Section label="Subdivisions" hint="Show smaller regions on the map.">
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={!!settings.showUSStates}
            onChange={(e) => updateSettings({ showUSStates: e.target.checked })}
          />
          US states
        </label>
      </Section>

      <Section label="Wishlist color">
        <Swatches
          value={settings.wishlistColor}
          options={WISHLIST_SWATCHES}
          onChange={(c) => updateSettings({ wishlistColor: c })}
        />
      </Section>

      <Section label="Custom categories" hint="Add your own — e.g. “Hell never”, “Lived here”.">
        {customCategories.length > 0 && (
          <ul className="cat-list">
            {customCategories.map((c) => (
              <li key={c.id}>
                <input
                  type="color"
                  value={c.color}
                  onChange={(e) => updateCategory(c.id, { color: e.target.value })}
                  aria-label="Color"
                />
                <input
                  type="text"
                  value={c.label}
                  onChange={(e) => updateCategory(c.id, { label: e.target.value })}
                  aria-label="Label"
                />
                <button className="icon-btn" onClick={() => removeCategory(c.id)} aria-label="Delete">
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="cat-add">
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            aria-label="New color"
          />
          <input
            type="text"
            placeholder="New category…"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newLabel.trim()) {
                addCategory(newLabel, newColor)
                setNewLabel('')
              }
            }}
          />
          <button
            className="btn small"
            disabled={!newLabel.trim()}
            onClick={() => {
              if (!newLabel.trim()) return
              addCategory(newLabel, newColor)
              setNewLabel('')
            }}
          >
            Add
          </button>
        </div>
      </Section>

      <Section label="Drive sync" hint="Back up and restore via Google Drive.">
        <div className="sync-row">
          <button className="btn small" onClick={onPullFromDrive} disabled={!onPullFromDrive}>↓ Pull</button>
          <button className="btn small" onClick={onPushToDrive} disabled={!onPushToDrive}>↑ Push</button>
        </div>
        {syncStatus && <p className="muted" style={{ marginTop: 8 }}>{syncStatus}</p>}
      </Section>

      <div ref={hiddenSectionRef} />
      <Section label="Hidden countries" hint="Countries you removed from the map.">
        {hiddenList.length === 0 ? (
          <p className="muted">None hidden.</p>
        ) : (
          <>
            <ul className="hidden-list">
              {hiddenList.map((c) => (
                <li key={c.id}>
                  <span>{c.name}</span>
                  <button className="link" onClick={() => unhide(c.id)}>Restore</button>
                </li>
              ))}
            </ul>
            <button className="btn small" onClick={restoreAllHidden}>Restore all</button>
          </>
        )}
      </Section>
    </div>
  )
}

function Section({ label, hint, children }) {
  return (
    <div className="settings-section">
      <div className="settings-label">{label}</div>
      {hint && <div className="settings-hint">{hint}</div>}
      {children}
    </div>
  )
}

function Swatches({ value, options, onChange }) {
  return (
    <div className="swatches">
      {options.map((c) => (
        <button
          key={c}
          className={`swatch ${value === c ? 'active' : ''}`}
          style={{ background: c }}
          onClick={() => onChange(c)}
          aria-label={c}
        />
      ))}
    </div>
  )
}

export default SettingsMenu
