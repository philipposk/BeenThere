// Load Natural Earth countries GeoJSON
export async function loadCountryData() {
  try {
    // Option 1: Load from CDN (simpler for MVP)
    // Using a reliable GeoJSON source
    const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
    
    if (!response.ok) {
      throw new Error('Failed to fetch country data')
    }
    
    const data = await response.json()
    
    // Validate data structure
    if (!data.features || !Array.isArray(data.features)) {
      throw new Error('Invalid GeoJSON structure')
    }
    
    return data
  } catch (error) {
    console.error('Failed to load country data:', error)
    
    // Fallback: return minimal GeoJSON structure
    return {
      type: 'FeatureCollection',
      features: []
    }
  }
}

// Alternative: Load from local file (better for production)
// Place countries.geojson in public/data/ folder
export async function loadCountryDataLocal() {
  try {
    const response = await fetch('/data/countries.geojson')
    if (!response.ok) {
      throw new Error('Local file not found')
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to load local country data:', error)
    return loadCountryData() // Fallback to CDN
  }
}

