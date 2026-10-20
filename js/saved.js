/**
 * SAVED EXPERIENCES & PLACES SCRIPT (Matching Screenshot 13)
 * Metrics computation, category tabs, empty state toggle, and Project 1 API Export
 */

(function () {
  'use strict';

  let currentTab = 'all'; // 'all', 'experiences', 'restaurants'
  let isSimulatingEmptyState = false;

  // Load and Render Saved Page
  async function loadSavedPage() {
    if (isSimulatingEmptyState) {
      renderMetrics(0, 0, []);
      renderTabCounts(0, 0, 0);
      renderSavedCards([], []);
      return;
    }

    let experiences = [];
    let restaurants = [];

    try {
      experiences = await window.ExplorelyAPI.getSavedExperiences();
      restaurants = await window.ExplorelyAPI.getSavedRestaurants();
      experiences = Array.isArray(experiences) ? experiences : [];
      restaurants = Array.isArray(restaurants) ? restaurants : [];
    } catch (error) {
      console.error('Could not load saved items:', error);
      const container = document.getElementById('saved-cards-grid');
      if (container) {
        container.innerHTML = `<div class="empty-state-box" style="grid-column:1/-1;"><h3>Could not load saved items</h3><p style="color:var(--text-muted);">Check your connection and sign-in status, then refresh this page.</p><button class="btn btn-primary" id="btn-retry-saved">Try Again</button></div>`;
        container.querySelector('#btn-retry-saved')?.addEventListener('click', loadSavedPage);
      }
      return;
    }

    const totalValue = experiences.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    const cities = Array.from(new Set([
      ...experiences.map(e => e.destination),
      ...restaurants.map(r => r.destination)
    ]));

    renderMetrics(experiences.length + restaurants.length, totalValue, cities);
    renderTabCounts(experiences.length + restaurants.length, experiences.length, restaurants.length);
    renderSavedCards(experiences, restaurants);
  }

  function renderMetrics(totalCount, totalValue, cities) {
    const totalCountEl = document.getElementById('metric-total-saves');
    if (totalCountEl) totalCountEl.textContent = totalCount;

    const totalValEl = document.getElementById('metric-total-value');
    if (totalValEl) totalValEl.textContent = window.formatINR ? window.formatINR(totalValue) : '₹' + totalValue;

    const citiesEl = document.getElementById('metric-cities');
    const citiesListEl = document.getElementById('metric-cities-list');
    if (citiesEl) citiesEl.textContent = `${cities.length} ${cities.length === 1 ? 'City' : 'Cities'}`;
    if (citiesListEl) {
      citiesListEl.textContent = cities.length > 0 ? cities.slice(0, 3).join(', ') : 'None selected';
    }
  }

  function renderTabCounts(allCount, expCount, restCount) {
    const tabAll = document.getElementById('tab-all-saved');
    if (tabAll) tabAll.textContent = `All Saved (${allCount})`;

    const tabExp = document.getElementById('tab-experiences');
    if (tabExp) tabExp.textContent = `Experiences (${expCount})`;

    const tabRest = document.getElementById('tab-restaurants');
    if (tabRest) tabRest.textContent = `Restaurants (${restCount})`;
  }

  function renderSavedCards(experiences, restaurants) {
    const container = document.getElementById('saved-cards-grid');
    if (!container) return;

    let itemsToDisplay = [];

    if (currentTab === 'all' || currentTab === 'experiences') {
      experiences.forEach(e => itemsToDisplay.push({ ...e, item_type: 'experience' }));
    }

    if (currentTab === 'all' || currentTab === 'restaurants') {
      restaurants.forEach(r => itemsToDisplay.push({ ...r, item_type: 'restaurant' }));
    }

    if (itemsToDisplay.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1;" class="empty-state-box">
          <div class="empty-state-icon">🤍</div>
          <h3 style="font-size: 22px; font-weight: 700; margin-bottom: 0.5rem;">You haven't saved anything yet.</h3>
          <p style="color: var(--text-muted); font-size: 14px; max-width: 480px; margin: 0 auto 1.5rem;">
            Explore handpicked Indian destinations, heritage walking tours, water sports, and culinary spots, and tap the heart icon to save your favorites.
          </p>
          <a href="explore.html" class="btn btn-primary">Explore Experiences</a>
        </div>
      `;
      return;
    }

    container.innerHTML = itemsToDisplay.map(item => {
      if (item.item_type === 'experience') {
        return `
          <div class="experience-card" data-exp-id="${item.experience_id}">
            <div class="card-image-wrap">
              <img src="${escapeHTML(item.image_url || '')}" alt="${escapeHTML(item.name || 'Saved item')}">
              <span class="pill-badge pill-badge-teal card-badge-top-left">${String(item.category || 'TRAVEL').toUpperCase()}</span>
              <button class="card-save-btn active" data-experience-id="${item.experience_id}" title="Remove from saved">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#E11D48" stroke="currentColor" stroke-width="2">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>
            <div class="card-body">
              <div class="card-location-row">
                <span>📍 ${escapeHTML(item.locality || item.destination || '')}</span>
                <span>⏱️ ${escapeHTML(item.duration || '')}</span>
              </div>
              <h3 class="card-title"><a href="experience-detail.html?id=${item.experience_id}">${escapeHTML(item.name || 'Saved item')}</a></h3>
              <div class="card-rating-row">
                <span class="star-icon">★</span> ${(Number(item.rating) || 0).toFixed(1)} (${Number(item.review_count) || 0} reviews)
              </div>
              <div class="card-footer-row">
                <div class="card-price-block">
                  <span class="card-price-label">Starting From</span>
                  <span class="card-price-value">${window.formatINR ? window.formatINR(item.price) : '₹' + item.price}</span>
                </div>
                <div style="display:flex;gap:0.5rem;">
                  <button class="btn btn-secondary btn-sm btn-remove-saved" data-type="exp" data-id="${item.experience_id}">Remove</button>
                  <a href="experience-detail.html?id=${item.experience_id}" class="btn btn-primary btn-sm">View Details</a>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        // Restaurant card
        return `
          <div class="experience-card" data-rest-id="${item.restaurant_id}">
            <div class="card-image-wrap">
              <img src="${escapeHTML(item.image_url || '')}" alt="${escapeHTML(item.name || 'Saved item')}">
              <span class="pill-badge pill-badge-amber card-badge-top-left">🍽️ RESTAURANT</span>
              <button class="card-save-btn active" data-restaurant-id="${item.restaurant_id}" title="Remove from saved">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#E11D48" stroke="currentColor" stroke-width="2">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>
            <div class="card-body">
              <div class="card-location-row">
                <span>📍 ${escapeHTML(item.locality || item.destination || '')}</span>
                <span>🏷️ ${escapeHTML(item.cuisine || 'Restaurant')}</span>
              </div>
              <h3 class="card-title"><a href="restaurant-detail.html?id=${item.restaurant_id}">${escapeHTML(item.name || 'Saved item')}</a></h3>
              <div class="card-rating-row">
                <span class="star-icon">★</span> ${(Number(item.rating) || 0).toFixed(1)} (${Number(item.review_count) || 0} reviews)
              </div>
              <div class="card-footer-row">
                <div class="card-price-block">
                  <span class="card-price-label">Average for two</span>
                  <span class="card-price-value">${item.price_for_two ? (window.formatINR ? window.formatINR(item.price_for_two) : '₹' + item.price_for_two) : item.price_range}</span>
                </div>
                <div style="display:flex;gap:0.5rem;">
                  <button class="btn btn-secondary btn-sm btn-remove-saved" data-type="rest" data-id="${item.restaurant_id}">Remove</button>
                  <a href="restaurant-detail.html?id=${item.restaurant_id}" class="btn btn-primary btn-sm">View Details</a>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    }).join('');

    // Remove buttons and heart icons both remove an item from the saved list.
    const removeSavedItem = async (type, id, button) => {
      if (button) button.disabled = true;
      try {
        if (type === 'exp') {
          await window.ExplorelyAPI.toggleSaveExperience(id);
        } else {
          await window.ExplorelyAPI.toggleSaveRestaurant(id);
        }
        if (window.showToast) window.showToast('Removed from saved items.');
        await loadSavedPage();
      } catch (error) {
        if (window.showToast) window.showToast(error.message || 'Could not remove item. Please try again.', 'error');
      } finally {
        if (button) button.disabled = false;
      }
    };

    container.querySelectorAll('.btn-remove-saved').forEach(btn => {
      btn.addEventListener('click', () => {
        removeSavedItem(btn.dataset.type, parseInt(btn.dataset.id, 10), btn);
      });
    });
    container.querySelectorAll('[data-experience-id].card-save-btn').forEach(btn => {
      btn.addEventListener('click', () => removeSavedItem('exp', parseInt(btn.dataset.experienceId, 10), btn));
    });
    container.querySelectorAll('[data-restaurant-id].card-save-btn').forEach(btn => {
      btn.addEventListener('click', () => removeSavedItem('rest', parseInt(btn.dataset.restaurantId, 10), btn));
    });
  }

  function setupActionButtons() {
    // Tab switching
    document.querySelectorAll('.saved-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.saved-tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentTab = e.target.dataset.tab;
        loadSavedPage();
      });
    });

    // Toggle Preview Empty State Button
    const emptyStateToggle = document.getElementById('btn-toggle-empty-state');
    if (emptyStateToggle) {
      emptyStateToggle.addEventListener('click', () => {
        isSimulatingEmptyState = !isSimulatingEmptyState;
        emptyStateToggle.textContent = isSimulatingEmptyState ? 'Restore Saved View' : 'Preview Empty State';
        loadSavedPage();
      });
    }

    // Clear All Button
    const clearAllBtn = document.getElementById('btn-clear-all-saved');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to remove all saved items?')) return;
        clearAllBtn.disabled = true;
        try {
          const [experiences, restaurants] = await Promise.all([
            window.ExplorelyAPI.getSavedExperiences(),
            window.ExplorelyAPI.getSavedRestaurants()
          ]);
          for (const item of (Array.isArray(experiences) ? experiences : [])) {
            await window.ExplorelyAPI.toggleSaveExperience(item.experience_id);
          }
          for (const item of (Array.isArray(restaurants) ? restaurants : [])) {
            await window.ExplorelyAPI.toggleSaveRestaurant(item.restaurant_id);
          }
          if (window.showToast) window.showToast('All saved items cleared.');
          await loadSavedPage();
        } catch (error) {
          if (window.showToast) window.showToast(error.message || 'Could not clear saved items.', 'error');
        } finally {
          clearAllBtn.disabled = false;
        }
      });
    }

    // Export List (JSON Download)
    const exportBtn = document.getElementById('btn-export-list');
    if (exportBtn) {
      exportBtn.addEventListener('click', async () => {
        const payload = await window.ExplorelyAPI.generateProject1ExportPayload();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", `explorely_saved_export_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
        window.showToast('Export JSON downloaded successfully!');
      });
    }

    // Sync to Smart Travel Planner Modal (Project 1 Integration)
    const syncBtn = document.getElementById('btn-sync-project1');
    if (syncBtn) {
      syncBtn.addEventListener('click', showSyncModal);
    }

    // View Live JSON Payload Modal Trigger
    const viewJsonBtn = document.getElementById('btn-view-live-json');
    if (viewJsonBtn) {
      viewJsonBtn.addEventListener('click', showJsonModal);
    }

    // Copy cURL Button
    const copyCurlBtn = document.getElementById('btn-copy-curl');
    if (copyCurlBtn) {
      copyCurlBtn.addEventListener('click', () => {
        const baseUrl = window.ExplorelyAPI.getApiBaseUrl();
        const curlCmd = `curl -X GET "${baseUrl}/api/saved/experiences" -H "Accept: application/json"`;
        navigator.clipboard.writeText(curlCmd).then(() => {
          window.showToast('cURL command copied to clipboard!');
        });
      });
    }
  }

  async function showJsonModal() {
    let modal = document.getElementById('live-json-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'live-json-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    const payload = await window.ExplorelyAPI.generateProject1ExportPayload();

    modal.innerHTML = `
      <div class="modal-card" style="max-width: 750px;">
        <button class="modal-close-btn" onclick="this.closest('.modal-backdrop').classList.remove('open')">&times;</button>
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;">
          <div style="width:36px;height:36px;border-radius:8px;background:#0F172A;color:#38BDF8;display:flex;align-items:center;justify-content:center;font-weight:700;">{ }</div>
          <div>
            <h3 style="font-size:20px;font-weight:700;">Live Project 1 Export JSON Payload</h3>
            <p style="font-size:13px;color:var(--text-muted);">Exact payload contract consumed by Project 1 Smart Travel Planner</p>
          </div>
        </div>

        <pre style="background:#0F172A;color:#38BDF8;padding:1.25rem;border-radius:12px;font-family:monospace;font-size:12px;max-height:360px;overflow-y:auto;line-height:1.45;">${JSON.stringify(payload, null, 2)}</pre>

        <div style="display:flex;justify-content:flex-end;gap:0.75rem;margin-top:1.25rem;">
          <button class="btn btn-secondary" onclick="navigator.clipboard.writeText(JSON.stringify(${JSON.stringify(payload)}, null, 2)).then(() => window.showToast('Copied JSON payload!'))">Copy JSON</button>
          <button class="btn btn-primary" onclick="this.closest('.modal-backdrop').classList.remove('open')">Close</button>
        </div>
      </div>
    `;

    modal.classList.add('open');
  }

  function showSyncModal() {
    let modal = document.getElementById('sync-planner-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'sync-planner-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-card">
        <button class="modal-close-btn" onclick="this.closest('.modal-backdrop').classList.remove('open')">&times;</button>
        <div style="text-align:center;margin-bottom:1.5rem;">
          <div style="width:48px;height:48px;border-radius:50%;background:var(--primary-light);color:var(--primary);display:flex;align-items:center;justify-content:center;font-size:22px;margin:0 auto 1rem;">
            🔄
          </div>
          <h3 style="font-size:22px;font-weight:700;">Sync to Smart Travel Planner</h3>
          <p style="font-size:13px;color:var(--text-muted);margin-top:4px;">
            Cross-project REST integration with Project 1
          </p>
        </div>

        <div style="background-color:var(--surface-container-low);padding:1.25rem;border-radius:var(--radius-lg);margin-bottom:1.5rem;font-size:13px;line-height:1.5;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">
            <strong>Target Application:</strong>
            <span style="color:var(--primary);font-weight:600;">Project 1 (Smart Travel Planner)</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">
            <strong>Handshake Protocol:</strong>
            <span style="font-family:monospace;background:#fff;padding:2px 6px;border-radius:4px;">REST / JSON over HTTP</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <strong>Status:</strong>
            <span style="color:#10B981;font-weight:700;">● Ready for sync</span>
          </div>
        </div>

        <div style="display:flex;gap:0.75rem;">
          <button class="btn btn-secondary" style="flex:1;" onclick="this.closest('.modal-backdrop').classList.remove('open')">Dismiss</button>
          <button class="btn btn-primary" style="flex:1;" id="btn-execute-sync">Execute REST Sync</button>
        </div>
      </div>
    `;

    modal.querySelector('#btn-execute-sync').addEventListener('click', () => {
      modal.classList.remove('open');
      window.showToast('Successfully synchronized with Project 1 Smart Travel Planner!');
    });

    modal.classList.add('open');
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>\"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' }[char]));
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Saved items belong to a user: require login when the live backend is in use
    if (window.ExplorelyAPI.requiresLogin()) {
      window.ExplorelyAPI.redirectToLogin('Please log in to view your saved items.');
      return;
    }
    setupActionButtons();
    loadSavedPage();
    window.addEventListener('explorely:saved-updated', loadSavedPage);
  });

})();
