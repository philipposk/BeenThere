import { useState } from 'react'
import { generateKMLWithPolygons } from '../utils/kmlGenerator'
import { uploadToDrive, openMyMaps } from '../utils/googleDrive'

function DriveUpload({ countryStatuses, countries }) {
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [error, setError] = useState(null)

  const handleUpload = async () => {
    setUploading(true)
    setError(null)
    try {
      if (!countries) {
        throw new Error('Country data not loaded')
      }
      const kml = await generateKMLWithPolygons(countryStatuses, countries)
      const fileId = await uploadToDrive(kml, 'MyCountries.kml')
      setUploaded(true)
      console.log('Uploaded to Drive:', fileId)
    } catch (error) {
      console.error('Upload failed:', error)
      setError(error.message || 'Upload failed. Please check Google Drive permissions.')
    } finally {
      setUploading(false)
    }
  }

  const handleOpenMyMaps = () => {
    openMyMaps()
  }

  const visitedCount = Object.values(countryStatuses).filter(s => s === 'visited').length
  const wishlistCount = Object.values(countryStatuses).filter(s => s === 'wishlist').length

  return (
    <div style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      background: 'white',
      padding: '12px 16px',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      borderTop: '1px solid #e0e0e0'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <div style={{ fontSize: '14px', color: '#666' }}>
          ✓ <strong>{visitedCount}</strong> visited | 
          ⭐ <strong>{wishlistCount}</strong> wishlist
        </div>
      </div>
      
      {error && (
        <div style={{
          padding: '12px',
          background: '#ffebee',
          color: '#c62828',
          borderRadius: '6px',
          marginBottom: '12px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleUpload}
          disabled={uploading || (visitedCount === 0 && wishlistCount === 0)}
          style={{
            flex: 1,
            padding: '12px',
            background: uploading ? '#ccc' : (visitedCount === 0 && wishlistCount === 0) ? '#e0e0e0' : '#1a73e8',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: (uploading || (visitedCount === 0 && wishlistCount === 0)) ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {uploading ? '⏳ Uploading...' : '📤 Upload to Drive'}
        </button>
        
        {uploaded && (
          <button
            onClick={handleOpenMyMaps}
            style={{
              flex: 1,
              padding: '12px',
              background: '#34a853',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#2d8f47'}
            onMouseLeave={(e) => e.target.style.background = '#34a853'}
          >
            🗺️ Open My Maps
          </button>
        )}
      </div>

      {uploaded && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: '#e8f5e9',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#2e7d32'
        }}>
          <strong>📋 Next steps:</strong>
          <ol style={{ marginTop: '8px', paddingLeft: '20px', lineHeight: '1.6' }}>
            <li>Click "Open My Maps" above</li>
            <li>Create a new map (or open existing)</li>
            <li>Click "Import" → Select "MyCountries.kml"</li>
            <li>View in Google Maps app!</li>
          </ol>
        </div>
      )}
    </div>
  )
}

export default DriveUpload

