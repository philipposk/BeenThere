import { useMemo } from 'react'

function StatsDashboard({ countryStatuses, countries, onCountrySelect }) {
  const stats = useMemo(() => {
    const visited = Object.entries(countryStatuses)
      .filter(([_, status]) => status === 'visited')
      .map(([code]) => code)
    
    const wishlist = Object.entries(countryStatuses)
      .filter(([_, status]) => status === 'wishlist')
      .map(([code]) => code)

    const totalCountries = countries?.features?.length || 195
    const visitedPercent = ((visited.length / totalCountries) * 100).toFixed(1)

    return {
      visited,
      wishlist,
      visitedCount: visited.length,
      wishlistCount: wishlist.length,
      visitedPercent,
      totalCountries
    }
  }, [countryStatuses, countries])

  const getCountryName = (code) => {
    if (!countries) return code
    const feature = countries.features.find(f => 
      (f.properties.ISO_A2 || f.properties.ISO_A3) === code
    )
    return feature?.properties.NAME || code
  }

  return (
    <div style={{
      height: 'calc(100vh - 200px)',
      overflowY: 'auto',
      padding: '16px',
      background: '#f5f5f5'
    }}>
      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #00ff00 0%, #00cc00 100%)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>
            {stats.visitedCount}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Visited</div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #ff8800 0%, #ff6600 100%)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>
            {stats.wishlistCount}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Wishlist</div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>
            {stats.visitedPercent}%
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Of World</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>
          World Coverage
        </div>
        <div style={{
          width: '100%',
          height: '24px',
          background: '#e0e0e0',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            width: `${stats.visitedPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #00ff00 0%, #00cc00 100%)',
            transition: 'width 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '8px',
            color: '#000',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {stats.visitedPercent > 5 && `${stats.visitedPercent}%`}
          </div>
        </div>
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
          {stats.visitedCount} of {stats.totalCountries} countries
        </div>
      </div>

      {/* Visited Countries List */}
      {stats.visited.length > 0 && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>
            ✓ Visited Countries ({stats.visited.length})
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '8px'
          }}>
            {stats.visited.map(code => (
              <div
                key={code}
                onClick={() => onCountrySelect(code)}
                style={{
                  padding: '8px 12px',
                  background: '#e8f5e9',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  border: '1px solid #c8e6c9'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#c8e6c9'
                  e.target.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#e8f5e9'
                  e.target.style.transform = 'scale(1)'
                }}
              >
                {getCountryName(code)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wishlist Countries List */}
      {stats.wishlist.length > 0 && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>
            ⭐ Wishlist Countries ({stats.wishlist.length})
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '8px'
          }}>
            {stats.wishlist.map(code => (
              <div
                key={code}
                onClick={() => onCountrySelect(code)}
                style={{
                  padding: '8px 12px',
                  background: '#fff3e0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  border: '1px solid #ffcc80'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#ffcc80'
                  e.target.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#fff3e0'
                  e.target.style.transform = 'scale(1)'
                }}
              >
                {getCountryName(code)}
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.visited.length === 0 && stats.wishlist.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#999'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>No countries marked yet</div>
          <div style={{ fontSize: '14px' }}>Tap countries on the map to get started!</div>
        </div>
      )}
    </div>
  )
}

export default StatsDashboard

