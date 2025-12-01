/**
 * Notification system for user feedback
 */

class NotificationManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    // Create container if it doesn't exist
    this.container = document.getElementById('notification-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'notification-container';
      this.container.className = 'notification-container';
      document.body.appendChild(this.container);
    }
  }

  /**
   * Show a notification
   * @param {string} message - The message to display
   * @param {('success'|'error'|'warning'|'info')} type - Notification type
   * @param {number} duration - Duration in ms (0 for persistent)
   */
  show(message, type = 'info', duration = 4000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };

    notification.innerHTML = `
      <span class="notification-icon">${icons[type] || icons.info}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close" aria-label="Close notification">×</button>
    `;

    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => this.dismiss(notification));

    this.container.appendChild(notification);

    // Trigger entrance animation
    requestAnimationFrame(() => {
      notification.classList.add('notification-show');
    });

    if (duration > 0) {
      setTimeout(() => this.dismiss(notification), duration);
    }

    return notification;
  }

  dismiss(notification) {
    notification.classList.remove('notification-show');
    notification.classList.add('notification-hide');
    setTimeout(() => notification.remove(), 300);
  }

  success(message, duration = 4000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 5000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 4000) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 4000) {
    return this.show(message, 'info', duration);
  }
}

// Export singleton instance
export const notify = new NotificationManager();
