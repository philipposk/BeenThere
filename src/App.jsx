import { useState, useEffect } from 'react'
import MapView from './components/MapView'
import CountryStatusPanel from './components/CountryStatusPanel'
import DriveUpload from './components/DriveUpload'
import StatsDashboard from './components/StatsDashboard'
import SearchBar from './components/SearchBar'
import { loadCountryData } from './utils/countryData'

function App() {
  const [countryStatuses, setCountryStatuses] = useState({})
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [countries, setCountries] = useState(null)
  const [showStats, setShowStats] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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

  const handleSearchSelect = (countryCode) => {
    setSelectedCountry(countryCode)
    setSearchQuery('')
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
        <p>Tap countries to mark as visited or wishlist</p>
      </header>

      {showStats ? (
        <StatsDashboard 
          countryStatuses={countryStatuses} 
          countries={countries}
          onCountrySelect={handleCountrySelect}
        />
      ) : (
        <>
          <SearchBar
            countries={countries}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCountrySelect={handleSearchSelect}
            countryStatuses={countryStatuses}
          />
          <MapView
            countries={countries}
            countryStatuses={countryStatuses}
            onCountryClick={handleCountryClick}
            onCountrySelect={handleCountrySelect}
            selectedCountry={selectedCountry}
            searchQuery={searchQuery}
          />
        </>
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

