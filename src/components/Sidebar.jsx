import { useState, useMemo } from 'react'

function Sidebar({ countries, onCountrySelect, countryStatuses, visitedCountries, wishlistCountries, onRemoveCountry }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedContinent, setExpandedContinent] = useState(null)

  // Group countries by continent/region
  const countriesByRegion = useMemo(() => {
    if (!countries || !countries.features) return {}
    
    const regions = {
      'Europe': [],
      'Asia': [],
      'Africa': [],
      'North America': [],
      'South America': [],
      'Oceania': [],
      'Other': []
    }

    countries.features.forEach(feature => {
      if (!feature.properties) return
      const name = feature.properties.NAME || ''
      const code = feature.properties.ISO_A2 || feature.properties.ISO_A3
      
      // Simple region detection (can be improved)
      if (name.includes('United States') || name.includes('Canada') || name.includes('Mexico') || 
          name.includes('Cuba') || name.includes('Jamaica') || name.includes('Haiti')) {
        regions['North America'].push({ name, code })
      } else if (name.includes('Brazil') || name.includes('Argentina') || name.includes('Chile') ||
                 name.includes('Peru') || name.includes('Colombia') || name.includes('Venezuela')) {
        regions['South America'].push({ name, code })
      } else if (name.includes('Australia') || name.includes('New Zealand') || name.includes('Fiji') ||
                 name.includes('Papua')) {
        regions['Oceania'].push({ name, code })
      } else if (name.includes('China') || name.includes('Japan') || name.includes('India') ||
                 name.includes('Thailand') || name.includes('Vietnam') || name.includes('Indonesia') ||
                 name.includes('Korea') || name.includes('Philippines') || name.includes('Malaysia')) {
        regions['Asia'].push({ name, code })
      } else if (name.includes('Egypt') || name.includes('South Africa') || name.includes('Kenya') ||
                 name.includes('Nigeria') || name.includes('Morocco') || name.includes('Tunisia')) {
        regions['Africa'].push({ name, code })
      } else if (name.includes('France') || name.includes('Germany') || name.includes('Italy') ||
                 name.includes('Spain') || name.includes('United Kingdom') || name.includes('Greece') ||
                 name.includes('Portugal') || name.includes('Netherlands') || name.includes('Belgium') ||
                 name.includes('Switzerland') || name.includes('Austria') || name.includes('Poland') ||
                 name.includes('Sweden') || name.includes('Norway') || name.includes('Denmark') ||
                 name.includes('Finland') || name.includes('Ireland') || name.includes('Iceland')) {
        regions['Europe'].push({ name, code })
      } else {
        regions['Other'].push({ name, code })
      }
    })

    // Sort each region
    Object.keys(regions).forEach(region => {
      regions[region].sort((a, b) => a.name.localeCompare(b.name))
    })

    return regions
  }, [countries])

  const filteredCountries = useMemo(() => {
    if (!searchQuery || !countries || !countries.features) return []
    
    const query = searchQuery.toLowerCase().trim()
    if (query.length === 0) return []
    
    return countries.features
      .filter(feature => {
        if (!feature.properties) return false
        const name = (feature.properties.NAME || '').toLowerCase()
        const code = (feature.properties.ISO_A2 || feature.properties.ISO_A3 || '').toLowerCase()
        return name.includes(query) || code.includes(query)
      })
      .map(feature => ({
        name: feature.properties.NAME || '',
        code: feature.properties.ISO_A2 || feature.properties.ISO_A3
      }))
      .slice(0, 20)
  }, [searchQuery, countries])

  const getCountryName = (code) => {
    if (!countries) return code
    const feature = countries.features.find(f => 
      (f.properties.ISO_A2 || f.properties.ISO_A3) === code
    )
    return feature?.properties.NAME || code
  }

  return (
    <div style={{
      width: '280px',
      height: 'calc(100vh - 60px)',
      background: '#f8f9fa',
      borderRight: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Click to add section */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e0e0e0',
        background: 'white'
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '12px',
          color: '#333'
        }}>
          Click to add
        </h3>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            outline: 'none'
          }}
        />
      </div>

      {/* Search results or region list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px'
      }}>
        {searchQuery.length > 0 ? (
          <div>
            {filteredCountries.map((country, idx) => {
              if (!country.code) return null
              const status = countryStatuses[country.code]
              return (
                <div
                  key={country.code}
                  onClick={() => {
                    onCountrySelect(country.code)
                    setSearchQuery('')
                  }}
                  style={{
                    padding: '10px 12px',
                    marginBottom: '4px',
                    background: status ? (status === 'visited' ? '#e8f5e9' : '#fff3e0') : 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: `1px solid ${status ? (status === 'visited' ? '#00ff00' : '#ff8800') : '#e0e0e0'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0f0f0'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = status ? (status === 'visited' ? '#e8f5e9' : '#fff3e0') : 'white'
                  }}
                >
                  <span style={{ fontSize: '14px' }}>{country.name}</span>
                  {status && (
                    <span style={{
                      fontSize: '12px',
                      color: status === 'visited' ? '#00ff00' : '#ff8800',
                      fontWeight: 'bold'
                    }}>
                      {status === 'visited' ? '✓' : '⭐'}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div>
            {Object.entries(countriesByRegion).map(([region, countries]) => (
              <div key={region}>
                <div
                  onClick={() => setExpandedContinent(expandedContinent === region ? null : region)}
                  style={{
                    padding: '10px 12px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    color: '#666',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    userSelect: 'none'
                  }}
                >
                  <span>{region}</span>
                  <span>{expandedContinent === region ? '▼' : '▶'}</span>
                </div>
                {expandedContinent === region && countries.length > 0 && (
                  <div style={{ paddingLeft: '8px' }}>
                    {countries.slice(0, 10).map(country => {
                      if (!country.code) return null
                      const status = countryStatuses[country.code]
                      return (
                        <div
                          key={country.code}
                          onClick={() => onCountrySelect(country.code)}
                          style={{
                            padding: '8px 12px',
                            marginBottom: '2px',
                            background: status ? (status === 'visited' ? '#e8f5e9' : '#fff3e0') : 'white',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f0f0f0'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = status ? (status === 'visited' ? '#e8f5e9' : '#fff3e0') : 'white'
                          }}
                        >
                          {country.name}
                        </div>
                      )
                    })}
                    {countries.length > 10 && (
                      <div style={{
                        padding: '8px 12px',
                        fontSize: '12px',
                        color: '#999',
                        fontStyle: 'italic'
                      }}>
                        +{countries.length - 10} more...
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visited list */}
      {(visitedCountries.length > 0 || wishlistCountries.length > 0) && (
        <div style={{
          borderTop: '1px solid #e0e0e0',
          background: 'white',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {visitedCountries.length > 0 && (
            <div style={{ padding: '12px' }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: '#333'
              }}>
                Visited ({visitedCountries.length})
              </div>
              {visitedCountries.map(code => (
                <div
                  key={code}
                  style={{
                    padding: '6px 8px',
                    marginBottom: '4px',
                    background: '#e8f5e9',
                    borderRadius: '4px',
                    fontSize: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{getCountryName(code)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveCountry(code)
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#666',
                      padding: '2px 6px'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {wishlistCountries.length > 0 && (
            <div style={{ padding: '12px', borderTop: '1px solid #e0e0e0' }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: '#333'
              }}>
                Wishlist ({wishlistCountries.length})
              </div>
              {wishlistCountries.map(code => (
                <div
                  key={code}
                  style={{
                    padding: '6px 8px',
                    marginBottom: '4px',
                    background: '#fff3e0',
                    borderRadius: '4px',
                    fontSize: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{getCountryName(code)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveCountry(code)
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#666',
                      padding: '2px 6px'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Sidebar

