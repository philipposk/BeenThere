import { useState, useMemo } from 'react'

function Sidebar({ countries, onCountrySelect, countryStatuses, visitedCountries, wishlistCountries, onRemoveCountry }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedContinent, setExpandedContinent] = useState(null)

  // Better region detection using continent codes or name patterns
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

    // Common country patterns by region
    const regionPatterns = {
      'Europe': [
        'Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia', 'Bulgaria',
        'Croatia', 'Cyprus', 'Czech', 'Denmark', 'Estonia', 'Finland', 'France',
        'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Latvia',
        'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 'Monaco',
        'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland',
        'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia',
        'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom',
        'Vatican', 'Albania', 'Belarus', 'Croatia', 'Estonia', 'Latvia', 'Lithuania'
      ],
      'Asia': [
        'Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan',
        'Brunei', 'Cambodia', 'China', 'Georgia', 'India', 'Indonesia', 'Iran',
        'Iraq', 'Israel', 'Japan', 'Jordan', 'Kazakhstan', 'Kuwait', 'Kyrgyzstan',
        'Laos', 'Lebanon', 'Malaysia', 'Maldives', 'Mongolia', 'Myanmar', 'Nepal',
        'North Korea', 'Oman', 'Pakistan', 'Palestine', 'Philippines', 'Qatar',
        'Saudi Arabia', 'Singapore', 'South Korea', 'Sri Lanka', 'Syria', 'Taiwan',
        'Tajikistan', 'Thailand', 'Turkey', 'Turkmenistan', 'United Arab Emirates',
        'Uzbekistan', 'Vietnam', 'Yemen'
      ],
      'Africa': [
        'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi',
        'Cameroon', 'Cape Verde', 'Central African Republic', 'Chad', 'Comoros',
        'Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini',
        'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast',
        'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali',
        'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger',
        'Nigeria', 'Rwanda', 'Sao Tome', 'Senegal', 'Seychelles', 'Sierra Leone',
        'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo',
        'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'
      ],
      'North America': [
        'Antigua', 'Bahamas', 'Barbados', 'Belize', 'Canada', 'Costa Rica', 'Cuba',
        'Dominica', 'Dominican Republic', 'El Salvador', 'Grenada', 'Guatemala',
        'Haiti', 'Honduras', 'Jamaica', 'Mexico', 'Nicaragua', 'Panama',
        'Saint Kitts', 'Saint Lucia', 'Saint Vincent', 'Trinidad', 'United States'
      ],
      'South America': [
        'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana',
        'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela'
      ],
      'Oceania': [
        'Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru',
        'New Zealand', 'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands',
        'Tonga', 'Tuvalu', 'Vanuatu'
      ]
    }

    countries.features.forEach(feature => {
      if (!feature.properties) return
      const name = feature.properties.NAME || ''
      const code = feature.properties.ISO_A2 || feature.properties.ISO_A3
      
      if (!name || !code) return
      
      // Try to match by region patterns
      let matched = false
      for (const [region, patterns] of Object.entries(regionPatterns)) {
        if (patterns.some(pattern => name.includes(pattern) || name === pattern)) {
          regions[region].push({ name, code })
          matched = true
          break
        }
      }
      
      // If no match, check common patterns
      if (!matched) {
        if (name.includes('United States') || name.includes('USA') || code === 'US') {
          regions['North America'].push({ name, code })
        } else if (name.includes('United Kingdom') || name.includes('UK') || code === 'GB') {
          regions['Europe'].push({ name, code })
        } else {
          regions['Other'].push({ name, code })
        }
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
      .filter(country => country.name && country.code)
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
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country, idx) => {
                if (!country.code) return null
                const status = countryStatuses[country.code]
                return (
                  <div
                    key={`${country.code}-${idx}`}
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
              })
            ) : (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: '#999',
                fontSize: '14px'
              }}>
                No countries found
              </div>
            )}
          </div>
        ) : (
          <div>
            {Object.entries(countriesByRegion).map(([region, regionCountries]) => {
              if (regionCountries.length === 0) return null
              return (
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
                      userSelect: 'none',
                      background: expandedContinent === region ? '#e9ecef' : 'transparent',
                      borderRadius: '4px',
                      marginBottom: '2px'
                    }}
                    onMouseEnter={(e) => {
                      if (expandedContinent !== region) {
                        e.currentTarget.style.background = '#f0f0f0'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (expandedContinent !== region) {
                        e.currentTarget.style.background = 'transparent'
                      }
                    }}
                  >
                    <span>{region} ({regionCountries.length})</span>
                    <span>{expandedContinent === region ? '▼' : '▶'}</span>
                  </div>
                  {expandedContinent === region && regionCountries.length > 0 && (
                    <div style={{ paddingLeft: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                      {regionCountries.map(country => {
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
                              transition: 'all 0.2s',
                              border: status ? `1px solid ${status === 'visited' ? '#00ff00' : '#ff8800'}` : '1px solid transparent'
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
                    </div>
                  )}
                </div>
              )
            })}
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
