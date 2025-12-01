/**
 * Storage utilities for LocalStorage operations
 */

const STORAGE_KEY = 'mtg-proxy-sheet-v2';

/**
 * Saves the gallery to LocalStorage
 * @param {string[]} cards - Array of card image URLs
 * @returns {boolean} - True if successful
 */
export function saveGallery(cards) {
  try {
    const data = {
      version: 2,
      cards: cards,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Failed to save gallery:', e);
    return false;
  }
}

/**
 * Loads the gallery from LocalStorage
 * @returns {string[]|null} - Array of card image URLs or null if not found
 */
export function loadGallery() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);

    // Handle legacy format (array only)
    if (Array.isArray(data)) {
      return data;
    }

    // Handle new format
    if (data && Array.isArray(data.cards)) {
      return data.cards;
    }

    return null;
  } catch (e) {
    console.error('Failed to load gallery:', e);
    return null;
  }
}

/**
 * Clears the gallery from LocalStorage
 * @returns {boolean} - True if successful
 */
export function clearStoredGallery() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.error('Failed to clear gallery:', e);
    return false;
  }
}

/**
 * Checks if there is a stored gallery
 * @returns {boolean}
 */
export function hasStoredGallery() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}
