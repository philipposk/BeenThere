import { useEffect } from 'react'

/**
 * Keyboard cheatsheet overlay. Opened with `?`, closed with Esc / click outside
 * / `?` again. Two-column grid grouped by scope.
 */
function Cheatsheet({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const groups = [
    {
      label: 'Global',
      rows: [
        ['?',           'Toggle this cheatsheet'],
        ['⌘K / Ctrl-K', 'Focus search'],
        ['f',           'Focus search'],
        ['g s',         'Open Settings'],
        ['g h',         'Open Hidden-countries manager'],
        ['g k',         'Open Stats'],
        ['g t',         'Open Look-back timeline'],
        ['Esc',         'Close popovers / detail'],
      ],
    },
    {
      label: 'Journal navigation',
      rows: [
        ['j  /  ↓',   'Next country in current tab'],
        ['k  /  ↑',   'Previous country in current tab'],
        ['Tab',       'Cycle to next tab'],
        ['Shift+Tab', 'Cycle to previous tab'],
        ['Enter',     'Open detail for highlighted row'],
      ],
    },
    {
      label: 'Country actions (country selected)',
      rows: [
        ['A–Z',       'Assign by category-label prefix (type-ahead)'],
        ['1 – 9',     'Assign nth category from legend order'],
        ['0 / Del',   'Unmark country'],
        ['Backspace', 'Clear keystroke buffer'],
        ['h',         'Hide country from map'],
      ],
    },
    {
      label: 'Map',
      rows: [
        ['Right-click country', 'Open context menu (assign / hide)'],
      ],
    },
  ]

  return (
    <div className="cheatsheet-backdrop" onClick={onClose}>
      <div className="cheatsheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Keyboard shortcuts">
        <div className="cheatsheet-head">
          <h3>Keyboard shortcuts</h3>
          <button className="close" onClick={onClose} aria-label="close">×</button>
        </div>
        <div className="cheatsheet-grid">
          {groups.map((g) => (
            <section key={g.label}>
              <h4>{g.label}</h4>
              <table>
                <tbody>
                  {g.rows.map(([k, v]) => (
                    <tr key={k}>
                      <td><kbd>{k}</kbd></td>
                      <td>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
        <div className="cheatsheet-foot">
          Shortcuts ignored while typing in inputs. Press <kbd>?</kbd> any time.
        </div>
      </div>
    </div>
  )
}

export default Cheatsheet
