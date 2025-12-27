function CountryStatusPanel({ selectedCountry, countryStatuses, onStatusChange, countries }) {
  if (!selectedCountry) return null

  const currentStatus = countryStatuses[selectedCountry] || 'none'
  
  // Get country name
  let countryName = selectedCountry
  if (countries) {
    const feature = countries.features.find(f => 
      (f.properties.ISO_A2 || f.properties.ISO_A3) === selectedCountry
    )
    if (feature) {
      countryName = feature.properties.NAME || countryName
    }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '120px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'white',
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      zIndex: 1000,
      minWidth: '280px',
      maxWidth: '90%',
      textAlign: 'center'
    }}>
      <h3 style={{ 
        marginBottom: '12px', 
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333'
      }}>
        {countryName}
      </h3>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => onStatusChange(selectedCountry, 'visited')}
          style={{
            padding: '10px 20px',
            background: currentStatus === 'visited' ? '#00ff00' : '#e0e0e0',
            color: currentStatus === 'visited' ? '#000' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          ✓ Visited
        </button>
        <button
          onClick={() => onStatusChange(selectedCountry, 'wishlist')}
          style={{
            padding: '10px 20px',
            background: currentStatus === 'wishlist' ? '#ff8800' : '#e0e0e0',
            color: currentStatus === 'wishlist' ? '#000' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          ⭐ Wishlist
        </button>
        {currentStatus !== 'none' && (
          <button
            onClick={() => onStatusChange(selectedCountry, 'none')}
            style={{
              padding: '10px 16px',
              background: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

export default CountryStatusPanel

