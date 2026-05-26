import { useEffect, useRef } from 'react'

/**
 * Right-click menu anchored at cursor coords.
 *  - `target`: { id, name, x, y }
 *  - Assign-category list, Clear, Hide-from-map.
 * Closes on outside click, Esc, or after action.
 */
function ContextMenu({ target, categories, currentCategoryId, onAssign, onClear, onHide, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!target) return
    const onMouseDown = (e) => {
      if (ref.current?.contains(e.target)) return
      onClose()
    }
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [target, onClose])

  if (!target) return null

  // Clamp inside viewport.
  const w = 220
  const x = Math.min(target.x, window.innerWidth - w - 8)
  const y = Math.min(target.y, window.innerHeight - 280)

  return (
    <div
      ref={ref}
      className="ctx-menu"
      style={{ left: x, top: y, width: w }}
      role="menu"
    >
      <div className="ctx-head">{target.name}</div>
      <div className="ctx-section-label">Assign</div>
      {categories.map((c, i) => (
        <button
          key={c.id}
          className={`ctx-item ${currentCategoryId === c.id ? 'active' : ''}`}
          onClick={() => { onAssign(c.id); onClose() }}
        >
          <span className="ctx-dot" style={{ background: c.color }} />
          <span className="ctx-label">{c.label}</span>
          <span className="ctx-kbd">{i < 9 ? i + 1 : ''}</span>
        </button>
      ))}
      <div className="ctx-divider" />
      <button className="ctx-item" onClick={() => { onClear(); onClose() }}>
        <span className="ctx-label">Clear mark</span>
        <span className="ctx-kbd">0</span>
      </button>
      <button className="ctx-item danger" onClick={() => { onHide(); onClose() }}>
        <span className="ctx-label">Hide from map</span>
        <span className="ctx-kbd">h</span>
      </button>
    </div>
  )
}

export default ContextMenu
