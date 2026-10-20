/**
 * CATEGORIES HUB & TRAVEL STYLES SCRIPT
 * Manages Travel Style Finder Quiz, quick category navigation, and live experiences loading.
 */

(function () {
  'use strict';

  // Category Configuration
  const CATEGORIES = [
    {
      id: "adventure",
      name: "Adventure",
      title: "Adventure & High Adrenaline",
      icon: "🏄‍♂️",
      tagline: "Unleash thrills across Arabian ocean depths, sky-high peaks, and jungle rapids.",
      intensity: "High Adrenaline",
      idealFor: "Thrill Seekers & Active Explorers",
      priceSpectrum: "₹1,450 – ₹8,500",
      topHubs: ["Goa (Scuba, Bungee, Jeep Safaris)", "Manali (Paragliding, Zorbing)", "Jaipur (Hot Air Ballooning)"],
      description: "From plunging into the crystalline Arabian sea off Grand Island to leaping 55 meters above Mayem Lake and soaring on tandem paragliders above Himalayan cedar forests.",
      filterKey: "Adventure"
    },
    {
      id: "historical",
      name: "Historical",
      title: "Historical & Heritage Walks",
      icon: "🏛️",
      tagline: "Walk through Rajput fortresses, 450-yr Portuguese villas, and Dravidian stone wonders.",
      intensity: "Easy to Moderate Walks",
      idealFor: "Culture Lovers & History Enthusiasts",
      priceSpectrum: "₹850 – ₹1,600",
      topHubs: ["Jaipur (Palaces & Sundials)", "Goa (Fontainhas & Old Goa)", "Chennai (UNESCO Shore Temples & Mylapore)"],
      description: "Unravel stories etched in stone. Explore Asia's grandest cathedrals, 7th-century rock-cut monolithic sanctuaries facing the Bay of Bengal, and Jaipur's 953 honeycombed palace windows.",
      filterKey: "Historical"
    },
    {
      id: "food",
      name: "Food",
      title: "Culinary & Food Trails",
      icon: "🍛",
      tagline: "Taste royal Rajput court recipes, midnight Mughal kebabs, and heirloom coastal curries.",
      intensity: "Sensory & Gastronomic",
      idealFor: "Foodies & Culinary Explorers",
      priceSpectrum: "₹950 – ₹4,200",
      topHubs: ["Delhi (Chandni Chowk Midnight Food)", "Goa (Spice Plantations & Seafood)", "Bangalore (1940s Tiffins)"],
      description: "A sensory feast across India's culinary heartlands: fragrant cardamom groves in Ponda, slow-cooked royal Laal Maas under gold palace ceilings, and steaming brass-filter coffee.",
      filterKey: "Food"
    },
    {
      id: "beach",
      name: "Beach & Leisure",
      title: "Beach & Coastal Leisure",
      icon: "🏖️",
      tagline: "Sail into golden sunsets aboard luxury catamarans and cycle breezy coastal promenades.",
      intensity: "Relaxed & Scenic",
      idealFor: "Couples, Friends & Sunset Lovers",
      priceSpectrum: "₹1,199 – ₹1,800",
      topHubs: ["Goa (Mandovi River, Aguada Bay)", "Mumbai (Marine Drive Queen's Necklace)", "Chennai (Marina Beach)"],
      description: "Soak in the rhythm of the waves. Enjoy twin-hull catamaran sunset cruises accompanied by live Konkani acoustic melodies and sunrise cycling along oceanfront esplanades.",
      filterKey: "Beach & Leisure"
    },
    {
      id: "nature",
      name: "Nature",
      title: "Nature & Wildlife Sanctuaries",
      icon: "🌿",
      tagline: "Paddle through quiet mangrove estuaries and trek into mist-shrouded Western Ghats.",
      intensity: "Moderate Nature Walks",
      idealFor: "Wildlife Watchers & Eco Travelers",
      priceSpectrum: "₹1,450 – ₹2,600",
      topHubs: ["Goa (Sal River Mangroves, Netravali Rainforest)"],
      description: "Escape into untouched biodiversity. Spot kingfishers and river otters in mangrove tidal labyrinths, or discover secluded bubbling sacred lagoons deep in the Western Ghats canopy.",
      filterKey: "Nature"
    },
    {
      id: "nightlife",
      name: "Nightlife",
      title: "Nightlife, Pubs & Social Scenes",
      icon: "🍸",
      tagline: "Explore craft microbrewery taprooms, riverside sunset decks, and live music lounges.",
      intensity: "Lively & Social",
      idealFor: "Groups & Night Owls",
      priceSpectrum: "₹1,200 – ₹2,500",
      topHubs: ["Bangalore (Indiranagar Taprooms)", "Goa (Sunset Beach Clubs)"],
      description: "Immerse yourself in India's buzzing social tapestry. Experience craft beer tasting flights in Bangalore's pub capital with behind-the-scenes brewhouse tours and live music sets.",
      filterKey: "Nightlife"
    }
  ];

  // Render Mini Experience Card for Category Collections
  function renderMiniExpCard(exp) {
    const isSaved = window.ExplorelyAPI ? window.ExplorelyAPI.isExperienceSaved(exp.experience_id) : false;
    return `
      <div class="experience-card" style="box-shadow:var(--shadow-level-1);">
        <div class="card-image-wrap">
          <img src="${exp.image_url}" alt="${exp.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'">
          <span class="pill-badge pill-badge-teal card-badge-top-left">${exp.destination}</span>
          <button class="card-save-btn ${isSaved ? 'active' : ''}" data-experience-id="${exp.experience_id}" title="Save item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
        <div class="card-body">
          <div class="card-location-row">
            <span>📍 ${exp.locality || exp.destination}</span>
            <span>⏱️ ${exp.duration}</span>
          </div>
          <h3 class="card-title">
            <a href="experience-detail.html?id=${exp.experience_id}">${exp.name}</a>
          </h3>
          <div class="card-rating-row">
            <span class="star-icon">★</span> ${exp.rating.toFixed(1)} (${exp.review_count} reviews)
          </div>
          <div class="card-footer-row">
            <div class="card-price-block">
              <span class="card-price-label">Price per person</span>
              <span class="card-price-value">${window.formatINR ? window.formatINR(exp.price) : '₹' + exp.price}</span>
            </div>
            <a href="experience-detail.html?id=${exp.experience_id}" class="btn btn-secondary btn-sm">View Details</a>
          </div>
        </div>
      </div>
    `;
  }

  // Load Experiences into each category container
  async function loadCategoryExperiences() {
    if (!window.ExplorelyAPI) return;

    for (const cat of CATEGORIES) {
      const container = document.getElementById(`cat-grid-${cat.id}`);
      if (!container) continue;

      try {
        const experiences = await window.ExplorelyAPI.getExperiences({ category: cat.filterKey });
        const items = experiences.slice(0, 3);
        if (items.length > 0) {
          container.innerHTML = items.map(renderMiniExpCard).join('');
        } else {
          container.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 1.5rem; text-align: center; color: var(--text-muted);">
              Experiences in this category can be explored via search.
            </div>
          `;
        }
      } catch (err) {
        console.error(`Failed to load ${cat.name} experiences:`, err);
      }
    }
  }

  // Travel Style Finder Quiz Logic
  function setupStyleQuiz() {
    const quizCard = document.getElementById('travel-style-quiz');
    if (!quizCard) return;

    let quizState = {
      energy: "high", // 'high', 'chill', 'culture', 'food'
      who: "solo",    // 'solo', 'couple', 'friends'
      env: "ocean"    // 'ocean', 'forts', 'mountains'
    };

    const quizOptions = quizCard.querySelectorAll('.quiz-pill-btn');
    quizOptions.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const group = btn.closest('.quiz-pill-options');
        group.querySelectorAll('.quiz-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const key = btn.dataset.key;
        const val = btn.dataset.val;
        quizState[key] = val;

        computeQuizResult();
      });
    });

    function computeQuizResult() {
      let matchedCat = "Adventure";
      let matchedId = "adventure";
      let matchReason = "High-adrenaline water sports and alpine thrills matched to your active energy level.";

      if (quizState.energy === "culture" || quizState.env === "forts") {
        matchedCat = "Historical & Heritage";
        matchedId = "historical";
        matchReason = "Centuries-old Rajput palaces, Dravidian monolithic sanctuaries, and Latin quarters.";
      } else if (quizState.energy === "food") {
        matchedCat = "Culinary & Food Trails";
        matchedId = "food";
        matchReason = "Midnight Old Delhi street food walks, spice plantations, and royal palace banquets.";
      } else if (quizState.energy === "chill" && quizState.env === "ocean") {
        matchedCat = "Beach & Coastal Leisure";
        matchedId = "beach";
        matchReason = "Sunset catamaran cruises and tranquil Arabian coastal trails.";
      } else if (quizState.energy === "chill") {
        matchedCat = "Nature & Wildlife";
        matchedId = "nature";
        matchReason = "Pristine mangrove kayaking and serene Western Ghats rainforest canopy walks.";
      }

      const resultTitle = document.getElementById('quiz-result-category-title');
      const resultDesc = document.getElementById('quiz-result-category-desc');
      const resultBtn = document.getElementById('quiz-result-btn');

      if (resultTitle) resultTitle.textContent = matchedCat;
      if (resultDesc) resultDesc.textContent = matchReason;
      if (resultBtn) {
        resultBtn.onclick = () => {
          const targetSection = document.getElementById(`cat-section-${matchedId}`);
          if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            targetSection.style.outline = '2px solid var(--primary)';
            setTimeout(() => targetSection.style.outline = 'none', 2000);
          }
        };
      }
    }
  }

  // Quick Category Jump buttons
  function setupQuickNav() {
    document.querySelectorAll('.cat-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const targetSection = document.getElementById(`cat-section-${targetId}`);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupQuickNav();
    setupStyleQuiz();
    loadCategoryExperiences();
  });

})();
