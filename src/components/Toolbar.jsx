const ResetIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
  </svg>
)
const ExportIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v12" />
    <path d="m7 8 5-5 5 5" />
    <path d="M5 21h14" />
  </svg>
)
const GearIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
)

function Toolbar({ onReset, onExport, onExportSVG, onExportPNG, onShareLink, onToggleSettings, gearRef }) {
  return (
    <div className="toolbar">
      <button className="btn" onClick={onReset} title="Reset all marks">
        <ResetIcon /><span className="label-text">Reset</span>
      </button>
      {onShareLink && (
        <button className="btn" onClick={onShareLink} title="Copy share link">
          <span className="label-text">Share link</span>
          <span className="emoji-only">🔗</span>
        </button>
      )}
      {onExportPNG && (
        <button className="btn" onClick={onExportPNG} title="Download PNG">
          <span className="label-text">PNG</span>
          <span className="emoji-only">🖼️</span>
        </button>
      )}
      {onExportSVG && (
        <button className="btn" onClick={onExportSVG} title="Download SVG">
          <span className="label-text">SVG</span>
          <span className="emoji-only">📄</span>
        </button>
      )}
      <button className="btn primary" onClick={onExport} title="Export to Google Drive">
        <ExportIcon /><span className="label-text">Drive</span>
      </button>
      <button ref={gearRef} className="btn icon-only" onClick={onToggleSettings} title="Settings" aria-label="Settings">
        <GearIcon />
      </button>
    </div>
  )
}

export default Toolbar
