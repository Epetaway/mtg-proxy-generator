/**
 * Loading Spinner component
 */

class LoadingSpinner {
  constructor() {
    this.overlay = null;
    this.init();
  }

  init() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'loading-overlay';
    this.overlay.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <p class="spinner-text">Loading...</p>
      </div>
    `;
    this.overlay.style.display = 'none';
    document.body.appendChild(this.overlay);
  }

  /**
   * Show the loading spinner
   * @param {string} text - Optional loading text
   */
  show(text = 'Loading...') {
    const textEl = this.overlay.querySelector('.spinner-text');
    if (textEl) textEl.textContent = text;
    this.overlay.style.display = 'flex';
  }

  /**
   * Hide the loading spinner
   */
  hide() {
    this.overlay.style.display = 'none';
  }
}

export const loader = new LoadingSpinner();
