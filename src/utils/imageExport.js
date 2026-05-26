// Export the rendered map SVG as a standalone .svg file or a rasterized PNG.
// Works by cloning the live SVG, inlining computed fill colors, and either
// serializing or drawing onto a canvas.

function inlineFills(srcSvg) {
  const clone = srcSvg.cloneNode(true)
  // Mirror computed fill/stroke onto each element so the standalone file
  // doesn't depend on external CSS variables.
  const srcEls = srcSvg.querySelectorAll('path')
  const dstEls = clone.querySelectorAll('path')
  for (let i = 0; i < srcEls.length; i++) {
    const cs = getComputedStyle(srcEls[i])
    dstEls[i].setAttribute('fill', cs.fill)
    dstEls[i].setAttribute('stroke', cs.stroke)
    dstEls[i].setAttribute('stroke-width', cs.strokeWidth)
  }
  // Ensure XML namespaces are present.
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
  return clone
}

function serialize(svg) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(svg)
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadMapSVG(filename = 'beenthere.svg') {
  const svg = document.querySelector('.map-canvas svg')
  if (!svg) throw new Error('Map not ready')
  const clone = inlineFills(svg)
  const blob = new Blob([serialize(clone)], { type: 'image/svg+xml;charset=utf-8' })
  triggerDownload(blob, filename)
}

export async function downloadMapPNG(filename = 'beenthere.png', scale = 2) {
  const svg = document.querySelector('.map-canvas svg')
  if (!svg) throw new Error('Map not ready')
  const clone = inlineFills(svg)
  // Establish explicit width/height so canvas knows pixel dimensions.
  const rect = svg.getBoundingClientRect()
  const w = Math.max(1, Math.round(rect.width))
  const h = Math.max(1, Math.round(rect.height))
  clone.setAttribute('width', w)
  clone.setAttribute('height', h)

  const xml = serialize(clone)
  const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  try {
    await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = w * scale
        canvas.height = h * scale
        const ctx = canvas.getContext('2d')
        // Paint background from sea token so PNG isn't transparent.
        const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#FAF7F1'
        ctx.fillStyle = bg
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Canvas export failed'))
          triggerDownload(blob, filename)
          resolve()
        }, 'image/png')
      }
      img.onerror = (e) => reject(new Error('Image load failed'))
      img.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}
