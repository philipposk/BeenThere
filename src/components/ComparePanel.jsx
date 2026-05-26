import { useEffect, useRef, useState } from 'react'
import { decodeShareState } from '../utils/shareLink'
import { catMap } from '../utils/statusSchema'
import { COUNTRY_INFO } from '../utils/countryInfo'
import { continentOf } from '../utils/countryData'

/**
 * Partner compare panel.
 * User pastes a BeenThere share URL; we decode it and show:
 *  - "Both visited" (overlap)
 *  - "You only"
 *  - "Partner only"
 *
 * Props:
 *   open, onClose
 *   myStatuses  — { [id]: categoryId }   (already catMap'd)
 *   nameMap     — Map<id, name>
 */
function ComparePanel({ open, onClose, myStatuses, nameMap }) {
  const [url, setUrl]         = useState('')
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState(null)
  const inputRef              = useRef(null)

  useEffect(() => {
    if (!open) return
    setUrl('')
    setResult(null)
    setError(null)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const handleCompare = () => {
    setError(null)
    try {
      const raw = url.trim()
      // Extract the hash fragment from the URL (or treat raw as hash directly)
      const hashIdx = raw.indexOf('#')
      const hash = hashIdx !== -1 ? raw.slice(hashIdx) : (raw.startsWith('#') ? raw : `#${raw}`)
      const shared = decodeShareState(hash)
      if (!shared || !shared.s) { setError('Could not parse share link.'); return }

      const partnerCats = catMap(shared.s)

      const myVisited    = new Set(Object.keys(myStatuses))
      const theirVisited = new Set(Object.keys(partnerCats))

      const both         = [...myVisited].filter((id) => theirVisited.has(id)).sort(byName(nameMap))
      const onlyMe       = [...myVisited].filter((id) => !theirVisited.has(id)).sort(byName(nameMap))
      const onlyThem     = [...theirVisited].filter((id) => !myVisited.has(id)).sort(byName(nameMap))

      setResult({ partnerCats, both, onlyMe, onlyThem })
    } catch (err) {
      setError(err.message || 'Failed to parse URL.')
    }
  }

  return (
    <div className="compare-backdrop" onClick={onClose}>
      <div className="compare-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Compare with partner">
        <div className="compare-head">
          <h3>Compare with a friend</h3>
          <button className="close" onClick={onClose} aria-label="close">×</button>
        </div>

        <div className="compare-input-row">
          <input
            ref={inputRef}
            type="text"
            placeholder="Paste their BeenThere share link…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCompare() }}
          />
          <button className="btn small" onClick={handleCompare} disabled={!url.trim()}>Compare</button>
        </div>

        {error && <p className="compare-error">{error}</p>}

        {result && (
          <div className="compare-body">
            <div className="compare-summary">
              <div className="compare-stat both">
                <span className="n">{result.both.length}</span>
                <span className="l">Both visited</span>
              </div>
              <div className="compare-stat only-me">
                <span className="n">{result.onlyMe.length}</span>
                <span className="l">You only</span>
              </div>
              <div className="compare-stat only-them">
                <span className="n">{result.onlyThem.length}</span>
                <span className="l">Partner only</span>
              </div>
            </div>

            {result.both.length > 0 && (
              <Section label="Both visited" cls="both">
                {result.both.map((id) => <CountryRow key={id} id={id} nameMap={nameMap} />)}
              </Section>
            )}
            {result.onlyMe.length > 0 && (
              <Section label="You visited, they haven't" cls="only-me">
                {result.onlyMe.map((id) => <CountryRow key={id} id={id} nameMap={nameMap} />)}
              </Section>
            )}
            {result.onlyThem.length > 0 && (
              <Section label="They visited, you haven't" cls="only-them">
                {result.onlyThem.map((id) => <CountryRow key={id} id={id} nameMap={nameMap} />)}
              </Section>
            )}
          </div>
        )}

        {!result && !error && (
          <p className="compare-hint muted">
            Share your map via the 🔗 share button, then ask a friend to do the same.
            Paste their link above to see the overlap.
          </p>
        )}
      </div>
    </div>
  )
}

function byName(nameMap) {
  return (a, b) => (nameMap.get(a) || a).localeCompare(nameMap.get(b) || b)
}

function Section({ label, cls, children }) {
  return (
    <div className={`compare-section compare-section-${cls}`}>
      <h4>{label}</h4>
      <div className="compare-rows">{children}</div>
    </div>
  )
}

function CountryRow({ id, nameMap }) {
  const name = nameMap.get(id) || id
  const info = COUNTRY_INFO[id] || {}
  return (
    <div className="compare-row">
      <span className="compare-flag">{info.flag || ''}</span>
      <span className="compare-name">{name}</span>
      <span className="compare-cont muted">{continentOf(id)}</span>
    </div>
  )
}

export default ComparePanel
