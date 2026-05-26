import { useEffect, useMemo, useRef, useState } from 'react'
import { geoNaturalEarth1, geoPath, geoGraticule10 } from 'd3-geo'

/**
 * SVG world map rendered via d3-geo (Natural Earth I projection).
 * - `countries`     : GeoJSON FeatureCollection (each feature.id = numeric ISO)
 * - `statuses`      : { [numericId]: categoryId }
 * - `categories`    : merged list from useCategories
 * - `hidden`        : Set<string> of numeric IDs the user removed from the map
 * - `selectedId`    : currently-selected numeric ID
 * - `hoveredId`     : numeric ID hovered from the rail (for cross-highlight)
 * - `onSelect(id,name)` : click handler
 */
function WorldMap({ countries, statuses, categories, hidden, selectedId, hoveredId, onSelect, onContextMenu }) {
  const containerRef = useRef(null)
  const [dims, setDims] = useState({ w: 800, h: 600 })

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width, height } = e.contentRect
        if (width > 0 && height > 0) setDims({ w: width, h: height })
      }
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const categoryById = useMemo(() => {
    const m = new Map()
    for (const c of categories) m.set(c.id, c)
    return m
  }, [categories])

  const { paths, sphereD, graticuleD } = useMemo(() => {
    if (!countries || !dims.w || !dims.h) return { paths: [], sphereD: '', graticuleD: '' }
    const projection = geoNaturalEarth1()
    projection.fitExtent([[20, 40], [dims.w - 20, dims.h - 40]], { type: 'Sphere' })
    const pathGen = geoPath(projection)
    const sphereD = pathGen({ type: 'Sphere' })
    const graticuleD = pathGen(geoGraticule10())
    const paths = countries.features
      .filter((f) => !hidden.has(String(f.id)))
      .map((f) => ({
        id: String(f.id),
        name: (f.properties && (f.properties.name || f.properties.NAME)) || String(f.id),
        d: pathGen(f),
      }))
      .filter((p) => p.d)
    return { paths, sphereD, graticuleD }
  }, [countries, dims, hidden])

  return (
    <div ref={containerRef} className="map-canvas">
      <svg
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
      >
        <path className="sphere" d={sphereD} />
        <path className="graticule" d={graticuleD} />
        <g>
          {paths.map((p) => {
            const catId = statuses[p.id]
            const cat = catId ? categoryById.get(catId) : null
            const isHighlighted = p.id === selectedId || p.id === hoveredId
            // Custom (non-builtin) categories use inline fill — builtins use
            // CSS-variable classes so live tone/swatch changes flow through.
            const style = {}
            if (cat && !cat.builtin) {
              style.fill = cat.color
            }
            const cls = ['country']
            if (cat && cat.builtin) cls.push(cat.id) // "visited" or "wishlist"
            if (cat && !cat.builtin) cls.push('custom')
            if (isHighlighted) cls.push('selected')
            return (
              <path
                key={p.id}
                d={p.d}
                className={cls.join(' ')}
                style={style}
                onClick={() => onSelect(p.id, p.name)}
                onContextMenu={(e) => {
                  if (!onContextMenu) return
                  e.preventDefault()
                  onSelect(p.id, p.name)
                  onContextMenu({ id: p.id, name: p.name, x: e.clientX, y: e.clientY })
                }}
              >
                <title>{p.name}</title>
              </path>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

export default WorldMap
