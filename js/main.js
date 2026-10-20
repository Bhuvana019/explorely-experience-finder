
/**
 * EXPLORELY MAIN APPLICATION SCRIPT
 * Guest mode: Navigation, search, toasts, and saved items.
 * No login, signup, or profile dependencies.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'explorely_guest_saved';

  // -----------------------------
  // Currency formatting
  // -----------------------------
  function formatINR(amount) {
    return '₹' + Number(amount || 0).toLocaleString('en-IN');
  }

  window.formatINR = formatINR;

  // -----------------------------
  // Toast notifications
  // -----------------------------
  function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');

    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = type === 'success'
      ? '✓'
      : type === 'error'
        ? '✕'
        : 'ℹ';

    const iconEl = document.createElement('span');
    iconEl.textContent = icon;
    iconEl.style.fontWeight = '700';

    const messageEl = document.createElement('span');
    messageEl.textContent = String(message);

    toast.append(iconEl, messageEl);
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 250ms ease';

      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  window.showToast = showToast;

  // -----------------------------
  // Guest saved items
  // -----------------------------
  function readSavedItems() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

      return {
        experiences: Array.isArray(data.experiences)
          ? data.experiences
          : [],
        restaurants: Array.isArray(data.restaurants)
          ? data.restaurants
          : []
      };
    } catch {
      return { experiences: [], restaurants: [] };
    }
  }

  function writeSavedItems(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('explorely:saved-updated'));
      return true;
    } catch {
      showToast('Unable to save locally in this browser.', 'error');
      return false;
    }
  }

  function updateSavedBadge() {
    const data = readSavedItems();
    const total = data.experiences.length + data.restaurants.length;

    document.querySelectorAll('.nav-saved-count').forEach(badge => {
      badge.textContent = total;
      badge.style.display = total > 0 ? 'inline-flex' : 'none';
    });
  }

  window.ExplorelyGuestSaved = {
    getAll: readSavedItems,

    isSaved(type, id) {
      const key = type === 'restaurant' ? 'restaurants' : 'experiences';
      return readSavedItems()[key].some(item => String(item.id) === String(id));
    },

    toggle(type, id) {
      const data = readSavedItems();
      const key = type === 'restaurant' ? 'restaurants' : 'experiences';
      const items = data[key];
      const index = items.findIndex(item => String(item.id) === String(id));

      if (index >= 0) {
        items.splice(index, 1);
        writeSavedItems(data);
        return false;
      }

      items.push({ id: String(id), savedAt: new Date().toISOString() });
      writeSavedItems(data);
      return true;
    }
  };

  // -----------------------------
  // Header and mobile navigation
  // -----------------------------
  function setupHeader() {
    updateSavedBadge();

    window.addEventListener('explorely:saved-updated', updateSavedBadge);
    window.addEventListener('storage', updateSavedBadge);

    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
      mobileBtn.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('mobile-nav-open');
        mobileBtn.setAttribute('aria-expanded', String(isOpen));
      });
    }

    // Remove any leftover account controls if present in a template.
    document.querySelectorAll(
      '#user-profile-btn, #profile-dropdown, .auth-nav-link, .login-link, .register-link'
    ).forEach(element => element.remove());
  }

  // -----------------------------
  // Search forms
  // -----------------------------
  function setupSearchBars() {
    document.querySelectorAll('.unified-search-bar').forEach(bar => {
      const form = bar.tagName === 'FORM' ? bar : bar.closest('form');
      const submitBtn = bar.querySelector('.search-submit-btn');

      function handleSearch(event) {
        if (event) event.preventDefault();

        const destinationInput =
          bar.querySelector('input[name="destination"]') ||
          bar.querySelector('.search-destination-input');

        const categorySelect =
          bar.querySelector('select[name="category"]') ||
          bar.querySelector('.search-category-select');

        const params = new URLSearchParams();
        const destination = destinationInput?.value.trim() || '';
        const category = categorySelect?.value || '';

        if (destination) params.set('destination', destination);

        if (category && category !== 'All Categories') {
          params.set('category', category);
        }

        const query = params.toString();
        window.location.href = '/explore.html' + (query ? `?${query}` : '');
      }

      if (submitBtn) {
        submitBtn.addEventListener('click', handleSearch);
      }

      if (form) {
        form.addEventListener('submit', handleSearch);
      }
    });
  }

  // -----------------------------
  // Save buttons — guest mode
  // -----------------------------
  document.addEventListener('click', event => {
    const target = event.target;

    if (!(target instanceof Element)) return;

    const saveBtn = target.closest('.card-save-btn');
    if (!saveBtn) return;

    const experienceId = saveBtn.dataset.experienceId;
    const restaurantId = saveBtn.dataset.restaurantId;
    const id = experienceId || restaurantId;

    if (!id) return;

    event.preventDefault();
    event.stopPropagation();

    const type = restaurantId ? 'restaurant' : 'experience';
    const isSaved = window.ExplorelyGuestSaved.toggle(type, id);

    saveBtn.classList.toggle('active', isSaved);
    saveBtn.setAttribute('aria-pressed', String(isSaved));

    showToast(
      isSaved ? 'Saved on this device!' : 'Removed from saved items.'
    );
  });

  // -----------------------------
  // Initialize
  // -----------------------------
  document.addEventListener('DOMContentLoaded', () => {
    setupHeader();
    setupSearchBars();
  });

})();
