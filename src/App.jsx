import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import WorldMap from './components/WorldMap'
import Rail from './components/Rail'
import SearchBar from './components/SearchBar'
import Toolbar from './components/Toolbar'
import Detail from './components/Detail'
import SettingsMenu from './components/SettingsMenu'
import Cheatsheet from './components/Cheatsheet'
import ContextMenu from './components/ContextMenu'
import { loadCountryData } from './utils/countryData'
import { loadUSStates } from './utils/subdivisions'
import { useSettings } from './utils/useSettings'
import { useCategories } from './utils/useCategories'
import { useHidden } from './utils/useHidden'
import { generateKMLWithPolygons } from './utils/kmlGenerator'
import { uploadToDrive, openMyMaps, uploadJSONToDrive, downloadJSONFromDrive } from './utils/googleDrive'
import { getCat, withCat, addVisit, removeVisit, updateVisit, catMap } from './utils/statusSchema'
import { downloadMapPNG, downloadMapSVG } from './utils/imageExport'
import { buildShareURL, decodeShareState } from './utils/shareLink'

const STATUSES_KEY = 'beenthere.statuses'

// One-shot migration from legacy `countryStatuses` (2-letter ISO -> string) to
// new key `beenthere.statuses` (numeric ISO -> categoryId). If the old key
// existed but the new one didn't, we preserve the values but the keys are
// 2-letter codes that won't match the world-atlas numeric IDs — those entries
// effectively become orphaned. Users keep their counts visible in the rail but
// won't see colored countries until they re-mark. This is a known trade-off of
// switching geometry datasets.
function loadStatuses() {
  try {
    const raw = localStorage.getItem(STATUSES_KEY)
    if (raw) return JSON.parse(raw)
    const legacy = localStorage.getItem('countryStatuses')
    if (legacy) return JSON.parse(legacy)
  } catch (e) { /* ignore */ }
  return {}
}

// On boot, check for shared-state hash. If present, the app boots in read-only
// mode showing that state instead of the user's own.
const SHARED = decodeShareState(window.location.hash)

function App() {
  const [countries, setCountries] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const readOnly = !!SHARED
  const [statuses, setStatuses] = useState(() => SHARED ? (SHARED.s || {}) : loadStatuses())
  const [selectedId, setSelectedId] = useState(null)
  const [selectedName, setSelectedName] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)
  const [tab, setTab] = useState('visited')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsScrollTo, setSettingsScrollTo] = useState(null)
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false)
  const [contextTarget, setContextTarget] = useState(null)
  const [exportState, setExportState] = useState({ status: 'idle', message: null })

  // Undo-hide toast: last hidden country (id + name) for ~10s after hide.
  const [undoHide, setUndoHide] = useState(null)
  const undoTimerRef = useRef(null)

  // Type-ahead keyboard mnemonics: keystroke buffer + reset timer.
  const keyBufRef = useRef('')
  const keyTimerRef = useRef(null)
  const [keyHint, setKeyHint] = useState(null)

  const [settings, updateSettings] = useSettings()
  const { categories, customCategories, addCategory, updateCategory, removeCategory } = useCategories(settings)
  const { hidden, isHidden, hide, unhide, restoreAll } = useHidden()

  const gearRef = useRef(null)
  const searchRef = useRef(null)
  // Leader-key state: when user presses `g`, next keystroke is the second half
  // of a two-stroke shortcut (`g h`, `g s`). Resets after 1.2s.
  const leaderRef = useRef(null)
  const leaderTimerRef = useRef(null)

  // Load TopoJSON once.
  useEffect(() => {
    loadCountryData()
      .then(setCountries)
      .catch((err) => setLoadError(err.message))
  }, [])

  // Lazy-load US states when enabled.
  const [usStates, setUSStates] = useState(null)
  useEffect(() => {
    if (!settings.showUSStates || usStates) return
    loadUSStates().then(setUSStates).catch((err) => console.warn('US states load failed:', err))
  }, [settings.showUSStates, usStates])

  // Merge country FC with US states FC when toggle on.
  const mergedFC = useMemo(() => {
    if (!countries) return null
    if (!settings.showUSStates || !usStates) return countries
    return {
      type: 'FeatureCollection',
      features: [...countries.features, ...usStates.features],
    }
  }, [countries, settings.showUSStates, usStates])

  // Persist statuses. Skip in read-only (shared) mode so we don't overwrite
  // the user's own data when they view someone else's map.
  useEffect(() => {
    if (readOnly) return
    try { localStorage.setItem(STATUSES_KEY, JSON.stringify(statuses)) } catch (e) { /* ignore */ }
  }, [statuses, readOnly])

  // If a category gets deleted, clear it from statuses.
  useEffect(() => {
    const valid = new Set(categories.map((c) => c.id))
    setStatuses((prev) => {
      let changed = false
      const next = {}
      for (const [id, entry] of Object.entries(prev)) {
        const cat = getCat(entry)
        if (cat && valid.has(cat)) next[id] = entry
        else changed = true
      }
      return changed ? next : prev
    })
  }, [categories])

  // Derived: { id -> categoryId } for components that don't care about visits.
  const cats = useMemo(() => catMap(statuses), [statuses])

  // Ensure `tab` always points to an existing category.
  useEffect(() => {
    if (!categories.find((c) => c.id === tab)) {
      setTab(categories[0]?.id || 'visited')
    }
  }, [categories, tab])

  const nameMap = useMemo(() => {
    const m = new Map()
    if (mergedFC) for (const f of mergedFC.features) m.set(String(f.id), f.properties?.name || String(f.id))
    return m
  }, [mergedFC])

  const visibleCount = countries ? countries.features.length - hidden.size : 0

  const handleSelect = useCallback((id, name) => {
    setSelectedId(String(id))
    setSelectedName(name)
  }, [])

  const handleSet = useCallback((categoryId) => {
    if (!selectedId) return
    setStatuses((prev) => {
      const next = { ...prev }
      if (categoryId === null || categoryId === undefined) {
        delete next[selectedId]
      } else {
        next[selectedId] = withCat(prev[selectedId], categoryId)
      }
      return next
    })
  }, [selectedId])

  // Visit-log handlers — operate on currently selected country.
  const handleAddVisit = useCallback((visit) => {
    if (!selectedId) return
    setStatuses((prev) => {
      const entry = prev[selectedId]
      if (!entry) return prev // must be marked first
      return { ...prev, [selectedId]: addVisit(entry, visit) }
    })
  }, [selectedId])

  const handleRemoveVisit = useCallback((idx) => {
    if (!selectedId) return
    setStatuses((prev) => {
      const entry = prev[selectedId]
      if (!entry) return prev
      return { ...prev, [selectedId]: removeVisit(entry, idx) }
    })
  }, [selectedId])

  const handleUpdateVisit = useCallback((idx, patch) => {
    if (!selectedId) return
    setStatuses((prev) => {
      const entry = prev[selectedId]
      if (!entry) return prev
      return { ...prev, [selectedId]: updateVisit(entry, idx, patch) }
    })
  }, [selectedId])

  const handleReset = useCallback(() => {
    if (confirm('Clear all marked countries? This cannot be undone.')) setStatuses({})
  }, [])

  const handleSharePNG = useCallback(async () => {
    try { await downloadMapPNG('beenthere.png') }
    catch (err) { setExportState({ status: 'error', message: err.message }) }
  }, [])

  const handleShareSVG = useCallback(() => {
    try { downloadMapSVG('beenthere.svg') }
    catch (err) { setExportState({ status: 'error', message: err.message }) }
  }, [])

  const handleShareLink = useCallback(async () => {
    const url = buildShareURL({ statuses, categories, hidden })
    try {
      await navigator.clipboard.writeText(url)
      setExportState({ status: 'done', message: 'Share link copied' })
    } catch (e) {
      // Fallback: show prompt for manual copy.
      window.prompt('Copy share link:', url)
    }
    setTimeout(() => setExportState({ status: 'idle', message: null }), 2500)
  }, [statuses, categories, hidden])

  // Drive JSON sync.
  const [syncStatus, setSyncStatus] = useState(null)
  const handleDrivePush = useCallback(async () => {
    setSyncStatus('Pushing…')
    try {
      const payload = {
        v: 1,
        statuses,
        customCategories,
        hidden: Array.from(hidden),
        settings,
        savedAt: new Date().toISOString(),
      }
      const fileId = await uploadJSONToDrive(payload)
      setSyncStatus(`Pushed (file ${fileId.slice(0, 8)}…) at ${new Date().toLocaleTimeString()}`)
    } catch (err) {
      setSyncStatus(`Push failed: ${err.message || err}`)
    }
  }, [statuses, customCategories, hidden, settings])

  const handleDrivePull = useCallback(async () => {
    setSyncStatus('Pulling…')
    try {
      const res = await downloadJSONFromDrive()
      if (!res) {
        setSyncStatus('No backup found on Drive.')
        return
      }
      const { data, modifiedTime } = res
      if (!confirm(`Replace local data with Drive backup from ${modifiedTime}?`)) {
        setSyncStatus('Cancelled.')
        return
      }
      if (data.statuses) setStatuses(data.statuses)
      if (Array.isArray(data.customCategories)) {
        localStorage.setItem('beenthere.categories', JSON.stringify(data.customCategories))
      }
      if (Array.isArray(data.hidden)) {
        localStorage.setItem('beenthere.hidden', JSON.stringify(data.hidden))
      }
      if (data.settings) {
        localStorage.setItem('beenthere.settings', JSON.stringify(data.settings))
      }
      setSyncStatus('Pulled. Reloading…')
      setTimeout(() => window.location.reload(), 500)
    } catch (err) {
      setSyncStatus(`Pull failed: ${err.message || err}`)
    }
  }, [])

  const exitReadOnly = useCallback(() => {
    if (!readOnly) return
    history.replaceState(null, '', window.location.pathname)
    window.location.reload()
  }, [readOnly])

  // Hide a country + show 10s Undo toast.
  const handleHide = useCallback((id, name) => {
    hide(id)
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setUndoHide({ id: String(id), name })
    undoTimerRef.current = setTimeout(() => setUndoHide(null), 10000)
  }, [hide])

  const handleUndoHide = useCallback(() => {
    if (!undoHide) return
    unhide(undoHide.id)
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setUndoHide(null)
  }, [undoHide, unhide])

  // ----- Keyboard layer ---------------------------------------------------
  // Global:
  //   ?           toggle cheatsheet
  //   f           focus search
  //   g s         open Settings
  //   g h         open Settings scrolled to Hidden countries
  //   Esc         close popovers / clear selection
  //   j / ↓       next country in current journal tab
  //   k / ↑       previous country in current journal tab
  //   Enter       (no-op here; row click handles open)
  //   Tab / S-Tab cycle categories (tabs)
  // With a country selected:
  //   A–Z         type-ahead category prefix
  //   1–9         assign nth category
  //   0 / Del     unmark
  //   h           hide country
  //   Backspace   clear keystroke buffer
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return

      const clearLeader = () => {
        leaderRef.current = null
        if (leaderTimerRef.current) clearTimeout(leaderTimerRef.current)
      }

      // ----- Leader resolution (`g <x>`) --------------------------------
      if (leaderRef.current === 'g') {
        e.preventDefault()
        if (e.key === 's') { setSettingsScrollTo(null); setSettingsOpen(true) }
        else if (e.key === 'h') { setSettingsScrollTo('hidden'); setSettingsOpen(true) }
        clearLeader()
        return
      }

      // ----- Cheatsheet -------------------------------------------------
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        setCheatsheetOpen((v) => !v)
        return
      }
      if (cheatsheetOpen) return // let cheatsheet eat keys

      // ----- Esc --------------------------------------------------------
      if (e.key === 'Escape') {
        if (contextTarget) { setContextTarget(null); return }
        if (settingsOpen) { setSettingsOpen(false); return }
        if (selectedId) { setSelectedId(null); setSelectedName(null) }
        return
      }

      // ----- f focus search --------------------------------------------
      if (e.key === 'f' && !selectedId) {
        e.preventDefault()
        searchRef.current?.focus()
        return
      }

      // ----- g leader --------------------------------------------------
      if (e.key === 'g') {
        e.preventDefault()
        leaderRef.current = 'g'
        if (leaderTimerRef.current) clearTimeout(leaderTimerRef.current)
        leaderTimerRef.current = setTimeout(clearLeader, 1200)
        return
      }

      // ----- Tab cycles category tabs ----------------------------------
      if (e.key === 'Tab' && categories.length > 1) {
        e.preventDefault()
        const idx = categories.findIndex((c) => c.id === tab)
        const next = e.shiftKey
          ? (idx <= 0 ? categories.length - 1 : idx - 1)
          : (idx + 1) % categories.length
        setTab(categories[next].id)
        return
      }

      // ----- j/k/arrow navigation in current journal tab --------------
      if (e.key === 'j' || e.key === 'ArrowDown' || e.key === 'k' || e.key === 'ArrowUp') {
        const list = Object.entries(cats)
          .filter(([, cid]) => cid === tab)
          .map(([id]) => id)
        if (list.length === 0) return
        e.preventDefault()
        const cur = selectedId && list.indexOf(selectedId)
        const downward = e.key === 'j' || e.key === 'ArrowDown'
        let nextIdx
        if (cur === -1 || cur === null || cur === undefined || cur === false) {
          nextIdx = downward ? 0 : list.length - 1
        } else {
          nextIdx = downward ? (cur + 1) % list.length : (cur - 1 + list.length) % list.length
        }
        const nextId = list[nextIdx]
        handleSelect(nextId, nameMap.get(nextId) || nextId)
        return
      }

      if (!selectedId) return

      // ----- With country selected -------------------------------------
      if (e.key === 'Backspace') {
        keyBufRef.current = ''
        setKeyHint(null)
        if (keyTimerRef.current) clearTimeout(keyTimerRef.current)
        return
      }
      if (e.key === 'Delete' || e.key === '0') {
        e.preventDefault()
        handleSet(null)
        keyBufRef.current = ''
        setKeyHint(null)
        return
      }
      if (e.key === 'h') {
        e.preventDefault()
        handleHide(selectedId, selectedName)
        setSelectedId(null); setSelectedName(null)
        return
      }
      // Digit 1-9 = nth category.
      if (/^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1
        const cat = categories[idx]
        if (cat) {
          e.preventDefault()
          handleSet(cat.id)
          setKeyHint({ buf: e.key, label: cat.label, status: 'assigned' })
          if (keyTimerRef.current) clearTimeout(keyTimerRef.current)
          keyTimerRef.current = setTimeout(() => setKeyHint(null), 1000)
        }
        return
      }
      if (e.key.length !== 1 || !/[a-zA-Z]/.test(e.key)) return

      // Type-ahead prefix match.
      const buf = (keyBufRef.current + e.key).toLowerCase()
      keyBufRef.current = buf
      const matches = categories.filter((c) => c.label.toLowerCase().startsWith(buf))
      if (matches.length === 1) {
        handleSet(matches[0].id)
        keyBufRef.current = ''
        setKeyHint({ buf, label: matches[0].label, status: 'assigned' })
        if (keyTimerRef.current) clearTimeout(keyTimerRef.current)
        keyTimerRef.current = setTimeout(() => setKeyHint(null), 1000)
      } else if (matches.length === 0) {
        keyBufRef.current = ''
        setKeyHint({ buf, status: 'no-match' })
        if (keyTimerRef.current) clearTimeout(keyTimerRef.current)
        keyTimerRef.current = setTimeout(() => setKeyHint(null), 800)
      } else {
        setKeyHint({ buf, status: 'ambiguous', count: matches.length })
        if (keyTimerRef.current) clearTimeout(keyTimerRef.current)
        keyTimerRef.current = setTimeout(() => {
          keyBufRef.current = ''
          setKeyHint(null)
        }, 1200)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, selectedName, categories, handleSet, handleSelect, cats, tab, nameMap, cheatsheetOpen, settingsOpen, contextTarget])

  const handleExport = useCallback(async () => {
    if (!countries) return
    setExportState({ status: 'working', message: 'Generating KML…' })
    try {
      const kml = await generateKMLWithPolygons(cats, countries, categories, statuses)
      setExportState({ status: 'working', message: 'Uploading to Drive…' })
      const fileId = await uploadToDrive(kml, 'BeenThere.kml')
      setExportState({ status: 'done', message: `Uploaded. File ID ${fileId}.` })
      if (confirm('Uploaded to Drive. Open Google My Maps now?')) openMyMaps()
    } catch (err) {
      setExportState({ status: 'error', message: err.message || String(err) })
    }
  }, [countries, cats, statuses, categories])

  if (loadError) {
    return (
      <div className="app-error">
        <h2>Couldn’t load map data</h2>
        <p>{loadError}</p>
      </div>
    )
  }

  if (!countries) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <div>Drawing the world…</div>
      </div>
    )
  }

  const selectedEntry = selectedId ? statuses[selectedId] : null
  const currentCategoryId = getCat(selectedEntry)

  return (
    <div className={`app ${readOnly ? 'read-only' : ''}`}>
      {readOnly && (
        <div className="readonly-banner">
          <span>Viewing a shared map (read-only).</span>
          <button className="link" onClick={exitReadOnly}>Exit to my own map</button>
        </div>
      )}
      <Rail
        statuses={cats}
        categories={categories}
        totalCountries={visibleCount}
        nameMap={nameMap}
        selectedId={selectedId}
        onSelect={handleSelect}
        onHover={setHoveredId}
        tab={tab}
        setTab={setTab}
        onExport={handleExport}
      />

      <main className="stage">
        <WorldMap
          countries={mergedFC}
          statuses={cats}
          categories={categories}
          hidden={hidden}
          selectedId={selectedId}
          hoveredId={hoveredId}
          onSelect={handleSelect}
          onContextMenu={setContextTarget}
        />

        <div className="top-bar">
          <SearchBar
            ref={searchRef}
            countries={mergedFC}
            statuses={cats}
            categories={categories}
            onSelect={handleSelect}
          />
          <Toolbar
            gearRef={gearRef}
            onReset={readOnly ? null : handleReset}
            onExport={handleExport}
            onExportSVG={handleShareSVG}
            onExportPNG={handleSharePNG}
            onShareLink={handleShareLink}
            onToggleSettings={() => { setSettingsScrollTo(null); setSettingsOpen((v) => !v) }}
          />
          <SettingsMenu
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            anchorRef={gearRef}
            settings={settings}
            updateSettings={updateSettings}
            customCategories={customCategories}
            addCategory={addCategory}
            updateCategory={updateCategory}
            removeCategory={removeCategory}
            hidden={hidden}
            nameMap={nameMap}
            unhide={unhide}
            restoreAllHidden={restoreAll}
            initialScroll={settingsScrollTo}
            onPullFromDrive={readOnly ? null : handleDrivePull}
            onPushToDrive={readOnly ? null : handleDrivePush}
            syncStatus={syncStatus}
          />
        </div>

        <div className="legend">
          {categories.map((c) => (
            <div key={c.id} className="item">
              <span className="sw" style={{ background: c.color }} /> {c.label}
            </div>
          ))}
          <div className="item">
            <span className="sw" style={{ background: 'var(--land)' }} /> Unmarked
          </div>
        </div>

        {exportState.status !== 'idle' && exportState.message && (
          <div className={`export-toast ${exportState.status}`} onClick={() => setExportState({ status: 'idle', message: null })}>
            {exportState.message}
          </div>
        )}

        <Detail
          id={selectedId}
          name={selectedName}
          entry={selectedEntry}
          currentCategoryId={currentCategoryId}
          categories={categories}
          onSet={handleSet}
          onAddVisit={handleAddVisit}
          onRemoveVisit={handleRemoveVisit}
          onUpdateVisit={handleUpdateVisit}
          onClose={() => { setSelectedId(null); setSelectedName(null) }}
          onHide={(id) => handleHide(id, selectedName)}
          readOnly={readOnly}
        />

        {undoHide && (
          <div className="undo-toast">
            <span>Hid <strong>{undoHide.name}</strong>.</span>
            <button className="link" onClick={handleUndoHide}>Undo</button>
            <button
              className="link"
              onClick={() => { setSettingsOpen(true); setUndoHide(null) }}
              title="Open Settings to manage hidden countries"
            >
              Manage
            </button>
          </div>
        )}

        {keyHint && selectedId && (
          <div className={`key-hint key-hint-${keyHint.status}`}>
            <span className="buf">{keyHint.buf}</span>
            {keyHint.status === 'assigned' && <span>→ {keyHint.label}</span>}
            {keyHint.status === 'ambiguous' && <span>{keyHint.count} matches — keep typing</span>}
            {keyHint.status === 'no-match' && <span>no category</span>}
          </div>
        )}

        <ContextMenu
          target={contextTarget}
          categories={categories}
          currentCategoryId={contextTarget ? getCat(statuses[contextTarget.id]) : null}
          onAssign={(catId) => {
            if (!contextTarget) return
            setStatuses((prev) => ({ ...prev, [contextTarget.id]: withCat(prev[contextTarget.id], catId) }))
          }}
          onClear={() => {
            if (!contextTarget) return
            setStatuses((prev) => { const n = { ...prev }; delete n[contextTarget.id]; return n })
          }}
          onHide={() => { if (contextTarget) handleHide(contextTarget.id, contextTarget.name) }}
          onClose={() => setContextTarget(null)}
        />

        <button
          className="help-fab"
          onClick={() => setCheatsheetOpen(true)}
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts (?)"
        >?</button>
      </main>

      <Cheatsheet open={cheatsheetOpen} onClose={() => setCheatsheetOpen(false)} />
    </div>
  )
}

export default App
