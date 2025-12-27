import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function MapController({ countryStatuses, selectedCountry, searchQuery }) {
  const map = useMap()

  useEffect(() => {
    // Fit world view on load
    if (!selectedCountry) {
      map.setView([20, 0], 2)
    }
  }, [map, selectedCountry])

  return null
}

function MapView({ countries, countryStatuses, onCountryClick, onCountrySelect, selectedCountry, searchQuery }) {
  const geoJsonRef = useRef(null)
  const mapRef = useRef(null)

  const getCountryColor = (countryCode) => {
    const status = countryStatuses[countryCode]
    switch (status) {
      case 'visited': return '#00ff00' // Green
      case 'wishlist': return '#ff8800' // Orange
      default: return '#cccccc' // Gray
    }
  }

  const countryStyle = (feature) => {
    const code = feature.properties.ISO_A2 || feature.properties.ISO_A3
    const isSelected = code === selectedCountry
    const isSearched = searchQuery && (
      (feature.properties.NAME || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    return {
      fillColor: getCountryColor(code),
      fillOpacity: isSelected ? 0.9 : isSearched ? 0.8 : 0.6,
      color: isSelected ? '#0000ff' : '#666',
      weight: isSelected ? 3 : isSearched ? 2 : 1,
      opacity: isSelected ? 1 : 0.8
    }
  }

  const onEachCountry = (feature, layer) => {
    const code = feature.properties.ISO_A2 || feature.properties.ISO_A3
    const name = feature.properties.NAME || code
    
    layer.bindTooltip(name, {
      permanent: false,
      direction: 'top',
      className: 'country-tooltip'
    })
    
    layer.on({
      click: () => {
        onCountryClick(code)
        onCountrySelect(code)
      },
      mouseover: (e) => {
        const layer = e.target
        layer.setStyle({
          weight: 3,
          opacity: 1,
          fillOpacity: 0.8
        })
      },
      mouseout: (e) => {
        if (geoJsonRef.current) {
          geoJsonRef.current.resetStyle(e.target)
        }
      }
    })
  }

  // Zoom to selected country
  useEffect(() => {
    if (selectedCountry && countries && mapRef.current) {
      const feature = countries.features.find(f => 
        (f.properties.ISO_A2 || f.properties.ISO_A3) === selectedCountry
      )
      if (feature && feature.geometry) {
        const geoJsonLayer = L.geoJSON(feature)
        const bounds = geoJsonLayer.getBounds()
        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 })
        }
      }
    }
  }, [selectedCountry, countries])

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 200px)', position: 'relative' }}>
      <MapContainer
        ref={mapRef}
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
        whenCreated={(map) => { mapRef.current = map }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON
          ref={geoJsonRef}
          data={countries}
          style={countryStyle}
          onEachFeature={onEachCountry}
        />
        <MapController 
          countryStatuses={countryStatuses} 
          selectedCountry={selectedCountry}
          searchQuery={searchQuery}
        />
      </MapContainer>
    </div>
  )
}

export default MapView

