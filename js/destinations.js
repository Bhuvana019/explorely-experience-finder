/**
 * DESTINATIONS PORTAL SCRIPT
 * Manages Region filtering, Destination Comparator tool, and Insider Guide modals.
 */

(function () {
  'use strict';

  // Master Destination Data Registry
  const DESTINATIONS_DATA = {
    goa: {
      name: "Goa",
      region: "coastal",
      tagline: "Sun, Sand & 450-Year Portuguese Charm",
      badge: "Coastal & Heritage",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
      description: "A tropical tapestry of golden Arabian shores, swaying palm groves, and vibrant Latin quarters. From high-thrill scuba diving off Grand Island to serene mangrove kayaking along the River Sal.",
      bestTime: "October – May",
      budget: "₹2,000 / day",
      duration: "4 – 6 Days",
      experiencesCount: 8,
      rating: "4.8 ★",
      localities: ["Grand Island", "Panaji & Fontainhas", "Cavelossim", "Mollem National Park", "Candolim"],
      signatureDish: "Goan Fish Curry Thali, Recheado Crab & Bebinca",
      diningSpot: "The Fisherman's Wharf (Cavelossim)",
      vibe: "Tropical, Laid-back & Adrenaline",
      connectivity: "Dabolim (GOI) & Mopa (GOX) Airports; Madgaon / Thivim Railway",
      itinerary: [
        { day: "Day 1", title: "Panaji Latin Quarter & Mandovi River", desc: "Stroll Fontainhas' pastel-washed Portuguese villas, taste authentic bebinca at an artisanal 90-yr bakery, and finish with a sunset catamaran cruise on the Mandovi." },
        { day: "Day 2", title: "Grand Island Scuba & Dolphin Safari", desc: "Morning speedboat cruise through Aguada Bay, coral reef diving with PADI instructors, followed by a secluded island beach barbecue." },
        { day: "Day 3", title: "Jungle Safari & Mollem Cascades", desc: "4x4 off-road jeep drive across forest streams to the 310m Dudhsagar Waterfalls, followed by an organic spice plantation banquet in Ponda." }
      ],
      insiderTip: "Rent a self-drive scooter for coast cruising, and visit South Goa (Palolem, Agonda) if you prefer serene empty bays over busy party beaches."
    },
    jaipur: {
      name: "Jaipur",
      region: "royal",
      tagline: "The Pink City & Regalia of Rajasthan",
      badge: "Royal Heritage",
      image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80",
      description: "The timeless heart of Rajput majesty. Terracotta-pink facades, towering hilltop forts, astronomical stone observatories, and centuries of vibrant royal pageantry.",
      bestTime: "October – March",
      budget: "₹2,500 / day",
      duration: "3 – 4 Days",
      experiencesCount: 4,
      rating: "4.9 ★",
      localities: ["Amer Fort Ridge", "Old Walled City", "Badi Choupad", "Johari Bazaar"],
      signatureDish: "Royal Laal Maas, Dal Baati Churma & Pyaaz Kachori",
      diningSpot: "1135 AD Royal Dining at Amber Fort",
      vibe: "Majestic, Historic & Vibrant Bazaars",
      connectivity: "Jaipur International Airport (JAI); Jaipur Junction Railway",
      itinerary: [
        { day: "Day 1", title: "Amber Fort & Hot Air Balloon Drift", desc: "Sunrise hot air balloon flight drifting over Aravalli ridges and Amer palace ramparts, followed by an elephant-gate courtyard tour." },
        { day: "Day 2", title: "Hawa Mahal, City Palace & Observatories", desc: "Walk through Hawa Mahal's 953 honeycombed windows, explore Maharaja Sawai Jai Singh's City Palace, and decode ancient sundials at Jantar Mantar." },
        { day: "Day 3", title: "Bazaars, Block-Printing & Palace Dining", desc: "Shop Johari Bazaar gemstone lanes, try Sanganeri woodblock printing, and dine like royalty under gold ceilings at 1135 AD inside Amber Fort." }
      ],
      insiderTip: "Early mornings before 09:30 AM are best for Hawa Mahal photographs when golden light strikes the eastern sandstone facade without traffic."
    },
    manali: {
      name: "Manali",
      region: "mountains",
      tagline: "Himalayan Vistas, Alpine Valleys & Snow Thrills",
      badge: "Mountain Escape",
      image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
      description: "Perched along the rushing Beas River beneath snow-mantled Pir Panjal peaks. The gateway to extreme high-altitude adventure, deodar forests, and high mountain passes.",
      bestTime: "All Year (Snow: Dec–Feb, Flying: Mar–Jun)",
      budget: "₹2,200 / day",
      duration: "4 – 5 Days",
      experiencesCount: 3,
      rating: "4.9 ★",
      localities: ["Solang Valley", "Old Manali", "Vashisht", "Rohtang Pass", "Naggar"],
      signatureDish: "Himalayan River Trout, Traditional Siddu & Fresh Apple Cider",
      diningSpot: "Old Manali Riverside Cafes",
      vibe: "Crisp Alpine, Thrilling & Bohemian",
      connectivity: "Bhuntar Airport (KUU, 50 km); Volvo overnight sleeper coaches from Delhi/Chandigarh",
      itinerary: [
        { day: "Day 1", title: "Arrival, Cedar Forests & Old Manali", desc: "Walk through whispering Hadimba temple deodars, browse acoustic cafes in Old Manali, and dip in Vashisht natural sulfur hot springs." },
        { day: "Day 2", title: "Solang Valley Paragliding & Zorbing", desc: "High-altitude tandem paragliding taking off from 8,000 feet with snow-peak panoramas, followed by meadow zorbing." },
        { day: "Day 3", title: "Rohtang / Atal Tunnel High Pass Expedition", desc: "Drive through the engineering marvel of Atal Tunnel to Lahaul valley's otherworldly mountain landscape and glacier viewpoints." }
      ],
      insiderTip: "Book paragliding pilots early morning (08:30–10:30 AM) when thermal air currents are smoothest and valley visibility is clearest."
    },
    delhi: {
      name: "Delhi",
      region: "royal",
      tagline: "Capital of Seven Empires & Heritage Street Food",
      badge: "Imperial & Culinary",
      image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
      description: "A monumental collision of ancient Mughal architecture, British colonial symmetry, and the intoxicating aromas of century-old culinary alleys.",
      bestTime: "October – March",
      budget: "₹1,800 / day",
      duration: "3 – 4 Days",
      experiencesCount: 4,
      rating: "4.8 ★",
      localities: ["Chandni Chowk", "Jama Masjid", "Connaught Place", "Mehrauli", "Hauz Khas"],
      signatureDish: "Karim's 1913 Mutton Burra, Paranthe Wali Gali & Rabri Jalebi",
      diningSpot: "Karim's Historic Mughlai Kitchen (Jama Masjid)",
      vibe: "Imperial, Energetic & Foodie Mecca",
      connectivity: "Indira Gandhi International Airport (DEL); New Delhi Railway (NDLS)",
      itinerary: [
        { day: "Day 1", title: "Old Delhi Midnight Food Walk", desc: "Sample 100-year-old crisp jalebis, succulent seekh kebabs, paranthas, and saffron kulfi under lantern light in Shahjahanabad." },
        { day: "Day 2", title: "Mughal Monuments & Spice Market", desc: "Tour the Red Fort, climb Jama Masjid's southern minaret, and take a rickshaw ride through Asia's largest spice market at Khari Baoli." },
        { day: "Day 3", title: "Qutub Minar & Lodhi Art District", desc: "Marvel at the 12th-century victory tower and iron pillar, followed by a stroll through Lodhi Gardens and street art murals." }
      ],
      insiderTip: "Use the Delhi Metro's Heritage Line (Violet Line) to hop effortlessly between Old Delhi monuments and South Delhi arts districts without road congestion."
    },
    chennai: {
      name: "Chennai",
      region: "coastal",
      tagline: "Dravidian Temples, Bay of Bengal Coast & Filter Kaapi",
      badge: "Dravidian Coast",
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
      description: "The cultural soul of South India. Towering temple gopurams, ancient Carnatic music traditions, 7th-century UNESCO seaside stone sculptures, and the second-longest urban beach in the world.",
      bestTime: "November – February",
      budget: "₹1,500 / day",
      duration: "2 – 3 Days",
      experiencesCount: 3,
      rating: "4.8 ★",
      localities: ["Mylapore", "Mahabalipuram Coast", "Marina Beach", "Besant Nagar"],
      signatureDish: "Brass-filter Kaapi, Ghee Roast Podi Idli & Chettinad Crab Curry",
      diningSpot: "Rayar's Mess & Saravana Bhavan",
      vibe: "Cultural, Spiritual & Coastal Heritage",
      connectivity: "Chennai International Airport (MAA); Chennai Central Railway (MAS)",
      itinerary: [
        { day: "Day 1", title: "Mylapore Heritage & Carnatic Walk", desc: "Sunrise walk around Kapaleeshwarar Temple tank, sacred kolam art demo, and authentic brass-filter coffee with hot ghee idlis." },
        { day: "Day 2", title: "Mahabalipuram UNESCO Shore Temples", desc: "Scenic East Coast Road drive to 7th-century rock-cut monoliths facing the Bay of Bengal, Arjuna's Penance, and live stone carving." },
        { day: "Day 3", title: "Marina Beach & Kalakshetra Arts", desc: "Dawn stroll on Marina Beach with local fishermen, followed by a visit to Kalakshetra foundation for classical Bharatnatyam dance." }
      ],
      insiderTip: "Mylapore is most magical at 06:30 AM when temple bells chime, flower vendors string fresh jasmine, and filter coffee is brewed fresh."
    },
    bangalore: {
      name: "Bangalore",
      region: "modern",
      tagline: "Silicon Garden City, Craft Breweries & Iconic Tiffins",
      badge: "Urban & Breweries",
      image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80",
      description: "India's tech innovation engine embraced by sprawling botanical gardens, tree-lined boulevards, world-class microbreweries, and nostalgic 1940s South Indian tiffin institutions.",
      bestTime: "All Year (Pleasant plateau climate)",
      budget: "₹1,800 / day",
      duration: "2 – 3 Days",
      experiencesCount: 3,
      rating: "4.8 ★",
      localities: ["Indiranagar 100ft Rd", "Basavanagudi", "Church Street", "Cubbon Park", "Koramangala"],
      signatureDish: "Crispy Ghee Masala Dosa, House-brewed IPAs & Mysore Pak",
      diningSpot: "Vidyarthi Bhavan (Gandhi Bazaar, est. 1943)",
      vibe: "Cosmopolitan, Youthful & Lush Greenery",
      connectivity: "Kempegowda International Airport (BLR); KSR Bengaluru City Railway (SBC)",
      itinerary: [
        { day: "Day 1", title: "Cubbon Park & 1943 Heritage Tiffin", desc: "Morning walk under Cubbon Park bamboo groves, followed by legendary ghee roast dosas at Vidyarthi Bhavan in Gandhi Bazaar." },
        { day: "Day 2", title: "Indiranagar Craft Microbrewery Trail", desc: "Brewery hop across 3 award-winning taprooms, tasting tropical IPAs, wheat beers, and sourdough pizzas with a brewmaster guide." },
        { day: "Day 3", title: "Lalbagh Glass House & Church Street", desc: "Tour the 240-acre botanical conservatory, then browse indie bookstores and music cafes on pedestrian Church Street." }
      ],
      insiderTip: "Bengaluru's craft breweries shine brightest on weekday early evenings (Tuesday to Thursday) before weekend crowds arrive."
    },
    mumbai: {
      name: "Mumbai",
      region: "coastal",
      tagline: "City of Dreams, Marine Drive & Art Deco Marvels",
      badge: "Coastal Metropolis",
      image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
      description: "A relentless coastal powerhouse where historic Gothic & Art Deco architecture overlooks the Arabian Sea. Dawn cycling tours, iconic Irani bakeries, and sunset sea-link views.",
      bestTime: "November – February",
      budget: "₹2,500 / day",
      duration: "3 – 4 Days",
      experiencesCount: 3,
      rating: "4.8 ★",
      localities: ["Colaba", "Marine Drive", "Fort Art Deco", "Bandra Coast", "Kala Ghoda"],
      signatureDish: "Yazdani Bakery Bun Maska & Chai, Bombay Duck Fry & Vada Pav",
      diningSpot: "Britannia & Co. / Yazdani Bakery (Fort)",
      vibe: "Electrifying, Ocean-Facing & Cinematic",
      connectivity: "Chhatrapati Shivaji Maharaj International (BOM); CSMT Railway",
      itinerary: [
        { day: "Day 1", title: "Dawn Cycling on Marine Drive & Gateway", desc: "Cycle along Queen's Necklace at dawn before traffic awakens, view Art Deco landmarks, and savor Irani bun maska at Yazdani." },
        { day: "Day 2", title: "Kala Ghoda Art Walk & Colaba Causeway", desc: "Explore boutique galleries, heritage cafes, David Sassoon Library, and shop antique trinkets at Colaba Causeway." },
        { day: "Day 3", title: "Bandra Sea Link & Sunset Promenade", desc: "Drive over the Bandra-Worli Sea Link, walk Bandra's Portuguese village chapels, and catch twilight at Bandstand." }
      ],
      insiderTip: "Visit Marine Drive between 05:45 AM and 07:00 AM for the cool Arabian sea breeze and uninterrupted views of the Queen's Necklace."
    }
  };

  // Region Filter Tabs Handler
  function setupRegionFilter() {
    const filterBtns = document.querySelectorAll('.region-pill-btn');
    const cards = document.querySelectorAll('.destination-portal-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const selectedRegion = btn.dataset.region;

        cards.forEach(card => {
          const cardRegion = card.dataset.region;
          if (selectedRegion === 'all' || cardRegion === selectedRegion || (selectedRegion === 'coastal' && (cardRegion === 'coastal')) || (selectedRegion === 'royal' && cardRegion === 'royal')) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // Check URL hash (e.g., destinations.html#goa)
    if (window.location.hash) {
      const destKey = window.location.hash.substring(1).toLowerCase();
      const targetCard = document.getElementById(`dest-card-${destKey}`);
      if (targetCard) {
        setTimeout(() => {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetCard.style.outline = '3px solid var(--primary)';
          setTimeout(() => targetCard.style.outline = 'none', 2500);
        }, 300);
      }
    }
  }

  // Side-by-Side Comparator Tool
  function setupComparator() {
    const selectA = document.getElementById('compare-dest-a');
    const selectB = document.getElementById('compare-dest-b');

    if (!selectA || !selectB) return;

    const updateComparison = () => {
      const destA = DESTINATIONS_DATA[selectA.value] || DESTINATIONS_DATA.goa;
      const destB = DESTINATIONS_DATA[selectB.value] || DESTINATIONS_DATA.jaipur;

      // Update Column Headers
      document.getElementById('cmp-head-a').textContent = destA.name;
      document.getElementById('cmp-head-b').textContent = destB.name;

      // Update Vibe
      document.getElementById('cmp-vibe-a').textContent = destA.vibe;
      document.getElementById('cmp-vibe-b').textContent = destB.vibe;

      // Update Best Time
      document.getElementById('cmp-season-a').textContent = destA.bestTime;
      document.getElementById('cmp-season-b').textContent = destB.bestTime;

      // Update Budget
      document.getElementById('cmp-budget-a').textContent = destA.budget;
      document.getElementById('cmp-budget-b').textContent = destB.budget;

      // Update Stay Length
      document.getElementById('cmp-stay-a').textContent = destA.duration;
      document.getElementById('cmp-stay-b').textContent = destB.duration;

      // Update Highlights
      document.getElementById('cmp-dish-a').textContent = destA.signatureDish;
      document.getElementById('cmp-dish-b').textContent = destB.signatureDish;

      // Update Links
      const linkA = document.getElementById('cmp-link-a');
      const linkB = document.getElementById('cmp-link-b');
      if (linkA) {
        linkA.href = `explore.html?destination=${encodeURIComponent(destA.name)}`;
        linkA.textContent = `Explore ${destA.name} Experiences →`;
      }
      if (linkB) {
        linkB.href = `explore.html?destination=${encodeURIComponent(destB.name)}`;
        linkB.textContent = `Explore ${destB.name} Experiences →`;
      }
    };

    selectA.addEventListener('change', updateComparison);
    selectB.addEventListener('change', updateComparison);
    updateComparison();
  }

  // Insider Guide Modal
  function setupGuideModal() {
    const modal = document.getElementById('dest-guide-modal');
    if (!modal) return;

    const closeBtn = document.getElementById('close-dest-guide');
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('open'));

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });

    document.querySelectorAll('.btn-open-dest-guide').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const destKey = e.currentTarget.dataset.dest;
        const data = DESTINATIONS_DATA[destKey];
        if (!data) return;

        document.getElementById('modal-dest-img').src = data.image;
        document.getElementById('modal-dest-title').textContent = data.name;
        document.getElementById('modal-dest-tagline').textContent = data.tagline;
        document.getElementById('modal-dest-desc').textContent = data.description;
        document.getElementById('modal-dest-season').textContent = data.bestTime;
        document.getElementById('modal-dest-connectivity').textContent = data.connectivity;
        document.getElementById('modal-dest-tip').textContent = data.insiderTip;

        // Render 3-Day Itinerary
        const itinWrap = document.getElementById('modal-dest-itinerary');
        itinWrap.innerHTML = data.itinerary.map(item => `
          <div class="itinerary-step">
            <div class="itinerary-day-badge">${item.day}</div>
            <div>
              <h4 style="font-size:15px;font-weight:700;color:var(--on-surface);margin-bottom:0.25rem;">${item.title}</h4>
              <p style="font-size:13.5px;color:var(--on-surface-variant);line-height:1.5;">${item.desc}</p>
            </div>
          </div>
        `).join('');

        // Link
        const exploreBtn = document.getElementById('modal-dest-explore-btn');
        if (exploreBtn) {
          exploreBtn.href = `explore.html?destination=${encodeURIComponent(data.name)}`;
          exploreBtn.textContent = `Explore ${data.name} Experiences (${data.experiencesCount}) →`;
        }

        modal.classList.add('open');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupRegionFilter();
    setupComparator();
    setupGuideModal();
  });

})();
