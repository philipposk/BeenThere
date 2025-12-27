// Enhanced KML generator with actual country polygons
export async function generateKMLWithPolygons(countryStatuses, countriesGeoJSON) {
  const visited = []
  const wishlist = []

  // Separate countries by status
  Object.entries(countryStatuses).forEach(([code, status]) => {
    if (status === 'visited') visited.push(code)
    if (status === 'wishlist') wishlist.push(code)
  })

  // Helper to convert coordinates to KML format
  const coordinatesToString = (coords) => {
    if (!coords || coords.length === 0) return ''
    
    // Handle different geometry types
    if (Array.isArray(coords[0][0][0])) {
      // MultiPolygon - take first polygon
      return coords[0].map(ring => 
        ring.map(([lng, lat]) => `${lng},${lat},0`).join(' ')
      ).join(' ')
    } else if (Array.isArray(coords[0][0])) {
      // Polygon with holes - first ring is outer boundary
      return coords[0].map(([lng, lat]) => `${lng},${lat},0`).join(' ')
    } else if (Array.isArray(coords[0])) {
      // Simple polygon
      return coords.map(([lng, lat]) => `${lng},${lat},0`).join(' ')
    }
    return ''
  }

  // Helper to process geometry
  const processGeometry = (geometry) => {
    if (geometry.type === 'Polygon') {
      return coordinatesToString(geometry.coordinates)
    } else if (geometry.type === 'MultiPolygon') {
      // For MultiPolygon, use the largest polygon
      const polygons = geometry.coordinates
      const largest = polygons.reduce((max, poly) => 
        poly[0].length > (max?.[0]?.length || 0) ? poly : max
      )
      return coordinatesToString(largest)
    }
    return ''
  }

  let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>MyCountries</name>
    <description>Countries I've visited and want to visit</description>
    
    <!-- Visited Countries Style (Green) -->
    <Style id="visitedStyle">
      <PolyStyle>
        <color>7d00ff00</color>
        <outline>1</outline>
        <width>1</width>
      </PolyStyle>
      <LineStyle>
        <color>ff000000</color>
        <width>1</width>
      </LineStyle>
    </Style>
    
    <!-- Wishlist Countries Style (Orange) -->
    <Style id="wishlistStyle">
      <PolyStyle>
        <color>7d0088ff</color>
        <outline>1</outline>
        <width>1</width>
      </PolyStyle>
      <LineStyle>
        <color>ff000000</color>
        <width>1</width>
      </LineStyle>
    </Style>
    
    <!-- Visited Folder -->
    <Folder>
      <name>Visited Countries</name>
      <open>1</open>
`

  // Add visited countries placemarks
  countriesGeoJSON.features.forEach(feature => {
    const code = feature.properties.ISO_A2 || feature.properties.ISO_A3
    if (!visited.includes(code)) return

    const name = feature.properties.NAME || code
    const coordString = processGeometry(feature.geometry)
    
    if (!coordString) return

    kml += `      <Placemark>
        <name>${escapeXML(name)}</name>
        <description>Country code: ${code}</description>
        <styleUrl>#visitedStyle</styleUrl>
        <Polygon>
          <outerBoundaryIs>
            <LinearRing>
              <coordinates>${coordString}</coordinates>
            </LinearRing>
          </outerBoundaryIs>
        </Polygon>
      </Placemark>
`
  })

  kml += `    </Folder>
    
    <!-- Wishlist Folder -->
    <Folder>
      <name>Wishlist Countries</name>
      <open>1</open>
`

  // Add wishlist countries placemarks
  countriesGeoJSON.features.forEach(feature => {
    const code = feature.properties.ISO_A2 || feature.properties.ISO_A3
    if (!wishlist.includes(code)) return

    const name = feature.properties.NAME || code
    const coordString = processGeometry(feature.geometry)
    
    if (!coordString) return

    kml += `      <Placemark>
        <name>${escapeXML(name)}</name>
        <description>Country code: ${code}</description>
        <styleUrl>#wishlistStyle</styleUrl>
        <Polygon>
          <outerBoundaryIs>
            <LinearRing>
              <coordinates>${coordString}</coordinates>
            </LinearRing>
          </outerBoundaryIs>
        </Polygon>
      </Placemark>
`
  })

  kml += `    </Folder>
  </Document>
</kml>`

  return kml
}

// Escape XML special characters
function escapeXML(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Simple version for testing (fallback)
export function generateKML(countryStatuses) {
  const visited = []
  const wishlist = []

  Object.entries(countryStatuses).forEach(([code, status]) => {
    if (status === 'visited') visited.push(code)
    if (status === 'wishlist') wishlist.push(code)
  })

  let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>MyCountries</name>
    <description>Countries I've visited and want to visit</description>
    
    <Style id="visitedStyle">
      <PolyStyle>
        <color>7d00ff00</color>
        <outline>1</outline>
      </PolyStyle>
    </Style>
    
    <Style id="wishlistStyle">
      <PolyStyle>
        <color>7d0088ff</color>
        <outline>1</outline>
      </PolyStyle>
    </Style>
    
    <Folder>
      <name>Visited Countries</name>
      <open>1</open>
`

  visited.forEach(code => {
    kml += `      <Placemark>
        <name>${code}</name>
        <styleUrl>#visitedStyle</styleUrl>
        <Point>
          <coordinates>0,0,0</coordinates>
        </Point>
      </Placemark>
`
  })

  kml += `    </Folder>
    <Folder>
      <name>Wishlist Countries</name>
      <open>1</open>
`

  wishlist.forEach(code => {
    kml += `      <Placemark>
        <name>${code}</name>
        <styleUrl>#wishlistStyle</styleUrl>
        <Point>
          <coordinates>0,0,0</coordinates>
        </Point>
      </Placemark>
`
  })

  kml += `    </Folder>
  </Document>
</kml>`

  return kml
}

