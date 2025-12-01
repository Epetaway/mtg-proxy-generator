/**
 * Card Gallery component - manages the collection of cards to print
 */

import { $, createElement } from '../utils/helpers.js';
import { saveGallery, loadGallery } from '../utils/storage.js';
import { notify } from '../utils/notifications.js';

class CardGallery {
  constructor(containerId) {
    this.container = $(containerId);
    this.cards = [];
    this.onChangeCallbacks = [];
  }

  /**
   * Initialize the gallery, loading any saved cards
   */
  init() {
    const saved = loadGallery();
    if (saved && saved.length > 0) {
      this.cards = saved;
      notify.info(`Restored ${saved.length} card(s) from your previous session.`);
    }
    // Always render to show empty state or saved cards
    this.render();
  }

  /**
   * Add cards to the gallery
   * @param {string[]} cardImages - Array of card image URLs
   */
  addCards(cardImages) {
    if (!cardImages || cardImages.length === 0) return;

    this.cards.push(...cardImages);
    this.render();
    this.save();
    this.notifyChange();

    // Animate the newly added cards
    const newCards = this.container.querySelectorAll('.gallery-card');
    const startIndex = this.cards.length - cardImages.length;
    for (let i = startIndex; i < this.cards.length; i++) {
      if (newCards[i]) {
        newCards[i].classList.add('card-added');
        setTimeout(() => newCards[i].classList.remove('card-added'), 600);
      }
    }
  }

  /**
   * Remove a card at a specific index
   * @param {number} index
   */
  removeCard(index) {
    if (index >= 0 && index < this.cards.length) {
      this.cards.splice(index, 1);
      this.render();
      this.save();
      this.notifyChange();
    }
  }

  /**
   * Clear all cards from the gallery
   * @param {boolean} skipConfirm - Skip confirmation dialog
   */
  clear(skipConfirm = false) {
    if (this.cards.length === 0) {
      notify.info('Gallery is already empty.');
      return;
    }

    if (!skipConfirm) {
      const confirmed = confirm(
        `Are you sure you want to clear all ${this.cards.length} card(s) from the gallery?`
      );
      if (!confirmed) return;
    }

    this.cards = [];
    this.render();
    this.save();
    this.notifyChange();
    notify.success('Gallery cleared.');
  }

  /**
   * Get all cards
   * @returns {string[]}
   */
  getCards() {
    return [...this.cards];
  }

  /**
   * Get card count
   * @returns {number}
   */
  getCount() {
    return this.cards.length;
  }

  /**
   * Save gallery to localStorage
   */
  save() {
    saveGallery(this.cards);
  }

  /**
   * Register a callback for when gallery changes
   * @param {Function} callback
   */
  onChange(callback) {
    this.onChangeCallbacks.push(callback);
  }

  notifyChange() {
    this.onChangeCallbacks.forEach((cb) => cb(this.cards));
  }

  /**
   * Render the gallery
   */
  render() {
    if (!this.container) return;

    if (this.cards.length === 0) {
      this.container.innerHTML = `
        <div class="gallery-empty">
          <span class="gallery-empty-icon">🎴</span>
          <p>Your gallery is empty</p>
          <p class="gallery-empty-hint">Search for cards and add them to build your proxy sheet</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = '';
    this.cards.forEach((src, index) => {
      const card = createElement(`
        <div class="gallery-card" data-index="${index}">
          <img src="${src}" alt="Card ${index + 1}" loading="lazy" />
          <button class="gallery-card-remove" aria-label="Remove card" title="Remove card">×</button>
        </div>
      `);

      const removeBtn = card.querySelector('.gallery-card-remove');
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeCard(index);
      });

      this.container.appendChild(card);
    });
  }
}

export const gallery = new CardGallery('sheet');
