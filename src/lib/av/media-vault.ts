/**
 * Media Vault: High-performance Client-Side Media Persistence & Stream Manager
 * Supports in-memory caching and persistent IndexedDB storage for video/image blobs.
 * Ensures uploaded evidence videos survive page refreshes, tab switching, and navigation.
 */

const DB_NAME = 'AuthentiVision_MediaVault_v1';
const STORE_NAME = 'evidence_media';
const DB_VERSION = 1;

// In-memory runtime cache for instant access
const memoryCache = new Map<string, Blob>();
const activeObjectUrls = new Map<string, string>();

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('sha256', 'sha256', { unique: false });
        store.createIndex('savedAt', 'savedAt', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.warn('IndexedDB opening error:', request.error);
      reject(request.error);
    };
  });

  return dbPromise;
}

export interface StoredMediaRecord {
  id: string;
  sha256: string;
  filename: string;
  mimeType: string;
  blob: Blob;
  savedAt: number;
}

/**
 * Save evidence File / Blob to memory and persistent IndexedDB
 */
export async function saveMediaToVault(
  id: string,
  sha256: string,
  fileOrBlob: Blob | File,
  filename?: string
): Promise<string> {
  const mimeType = fileOrBlob.type || (filename?.match(/\.(mp4|mov|mkv|avi|webm)$/i) ? 'video/mp4' : 'image/jpeg');

  // Cache in memory
  memoryCache.set(id, fileOrBlob);
  if (sha256) memoryCache.set(sha256, fileOrBlob);

  // Generate or retrieve active object URL
  let objectUrl = activeObjectUrls.get(id);
  if (!objectUrl) {
    objectUrl = URL.createObjectURL(fileOrBlob);
    activeObjectUrls.set(id, objectUrl);
    if (sha256) activeObjectUrls.set(sha256, objectUrl);
  }

  // Persist to IndexedDB
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const record: StoredMediaRecord = {
      id,
      sha256,
      filename: filename || (fileOrBlob instanceof File ? fileOrBlob.name : 'evidence_media'),
      mimeType,
      blob: fileOrBlob,
      savedAt: Date.now(),
    };

    store.put(record);

    // Also store by sha256 if different from id
    if (sha256 && sha256 !== id) {
      store.put({
        ...record,
        id: `sha_${sha256}`,
      });
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('MediaVault IndexedDB persistence notice (in-memory cache active):', err);
  }

  return objectUrl;
}

/**
 * Retrieve Blob from in-memory cache or IndexedDB
 */
export async function getMediaBlobFromVault(id: string, sha256?: string): Promise<Blob | null> {
  // 1. Check memory cache first
  if (memoryCache.has(id)) {
    return memoryCache.get(id)!;
  }
  if (sha256 && memoryCache.has(sha256)) {
    return memoryCache.get(sha256)!;
  }

  // 2. Check IndexedDB
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    // Try primary id
    let req = store.get(id);
    let record: StoredMediaRecord | undefined = await new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(undefined);
    });

    if (record?.blob) {
      memoryCache.set(id, record.blob);
      if (sha256) memoryCache.set(sha256, record.blob);
      return record.blob;
    }

    // Try by SHA256 key
    if (sha256) {
      req = store.get(`sha_${sha256}`);
      record = await new Promise((resolve) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(undefined);
      });

      if (record?.blob) {
        memoryCache.set(id, record.blob);
        memoryCache.set(sha256, record.blob);
        return record.blob;
      }
    }
  } catch (err) {
    console.warn('MediaVault IndexedDB read notice:', err);
  }

  return null;
}

/**
 * Resolve a valid, playable URL for an evidence item
 */
export async function resolveMediaUrl(
  id: string,
  sha256?: string,
  fallbackUrl?: string
): Promise<string | null> {
  // 1. Check active object URLs map
  if (activeObjectUrls.has(id)) {
    const url = activeObjectUrls.get(id)!;
    // Verify if it looks valid
    if (url.startsWith('blob:') || url.startsWith('http') || url.startsWith('data:')) {
      return url;
    }
  }
  if (sha256 && activeObjectUrls.has(sha256)) {
    const url = activeObjectUrls.get(sha256)!;
    if (url.startsWith('blob:') || url.startsWith('http') || url.startsWith('data:')) {
      return url;
    }
  }

  // 2. Check in-memory / IndexedDB blob
  const blob = await getMediaBlobFromVault(id, sha256);
  if (blob) {
    const newUrl = URL.createObjectURL(blob);
    activeObjectUrls.set(id, newUrl);
    if (sha256) activeObjectUrls.set(sha256, newUrl);
    return newUrl;
  }

  // 3. Check fallback URL (e.g. storage download URL, data URL, or sample URL)
  if (fallbackUrl && (fallbackUrl.startsWith('http') || fallbackUrl.startsWith('data:') || fallbackUrl.startsWith('/'))) {
    return fallbackUrl;
  }

  return fallbackUrl || null;
}
