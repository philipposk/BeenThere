/**
 * Thin IndexedDB wrapper for caching large blobs (e.g. TopoJSON) so the app
 * works offline after first load.
 */

const DB_NAME = 'beenthere-geodata'
const DB_VER  = 1
const STORE   = 'cache'

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER)
    req.onupgradeneeded = (e) => e.target.result.createObjectStore(STORE)
    req.onsuccess       = (e) => resolve(e.target.result)
    req.onerror         = (e) => reject(e.target.error)
  })
}

export async function idbGet(key) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key)
      req.onsuccess = (e) => resolve(e.target.result ?? null)
      req.onerror   = (e) => reject(e.target.error)
    })
  } catch {
    return null
  }
}

export async function idbSet(key, value) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(value, key)
      tx.oncomplete = resolve
      tx.onerror    = (e) => reject(e.target.error)
    })
  } catch {
    /* silently skip — caching is best-effort */
  }
}
