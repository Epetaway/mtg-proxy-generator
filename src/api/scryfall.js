/**
 * Scryfall API integration module
 */

const API_BASE = 'https://api.scryfall.com';

/**
 * Search for cards using the Scryfall API
 * @param {string} name - Card name to search for
 * @param {string} setCode - Optional set code filter
 * @returns {Promise<Array>} - Array of card objects with img and thumb properties
 */
export async function searchCards(name, setCode = '') {
  const query = name.trim();
  if (!query) {
    return [];
  }

  // Quote the search term for exact matching unless it's already quoted or using special syntax
  const quoted = /(^".*"$)|(^!)/.test(query) ? query : `"${query}"`;

  let searchQuery = quoted;
  if (setCode && setCode.trim()) {
    searchQuery += ` set:${setCode.trim()}`;
  }

  const url = `${API_BASE}/cards/search?q=${encodeURIComponent(searchQuery)}&unique=art`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      // No results found - this is a valid response from Scryfall
      return [];
    }
    throw new Error(`Scryfall API error: ${response.status}`);
  }

  const json = await response.json();
  const data = json.data || [];

  return data
    .map((card) => {
      // Handle regular cards
      const img =
        card.image_uris && (card.image_uris.large || card.image_uris.png || card.image_uris.normal);
      const thumb = card.image_uris && (card.image_uris.small || card.image_uris.art_crop);

      // Handle double-faced cards
      const face = !img && card.card_faces && card.card_faces.length ? card.card_faces[0] : null;
      const faceImg =
        img ||
        (face &&
          face.image_uris &&
          (face.image_uris.large || face.image_uris.png || face.image_uris.normal));
      const faceThumb =
        thumb ||
        (face && face.image_uris && (face.image_uris.small || face.image_uris.art_crop)) ||
        faceImg;

      return {
        name: card.name,
        set: card.set_name,
        img: faceImg,
        thumb: faceThumb,
      };
    })
    .filter((card) => card.img);
}

/**
 * Get autocomplete suggestions for card names
 * @param {string} query - Partial card name
 * @returns {Promise<string[]>} - Array of card name suggestions
 */
export async function getAutocompleteSuggestions(query) {
  if (!query || query.length < 2) {
    return [];
  }

  const url = `${API_BASE}/cards/autocomplete?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }

    const json = await response.json();
    return json.data || [];
  } catch {
    return [];
  }
}
