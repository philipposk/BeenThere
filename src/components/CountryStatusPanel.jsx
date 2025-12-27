function CountryStatusPanel({ selectedCountry, countryStatuses, onStatusChange, countries }) {
  if (!selectedCountry) return null

  const isVisited = countryStatuses[selectedCountry] === 'visited'
  const isWishlist = countryStatuses[selectedCountry] === 'wishlist'
  
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

  const handleVisitedToggle = () => {
    if (isVisited) {
      // If visited, remove it
      onStatusChange(selectedCountry, 'none')
    } else {
      // If not visited, set it (and remove wishlist if it was set)
      onStatusChange(selectedCountry, 'visited')
    }
  }

  const handleWishlistToggle = () => {
    if (isWishlist) {
      // If wishlist, remove it
      onStatusChange(selectedCountry, 'none')
    } else {
      // If not wishlist, set it (and remove visited if it was set)
      onStatusChange(selectedCountry, 'wishlist')
    }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      right: '20px',
      background: 'white',
      padding: '20px 24px',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      zIndex: 1000,
      minWidth: '280px',
      maxWidth: '90%',
      textAlign: 'left'
    }}>
      <h3 style={{ 
        marginBottom: '20px', 
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center'
      }}>
        {countryName}
      </h3>
      
      {/* Visited Checkbox */}
      <label style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px',
        marginBottom: '12px',
        borderRadius: '10px',
        cursor: 'pointer',
        background: isVisited ? '#e8f5e9' : '#f5f5f5',
        border: `2px solid ${isVisited ? '#00ff00' : '#e0e0e0'}`,
        transition: 'all 0.2s',
        userSelect: 'none'
      }}
      onMouseEnter={(e) => {
        if (!isVisited) {
          e.currentTarget.style.background = '#f0f0f0'
        }
      }}
      onMouseLeave={(e) => {
        if (!isVisited) {
          e.currentTarget.style.background = '#f5f5f5'
        }
      }}
      >
        <input
          type="checkbox"
          checked={isVisited}
          onChange={handleVisitedToggle}
          style={{
            width: '24px',
            height: '24px',
            marginRight: '12px',
            cursor: 'pointer',
            accentColor: '#00ff00'
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: isVisited ? '#000' : '#666',
            marginBottom: '2px'
          }}>
            ✓ Visited
          </div>
          <div style={{
            fontSize: '12px',
            color: '#999'
          }}>
            Mark as visited
          </div>
        </div>
        {isVisited && (
          <span style={{
            fontSize: '20px',
            marginLeft: '8px'
          }}>✓</span>
        )}
      </label>

      {/* Wishlist Checkbox */}
      <label style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px',
        borderRadius: '10px',
        cursor: 'pointer',
        background: isWishlist ? '#fff3e0' : '#f5f5f5',
        border: `2px solid ${isWishlist ? '#ff8800' : '#e0e0e0'}`,
        transition: 'all 0.2s',
        userSelect: 'none'
      }}
      onMouseEnter={(e) => {
        if (!isWishlist) {
          e.currentTarget.style.background = '#f0f0f0'
        }
      }}
      onMouseLeave={(e) => {
        if (!isWishlist) {
          e.currentTarget.style.background = '#f5f5f5'
        }
      }}
      >
        <input
          type="checkbox"
          checked={isWishlist}
          onChange={handleWishlistToggle}
          style={{
            width: '24px',
            height: '24px',
            marginRight: '12px',
            cursor: 'pointer',
            accentColor: '#ff8800'
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: isWishlist ? '#000' : '#666',
            marginBottom: '2px'
          }}>
            ⭐ Wishlist
          </div>
          <div style={{
            fontSize: '12px',
            color: '#999'
          }}>
            Want to visit
          </div>
        </div>
        {isWishlist && (
          <span style={{
            fontSize: '20px',
            marginLeft: '8px'
          }}>⭐</span>
        )}
      </label>
    </div>
  )
}

export default CountryStatusPanel

