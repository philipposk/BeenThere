import { useState, useMemo } from 'react'

function SearchBar({ countries, searchQuery, onSearchChange, onCountrySelect, countryStatuses }) {
  const [isOpen, setIsOpen] = useState(false)

  const filteredCountries = useMemo(() => {
    if (!searchQuery || !countries) return []
    
    const query = searchQuery.toLowerCase()
    return countries.features
      .filter(feature => {
        const name = (feature.properties.NAME || '').toLowerCase()
        const code = (feature.properties.ISO_A2 || feature.properties.ISO_A3 || '').toLowerCase()
        return name.includes(query) || code.includes(query)
      })
      .slice(0, 10) // Limit to 10 results
  }, [searchQuery, countries])

  const handleSelect = (code) => {
    onCountrySelect(code)
    setIsOpen(false)
    onSearchChange('')
  }

  return (
    <div style={{
      position: 'relative',
      zIndex: 1001,
      padding: '8px 16px',
      background: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <input
        type="text"
        placeholder="🔍 Search countries..."
        value={searchQuery}
        onChange={(e) => {
          onSearchChange(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: '16px',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          outline: 'none',
          transition: 'border-color 0.2s'
        }}
        onBlur={() => {
          // Delay to allow click events
          setTimeout(() => setIsOpen(false), 200)
        }}
      />
      
      {isOpen && filteredCountries.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '16px',
          right: '16px',
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          maxHeight: '300px',
          overflowY: 'auto',
          marginTop: '4px',
          zIndex: 1002
        }}>
          {filteredCountries.map((feature, idx) => {
            const code = feature.properties.ISO_A2 || feature.properties.ISO_A3
            const name = feature.properties.NAME || code
            const status = countryStatuses[code]
            
            return (
              <div
                key={idx}
                onClick={() => handleSelect(code)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: idx < filteredCountries.length - 1 ? '1px solid #f0f0f0' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.background = 'white'}
              >
                <span style={{ fontWeight: '500' }}>{name}</span>
                {status && (
                  <span style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: status === 'visited' ? '#00ff00' : '#ff8800',
                    color: '#000',
                    fontWeight: 'bold'
                  }}>
                    {status === 'visited' ? '✓' : '⭐'}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SearchBar

