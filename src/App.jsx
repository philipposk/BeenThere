import { useState, useEffect, useMemo } from 'react'
import MapView from './components/MapView'
import CountryStatusPanel from './components/CountryStatusPanel'
import DriveUpload from './components/DriveUpload'
import StatsDashboard from './components/StatsDashboard'
import Sidebar from './components/Sidebar'
import { loadCountryData } from './utils/countryData'

function App() {
  const [countryStatuses, setCountryStatuses] = useState({})
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [countries, setCountries] = useState(null)
  const [showStats, setShowStats] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    // Load saved statuses from localStorage
    const saved = localStorage.getItem('countryStatuses')
    if (saved) {
      try {
        setCountryStatuses(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved data:', e)
      }
    }

    // Load country GeoJSON data
    loadCountryData().then(setCountries)
  }, [])

  useEffect(() => {
    // Persist to localStorage
    if (Object.keys(countryStatuses).length > 0) {
      localStorage.setItem('countryStatuses', JSON.stringify(countryStatuses))
    }
  }, [countryStatuses])

  const handleCountryClick = (countryCode) => {
    // Just select the country, don't change status on click
    // User will use checkboxes in the panel
    setSelectedCountry(countryCode)
  }

  const handleCountrySelect = (countryCode) => {
    setSelectedCountry(countryCode)
  }

  const visitedCountries = useMemo(() => {
    return Object.entries(countryStatuses)
      .filter(([_, status]) => status === 'visited')
      .map(([code]) => code)
  }, [countryStatuses])

  const wishlistCountries = useMemo(() => {
    return Object.entries(countryStatuses)
      .filter(([_, status]) => status === 'wishlist')
      .map(([code]) => code)
  }, [countryStatuses])

  const handleRemoveCountry = (code) => {
    setCountryStatuses(prev => {
      const newStatuses = { ...prev }
      delete newStatuses[code]
      return newStatuses
    })
  }

  if (!countries) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div className="spinner"></div>
        <div>Loading map data...</div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>🌍 BeenThere</h1>
          <button
            onClick={() => setShowStats(!showStats)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {showStats ? '🗺️ Map' : '📊 Stats'}
          </button>
        </div>
        <p>Click countries on the map or search to add them</p>
      </header>

      {showStats ? (
        <StatsDashboard 
          countryStatuses={countryStatuses} 
          countries={countries}
          onCountrySelect={handleCountrySelect}
        />
      ) : (
        <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
          {sidebarOpen && (
            <Sidebar
              countries={countries}
              onCountrySelect={handleCountrySelect}
              countryStatuses={countryStatuses}
              visitedCountries={visitedCountries}
              wishlistCountries={wishlistCountries}
              onRemoveCountry={handleRemoveCountry}
            />
          )}
          <div style={{ flex: 1, position: 'relative' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                position: 'absolute',
                top: '10px',
                left: sidebarOpen ? '290px' : '10px',
                zIndex: 1000,
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '6px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'left 0.3s'
              }}
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
            <MapView
              countries={countries}
              countryStatuses={countryStatuses}
              onCountryClick={handleCountryClick}
              onCountrySelect={handleCountrySelect}
              selectedCountry={selectedCountry}
              searchQuery=""
            />
          </div>
        </div>
      )}

      <CountryStatusPanel
        selectedCountry={selectedCountry}
        countryStatuses={countryStatuses}
        onStatusChange={(code, status) => {
          setCountryStatuses(prev => ({
            ...prev,
            [code]: status === 'none' ? undefined : status
          }))
        }}
        countries={countries}
      />

      <DriveUpload 
        countryStatuses={countryStatuses} 
        countries={countries}
      />
    </div>
  )
}

export default App

