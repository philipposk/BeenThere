import { useState, useMemo, useRef, useEffect } from 'react'

function SearchBar({ countries, searchQuery, onSearchChange, onCountrySelect, countryStatuses }) {
  const [isOpen, setIsOpen] = useState(false)
  const searchRef = useRef(null)
  const dropdownRef = useRef(null)

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
      .slice(0, 10) // Limit to 10 results
  }, [searchQuery, countries])

  const handleSelect = (code) => {
    if (code) {
      onCountrySelect(code)
      setIsOpen(false)
      onSearchChange('')
      if (searchRef.current) {
        searchRef.current.blur()
      }
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div style={{
      position: 'relative',
      zIndex: 1001,
      padding: '8px 16px',
      background: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <input
        ref={searchRef}
        type="text"
        placeholder="🔍 Search countries..."
        value={searchQuery}
        onChange={(e) => {
          const value = e.target.value
          onSearchChange(value)
          setIsOpen(value.length > 0)
        }}
        onFocus={() => {
          if (searchQuery.length > 0) {
            setIsOpen(true)
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setIsOpen(false)
            searchRef.current?.blur()
          } else if (e.key === 'Enter' && filteredCountries.length > 0) {
            const firstCode = filteredCountries[0].properties.ISO_A2 || filteredCountries[0].properties.ISO_A3
            if (firstCode) {
              handleSelect(firstCode)
            }
          }
        }}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: '16px',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          outline: 'none',
          transition: 'border-color 0.2s'
        }}
      />
      
      {isOpen && filteredCountries.length > 0 && (
        <div
          ref={dropdownRef}
          style={{
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
          }}
        >
          {filteredCountries.map((feature, idx) => {
            if (!feature.properties) return null
            const code = feature.properties.ISO_A2 || feature.properties.ISO_A3
            const name = feature.properties.NAME || code
            const status = countryStatuses[code]
            
            if (!code) return null
            
            return (
              <div
                key={`${code}-${idx}`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleSelect(code)
                }}
                onMouseDown={(e) => {
                  e.preventDefault() // Prevent blur
                }}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: idx < filteredCountries.length - 1 ? '1px solid #f0f0f0' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background 0.2s',
                  background: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f5f5f5'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white'
                }}
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
      
      {isOpen && searchQuery.length > 0 && filteredCountries.length === 0 && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: '16px',
            right: '16px',
            background: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            marginTop: '4px',
            zIndex: 1002,
            padding: '16px',
            textAlign: 'center',
            color: '#999'
          }}
        >
          No countries found
        </div>
      )}
    </div>
  )
}

export default SearchBar
