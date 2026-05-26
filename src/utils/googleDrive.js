// Google Drive API configuration
// Replace these with your actual credentials from Google Cloud Console
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || 'YOUR_GOOGLE_API_KEY'
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
const SCOPES = 'https://www.googleapis.com/auth/drive.file'

let gapiLoaded = false
let tokenClient = null

export function initGoogleAPI() {
  return new Promise((resolve, reject) => {
    if (gapiLoaded && tokenClient) {
      resolve()
      return
    }

    // Load GAPI script
    if (window.gapi) {
      loadGSI()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.onload = () => {
      window.gapi.load('client', () => {
        window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: DISCOVERY_DOCS,
        }).then(() => {
          gapiLoaded = true
          loadGSI()
        }).catch(reject)
      })
    }
    script.onerror = reject
    document.head.appendChild(script)

    function loadGSI() {
      if (window.google?.accounts?.oauth2) {
        initTokenClient()
        resolve()
        return
      }

      const gsiScript = document.createElement('script')
      gsiScript.src = 'https://accounts.google.com/gsi/client'
      gsiScript.onload = () => {
        initTokenClient()
        resolve()
      }
      gsiScript.onerror = reject
      document.head.appendChild(gsiScript)
    }

    function initTokenClient() {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: () => {}
      })
    }
  })
}

export async function uploadToDrive(kmlContent, filename) {
  await initGoogleAPI()

  return new Promise((resolve, reject) => {
    // Check if already authorized
    const token = window.gapi.client.getToken()
    
    if (token === null) {
      // Request authorization
      tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
          reject(new Error(resp.error))
          return
        }
        try {
          await uploadFile(kmlContent, filename, resolve, reject)
        } catch (error) {
          reject(error)
        }
      }
      tokenClient.requestAccessToken({ prompt: 'consent' })
    } else {
      uploadFile(kmlContent, filename, resolve, reject)
    }
  })
}

async function uploadFile(kmlContent, filename, resolve, reject) {
  try {
    const token = window.gapi.client.getToken()
    if (!token) {
      reject(new Error('Not authenticated'))
      return
    }

    // Check if file exists
    let fileId = null
    try {
      const response = await window.gapi.client.drive.files.list({
        q: `name='${filename}' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive'
      })
      
      if (response.result.files && response.result.files.length > 0) {
        fileId = response.result.files[0].id
      }
    } catch (e) {
      console.warn('Could not check for existing file:', e)
    }

    const file = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' })
    const metadata = {
      name: filename,
      mimeType: 'application/vnd.google-earth.kml+xml'
    }

    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    form.append('file', file)

    if (fileId) {
      // Update existing file
      const response = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token.access_token}`
          },
          body: form
        }
      )
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Upload failed: ${error}`)
      }
      
      const result = await response.json()
      resolve(result.id)
    } else {
      // Create new file
      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token.access_token}`
          },
          body: form
        }
      )
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Upload failed: ${error}`)
      }
      
      const result = await response.json()
      resolve(result.id)
    }
  } catch (error) {
    reject(error)
  }
}

/**
 * Upload arbitrary JSON content to Drive — used for state sync.
 * @param {object} obj  Plain JSON-serializable object.
 * @param {string} filename
 */
export async function uploadJSONToDrive(obj, filename = 'BeenThereState.json') {
  await initGoogleAPI()
  return new Promise((resolve, reject) => {
    const token = window.gapi.client.getToken()
    const body = JSON.stringify(obj)
    const run = () => uploadJSONFile(body, filename, resolve, reject)
    if (!token) {
      tokenClient.callback = (resp) => {
        if (resp.error !== undefined) return reject(new Error(resp.error))
        run()
      }
      tokenClient.requestAccessToken({ prompt: 'consent' })
    } else {
      run()
    }
  })
}

async function uploadJSONFile(content, filename, resolve, reject) {
  try {
    const token = window.gapi.client.getToken()
    if (!token) return reject(new Error('Not authenticated'))

    // Find existing file.
    let fileId = null
    try {
      const r = await window.gapi.client.drive.files.list({
        q: `name='${filename}' and trashed=false`,
        fields: 'files(id, name, modifiedTime)',
        spaces: 'drive',
      })
      if (r.result.files?.length) fileId = r.result.files[0].id
    } catch (e) { /* ignore */ }

    const blob = new Blob([content], { type: 'application/json' })
    const metadata = { name: filename, mimeType: 'application/json' }
    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    form.append('file', blob)

    const url = fileId
      ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart'
    const method = fileId ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token.access_token}` },
      body: form,
    })
    if (!res.ok) throw new Error(`Upload failed: ${await res.text()}`)
    const result = await res.json()
    resolve(result.id)
  } catch (err) { reject(err) }
}

/**
 * Download JSON content from Drive. Returns null if file doesn't exist.
 */
export async function downloadJSONFromDrive(filename = 'BeenThereState.json') {
  await initGoogleAPI()
  return new Promise((resolve, reject) => {
    const token = window.gapi.client.getToken()
    const run = () => fetchJSONFile(filename, resolve, reject)
    if (!token) {
      tokenClient.callback = (resp) => {
        if (resp.error !== undefined) return reject(new Error(resp.error))
        run()
      }
      tokenClient.requestAccessToken({ prompt: 'consent' })
    } else {
      run()
    }
  })
}

async function fetchJSONFile(filename, resolve, reject) {
  try {
    const token = window.gapi.client.getToken()
    if (!token) return reject(new Error('Not authenticated'))
    const list = await window.gapi.client.drive.files.list({
      q: `name='${filename}' and trashed=false`,
      fields: 'files(id, name, modifiedTime)',
      spaces: 'drive',
    })
    if (!list.result.files?.length) return resolve(null)
    const fileId = list.result.files[0].id
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    })
    if (!res.ok) throw new Error(`Download failed: ${await res.text()}`)
    const json = await res.json()
    resolve({ data: json, modifiedTime: list.result.files[0].modifiedTime })
  } catch (err) { reject(err) }
}

export function openMyMaps() {
  window.open('https://www.google.com/mymaps', '_blank')
}

export function signOut() {
  const token = window.gapi.client.getToken()
  if (token !== null) {
    window.google.accounts.oauth2.revoke(token.access_token)
    window.gapi.client.setToken('')
  }
}

