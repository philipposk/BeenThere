import { useEffect, useState, useCallback } from 'react'

const KEY = 'beenthere.settings'

export const MAP_TONES = {
  warm: {
    bg: '#FAF7F1', paper: '#FFFDF8', sea: '#ECE6D8',
    land: '#DDD4BF', 'land-hover': '#CFC4AA',
    rule: 'rgba(27,26,23,0.10)', 'rule-soft': 'rgba(27,26,23,0.05)',
    ink: '#1B1A17', 'ink-2': '#4B463E', muted: '#8C8578',
  },
  cool: {
    bg: '#F4F5F7', paper: '#FFFFFF', sea: '#E4E7EC',
    land: '#D2D7DE', 'land-hover': '#BFC6D0',
    rule: 'rgba(19,24,33,0.10)', 'rule-soft': 'rgba(19,24,33,0.05)',
    ink: '#131821', 'ink-2': '#3E4654', muted: '#7C8493',
  },
  mono: {
    bg: '#F4F2EF', paper: '#FFFFFF', sea: '#E8E5E0',
    land: '#D1CCC4', 'land-hover': '#BCB6AC',
    rule: 'rgba(20,20,20,0.10)', 'rule-soft': 'rgba(20,20,20,0.05)',
    ink: '#141414', 'ink-2': '#3A3A3A', muted: '#8A857F',
  },
  dark: {
    bg: '#15171C', paper: '#1D2026', sea: '#0F1115',
    land: '#2A2F38', 'land-hover': '#373D48',
    rule: 'rgba(255,255,255,0.10)', 'rule-soft': 'rgba(255,255,255,0.06)',
    ink: '#E8E6E1', 'ink-2': '#B8B5AE', muted: '#7E7B74',
  },
}

export const VISITED_SWATCHES = ['#C0553A', '#1F8A5B', '#2A6FDB', '#8B5CF6', '#D9A441']
export const WISHLIST_SWATCHES = ['#4F6B7B', '#8C8578', '#D97757', '#5A7F46', '#A8567B']

const DEFAULTS = {
  mapTone: 'warm',
  visitedColor: '#C0553A',
  wishlistColor: '#4F6B7B',
  showUSStates: false,
  showCanadaProvinces: false,
}

// Lighten a hex color toward white by mixing in `amt` (0..1).
function softer(hex, amt = 0.7) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const mix = (c) => Math.round(c + (255 - c) * amt)
  const toHex = (n) => n.toString(16).padStart(2, '0')
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`
}

// Darken for hover state.
function darker(hex, amt = 0.15) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const mix = (c) => Math.round(c * (1 - amt))
  const toHex = (n) => n.toString(16).padStart(2, '0')
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`
}

function applySettings(settings) {
  const root = document.documentElement
  const tone = MAP_TONES[settings.mapTone] || MAP_TONES.warm
  Object.entries(tone).forEach(([k, v]) => root.style.setProperty(`--${k}`, v))
  root.style.setProperty('--visited', settings.visitedColor)
  root.style.setProperty('--visited-soft', softer(settings.visitedColor, 0.72))
  root.style.setProperty('--visited-hover', darker(settings.visitedColor, 0.12))
  root.style.setProperty('--wishlist', settings.wishlistColor)
  root.style.setProperty('--wishlist-soft', softer(settings.wishlistColor, 0.72))
  root.style.setProperty('--wishlist-hover', darker(settings.wishlistColor, 0.12))
}

export function colorSoft(hex) { return softer(hex, 0.72) }
export function colorHover(hex) { return darker(hex, 0.12) }

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) return { ...DEFAULTS, ...JSON.parse(raw) }
    } catch (e) { /* ignore */ }
    return DEFAULTS
  })

  useEffect(() => {
    applySettings(settings)
    try { localStorage.setItem(KEY, JSON.stringify(settings)) } catch (e) { /* ignore */ }
  }, [settings])

  const update = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  return [settings, update]
}
