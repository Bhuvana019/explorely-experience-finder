
/**
 * EXPERIENCE DETAILS PAGE SCRIPT
 * Manages Gallery, Specs, Timeline, Sticky Booking Calculator, and Review Submissions
 */

(function () {
  'use strict';

  let currentExperience = null;
  let selectedReviewRating = 5;

  // Read Experience ID from URL
  function getExperienceId() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('id') || '1', 10);
  }

  // Load and Render Experience Details
  async function loadDetails() {
    const id = getExperienceId();
    currentExperience = await window.ExplorelyAPI.getExperienceById(id);

    if (!currentExperience) {
      document.getElementById('details-content-container').innerHTML = `
        <div class="empty-state-box" style="margin: 4rem auto; max-width: 600px;">
          <h3>Experience Not Found</h3>
          <p style="color:var(--text-muted);margin:1rem 0;">
            The requested experience (ID #${id}) could not be located in our catalog.
          </p>
          <a href="explore.html" class="btn btn-primary">Back to Explore</a>
        </div>
      `;
      return;
    }

    // Normalize API/database fields before rendering
    currentExperience = normalizeExperience(currentExperience);

    renderHeaderAndBreadcrumbs();
    renderGallery();
    renderSpecs();
    renderAboutAndHighlights();
    renderTimeline();
    renderBookingSidebar();
    await renderReviews();
    renderSimilarExperiences();
  }

  /**
   * Normalize fields that may arrive as arrays or JSON strings.
   * Supports both gallery and gallery_json.
   */
  function normalizeExperience(experience) {
    const item = { ...experience };

    function parseArray(value) {
      if (Array.isArray(value)) return value;

      if (typeof value === 'string' && value.trim()) {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          console.warn('Could not parse JSON array:', error);
        }
      }

      return [];
    }

    item.gallery = parseArray(item.gallery ?? item.gallery_json)
      .filter(url => typeof url === 'string' && url.trim());

    item.highlights = parseArray(item.highlights ?? item.highlights_json);
    item.itinerary = parseArray(item.itinerary ?? item.itinerary_json);

    item.name = item.name || 'Travel Experience';
    item.destination = item.destination || '';
    item.locality = item.locality || item.destination;
    item.category = item.category || 'Travel';
    item.description = item.description || '';
    item.image_url = item.image_url || item.gallery[0] || '';
    item.price = Number(item.price) || 0;
    item.rating = Number(item.rating) || 0;
    item.review_count = Number(item.review_count) || 0;
    item.duration = item.duration || 'Duration varies';
    item.experience_id = Number(item.experience_id);

    return item;
  }

  function renderHeaderAndBreadcrumbs() {
    document.title = `${currentExperience.name} | Explorely`;

    const breadcrumbs = document.getElementById('breadcrumbs-bar');

    if (breadcrumbs) {
      breadcrumbs.innerHTML = `
        <a href="index.html">Home</a> &gt;
        <a href="explore.html">Explore</a> &gt;
        <a href="explore.html?destination=${encodeURIComponent(currentExperience.destination)}">
          ${currentExperience.destination}
        </a> &gt;
        <span style="color:var(--on-surface);font-weight:600;">
          ${currentExperience.name}
        </span>
      `;
    }

    const titleEl = document.getElementById('details-title');
    if (titleEl) {
      titleEl.textContent = currentExperience.name;
    }

    const metaLine = document.getElementById('details-meta-line');

    if (metaLine) {
      const isSaved = window.ExplorelyAPI.isExperienceSaved(
        currentExperience.experience_id
      );

      metaLine.innerHTML = `
        <span class="pill-badge pill-badge-teal">
          ${currentExperience.category.toUpperCase()}
        </span>

        <span style="display:flex;align-items:center;gap:4px;font-weight:600;">
          <span style="color:var(--secondary)">★</span>
          ${currentExperience.rating.toFixed(1)}
          <span style="color:var(--text-muted);font-weight:400;">
            (${currentExperience.review_count} reviews)
          </span>
        </span>

        <span>•</span>

        <span style="display:flex;align-items:center;gap:4px;color:var(--text-muted);">
          📍 ${currentExperience.locality || currentExperience.destination}
        </span>

        <span class="pill-badge pill-badge-verified">
          ✓ 100% Verified Local Guide
        </span>
      `;
    }

    const saveBtn = document.getElementById('details-save-btn');

    if (saveBtn) {
      saveBtn.dataset.experienceId = currentExperience.experience_id;

      const isSaved = window.ExplorelyAPI.isExperienceSaved(
        currentExperience.experience_id
      );

      saveBtn.classList.toggle('active', isSaved);

      saveBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24"
          fill="${isSaved ? 'currentColor' : 'none'}"
          stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span>${isSaved ? 'Saved to Wishlist' : 'Save Experience'}</span>
      `;

      saveBtn.addEventListener('click', async () => {
        const newState = await window.ExplorelyAPI.toggleSaveExperience(
          currentExperience.experience_id
        );

        saveBtn.classList.toggle('active', newState);
        saveBtn.querySelector('span').textContent =
          newState ? 'Saved to Wishlist' : 'Save Experience';

        saveBtn.querySelector('svg').setAttribute(
          'fill',
          newState ? 'currentColor' : 'none'
        );

        window.showToast(
          newState ? 'Added to your wishlist!' : 'Removed from wishlist.'
        );
      });
    }
  }

  // -------------------------------------------------------------
  // GALLERY — supports gallery arrays and gallery_json strings
  // -------------------------------------------------------------
  function renderGallery() {
    const galleryContainer = document.getElementById('gallery-container');
    if (!galleryContainer) return;

    // Support API responses containing either field
    const rawGallery =
      currentExperience.gallery ?? currentExperience.gallery_json;

    let gallery = [];

    if (Array.isArray(rawGallery)) {
      gallery = rawGallery;
    } else if (typeof rawGallery === 'string') {
      try {
        const parsed = JSON.parse(rawGallery);
        if (Array.isArray(parsed)) {
          gallery = parsed;
        }
      } catch (error) {
        console.warn('Could not parse experience gallery:', error);
      }
    }

    // Remove empty or invalid entries
    gallery = gallery.filter(
      url => typeof url === 'string' && url.trim().length > 0
    );

    // Use the cover image only if there are no gallery images
    if (gallery.length === 0 && currentExperience.image_url) {
      gallery = [currentExperience.image_url];
    }

    const mainImg = gallery[0] || currentExperience.image_url || '';
    const sub1 = gallery[1] || mainImg;
    const sub2 = gallery[2] || mainImg;

    galleryContainer.innerHTML = `
      <div class="gallery-grid">
        <div class="gallery-main">
          <img
            src="${mainImg}"
            alt="${currentExperience.name}"
            onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80';"
          >
        </div>

        <div class="gallery-sub">
          <img
            src="${sub1}"
            alt="${currentExperience.name} - view 2"
            onerror="this.onerror=null;this.src='${mainImg}';"
          >
        </div>

        <div class="gallery-sub" style="position:relative;">
          <img
            src="${sub2}"
            alt="${currentExperience.name} - view 3"
            onerror="this.onerror=null;this.src='${mainImg}';"
          >

          <div style="
            position:absolute;
            bottom:12px;
            right:12px;
            background:rgba(15,23,42,0.8);
            color:#fff;
            padding:6px 12px;
            border-radius:999px;
            font-size:12px;
            font-weight:600;
            backdrop-filter:blur(4px);
          ">
            📷 View Gallery
          </div>
        </div>
      </div>
    `;
  }

  function renderSpecs() {
    const specsEl = document.getElementById('specs-container');
    if (!specsEl) return;

    specsEl.innerHTML = `
      <div class="specs-strip">
        <div class="spec-item">
          <span class="spec-label">Duration</span>
          <span class="spec-value">⏱️ ${currentExperience.duration}</span>
        </div>

        <div class="spec-item">
          <span class="spec-label">Group Size</span>
          <span class="spec-value">
            👥 ${currentExperience.group_size || 'Max 12 Guests'}
          </span>
        </div>

        <div class="spec-item">
          <span class="spec-label">Best Season</span>
          <span class="spec-value">
            ☀️ ${currentExperience.best_time || 'October – May'}
          </span>
        </div>

        <div class="spec-item">
          <span class="spec-label">Guide Type</span>
          <span class="spec-value">
            🎙️ ${currentExperience.guide || 'Bilingual & Certified'}
          </span>
        </div>
      </div>
    `;
  }

  function renderAboutAndHighlights() {
    const aboutEl = document.getElementById('about-description-text');

    if (aboutEl) {
      aboutEl.textContent = currentExperience.description;
    }

    const highlightsList = document.getElementById('highlights-list');

    if (highlightsList) {
      highlightsList.innerHTML = currentExperience.highlights.map(h => `
        <li style="
          display:flex;
          align-items:flex-start;
          gap:0.75rem;
          margin-bottom:0.75rem;
          font-size:15px;
          color:var(--on-surface-variant);
        ">
          <span style="color:var(--primary);font-weight:700;font-size:16px;">✓</span>
          <span>${h}</span>
        </li>
      `).join('');
    }

    const meetingAddress = document.getElementById('meeting-address-text');

    if (meetingAddress) {
      meetingAddress.textContent = currentExperience.address || '';
    }
  }

  function renderTimeline() {
    const timelineEl = document.getElementById('itinerary-timeline-list');
    if (!timelineEl) return;

    const timeline = currentExperience.itinerary.length
      ? currentExperience.itinerary
      : [
          {
            time: '08:00 AM',
            title: 'Arrival & Orientation',
            desc: 'Meet your guide and complete the safety checklist.'
          },
          {
            time: '09:30 AM',
            title: 'Main Activity Commences',
            desc: 'Enjoy your guided travel excursion.'
          },
          {
            time: '01:30 PM',
            title: 'Regional Lunch & Relaxation',
            desc: 'Enjoy local cuisine and refreshments.'
          }
        ];

    timelineEl.innerHTML = timeline.map(step => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-time">${step.time || ''}</div>
        <div class="timeline-title">${step.title || ''}</div>
        <div class="timeline-desc">${step.desc || ''}</div>
      </div>
    `).join('');
  }

  function renderBookingSidebar() {
    const sidebar = document.getElementById('sticky-booking-card');
    if (!sidebar) return;

    const price = currentExperience.price;
    const formattedPrice = window.formatINR
      ? window.formatINR(price)
      : '₹' + price;

    sidebar.innerHTML = `
      <div class="booking-price-header">
        <div>
          <span style="font-size:13px;color:var(--text-muted);">From</span>
          <div style="
            font-size:28px;
            font-weight:800;
            color:var(--on-surface);
            line-height:1.1;
          ">${formattedPrice}</div>
          <span style="font-size:12px;color:var(--text-muted);">
            per person (all inclusive)
          </span>
        </div>
        <span class="pill-badge pill-badge-amber">Best Price Guaranteed</span>
      </div>

      <div class="booking-form-box">
        <div class="input-field-group">
          <label class="input-label">Select Date</label>
          <input type="date" id="booking-date-input" class="input-control"
            value="${new Date().toISOString().split('T')[0]}">
        </div>

        <div class="input-field-group">
          <label class="input-label">Guests</label>
          <select id="booking-guests-select" class="input-control">
            <option value="1">1 Person</option>
            <option value="2" selected>2 Guests</option>
            <option value="3">3 Guests</option>
            <option value="4">4 Guests</option>
            <option value="6">6 Guests (Group)</option>
          </select>
        </div>

        <div style="
          background-color:var(--surface-container-low);
          padding:1rem;
          border-radius:var(--radius-lg);
          margin-top:0.5rem;
        ">
          <div style="
            display:flex;
            justify-content:space-between;
            margin-bottom:0.5rem;
            font-size:13px;
          ">
            <span id="price-math-label">${formattedPrice} × 2 guests</span>
            <span id="price-subtotal-val">
              ${window.formatINR ? window.formatINR(price * 2) : '₹' + price * 2}
            </span>
          </div>

          <div style="
            display:flex;
            justify-content:space-between;
            margin-bottom:0.5rem;
            font-size:13px;
            color:var(--text-muted);
          ">
            <span>Taxes & Heritage Entry</span>
            <span style="color:var(--primary);font-weight:600;">Included (₹0)</span>
          </div>

          <div style="
            border-top:1px dashed var(--border);
            padding-top:0.5rem;
            display:flex;
            justify-content:space-between;
            font-weight:800;
            font-size:16px;
          ">
            <span>Total Payable</span>
            <span id="price-total-val" style="color:var(--primary);">
              ${window.formatINR ? window.formatINR(price * 2) : '₹' + price * 2}
            </span>
          </div>
        </div>

        <button class="btn btn-primary" id="btn-proceed-booking"
          style="width:100%;padding:0.9rem;margin-top:0.5rem;">
          Proceed to Fast Booking
        </button>

        <button class="btn btn-secondary" id="btn-sidebar-save"
          style="width:100%;padding:0.75rem;">
          ❤️ Add to Saved Wishlist
        </button>

        <div style="
          display:flex;
          flex-direction:column;
          gap:0.5rem;
          margin-top:1rem;
          font-size:12px;
          color:var(--text-muted);
        ">
          <div style="display:flex;align-items:center;gap:6px;">
            <span>🛡️</span>
            <span>Free cancellation up to 24 hours in advance</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span>⚡</span>
            <span>Instant mobile ticket confirmation & voucher</span>
          </div>
        </div>
      </div>
    `;

    const guestsSelect = sidebar.querySelector('#booking-guests-select');

    const updateCalculatedPrice = () => {
      const qty = parseInt(guestsSelect.value, 10);
      const total = price * qty;

      sidebar.querySelector('#price-math-label').textContent =
        `${formattedPrice} × ${qty} ${qty === 1 ? 'person' : 'guests'}`;

      sidebar.querySelector('#price-subtotal-val').textContent =
        window.formatINR ? window.formatINR(total) : '₹' + total;

      sidebar.querySelector('#price-total-val').textContent =
        window.formatINR ? window.formatINR(total) : '₹' + total;
    };

    guestsSelect.addEventListener('change', updateCalculatedPrice);

    sidebar.querySelector('#btn-proceed-booking').addEventListener('click', () => {
      const qty = guestsSelect.value;
      const date = sidebar.querySelector('#booking-date-input').value;
      const total = price * parseInt(qty, 10);
      showBookingModal(date, qty, total);
    });

    const saveButton = sidebar.querySelector('#btn-sidebar-save');

    const updateSaveButton = () => {
      const saved = window.ExplorelyAPI.isExperienceSaved(currentExperience.experience_id);
      saveButton.textContent = saved ? '❤️ Saved to Wishlist' : '❤️ Add to Saved Wishlist';
      saveButton.setAttribute('aria-pressed', String(saved));
    };

    updateSaveButton();

    saveButton.addEventListener('click', async () => {
      if (saveButton.disabled) return;
      saveButton.disabled = true;
      try {
        const isSaved = await window.ExplorelyAPI.toggleSaveExperience(
          currentExperience.experience_id
        );
        updateSaveButton();
        if (window.showToast) {
          window.showToast(isSaved ? 'Added to your saved wishlist!' : 'Removed from wishlist.');
        }
      } catch (error) {
        if (error.code === 'LOGIN_REQUIRED') {
          window.ExplorelyAPI.redirectToLogin('Please log in to save items.');
        } else if (window.showToast) {
          window.showToast(error.message || 'Could not update wishlist. Please try again.', 'error');
        }
      } finally {
        saveButton.disabled = false;
      }
    });

    window.addEventListener('explorely:saved-updated', updateSaveButton);
  }

  function showBookingModal(date, guests, total) {
    let modal = document.getElementById('booking-confirmation-modal');

    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'booking-confirmation-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-card">
        <button class="modal-close-btn"
          onclick="this.closest('.modal-backdrop').classList.remove('open')">
          &times;
        </button>

        <div style="text-align:center;margin-bottom:1.5rem;">
          <div style="
            width:50px;
            height:50px;
            border-radius:50%;
            background:var(--primary-light);
            color:var(--primary);
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:24px;
            margin:0 auto 1rem;
          ">✓</div>

          <h3 style="font-size:22px;font-weight:700;">Fast Booking Reservation</h3>
          <p style="font-size:14px;color:var(--text-muted);margin-top:4px;">
            No upfront payment required for project demonstration.
          </p>
        </div>

        <div style="
          background-color:var(--surface-container-low);
          padding:1.25rem;
          border-radius:var(--radius-lg);
          margin-bottom:1.5rem;
        ">
          <div style="
            font-size:15px;
            font-weight:700;
            color:var(--on-surface);
            margin-bottom:0.75rem;
          ">${currentExperience.name}</div>

          <div style="
            font-size:13px;
            color:var(--on-surface-variant);
            display:flex;
            flex-direction:column;
            gap:0.4rem;
          ">
            <div>📅 <strong>Reserved Date:</strong> ${date}</div>
            <div>👥 <strong>Travelers:</strong> ${guests} Guests</div>
            <div>📍 <strong>Departure Pier:</strong> ${currentExperience.address || ''}</div>
            <div style="
              font-size:16px;
              font-weight:800;
              color:var(--primary);
              margin-top:0.5rem;
            ">
              Total: ${window.formatINR ? window.formatINR(total) : '₹' + total}
            </div>
          </div>
        </div>

        <div style="display:flex;gap:1rem;">
          <button class="btn btn-secondary" style="flex:1;"
            onclick="this.closest('.modal-backdrop').classList.remove('open')">
            Cancel
          </button>
          <button class="btn btn-primary" style="flex:1;" id="btn-confirm-reservation">
            Confirm Reservation
          </button>
        </div>
      </div>
    `;

    modal.querySelector('#btn-confirm-reservation').addEventListener('click', () => {
      modal.classList.remove('open');
      window.showToast('Reservation confirmed! Booking voucher dispatched.');
    });

    modal.classList.add('open');
  }

  // -------------------------------------------------------------
  // Reviews System
  // -------------------------------------------------------------
  async function renderReviews() {
    const summaryCard = document.getElementById('reviews-summary-card');
    const reviewsList = document.getElementById('reviews-list-container');
    let reviews;

    try {
      reviews = await window.ExplorelyAPI.getReviews(currentExperience.experience_id);
    } catch (error) {
      if (summaryCard) {
        summaryCard.innerHTML = `<p style="color:var(--text-muted);">Reviews could not be loaded. Please try again.</p>`;
      }
      if (reviewsList) {
        reviewsList.innerHTML = `<div style="padding:1.5rem;text-align:center;color:var(--text-muted);">Unable to connect to the review service. No local or sample reviews are being shown.</div>`;
      }
      setupReviewForm();
      return;
    }

    const validReviews = Array.isArray(reviews)
      ? reviews.filter(r => Number(r.rating) >= 1 && Number(r.rating) <= 5)
      : [];
    const total = validReviews.length;
    const average = total
      ? validReviews.reduce((sum, r) => sum + Number(r.rating), 0) / total
      : 0;

    // In API mode the fetched database reviews are the source of truth.
    if (summaryCard) {
      const distribution = [5, 4, 3, 2, 1].map(rating => {
        const count = validReviews.filter(r => Number(r.rating) === rating).length;
        return { rating, count, percentage: total ? Math.round(count / total * 100) : 0 };
      });

      summaryCard.innerHTML = `
        <div class="rating-big-score">
          <div class="big-rating-num">${average.toFixed(1)}</div>
          <div style="display:flex;color:var(--secondary);font-size:20px;margin:0.25rem 0;">
            ${'★'.repeat(Math.round(average))}${'☆'.repeat(5 - Math.round(average))}
          </div>
          <div style="font-size:13px;color:var(--text-muted);font-weight:500;">
            Based on ${total} ${total === 1 ? 'review' : 'reviews'}
          </div>
        </div>
        <div class="rating-bars-list">
          ${distribution.map(item => `
            <div class="rating-bar-row">
              <span>${item.rating} ★</span>
              <div class="rating-bar-track"><div class="rating-bar-fill" style="width:${item.percentage}%;"></div></div>
              <span>${item.count}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (reviewsList) {
      if (!total) {
        reviewsList.innerHTML = `
          <div style="padding:1.5rem;background:#fff;border-radius:12px;text-align:center;color:var(--text-muted);font-size:14px;">
            No reviews yet for this experience. Be the first traveler to share your feedback below!
          </div>`;
      } else {
        reviewsList.innerHTML = validReviews.map(r => {
          const rating = Number(r.rating);
          const name = escapeHTML(r.user_name || 'Traveler');
          const comment = escapeHTML(r.comment || '');
          const date = escapeHTML(r.date || '');
          const avatar = escapeHTML(r.user_avatar || initialsFor(r.user_name));
          return `
            <div class="review-item">
              <div class="review-header">
                <div class="reviewer-info">
                  <div class="avatar-circle" style="width:36px;height:36px;font-size:13px;">${avatar}</div>
                  <div>
                    <div class="reviewer-name">${name}</div>
                    <div class="review-date">${date}</div>
                  </div>
                </div>
                <div style="color:var(--secondary);font-size:15px;letter-spacing:1px;">
                  ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}
                </div>
              </div>
              <p style="font-size:14px;color:var(--on-surface-variant);line-height:1.55;white-space:pre-wrap;">${comment}</p>
            </div>`;
        }).join('');
      }
    }

    // Use the actual review list for the header summary too.
    currentExperience.rating = Number(average.toFixed(1));
    currentExperience.review_count = total;
    const metaLine = document.getElementById('details-meta-line');
    if (metaLine) {
      const ratingText = metaLine.querySelector('span[style*="font-weight:600"]');
      if (ratingText) ratingText.innerHTML = `<span style="color:var(--secondary)">★</span> ${average.toFixed(1)} <span style="color:var(--text-muted);font-weight:400;">(${total} reviews)</span>`;
    }

    setupReviewForm();
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function initialsFor(name) {
    const parts = String(name || 'Traveler').trim().split(/\s+/);
    return ((parts[0] || 'T')[0] + ((parts[1] || parts[0] || 'R')[0] || 'R')).toUpperCase();
  }

  function setupReviewForm() {
    const starSelector = document.getElementById('star-rating-selector');

    if (starSelector && !starSelector.dataset.bound) {
      starSelector.dataset.bound = 'true';
      const stars = starSelector.querySelectorAll('span');
      stars.forEach(star => {
        star.addEventListener('click', event => {
          selectedReviewRating = parseInt(event.currentTarget.dataset.rating, 10) || 5;
          stars.forEach(s => {
            s.classList.toggle('active', (parseInt(s.dataset.rating, 10) || 0) <= selectedReviewRating);
          });
        });
      });
    }

    const reviewForm = document.getElementById('leave-review-form');
    if (!reviewForm || reviewForm.dataset.bound) return;
    reviewForm.dataset.bound = 'true';

    const authorInput = document.getElementById('review-author-input');
    if (authorInput && window.ExplorelyAPI.getMode() === 'api' && window.ExplorelyAPI.getToken()) {
      const user = window.ExplorelyAPI.getCurrentUser();
      authorInput.value = user && user.name ? user.name : '';
      authorInput.readOnly = true;
    }

    reviewForm.addEventListener('submit', async event => {
      event.preventDefault();
      const textInput = document.getElementById('review-comment-input');
      const comment = textInput ? textInput.value.trim() : '';

      if (window.ExplorelyAPI.getMode() === 'api' && window.ExplorelyAPI.requiresLogin()) {
        window.ExplorelyAPI.redirectToLogin('Please log in to write a review.');
        return;
      }
      if (!comment) {
        window.showToast('Please provide your review thoughts.', 'error');
        return;
      }

      const submitButton = reviewForm.querySelector('[type="submit"]');
      if (submitButton) submitButton.disabled = true;

      try {
        await window.ExplorelyAPI.addReview({
          experience_id: currentExperience.experience_id,
          rating: selectedReviewRating,
          comment
        });

        if (textInput) textInput.value = '';
        window.showToast('Thank you! Your review has been submitted.');

        const refreshed = await window.ExplorelyAPI.getExperienceById(currentExperience.experience_id);
        if (refreshed) currentExperience = normalizeExperience(refreshed);
        renderHeaderAndBreadcrumbs();
        await renderReviews();
      } catch (error) {
        if (error.code === 'LOGIN_REQUIRED') {
          window.ExplorelyAPI.redirectToLogin('Please log in to write a review.');
        } else {
          window.showToast(error.message || 'Could not submit review.', 'error');
        }
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  async function renderSimilarExperiences() {
    const container = document.getElementById('similar-experiences-grid');
    if (!container) return;

    const all = await window.ExplorelyAPI.getExperiences({
      destination: currentExperience.destination
    });

    const similar = all
      .filter(e => Number(e.experience_id) !== currentExperience.experience_id)
      .slice(0, 3);

    if (similar.length === 0) {
      container.innerHTML = `
        <p style="color:var(--text-muted);font-size:14px;">
          No other experiences found in ${currentExperience.destination}.
        </p>
      `;
      return;
    }

    container.innerHTML = similar.map(exp => `
      <div class="experience-card">
        <div class="card-image-wrap">
          <img
            src="${exp.image_url || ''}"
            alt="${exp.name || 'Travel experience'}"
            onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80';"
          >
          <span class="pill-badge pill-badge-teal card-badge-top-left">
            ${(exp.category || 'Travel').toUpperCase()}
          </span>
        </div>

        <div class="card-body">
          <div class="card-location-row">
            <span>📍 ${exp.locality || exp.destination || ''}</span>
            <span>⏱️ ${exp.duration || ''}</span>
          </div>

          <h3 class="card-title">
            <a href="experience-detail.html?id=${exp.experience_id}">
              ${exp.name || 'Travel Experience'}
            </a>
          </h3>

          <div class="card-rating-row">
            <span class="star-icon">★</span>
            ${(Number(exp.rating) || 0).toFixed(1)}
            (${Number(exp.review_count) || 0})
          </div>

          <div class="card-footer-row">
            <div class="card-price-block">
              <span class="card-price-value">
                ${window.formatINR
                  ? window.formatINR(Number(exp.price) || 0)
                  : '₹' + (Number(exp.price) || 0)}
              </span>
            </div>
            <a href="experience-detail.html?id=${exp.experience_id}"
              class="btn btn-secondary btn-sm">
              View Details
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  document.addEventListener('DOMContentLoaded', loadDetails);

})();
