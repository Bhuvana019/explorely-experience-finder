
/**
 * EXPLORE / SEARCH RESULTS PAGE SCRIPT
 * State-wise filters, sorting, pagination, and experience cards.
 */

(function () {
  "use strict";

  const ALL_REGION = "All Destinations";

  let currentFilters = {
    destination: ALL_REGION,
    category: "All Categories",
    min_rating: null,
    max_price: null,
    duration: null,
    search: "",
    sort_by: "highest_rated"
  };

  let currentPage = 1;
  const itemsPerPage = 6;
  let allExperiences = [];
  let allMatchingExperiences = [];

  // Map common destination names to their correct state or region.
  const STATE_CITIES = {
    "Tamil Nadu": [
      "Chennai", "Mahabalipuram", "Mamallapuram", "Madurai",
      "Thanjavur", "Tanjore", "Rameswaram", "Kanyakumari",
      "Ooty", "Udhagamandalam", "Kodaikanal", "Hogenakkal",
      "Dhanushkodi", "Tiruchirappalli", "Trichy", "Coimbatore",
      "Kanchipuram", "Tirunelveli", "Velankanni"
    ],
    "Kerala": [
      "Kochi", "Cochin", "Fort Kochi", "Alappuzha", "Alleppey",
      "Munnar", "Thekkady", "Varkala", "Kovalam", "Kumarakom",
      "Kozhikode", "Calicut", "Athirappilly", "Marari", "Bekal",
      "Wayanad", "Thiruvananthapuram", "Trivandrum", "Kannur",
      "Thrissur", "Palakkad", "Kollam", "Kasargod"
    ],
    "Karnataka": [
      "Mysuru", "Mysore", "Hampi", "Badami", "Pattadakal",
      "Aihole", "Belur", "Halebidu", "Halebid", "Somanathapura",
      "Bengaluru", "Bangalore", "Coorg", "Kodagu", "Gokarna",
      "Murudeshwar", "Udupi", "Malpe", "Jog Falls", "Jog",
      "Chikmagalur", "Chikkamagaluru", "Mangaluru", "Mangalore",
      "Dandeli", "Vijayapura", "Bijapur", "Shravanabelagola",
      "Srirangapatna", "Shivamogga"
    ],
    "Goa": [
      "Goa", "Baga", "Palolem", "Candolim", "Calangute",
      "Fontainhas", "Panjim", "Panaji", "Ponda", "Old Goa",
      "Vasco da Gama", "Anjuna", "Agonda", "Colva", "Margao"
    ],
    "Andhra Pradesh": [
      "Araku Valley", "Araku", "Visakhapatnam", "Vizag",
      "Tirupati", "Lepakshi", "Srikalahasti", "Vijayawada",
      "Undavalli", "Borra Caves", "Amaravati", "Rajahmundry",
      "Kakinada", "Guntur", "Kurnool", "Anantapur",
      "Ahobilam", "Srisailam"
    ],
    "Telangana": [
      "Hyderabad", "Warangal", "Bhongir", "Yadadri", "Yadagirigutta",
      "Ramappa", "Khammam", "Karimnagar", "Nizamabad",
      "Medak", "Nalgonda", "Ramoji Film City"
    ],
    "Puducherry": [
      "Puducherry", "Pondicherry", "Karaikal", "Yanam", "Mahe"
    ],
    "Rajasthan": ["Jaipur"],
    "Delhi": ["Delhi", "New Delhi"],
    "Himachal Pradesh": ["Manali"]
  };

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[’']/g, "")
      .replace(/[^a-z0-9]+/g, " ");
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function getPlaceState(place) {
    // If the API already supplies a state field, prefer it.
    const explicitState = normalize(place.state || place.state_name);

    for (const state of Object.keys(STATE_CITIES)) {
      if (normalize(state) === explicitState) return state;
    }

    const destination = normalize(place.destination);
    const locality = normalize(place.locality);
    const address = normalize(place.address);

    for (const [state, cities] of Object.entries(STATE_CITIES)) {
      const knownNames = [state, ...cities].map(normalize);

      if (
        knownNames.includes(destination) ||
        knownNames.includes(locality)
      ) {
        return state;
      }

      // Use address matching only as a fallback.
      if (
        address &&
        knownNames.some(name => {
          const paddedAddress = ` ${address} `;
          return paddedAddress.includes(` ${name} `);
        })
      ) {
        return state;
      }
    }

    return null;
  }

  function loadUrlParams() {
    const params = new URLSearchParams(window.location.search);

    if (params.has("destination")) {
      currentFilters.destination = params.get("destination");
    }
    if (params.has("category")) {
      currentFilters.category = params.get("category");
    }
    if (params.has("search")) {
      currentFilters.search = params.get("search");
    }
    if (params.has("min_rating")) {
      currentFilters.min_rating = params.get("min_rating");
    }
    if (params.has("max_price")) {
      currentFilters.max_price = params.get("max_price");
    }
    if (params.has("sort_by")) {
      currentFilters.sort_by = params.get("sort_by");
    }

    const searchDest = document.getElementById("search-dest-input");
    if (searchDest && currentFilters.destination !== ALL_REGION &&
        currentFilters.destination !== "All India") {
      searchDest.value = currentFilters.destination;
    }

    const searchKeyword = document.getElementById("search-keyword-input");
    if (searchKeyword && currentFilters.search) {
      searchKeyword.value = currentFilters.search;
    }

    syncFilterControls();
  }

  function syncFilterControls() {
    document.querySelectorAll('input[name="filter_destination"]')
      .forEach(radio => {
        radio.checked =
          normalize(radio.value) === normalize(currentFilters.destination) ||
          (radio.value === ALL_REGION &&
           ["all india", "all south india"].includes(
             normalize(currentFilters.destination)
           ));
      });

    document.querySelectorAll('input[name="filter_category"]')
      .forEach(input => {
        input.checked =
          normalize(input.value) === normalize(currentFilters.category);
      });

    document.querySelectorAll('input[name="filter_budget"]')
      .forEach(radio => {
        radio.checked =
          String(radio.value) === String(currentFilters.max_price);
      });

    document.querySelectorAll('input[name="filter_rating"]')
      .forEach(radio => {
        radio.checked =
          String(radio.value) === String(currentFilters.min_rating);
      });

    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) sortSelect.value = currentFilters.sort_by;
  }

  async function refreshDestinationFilter() {
    const firstRadio = document.querySelector(
      'input[name="filter_destination"]'
    );
    const container = firstRadio?.closest(".filter-options-list");

    if (!container) return;

    try {
      // Use the full catalogue, not a state-filtered API request.
      const records = await window.ExplorelyAPI.getExperiences({});
      allExperiences = Array.isArray(records) ? records : [];

      const counts = {};
      for (const state of Object.keys(STATE_CITIES)) {
        counts[state] = allExperiences.filter(
          place => getPlaceState(place) === state
        ).length;
      }

      const total = Object.values(counts).reduce(
        (sum, count) => sum + count, 0
      );

      container.innerHTML = `
        <label class="filter-radio-label">
          <span>
            <input type="radio"
                   name="filter_destination"
                   value="${ALL_REGION}">
            ${ALL_REGION}
          </span>
          <span class="filter-count-badge">${total}</span>
        </label>
        ${Object.entries(counts)
          .filter(([, count]) => count > 0)
          .map(([state, count]) => `
            <label class="filter-radio-label">
              <span>
                <input type="radio"
                       name="filter_destination"
                       value="${escapeHTML(state)}">
                ${escapeHTML(state)}
              </span>
              <span class="filter-count-badge">${count}</span>
            </label>
          `).join("")}
      `;

      container.querySelectorAll('input[name="filter_destination"]')
        .forEach(radio => {
          radio.addEventListener("change", () => {
            currentFilters.destination = radio.value;
            currentPage = 1;
            loadExperiences();
          });
        });

      syncFilterControls();
    } catch (error) {
      console.error("Could not build state filters:", error);
    }
  }

  function renderCard(exp) {
    const isSaved = window.ExplorelyAPI
      ? window.ExplorelyAPI.isExperienceSaved(exp.experience_id)
      : false;

    const category = exp.category || "Experience";
    const categoryClass = category === "Adventure"
      ? "pill-badge-teal"
      : category === "Historical"
        ? "pill-badge-amber"
        : "pill-badge-glass";

    const rating = Number(exp.rating || 0);
    const reviewCount = Number(exp.review_count || 0);
    const hasReviews = rating > 0 && reviewCount > 0;

    const image = escapeHTML(exp.image_url || "");
    const name = escapeHTML(exp.name || "Experience");
    const duration = escapeHTML(exp.duration || "Duration varies");
    const location = escapeHTML(exp.locality || exp.destination || "");
    const price = Number(exp.price || 0);

    return `
      <div class="experience-card" data-id="${escapeHTML(exp.experience_id)}">
        <div class="card-image-wrap">
          <img
            src="${image}"
            alt="${name}"
            loading="lazy"
            onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80';"
          >
          <span class="pill-badge ${categoryClass} card-badge-top-left">
            ${escapeHTML(category.toUpperCase())}
          </span>
          <button
            class="card-save-btn ${isSaved ? "active" : ""}"
            data-experience-id="${escapeHTML(exp.experience_id)}"
            title="${isSaved ? "Remove from wishlist" : "Save to wishlist"}"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"
                 fill="${isSaved ? "currentColor" : "none"}"
                 stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>

        <div class="card-body">
          <div class="card-location-row">
            <span class="card-locality">📍 ${location}</span>
            <span class="card-duration">◷ ${duration}</span>
          </div>

          <h3 class="card-title">
            <a href="experience-detail.html?id=${encodeURIComponent(exp.experience_id)}">
              ${name}
            </a>
          </h3>

          <div class="card-rating-row">
            ${hasReviews
              ? `<span class="star-icon">★</span>
                 <span>${rating.toFixed(1)}</span>
                 <span class="card-reviews-count">(${reviewCount} reviews)</span>`
              : `<span class="card-reviews-count">No verified reviews yet</span>`
            }
          </div>

          <div class="card-footer-row">
            <div class="card-price-block">
              <span class="card-price-label">Price per person</span>
              <span class="card-price-value">
                ${window.formatINR
                  ? window.formatINR(price)
                  : "₹" + price.toLocaleString("en-IN")}
              </span>
            </div>
            <a href="experience-detail.html?id=${encodeURIComponent(exp.experience_id)}"
               class="btn btn-secondary btn-sm"
               style="border-radius:var(--radius-md);">
              View Details
            </a>
          </div>
        </div>
      </div>
    `;
  }

  function renderSkeletons(count = 6) {
    const grid = document.getElementById("experiences-results-grid");
    if (!grid) return;

    grid.innerHTML = Array.from({ length: count }, () =>
      '<div class="experience-card skeleton" style="height:380px;opacity:.6;"></div>'
    ).join("");
  }

  function applyLocalFilters(records) {
    let results = [...records];

    const destination = currentFilters.destination;
    if (
      destination &&
      destination !== ALL_REGION &&
      destination !== "All India" &&
      destination !== "All South India"
    ) {
      const selectedState = Object.keys(STATE_CITIES).find(
        state => normalize(state) === normalize(destination)
      );

      if (selectedState) {
        // State selected: show experiences belonging to that state.
        results = results.filter(
          place => getPlaceState(place) === selectedState
        );
      } else {
        // City selected: show only experiences matching that city.
        const wantedCity = normalize(destination);
        const wantedStem = wantedCity.replace(/[uaieo]+$/, "");

        results = results.filter(place => {
          const d = normalize(place.destination);
          const l = normalize(place.locality);
          const n = normalize(place.name);
          const a = normalize(place.address);
          return (
            d === wantedCity || l === wantedCity || n === wantedCity ||
            (wantedStem.length >= 3 && d && (d.startsWith(wantedStem) || wantedCity.startsWith(d))) ||
            (wantedStem.length >= 3 && l && (l.startsWith(wantedStem) || wantedCity.startsWith(l))) ||
            a.includes(` ${wantedCity} `) || (wantedStem.length >= 3 && a.includes(` ${wantedStem} `))
          );
        });
      }
    }

    if (currentFilters.category &&
        currentFilters.category !== "All Categories") {
      results = results.filter(
        place => normalize(place.category) === normalize(currentFilters.category)
      );
    }

    if (currentFilters.search) {
      const term = normalize(currentFilters.search);
      results = results.filter(place => {
        const text = normalize([
          place.name,
          place.destination,
          place.locality,
          place.category,
          place.description
        ].join(" "));
        return text.includes(term);
      });
    }

    if (currentFilters.max_price !== null &&
        currentFilters.max_price !== "" &&
        Number.isFinite(Number(currentFilters.max_price))) {
      results = results.filter(
        place => Number(place.price || 0) <= Number(currentFilters.max_price)
      );
    }

    if (currentFilters.min_rating !== null &&
        currentFilters.min_rating !== "") {
      results = results.filter(place =>
        Number(place.rating || 0) >= Number(currentFilters.min_rating) &&
        Number(place.review_count || 0) > 0
      );
    }

    switch (currentFilters.sort_by) {
      case "lowest_price":
        results.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        break;
      case "highest_price":
        results.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        break;
      case "highest_rated":
        results.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
        break;
      case "popular":
        results.sort((a, b) =>
          Number(b.review_count || 0) - Number(a.review_count || 0)
        );
        break;
      case "name":
        results.sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || ""))
        );
        break;
    }

    return results;
  }

  async function loadExperiences() {
    renderSkeletons(itemsPerPage);
    renderFilterPills();

    try {
      // Reuse the catalogue already loaded for state counts.
      // If needed, fetch the catalogue again.
      if (!allExperiences.length) {
        const records = await window.ExplorelyAPI.getExperiences({});
        allExperiences = Array.isArray(records) ? records : [];
      }

      allMatchingExperiences = applyLocalFilters(allExperiences);
      renderResults();
    } catch (error) {
      console.error("Failed to load experiences:", error);
      const grid = document.getElementById("experiences-results-grid");
      if (grid) {
        grid.innerHTML = `
          <div style="grid-column:1/-1;padding:3rem;text-align:center;background:#fff;border-radius:16px;">
            <p style="color:var(--error);font-weight:600;">
              Unable to load experiences. Check that the API is running.
            </p>
            <button class="btn btn-secondary btn-sm"
                    style="margin-top:1rem;"
                    onclick="location.reload()">Retry</button>
          </div>`;
      }
    }
  }

  function renderResults() {
    const grid = document.getElementById("experiences-results-grid");
    const countDisplay = document.getElementById("results-count-number");
    const header = document.getElementById("header-banner-text");
    const pagination = document.getElementById("pagination-container");

    if (!grid) return;

    const total = allMatchingExperiences.length;
    if (countDisplay) countDisplay.textContent = `${total} experiences found`;

    if (header) {
      const region = currentFilters.destination &&
        ![ALL_REGION, "All India"].includes(currentFilters.destination)
        ? ` in ${currentFilters.destination}`
        : "";
      header.textContent = `Showing ${total} experiences${region}`;
    }

    if (total === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1" class="empty-state-box">
          <div class="empty-state-icon">🔍</div>
          <h3>No matching experiences found</h3>
          <p>Try another state or clear some filters.</p>
          <button class="btn btn-primary" id="btn-reset-filters">
            Clear All Filters
          </button>
        </div>`;

      grid.querySelector("#btn-reset-filters")
        ?.addEventListener("click", clearAllFilters);

      if (pagination) pagination.innerHTML = "";
      return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    grid.innerHTML = allMatchingExperiences
      .slice(start, start + itemsPerPage)
      .map(renderCard)
      .join("");

    renderPagination(total);
  }

  function renderFilterPills() {
    const container = document.getElementById("active-filter-pills");
    if (!container) return;

    const pills = [];

    if (currentFilters.destination &&
        ![ALL_REGION, "All India"].includes(currentFilters.destination)) {
      pills.push({ type: "destination", label: currentFilters.destination });
    }
    if (currentFilters.category !== "All Categories") {
      pills.push({ type: "category", label: currentFilters.category });
    }
    if (currentFilters.min_rating !== null &&
        currentFilters.min_rating !== "") {
      pills.push({ type: "min_rating", label: `Rating ${currentFilters.min_rating}+ ★` });
    }
    if (currentFilters.max_price !== null &&
        currentFilters.max_price !== "") {
      pills.push({
        type: "max_price",
        label: `Under ₹${Number(currentFilters.max_price).toLocaleString("en-IN")}`
      });
    }
    if (currentFilters.search) {
      pills.push({ type: "search", label: currentFilters.search });
    }

    container.innerHTML = pills.map(pill => `
      <span class="filter-pill-tag">
        ${escapeHTML(pill.label)}
        <button type="button" class="filter-pill-remove"
                data-type="${pill.type}" aria-label="Remove filter">&times;</button>
      </span>
    `).join("");

    container.querySelectorAll(".filter-pill-remove").forEach(button => {
      button.addEventListener("click", () => {
        const type = button.dataset.type;

        if (type === "destination") currentFilters.destination = ALL_REGION;
        if (type === "category") currentFilters.category = "All Categories";
        if (type === "min_rating") currentFilters.min_rating = null;
        if (type === "max_price") currentFilters.max_price = null;
        if (type === "search") currentFilters.search = "";

        currentPage = 1;
        syncFilterControls();
        loadExperiences();
      });
    });
  }

  function renderPagination(totalCount) {
    const container = document.getElementById("pagination-container");
    if (!container) return;

    const totalPages = Math.ceil(totalCount / itemsPerPage);
    if (totalPages <= 1) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = `
      <div class="pagination-wrap">
        <button class="pagination-btn" id="page-prev"
          ${currentPage === 1 ? "disabled" : ""}>←</button>
        ${Array.from({ length: totalPages }, (_, index) => index + 1)
          .map(page => `
            <button class="pagination-btn ${page === currentPage ? "active" : ""}"
                    data-page="${page}">${page}</button>
          `).join("")}
        <button class="pagination-btn" id="page-next"
          ${currentPage === totalPages ? "disabled" : ""}>→</button>
      </div>`;

    container.querySelectorAll("[data-page]").forEach(button => {
      button.addEventListener("click", () => {
        currentPage = Number(button.dataset.page);
        renderResults();
        window.scrollTo({ top: 120, behavior: "smooth" });
      });
    });

    container.querySelector("#page-prev")?.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderResults();
        window.scrollTo({ top: 120, behavior: "smooth" });
      }
    });

    container.querySelector("#page-next")?.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderResults();
        window.scrollTo({ top: 120, behavior: "smooth" });
      }
    });
  }

  function clearAllFilters() {
    currentFilters = {
      destination: ALL_REGION,
      category: "All Categories",
      min_rating: null,
      max_price: null,
      duration: null,
      search: "",
      sort_by: "highest_rated"
    };

    currentPage = 1;

    const destinationInput = document.getElementById("search-dest-input");
    if (destinationInput) destinationInput.value = "";

    const keywordInput = document.getElementById("search-keyword-input");
    if (keywordInput) keywordInput.value = "";

    syncFilterControls();
    loadExperiences();
  }

  function setupFilterEventListeners() {
    // Dynamic destination radios are wired by refreshDestinationFilter().
    document.querySelectorAll('input[name="filter_category"]')
      .forEach(input => {
        input.addEventListener("change", () => {
          currentFilters.category = input.checked
            ? input.value
            : "All Categories";
          currentPage = 1;
          loadExperiences();
        });
      });

    document.querySelectorAll('input[name="filter_budget"]')
      .forEach(radio => {
        radio.addEventListener("change", () => {
          currentFilters.max_price = radio.value;
          currentPage = 1;
          loadExperiences();
        });
      });

    document.querySelectorAll('input[name="filter_rating"]')
      .forEach(radio => {
        radio.addEventListener("change", () => {
          currentFilters.min_rating = radio.value;
          currentPage = 1;
          loadExperiences();
        });
      });

    document.getElementById("sort-select")
      ?.addEventListener("change", event => {
        currentFilters.sort_by = event.target.value;
        currentPage = 1;
        loadExperiences();
      });

    document.getElementById("btn-clear-all-filters")
      ?.addEventListener("click", clearAllFilters);

    // Dates & guests popover; persist selections in the URL so they survive refreshes.
    const dateTrigger = document.getElementById("dates-guests-trigger");
    const datePopover = document.getElementById("dates-guests-popover");
    const startDate = document.getElementById("search-start-date");
    const endDate = document.getElementById("search-end-date");
    const guestCountEl = document.getElementById("search-guest-count");
    let guestCount = Math.max(1, Math.min(30, Number(new URLSearchParams(location.search).get("guests")) || 2));
    const paramsAtLoad = new URLSearchParams(location.search);
    if (startDate) startDate.value = paramsAtLoad.get("start_date") || "";
    if (endDate) endDate.value = paramsAtLoad.get("end_date") || "";
    if (guestCountEl) guestCountEl.textContent = String(guestCount);
    const updateDateLabel = () => {
      if (!dateTrigger) return;
      const dates = startDate?.value && endDate?.value ? `${startDate.value} – ${endDate.value}` : "Anytime";
      dateTrigger.textContent = `${dates} • ${guestCount} ${guestCount === 1 ? "Guest" : "Guests"}`;
    };
    updateDateLabel();
    dateTrigger?.addEventListener("click", () => {
      const open = datePopover.hidden;
      datePopover.hidden = !open;
      dateTrigger.setAttribute("aria-expanded", String(open));
    });
    document.getElementById("guests-minus")?.addEventListener("click", () => {
      guestCount = Math.max(1, guestCount - 1);
      if (guestCountEl) guestCountEl.textContent = String(guestCount);
    });
    document.getElementById("guests-plus")?.addEventListener("click", () => {
      guestCount = Math.min(30, guestCount + 1);
      if (guestCountEl) guestCountEl.textContent = String(guestCount);
    });
    startDate?.addEventListener("change", () => { if (endDate && startDate.value) { endDate.min = startDate.value; if (endDate.value && endDate.value < startDate.value) endDate.value = ""; } });
    document.getElementById("dates-guests-apply")?.addEventListener("click", () => {
      if (startDate?.value && endDate?.value && endDate.value < startDate.value) {
        window.showToast?.("Check-out must be after check-in.", "error"); return;
      }
      updateDateLabel();
      datePopover.hidden = true;
      dateTrigger?.setAttribute("aria-expanded", "false");
    });

    document.getElementById("explore-search-form")
      ?.addEventListener("submit", event => {
        event.preventDefault();

        const destination = document.getElementById("search-dest-input")
          ?.value.trim();
        const keyword = document.getElementById("search-keyword-input")
          ?.value.trim();

        if (destination) {
          // Accept a state name or a city name in the search box.
          const matchingState = Object.keys(STATE_CITIES).find(
            state => normalize(state) === normalize(destination)
          );

          currentFilters.destination = matchingState || destination;
        }

        currentFilters.search = keyword || "";
        currentPage = 1;
        const searchParams = new URLSearchParams(window.location.search);
        if (destination) searchParams.set("destination", destination); else searchParams.delete("destination");
        if (keyword) searchParams.set("search", keyword); else searchParams.delete("search");
        if (startDate?.value) searchParams.set("start_date", startDate.value); else searchParams.delete("start_date");
        if (endDate?.value) searchParams.set("end_date", endDate.value); else searchParams.delete("end_date");
        searchParams.set("guests", String(guestCount));
        history.replaceState(null, "", `${window.location.pathname}?${searchParams.toString()}`);
        syncFilterControls();
        loadExperiences();
      });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    loadUrlParams();
    setupFilterEventListeners();
    await refreshDestinationFilter();

    // Convert legacy "All India" selection to the South India default.
    if (currentFilters.destination === "All India") {
      currentFilters.destination = ALL_REGION;
    }

    syncFilterControls();
    await loadExperiences();
  });

})();
