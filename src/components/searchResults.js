/**
 * Search Results component - displays search results and handles selection
 */

import { $ } from '../utils/helpers.js';
import { notify } from '../utils/notifications.js';

class SearchResults {
  constructor(containerId) {
    this.container = $(containerId);
    this.results = [];
    this.selected = new Set();
    this.onAddCallbacks = [];
  }

  /**
   * Set the search results
   * @param {Array} results - Array of card objects
   */
  setResults(results) {
    this.results = results;
    this.selected.clear();
    this.render();
  }

  /**
   * Clear all results
   */
  clear() {
    this.results = [];
    this.selected.clear();
    this.render();
  }

  /**
   * Toggle selection of a card
   * @param {number} index
   */
  toggleSelection(index) {
    if (this.selected.has(index)) {
      this.selected.delete(index);
    } else {
      this.selected.add(index);
    }
    this.render();
  }

  /**
   * Get selected card images
   * @returns {string[]}
   */
  getSelectedImages() {
    return Array.from(this.selected).map((i) => this.results[i].img);
  }

  /**
   * Check if any cards are selected
   * @returns {boolean}
   */
  hasSelection() {
    return this.selected.size > 0;
  }

  /**
   * Clear selection
   */
  clearSelection() {
    this.selected.clear();
    this.render();
  }

  /**
   * Get selection count
   * @returns {number}
   */
  getSelectionCount() {
    return this.selected.size;
  }

  /**
   * Register callback for when cards are added
   * @param {Function} callback
   */
  onAdd(callback) {
    this.onAddCallbacks.push(callback);
  }

  /**
   * Add selected cards and notify
   */
  addSelected() {
    if (!this.hasSelection()) {
      notify.warning('Please select at least one card to add.');
      return;
    }

    const images = this.getSelectedImages();
    this.onAddCallbacks.forEach((cb) => cb(images));
    this.clearSelection();
    notify.success(`Added ${images.length} card(s) to gallery.`);
  }

  /**
   * Render the search results
   */
  render() {
    if (!this.container) return;

    if (this.results.length === 0) {
      this.container.innerHTML = '';
      return;
    }

    this.container.innerHTML = '';
    this.results.forEach((card, index) => {
      const isSelected = this.selected.has(index);
      const cardEl = document.createElement('button');
      cardEl.className = `search-result-card ${isSelected ? 'selected' : ''}`;
      cardEl.setAttribute('aria-pressed', isSelected);
      cardEl.setAttribute('title', `${card.name} - ${card.set}`);

      cardEl.innerHTML = `
        <img src="${card.thumb}" alt="${card.name}" loading="lazy" />
        <div class="card-selection-indicator">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="checkmark">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      `;

      cardEl.addEventListener('click', () => {
        this.toggleSelection(index);
        // Add selection animation
        if (!isSelected) {
          cardEl.classList.add('card-selecting');
          setTimeout(() => cardEl.classList.remove('card-selecting'), 300);
        }
      });

      this.container.appendChild(cardEl);
    });
  }
}

export const searchResults = new SearchResults('results');
