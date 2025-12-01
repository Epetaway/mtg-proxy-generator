/**
 * MTG Proxy Generator - Main Application
 * A polished web tool for generating printable Magic: The Gathering proxies
 */

import { $, debounce } from './utils/helpers.js';
import { searchCards } from './api/scryfall.js';
import { notify } from './utils/notifications.js';
import { gallery } from './components/gallery.js';
import { searchResults } from './components/searchResults.js';
import { loader } from './components/loader.js';
import { printPreview } from './components/printPreview.js';

/**
 * Initialize the application
 */
function init() {
  // Initialize components
  gallery.init();

  // Connect search results to gallery
  searchResults.onAdd((images) => {
    gallery.addCards(images);
  });

  // Update gallery count display
  gallery.onChange(updateGalleryCount);
  updateGalleryCount(gallery.getCards());

  // Set up event listeners
  setupSearchEvents();
  setupButtonEvents();
  setupKeyboardEvents();
}

/**
 * Update the gallery count display
 */
function updateGalleryCount(cards) {
  const countEl = $('galleryCount');
  if (countEl) {
    countEl.textContent = `${cards.length} card(s)`;
  }
}

/**
 * Set up search-related events
 */
function setupSearchEvents() {
  const cardNameInput = $('cardName');
  const setCodeInput = $('setCode');
  const searchBtn = $('searchBtn');

  // Debounced search function
  const debouncedSearch = debounce(async () => {
    await performSearch();
  }, 300);

  // Search button click
  searchBtn.addEventListener('click', performSearch);

  // Enter key to search
  cardNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });

  setCodeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });

  // Live search on input (debounced)
  cardNameInput.addEventListener('input', () => {
    if (cardNameInput.value.length >= 3) {
      debouncedSearch();
    }
  });
}

/**
 * Perform the search
 */
async function performSearch() {
  const name = $('cardName').value;
  const setCode = $('setCode').value;

  if (!name.trim()) {
    notify.warning('Please enter a card name to search.');
    return;
  }

  loader.show('Searching Scryfall...');

  try {
    const results = await searchCards(name, setCode);

    if (results.length === 0) {
      notify.info('No results found. Try a different name or remove the set code.');
      searchResults.clear();
    } else {
      notify.success(`Found ${results.length} result(s). Click cards to select them.`);
      searchResults.setResults(results);
    }
  } catch (error) {
    console.error('Search error:', error);
    notify.error('Error contacting Scryfall. Please try again.');
    searchResults.clear();
  } finally {
    loader.hide();
  }
}

/**
 * Set up button event listeners
 */
function setupButtonEvents() {
  // Add selected cards to gallery
  $('addToSheet').addEventListener('click', () => {
    searchResults.addSelected();
  });

  // Clear gallery
  $('clearSheet').addEventListener('click', () => {
    gallery.clear();
  });

  // Print sheet (with preview)
  $('printSheet').addEventListener('click', () => {
    if (gallery.getCount() === 0) {
      notify.warning('Add some cards to the gallery before printing.');
      return;
    }
    if (!printPreview.show()) {
      notify.warning('Add some cards to the gallery before printing.');
    }
  });

  // Download PNG
  $('downloadPng').addEventListener('click', downloadAsPng);

  // Download PDF
  $('downloadPdf').addEventListener('click', downloadAsPdf);
}

/**
 * Set up keyboard shortcuts
 */
function setupKeyboardEvents() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + P for print preview
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      if (gallery.getCount() > 0) {
        printPreview.show();
      }
    }
  });
}

/**
 * Populate the print grid for export
 */
function populatePrintGrid() {
  const printGrid = $('printGrid');
  printGrid.innerHTML = '';
  gallery.getCards().forEach((src) => {
    const el = document.createElement('div');
    el.className = 'print-card';
    el.innerHTML = `<img src="${src}" />`;
    printGrid.appendChild(el);
  });
}

/**
 * Download the sheet as PNG
 */
async function downloadAsPng() {
  if (gallery.getCount() === 0) {
    notify.warning('Add some cards to the gallery before exporting.');
    return;
  }

  loader.show('Generating PNG...');
  populatePrintGrid();

  const printable = $('printable');
  printable.classList.remove('hidden');

  try {
    const node = $('printGrid');
    const canvas = await window.html2canvas(node, {
      backgroundColor: '#ffffff',
      scale: 2,
    });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mtg-proxy-sheet.png';
    a.click();
    notify.success('PNG downloaded successfully!');
  } catch (e) {
    console.error('PNG export error:', e);
    notify.error('Failed to generate PNG. Please try again.');
  } finally {
    printable.classList.add('hidden');
    loader.hide();
  }
}

/**
 * Download the sheet as PDF
 */
async function downloadAsPdf() {
  if (gallery.getCount() === 0) {
    notify.warning('Add some cards to the gallery before exporting.');
    return;
  }

  loader.show('Generating PDF...');
  populatePrintGrid();

  const printable = $('printable');
  printable.classList.remove('hidden');

  try {
    const node = $('printGrid');
    const canvas = await window.html2canvas(node, {
      backgroundColor: '#ffffff',
      scale: 2,
    });
    const imgData = canvas.toDataURL('image/png');

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'in', format: 'letter', compress: true });

    // Page dimensions
    const pageW = 8.5;
    const pageH = 11.0;
    const margin = 0.25;
    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;

    // Image aspect ratio fit
    const imgW = canvas.width;
    const imgH = canvas.height;
    const imgRatio = imgW / imgH;
    let w = maxW;
    let h = w / imgRatio;
    if (h > maxH) {
      h = maxH;
      w = h * imgRatio;
    }

    const x = (pageW - w) / 2;
    const y = (pageH - h) / 2;
    doc.addImage(imgData, 'PNG', x, y, w, h, '', 'FAST');
    doc.save('mtg-proxy-sheet.pdf');
    notify.success('PDF downloaded successfully!');
  } catch (e) {
    console.error('PDF export error:', e);
    notify.error('Failed to generate PDF. Please try again.');
  } finally {
    printable.classList.add('hidden');
    loader.hide();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
