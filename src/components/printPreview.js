/**
 * Print Preview Modal component
 */

import { gallery } from './gallery.js';

class PrintPreview {
  constructor() {
    this.modal = null;
    this.printGrid = null;
    this.init();
  }

  init() {
    // Create modal structure
    this.modal = document.createElement('div');
    this.modal.className = 'print-preview-modal';
    this.modal.innerHTML = `
      <div class="print-preview-backdrop"></div>
      <div class="print-preview-content">
        <div class="print-preview-header">
          <h2>Print Preview</h2>
          <button class="print-preview-close" aria-label="Close preview">×</button>
        </div>
        <div class="print-preview-body">
          <div class="print-preview-page">
            <div id="printPreviewGrid" class="print-grid-preview"></div>
          </div>
        </div>
        <div class="print-preview-footer">
          <span class="print-preview-info">Standard Letter (8.5" × 11") - 9 cards per page</span>
          <div class="print-preview-actions">
            <button class="btn btn-secondary" id="previewClose">Cancel</button>
            <button class="btn btn-primary" id="previewPrint">Print</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);

    // Get references
    this.printGrid = this.modal.querySelector('#printPreviewGrid');
    const backdrop = this.modal.querySelector('.print-preview-backdrop');
    const closeBtn = this.modal.querySelector('.print-preview-close');
    const cancelBtn = this.modal.querySelector('#previewClose');
    const printBtn = this.modal.querySelector('#previewPrint');

    // Event listeners
    backdrop.addEventListener('click', () => this.hide());
    closeBtn.addEventListener('click', () => this.hide());
    cancelBtn.addEventListener('click', () => this.hide());
    printBtn.addEventListener('click', () => this.print());

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible()) {
        this.hide();
      }
    });
  }

  /**
   * Show the print preview modal
   */
  show() {
    const cards = gallery.getCards();
    if (cards.length === 0) {
      return false;
    }

    // Populate the preview grid
    this.printGrid.innerHTML = '';
    cards.forEach((src, index) => {
      const card = document.createElement('div');
      card.className = 'print-card-preview';
      card.innerHTML = `<img src="${src}" alt="Card ${index + 1}" />`;
      this.printGrid.appendChild(card);
    });

    this.modal.classList.add('visible');
    document.body.style.overflow = 'hidden';
    return true;
  }

  /**
   * Hide the print preview modal
   */
  hide() {
    this.modal.classList.remove('visible');
    document.body.style.overflow = '';
  }

  /**
   * Check if modal is visible
   */
  isVisible() {
    return this.modal.classList.contains('visible');
  }

  /**
   * Trigger print
   */
  print() {
    this.hide();

    // Populate the actual print grid
    const printable = document.getElementById('printable');
    const printGrid = document.getElementById('printGrid');

    printGrid.innerHTML = '';
    gallery.getCards().forEach((src) => {
      const card = document.createElement('div');
      card.className = 'print-card';
      card.innerHTML = `<img src="${src}" />`;
      printGrid.appendChild(card);
    });

    printable.classList.remove('hidden');
    window.print();
    setTimeout(() => printable.classList.add('hidden'), 500);
  }
}

export const printPreview = new PrintPreview();
