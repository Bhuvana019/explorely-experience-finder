/**
 * EXPLORELY UNIFIED DATA & REST API CLIENT
 * Supports dual-mode:
 * 1. Live FastAPI REST API calls (Production & Full-Stack mode)
 * 2. Standalone Client-side Mock/LocalStorage (Zero-dependency standalone mode)
 */

(function (window) {
  'use strict';

  // Seed Data: 24+ Authentic Indian Travel Experiences
  const SEED_EXPERIENCES = [
    {
      experience_id: 1,
      name: "Grand Island Scuba Diving & Dolphin Safari Combo",
      destination: "Goa",
      locality: "Grand Island, South Goa",
      category: "Adventure",
      description: "Dive into the crystalline waters of Grand Island. Encounter vibrant coral reefs, shipwrecks, and friendly marine life, followed by a dolphin spotting speedboat cruise and a secluded beach barbecue.",
      price: 2499,
      rating: 4.9,
      review_count: 340,
      duration: "6 Hours",
      duration_category: "half_day",
      best_time: "October – May",
      group_size: "Max 12 Guests",
      guide: "PADI Certified & Bilingual",
      address: "Sinquerim Jetty, Candolim, Goa 403515",
      latitude: 15.4852,
      longitude: 73.7699,
      image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80"
      ],
      highlights: [
        "PADI certified briefing and underwater diving gear included",
        "Complimentary high-definition underwater photos and video footage",
        "Dolphin spotting boat cruise along Aguada Bay",
        "Buffet lunch with authentic Goan fish curry, rice & barbecue"
      ],
      itinerary: [
        { time: "07:30 AM", title: "Reporting & Boat Boarding", desc: "Arrive at Sinquerim Jetty for equipment check-in and briefing." },
        { time: "08:30 AM", title: "Dolphin Sighting & Sea Cruise", desc: "Cruise through the Arabian Sea with active dolphin pods." },
        { time: "10:30 AM", title: "Guided Scuba Diving", desc: "One-on-one dive at Grand Island Coral Reef with a master instructor." },
        { time: "01:30 PM", title: "Beach BBQ & Goan Lunch", desc: "Secluded island feast with grilled delicacies and chilled refreshments." },
        { time: "03:30 PM", title: "Jetty Return", desc: "Scenic speedboat transfer back to mainland jetty." }
      ]
    },
    {
      experience_id: 2,
      name: "Mandovi River Sunset Luxury Catamaran Cruise",
      destination: "Goa",
      locality: "Panaji, North Goa",
      category: "Beach & Leisure",
      description: "Sail down the tranquil Mandovi River into the sunset aboard a premium catamaran. Enjoy live Goan folk music, cocktail pairings, and panoramic views of the coastal skyline.",
      price: 1199,
      rating: 4.8,
      review_count: 180,
      duration: "2 Hours",
      duration_category: "half_day",
      best_time: "All Year",
      group_size: "Max 25 Guests",
      guide: "Captain & Host",
      address: "Captain of Ports Jetty, Panaji, Goa 403001",
      latitude: 15.4989,
      longitude: 73.8278,
      image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80"
      ],
      highlights: [
        "Chilled welcome mocktails and Goan savory tapas",
        "Live Konkani and international acoustic music performers",
        "Unimpeded 360-degree sunset photo deck"
      ],
      itinerary: [
        { time: "05:00 PM", title: "Boarding & Welcome Drink", desc: "Step aboard our double-deck twin hull luxury vessel." },
        { time: "05:45 PM", title: "Golden Hour Cruise", desc: "Pass by historic churches and riverside forts as the sun descends." },
        { time: "07:00 PM", title: "Music & Twilight Return", desc: "Twilight reflections under illuminated bridges." }
      ]
    },
    {
      experience_id: 3,
      name: "Kayaking in the Sal Backwaters & Mangroves",
      destination: "Goa",
      locality: "Sal River, South Goa",
      category: "Nature",
      description: "Paddle silently through hidden mangrove canals and untouched backwater estuaries. Spot kingfishers, eagles, and river otters in their lush pristine sanctuary.",
      price: 1450,
      rating: 4.9,
      review_count: 95,
      duration: "3 Hours",
      duration_category: "half_day",
      best_time: "October – April",
      group_size: "Max 8 Guests",
      guide: "Naturalist Guide",
      address: "Mobor Beach Backwater Club, Cavelossim, Goa 403731",
      latitude: 15.1558,
      longitude: 73.9452,
      image_url: "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=1200&q=80"
      ],
      highlights: [
        "Premium single and tandem sit-on-top sea kayaks",
        "Accompanied by veteran river wildlife naturalists",
        "Fresh coconut water stop at river bends"
      ],
      itinerary: [
        { time: "06:30 AM", title: "Paddling Briefing", desc: "Safety gear fitment and basic stroke demonstration." },
        { time: "07:00 AM", title: "Mangrove Labyrinth", desc: "Glide through tidal tunnels beneath canopy shade." },
        { time: "09:30 AM", title: "Debrief & Breakfast", desc: "Traditional poee and tea at the riverside clubhouse." }
      ]
    },
    {
      experience_id: 4,
      name: "Historic Old Goa Churches & Fontainhas Heritage Walk",
      destination: "Goa",
      locality: "Fontainhas, Panaji",
      category: "Historical",
      description: "Step back 450 years into Goa's colonial legacy. Explore Asia's grandest cathedrals in Old Goa, then stroll pastel-hued cobblestone alleys in the Latin Quarter.",
      price: 850,
      rating: 4.7,
      review_count: 112,
      duration: "4 Hours",
      duration_category: "half_day",
      best_time: "Morning / Late Afternoon",
      group_size: "Max 15 Guests",
      guide: "Historian Storyteller",
      address: "Basilica of Bom Jesus Plaza, Old Goa, Goa 403402",
      latitude: 15.5009,
      longitude: 73.9116,
      image_url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80"
      ],
      highlights: [
        "Visit Basilica of Bom Jesus & Se Cathedral",
        "Walking tour through Fontainhas' Portuguese villas",
        "Tasting authentic bebinca at an artisanal 90-year-old bakery"
      ],
      itinerary: [
        { time: "08:30 AM", title: "Old Goa Monuments", desc: "Baroque church architecture and sacred relics." },
        { time: "11:00 AM", title: "Fontainhas Latin Quarter", desc: "Azulejo tile art, wooden balconies, and photo alleys." },
        { time: "12:30 PM", title: "Heritage Tea & Sweets", desc: "Traditional confectionery sampling." }
      ]
    },
    {
      experience_id: 5,
      name: "North Goa Bungee Jumping from 55m",
      destination: "Goa",
      locality: "Mayem Lake, North Goa",
      category: "Adventure",
      description: "Feel the ultimate rush leaping from a 55-meter cantilever platform suspended above picturesque Mayem Lake. Complies with strict Australia/NZ safety guidelines.",
      price: 3750,
      rating: 4.8,
      review_count: 88,
      duration: "1.5 Hours",
      duration_category: "half_day",
      best_time: "October – June",
      group_size: "Individual Jumpers",
      guide: "Master Jump Masters",
      address: "Mayem Lake Tourism Complex, Bicholim, Goa 403504",
      latitude: 15.5866,
      longitude: 73.9458,
      image_url: "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1200&q=80"
      ],
      highlights: [
        "55-meter jump height overlooking freshwater lake",
        "100% safety certified with redundant harnesses",
        "Personalized jump certificate and HD video badge"
      ],
      itinerary: [
        { time: "Session 1", title: "Registration & Weigh-In", desc: "Safety check and harness rigging." },
        { time: "Session 2", title: "Platform Ascent", desc: "Elevator to tower summit with lake view." },
        { time: "Session 3", title: "The Jump", desc: "3, 2, 1, Bungee! Unrivaled freefall adrenaline." }
      ]
    },
    {
      experience_id: 6,
      name: "Spice Village Organic Tour with Traditional Goan Lunch",
      destination: "Goa",
      locality: "Ponda, Central Goa",
      category: "Food",
      description: "Walk under canopies of cardamom, vanilla, nutmeg, and black pepper. Learn age-old Ayurvedic remedies, see betel-nut tree climbers, and savor a traditional banquet on banana leaves.",
      price: 950,
      rating: 4.6,
      review_count: 140,
      duration: "5 Hours",
      duration_category: "half_day",
      best_time: "All Year",
      group_size: "Max 20 Guests",
      guide: "Plantation Botanist",
      address: "Sahakari Spice Farm, Curti, Ponda, Goa 403401",
      latitude: 15.4026,
      longitude: 74.0152,
      image_url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80"
      ],
      highlights: [
        "Traditional aarti and marigold garland welcome",
        "Sensory botanical walk through rare spice cultivars",
        "Authentic wood-fired Goan buffet with cashew feni tasting"
      ],
      itinerary: [
        { time: "10:00 AM", title: "Aromatic Reception", desc: "Herbal welcome brew and floral greeting." },
        { time: "10:30 AM", title: "Guided Spice Trail", desc: "Deep dive into culinary and medicinal botanicals." },
        { time: "01:00 PM", title: "Grand Village Feast", desc: "Unlimited clay-pot delicacies and desserts." }
      ]
    },
    {
      experience_id: 7,
      name: "Sunrise Hot Air Balloon Flight over Amber Palace",
      destination: "Jaipur",
      locality: "Amber, Jaipur",
      category: "Adventure",
      description: "Drift peacefully above the Aravalli hills, 16th-century fortress walls, and royal royal reservoirs as morning mist rises over the Pink City.",
      price: 8500,
      rating: 4.9,
      review_count: 215,
      duration: "3 Hours",
      duration_category: "half_day",
      best_time: "September – April",
      group_size: "Max 8 Guests",
      guide: "Commercial Balloon Pilot",
      address: "Amber Launch Field, Amer, Jaipur, Rajasthan 302028",
      latitude: 26.9855,
      longitude: 75.8513,
      image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
      ],
      highlights: [
        "60-minute majestic aerial flight at sunrise",
        "Flight certificate signed by international pilot",
        "Continental breakfast with champagne celebration on landing"
      ],
      itinerary: [
        { time: "05:15 AM", title: "Launch Site Gathering", desc: "Pre-flight safety instructions and burner ignition." },
        { time: "06:00 AM", title: "Takeoff & Golden Hour Drift", desc: "Floating above forts, lakes, and desert villages." },
        { time: "07:15 AM", title: "Touchdown Celebration", desc: "Traditional champagne toast and landing certificate." }
      ]
    },
    {
      experience_id: 8,
      name: "Pink City Royal Palaces & Jantar Mantar Walking Tour",
      destination: "Jaipur",
      locality: "Old City, Jaipur",
      category: "Historical",
      description: "Discover the architectural mastery of Maharaja Sawai Jai Singh II. Walk through the City Palace, Hawa Mahal's 953 stone lattice windows, and the world's largest stone sundial.",
      price: 1200,
      rating: 4.8,
      review_count: 178,
      duration: "4.5 Hours",
      duration_category: "half_day",
      best_time: "October – March",
      group_size: "Max 12 Guests",
      guide: "Certified Heritage Historian",
      address: "Hawa Mahal Rd, Badi Choupad, Jaipur, Rajasthan 302002",
      latitude: 26.9239,
      longitude: 75.8267,
      image_url: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80"
      ],
      highlights: [
        "Skip-the-line access to City Palace private museum",
        "In-depth astronomical tour of Jantar Mantar instruments",
        "Rooftop view and chai overlooking the iconic Hawa Mahal facade"
      ],
      itinerary: [
        { time: "09:00 AM", title: "Hawa Mahal Facade & History", desc: "Morning photography and wind palace architectural history." },
        { time: "10:30 AM", title: "City Palace Royal Courtyards", desc: "Pritam Niwas Chowk peacock gates and royal armory." },
        { time: "12:15 PM", title: "Jantar Mantar Observatories", desc: "Decoding ancient solar clocks and celestial instruments." }
      ]
    },
    {
      experience_id: 9,
      name: "Old Delhi Midnight Heritage Food Walk",
      destination: "Delhi",
      locality: "Chandni Chowk, Old Delhi",
      category: "Food",
      description: "Navigate the vibrant lanes of Shahjahanabad under lantern light. Sample legendary 100-year-old jalebis, succulent seekh kebabs, paranthas, and saffron kulfi.",
      price: 1200,
      rating: 4.9,
      review_count: 310,
      duration: "3.5 Hours",
      duration_category: "half_day",
      best_time: "All Year (Evening)",
      group_size: "Max 10 Guests",
      guide: "Culinary Historian",
      address: "Gate 1, Jama Masjid Metro Station, Old Delhi 110006",
      latitude: 28.6507,
      longitude: 77.2334,
      image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
      ],
      highlights: [
        "Taste dishes from 6 iconic, multi-generational street-food kitchens",
        "Historic rickshaw ride through the Asia's largest spice market",
        "Safe, hygienic, and expertly curated food tastings"
      ],
      itinerary: [
        { time: "07:30 PM", title: "Jama Masjid Chowk", desc: "Mutton seekh kebabs and butter chicken roti." },
        { time: "08:45 PM", title: "Paranthe Wali Gali", desc: "Crispy stuffed flatbreads and heirloom chutneys." },
        { time: "10:15 PM", title: "Sweet Lane Finale", desc: "Warm rabri jalebi and matka kulfi falooda." }
      ]
    },
    {
      experience_id: 10,
      name: "Trek to Dudhsagar Waterfalls & Jeep Safari",
      destination: "Goa",
      locality: "Mollem National Park, Goa",
      category: "Adventure",
      description: "An exhilarating jungle 4x4 safari across forest streams followed by a hike to the four-tiered 'Sea of Milk' cascade plunging 310 meters.",
      price: 1850,
      rating: 4.8,
      review_count: 165,
      duration: "7 Hours",
      duration_category: "full_day",
      best_time: "October – May",
      group_size: "Max 7 per Jeep",
      guide: "Forest Department Guide",
      address: "Mollem National Park Entry, Sancordem, Goa 403410",
      latitude: 15.3144,
      longitude: 74.3143,
      image_url: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1200&q=80"
      ],
      highlights: [
        "Exciting 4x4 off-road drive through riverbeds",
        "Freshwater dip in the natural pool at the waterfall base",
        "Forest permit and life jackets included"
      ],
      itinerary: [
        { time: "08:00 AM", title: "Mollem Departure", desc: "Board the customized 4x4 open safari jeeps." },
        { time: "09:30 AM", title: "Waterfall Pool Swim", desc: "Relax and swim under the thunderous cascades." },
        { time: "01:00 PM", title: "Jungle Camp Lunch", desc: "Local Goan thali meal at forest edge." }
      ]
    },
    {
      experience_id: 11,
      name: "Solang Valley Paragliding & Zorbing Adventure",
      destination: "Manali",
      locality: "Solang Valley, Manali",
      category: "Adventure",
      description: "Soar like a bird high above snow-capped Himalayan peaks. Experience tandem paragliding with panoramic views of the Pir Panjal range.",
      price: 3200,
      rating: 4.9,
      review_count: 190,
      duration: "2.5 Hours",
      duration_category: "half_day",
      best_time: "All Year (Except Monsoons)",
      group_size: "Tandem Solo",
      guide: "Certified Pilot",
      address: "Solang Valley Adventure Ground, Manali, HP 175131",
      latitude: 32.3166,
      longitude: 77.1585,
      image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
      ],
      highlights: [
        "High-altitude takeoff at 8,000 feet",
        "Complete action camera video footage on SD card",
        "Zorbing roll down alpine meadows"
      ],
      itinerary: [
        { time: "10:00 AM", title: "Equipment Check", desc: "Suit up in flight harnesses and helmet check." },
        { time: "10:45 AM", title: "Takeoff Flight", desc: "15-minute glide soaring over cedar valleys." },
        { time: "11:30 AM", title: "Smooth Landing", desc: "Precision landing at the Solang base camp." }
      ]
    },
    {
      experience_id: 12,
      name: "Bangalore Craft Brewery & Pub Crawl Experience",
      destination: "Bangalore",
      locality: "Indiranagar, Bangalore",
      category: "Nightlife",
      description: "Explore the pub capital of India! Visit 3 award-winning microbreweries, taste house-brewed IPAs, stouts, and witbiers paired with signature gastropub bites.",
      price: 2100,
      rating: 4.8,
      review_count: 128,
      duration: "4 Hours",
      duration_category: "half_day",
      best_time: "All Year",
      group_size: "Max 12 Guests",
      guide: "Brewmaster Host",
      address: "100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038",
      latitude: 12.9719,
      longitude: 77.6412,
      image_url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80"
      ],
      highlights: [
        "Craft beer tasting flight at 3 curated taprooms",
        "Behind-the-scenes brewhouse fermentation tour",
        "Reserved VIP tables and gourmet appetizers"
      ],
      itinerary: [
        { time: "06:30 PM", title: "Stop 1: Microbrewery Tour", desc: "Malt tasting and brewing process walkthrough." },
        { time: "08:00 PM", title: "Stop 2: Rooftop Tasting", desc: "Tropical fruit ales and sourdough pizza." },
        { time: "09:30 PM", title: "Stop 3: Late Night Vibe", desc: "Belgian strong ales with live DJ sets." }
      ]
    },
    {
      experience_id: 13,
      name: "Mahabalipuram Shore Temple & Stone Carving Tour",
      destination: "Chennai",
      locality: "Mahabalipuram, Chennai",
      category: "Historical",
      description: "Marvel at 7th-century UNESCO World Heritage rock monoliths facing the Bay of Bengal, Arjuna's Penance, and Krishna's Butter Ball.",
      price: 1600,
      rating: 4.8,
      review_count: 145,
      duration: "5 Hours",
      duration_category: "half_day",
      best_time: "November – February",
      group_size: "Max 10 Guests",
      guide: "Pallava Heritage Expert",
      address: "Shore Temple Complex, Mahabalipuram, Tamil Nadu 603104",
      latitude: 12.6163,
      longitude: 80.1983,
      image_url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
      ],
      highlights: [
        "Oceanfront Shore Temple dating back to 700 AD",
        "Live stone sculpture demonstration by hereditary artisans",
        "Coastal seafood lunch overlooking surf breaks"
      ],
      itinerary: [
        { time: "08:00 AM", title: "Scenic ECR Drive", desc: "Private AC transit along East Coast Road." },
        { time: "09:30 AM", title: "Five Rathas & Arjuna's Penance", desc: "Intricate monolithic rock sanctuaries." },
        { time: "11:30 AM", title: "Shore Temple Ocean Walk", desc: "Exploring the twin coastal sanctums." }
      ]
    },
    {
      experience_id: 14,
      name: "Mylapore Heritage Walk with Traditional Carnatic Music",
      destination: "Chennai",
      locality: "Mylapore, Chennai",
      category: "Historical",
      description: "Experience the spiritual and cultural heart of Chennai. Walk around the monumental Kapaleeshwarar Temple tank, weave jasmine garlands, and sip filter coffee.",
      price: 950,
      rating: 4.9,
      review_count: 89,
      duration: "3 Hours",
      duration_category: "half_day",
      best_time: "Morning (06:30 AM)",
      group_size: "Max 12 Guests",
      guide: "Cultural Storyteller",
      address: "Kapaleeshwarar Temple North Gate, Chennai 600004",
      latitude: 13.0336,
      longitude: 80.2699,
      image_url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
      ],
      highlights: [
        "Dravidian temple architecture and mythology",
        "Kolam rice-powder floor art workshop",
        "Authentic brass-filter kaapi and hot ghee idli breakfast"
      ],
      itinerary: [
        { time: "06:30 AM", title: "Temple Tank Sunrise", desc: "Spiritual morning rituals and chanting." },
        { time: "07:30 AM", title: "Agraharam Alleys", desc: "Ancient Brahmin courtyard homes and craft shops." },
        { time: "08:45 AM", title: "Traditional Breakfast", desc: "Rayar's Mess or Saravana Bhavan tasting." }
      ]
    },
    {
      experience_id: 15,
      name: "South Bombay Art Deco & Marine Drive Cycling Tour",
      destination: "Mumbai",
      locality: "Colaba & Marine Drive, Mumbai",
      category: "Beach & Leisure",
      description: "Cycle along the breezy Queen's Necklace at dawn before city traffic awakens. Discover the world's second-largest cluster of Art Deco buildings.",
      price: 1500,
      rating: 4.8,
      review_count: 176,
      duration: "3 Hours",
      duration_category: "half_day",
      best_time: "Sunrise (06:00 AM)",
      group_size: "Max 10 Guests",
      guide: "Urban Architecture Guide",
      address: "Gateway of India, Colaba, Mumbai 400001",
      latitude: 18.9220,
      longitude: 72.8347,
      image_url: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80"
      ],
      highlights: [
        "Geared bicycle and helmet provided",
        "Dawn photo stops at Gateway of India & Asiatic Library",
        "Irani cafe breakfast: Bun Maska and Chai at Yazdani Bakery"
      ],
      itinerary: [
        { time: "06:00 AM", title: "Gateway Meetup", desc: "Bicycle fitment and safety briefing." },
        { time: "06:30 AM", title: "Marine Drive Coast", desc: "Empty sea-facing promenade cycling in cool ocean breeze." },
        { time: "08:15 AM", title: "Irani Cafe Breakfast", desc: "Fresh buttery pavs and steeped spiced tea." }
      ]
    },
    {
      experience_id: 16,
      name: "Silent Valley Rainforest Guided Trekking Expedition",
      destination: "Goa",
      locality: "Netravali Wildlife Sanctuary, South Goa",
      category: "Nature",
      description: "Venture deep into South Goa's emerald Western Ghats. Discover hidden bubbling lagoons, sacred groves, and pristine canopy trails.",
      price: 2600,
      rating: 4.8,
      review_count: 72,
      duration: "8 Hours",
      duration_category: "full_day",
      best_time: "October – March",
      group_size: "Max 8 Guests",
      guide: "Conservation Biologist",
      address: "Netravali Sanctuary Checkpost, Sanguem, Goa 403704",
      latitude: 15.1105,
      longitude: 74.2052,
      image_url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80"
      ],
      highlights: [
        "Trek to the mysterious bubbling lake of Netravali",
        "Natural swimming pool under secluded forest waterfall",
        "Organic farm meal prepared by local tribal families"
      ],
      itinerary: [
        { time: "07:00 AM", title: "Forest Entrance", desc: "Briefing on tropical flora and endemic species." },
        { time: "10:30 AM", title: "Hidden Waterfall Swim", desc: "Refreshing dip in clear emerald pool." },
        { time: "01:30 PM", title: "Traditional Thali", desc: "Country-style lunch at organic plantation." }
      ]
    }
  ];

  // Seed Data: Featured Authentic Restaurants
  const SEED_RESTAURANTS = [
    {
      restaurant_id: 1,
      name: "The Fisherman's Wharf",
      destination: "Goa",
      locality: "Cavelossim, South Goa",
      cuisine: "Goan & Coastal Seafood",
      description: "An iconic riverside haven on the banks of River Sal serving heirloom Goan seafood recipes, peri-peri crab, butter garlic tiger prawns, and live sunset melodies.",
      price_range: "₹₹ (Moderate)",
      price_for_two: 1800,
      rating: 4.8,
      review_count: 410,
      address: "Near Mobor Football Ground, Cavelossim, Goa 403731",
      opening_hours: "12:00 PM – 11:30 PM",
      must_try: ["Kingfish Recheado", "Goan Crab Curry", "Bebinca with Vanilla Ice Cream"],
      image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
    },
    {
      restaurant_id: 2,
      name: "1135 AD Royal Dining at Amber Fort",
      destination: "Jaipur",
      locality: "Amer Fort, Jaipur",
      cuisine: "Royal Rajasthani Heritage",
      description: "Dine like Rajput royalty within the palace ramparts featuring gold-enameled ceilings, silver candelabras, and recipes recreated from historic royal court archives.",
      price_range: "₹₹₹₹ (Luxury)",
      price_for_two: 4200,
      rating: 4.9,
      review_count: 385,
      address: "Level 2, Jaleb Chowk, Amber Fort, Jaipur, Rajasthan 302001",
      opening_hours: "11:00 AM – 11:00 PM",
      must_try: ["Laal Maas", "Safed Maas", "Thaal-e-Amer Platter"],
      image_url: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80"
    },
    {
      restaurant_id: 3,
      name: "Vidyarthi Bhavan Heritage Tiffin",
      destination: "Bangalore",
      locality: "Gandhi Bazaar, Basavanagudi",
      cuisine: "Iconic South Indian",
      description: "Serving crispy golden ghee roast dosas since 1943. A cultural landmark where writers, artists, and families gather for authentic tiffin and foaming filter coffee.",
      price_range: "₹ (Budget)",
      price_for_two: 300,
      rating: 4.8,
      review_count: 890,
      address: "32, Gandhi Bazaar Main Rd, Basavanagudi, Bengaluru 560004",
      opening_hours: "06:30 AM – 11:30 AM, 02:00 PM – 08:00 PM",
      must_try: ["Crisp Ghee Masala Dosa", "Khara Bhath", "Brass Tumbler Filter Coffee"],
      image_url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80"
    },
    {
      restaurant_id: 4,
      name: "Karim's Historic Mughlai Kitchen",
      destination: "Delhi",
      locality: "Gali Kababian, Jama Masjid",
      cuisine: "Original Royal Mughlai",
      description: "Established in 1913 by Haji Karimuddin, a chef to the Mughal Emperor. Renowned worldwide for slow-cooked mutton burra, korma, and tandoori rogan josh.",
      price_range: "₹₹ (Moderate)",
      price_for_two: 1200,
      rating: 4.7,
      review_count: 740,
      address: "16, Gali Kababian, Jama Masjid, Old Delhi 110006",
      opening_hours: "12:00 PM – 12:00 AM",
      must_try: ["Mutton Burra Kebab", "Mutton Korma", "Khamiri Roti"],
      image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  // Seed Data: Reviews
  const SEED_REVIEWS = [
    {
      review_id: 101,
      experience_id: 1,
      user_name: "Rahul Sharma",
      user_avatar: "RS",
      rating: 5,
      date: "October 2, 2026",
      comment: "Incredible scuba experience! The PADI instructors were extremely calm and attentive with first-time divers. The underwater photos were crystal clear, and the secluded island lunch was delicious."
    },
    {
      review_id: 102,
      experience_id: 1,
      user_name: "Pooja Nair",
      user_avatar: "PN",
      rating: 5,
      date: "September 28, 2026",
      comment: "Seeing dolphins leaping next to our boat right before the dive was magical! The entire team handled safety impeccably. Best adventure in South Goa by far."
    },
    {
      review_id: 103,
      experience_id: 1,
      user_name: "Vikram Sen",
      user_avatar: "VS",
      rating: 4,
      date: "September 15, 2026",
      comment: "Great experience overall. Well-organized speedboat transfers and top notch equipment. Lunch was tasty, though the boat was a little crowded in the morning."
    }
  ];

  // Default User
  const DEFAULT_USER = {
    user_id: 1,
    name: "Ananya Sharma",
    email: "ananya@explorely.com",
    avatar: "AS",
    bio: "Passionate coastal and heritage travel enthusiast exploring the soul of India."
  };

  // Local Storage Keys
  const STORAGE_KEYS = {
    MODE: "explorely_mode", // 'api' or 'standalone'
    API_URL: "explorely_api_base_url",
    EXPERIENCES: "explorely_experiences_data",
    RESTAURANTS: "explorely_restaurants_data",
    REVIEWS: "explorely_reviews_data",
    SAVED_EXPERIENCES: "explorely_saved_experiences",
    SAVED_RESTAURANTS: "explorely_saved_restaurants",
    USER: "explorely_current_user",
    TOKEN: "explorely_access_token"
  };

  // Initialize Storage Cache
  function initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.EXPERIENCES)) {
      localStorage.setItem(STORAGE_KEYS.EXPERIENCES, JSON.stringify(SEED_EXPERIENCES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESTAURANTS)) {
      localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(SEED_RESTAURANTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(SEED_REVIEWS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SAVED_EXPERIENCES)) {
      // Default saves matching Screenshot 13 (Experience ID 1, 9, 7)
      localStorage.setItem(STORAGE_KEYS.SAVED_EXPERIENCES, JSON.stringify([1, 9, 7]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SAVED_RESTAURANTS)) {
      // Default saves matching Screenshot 13 (Restaurant ID 1: Fisherman's Wharf)
      localStorage.setItem(STORAGE_KEYS.SAVED_RESTAURANTS, JSON.stringify([1]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
    }
    if (!localStorage.getItem(STORAGE_KEYS.API_URL)) {
      localStorage.setItem(STORAGE_KEYS.API_URL, window.location.origin || "http://localhost:8000");
    }
    if (!localStorage.getItem(STORAGE_KEYS.MODE)) {
      // Default to standalone for instant zero-dependency opening, auto-detects API if online
      localStorage.setItem(STORAGE_KEYS.MODE, "standalone");
    }
  }

  initStorage();

  // Mode helpers
  function getMode() {
    return localStorage.getItem(STORAGE_KEYS.MODE) || "standalone";
  }

  function setMode(newMode) {
    localStorage.setItem(STORAGE_KEYS.MODE, newMode);
    window.dispatchEvent(new CustomEvent("explorely:mode-changed", { detail: { mode: newMode } }));
  }

  function getApiBaseUrl() {
    return localStorage.getItem(STORAGE_KEYS.API_URL) || "http://localhost:8000";
  }

  // -------------------------------------------------------------
  // AUTH TOKEN HELPERS (JWT issued by the FastAPI backend)
  // -------------------------------------------------------------
  function getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) || null;
  }

  function setToken(token) {
    if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    else localStorage.removeItem(STORAGE_KEYS.TOKEN);
  }

  function authHeaders(extra = {}) {
    const token = getToken();
    return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
  }

  // True when the live backend is in use and nobody is logged in
  function requiresLogin() {
    return getMode() === "api" && !getToken();
  }

  function isLoggedIn() {
    return getMode() === "api" ? !!getToken() : true;
  }

  // Clears the whole local session (token, user and per-user saved cache)
  function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    if (getMode() === "api") {
      localStorage.setItem(STORAGE_KEYS.SAVED_EXPERIENCES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.SAVED_RESTAURANTS, JSON.stringify([]));
    }
  }

  // Safe "where to go after login" target (same-site relative paths only)
  function getNextUrl(fallback) {
    const next = new URLSearchParams(window.location.search).get("next");
    if (next && /^[\w\-./?=&%]+$/.test(next) && !next.startsWith("//") && !next.includes(":")) {
      return next;
    }
    return fallback;
  }

  function redirectToLogin(message) {
    if (window.showToast) window.showToast(message || "Please log in to continue.", "error");
    const here = window.location.pathname.split("/").pop() + window.location.search;
    const nextParam = here && !here.startsWith("login") && !here.startsWith("register")
      ? `?next=${encodeURIComponent(here)}` : "";
    setTimeout(() => { window.location.href = `login.html${nextParam}`; }, 700);
  }

  // Called whenever the server answers 401: the token is missing/expired/invalid
  function handleUnauthorized() {
    clearSession();
    window.dispatchEvent(new CustomEvent("explorely:auth-changed", { detail: { loggedIn: false } }));
    redirectToLogin("Your session has expired. Please log in again.");
  }

  function userWithAvatar(user) {
    const parts = (user.name || "").trim().split(/\s+/);
    const initials = ((parts[0] || "")[0] || "") + ((parts[1] || "")[0] || (parts[0] || "")[1] || "");
    return { ...user, avatar: initials.toUpperCase() || "EX" };
  }

  // Replace the local saved-ID cache with the logged-in user's server-side saves.
  // Silent (no events) so it is safe to call from the getSaved* readers.
  function cacheSavedIds(kind, items) {
    if (kind === "experience") {
      localStorage.setItem(STORAGE_KEYS.SAVED_EXPERIENCES, JSON.stringify(items.map(i => i.experience_id)));
    } else {
      localStorage.setItem(STORAGE_KEYS.SAVED_RESTAURANTS, JSON.stringify(items.map(i => i.restaurant_id)));
    }
  }

  async function syncSavedFromServer() {
    if (!getToken()) return;
    try {
      const [e, r] = await Promise.all([
        fetch(`${getApiBaseUrl()}/api/saved/experiences`, { headers: authHeaders() }),
        fetch(`${getApiBaseUrl()}/api/saved/restaurants`, { headers: authHeaders() })
      ]);
      if (e.ok) cacheSavedIds("experience", await e.json());
      if (r.ok) cacheSavedIds("restaurant", await r.json());
      window.dispatchEvent(new CustomEvent("explorely:saved-updated", { detail: { synced: true } }));
    } catch (err) {
      console.warn("Saved sync failed:", err);
    }
  }

  // Health check for Live API
  async function testApiConnection() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${getApiBaseUrl()}/api/health`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch (err) {
      return false;
    }
  }

  // Auto-detect if API is available and switch to 'api' if responsive, otherwise keep 'standalone'
  async function autoDetectMode() {
    const isApiOnline = await testApiConnection();
    if (isApiOnline && getMode() !== "standalone_override") {
      setMode("api");
      if (getToken()) {
        // Validate the stored token & refresh the user + saved cache from the server
        refreshCurrentUser().then(u => { if (u) syncSavedFromServer(); }).catch(() => {});
      }
    }
    return isApiOnline;
  }

  // -------------------------------------------------------------
  // DATA OPERATIONS (Unified Interface for Standalone & API)
  // -------------------------------------------------------------

  // Experiences
  async function getExperiences(filters = {}) {
    const currentMode = getMode();

    if (currentMode === "api") {
      try {
        const params = new URLSearchParams();
        if (filters.destination && filters.destination !== "All India") params.append("destination", filters.destination);
        if (filters.category && filters.category !== "All Categories") params.append("category", filters.category);
        if (filters.min_rating) params.append("min_rating", filters.min_rating);
        if (filters.max_price) params.append("max_price", filters.max_price);
        if (filters.search) params.append("search", filters.search);

        params.set("limit", "100");
        const url = `${getApiBaseUrl()}/api/experiences?${params.toString()}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          return data;
        }
      } catch (err) {
        console.warn("API request failed, falling back to local catalog:", err);
      }
    }

    // Standalone Local Storage Filtering
    let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPERIENCES) || "[]");

    if (filters.destination && filters.destination !== "All India") {
      const dest = filters.destination.toLowerCase().trim();
      list = list.filter(item => item.destination.toLowerCase().includes(dest) || item.locality.toLowerCase().includes(dest));
    }

    if (filters.category && filters.category !== "All Categories") {
      const cat = filters.category.toLowerCase().trim();
      list = list.filter(item => item.category.toLowerCase().includes(cat));
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.destination.toLowerCase().includes(q) ||
        item.locality.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }

    if (filters.min_rating) {
      list = list.filter(item => item.rating >= parseFloat(filters.min_rating));
    }

    if (filters.max_price) {
      list = list.filter(item => item.price <= parseInt(filters.max_price, 10));
    }

    if (filters.duration) {
      if (filters.duration === "half_day") {
        list = list.filter(item => item.duration_category === "half_day" || item.duration.includes("Hour"));
      } else if (filters.duration === "full_day") {
        list = list.filter(item => item.duration_category === "full_day" || item.duration.includes("Day"));
      }
    }

    if (filters.sort_by) {
      if (filters.sort_by === "highest_rated") {
        list.sort((a, b) => b.rating - a.rating || b.review_count - a.review_count);
      } else if (filters.sort_by === "lowest_price") {
        list.sort((a, b) => a.price - b.price);
      } else if (filters.sort_by === "highest_price") {
        list.sort((a, b) => b.price - a.price);
      } else if (filters.sort_by === "most_popular") {
        list.sort((a, b) => b.review_count - a.review_count);
      }
    }

    return list;
  }

  async function getExperienceById(id) {
    const numId = parseInt(id, 10);
    const currentMode = getMode();

    if (currentMode === "api") {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/experiences/${numId}`);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn("API request failed, falling back to local catalog:", err);
      }
    }

    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPERIENCES) || "[]");
    return list.find(item => item.experience_id === numId) || null;
  }

  // Restaurants
  async function getRestaurants(filters = {}) {
    const currentMode = getMode();

    if (currentMode === "api") {
      try {
        const params = new URLSearchParams();
        if (filters.destination) params.append("destination", filters.destination);
        if (filters.cuisine) params.append("cuisine", filters.cuisine);
        const res = await fetch(`${getApiBaseUrl()}/api/restaurants?${params.toString()}`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn("API request failed, falling back to local catalog:", err);
      }
    }

    let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESTAURANTS) || "[]");
    if (filters.destination && filters.destination !== "All India") {
      const dest = filters.destination.toLowerCase().trim();
      list = list.filter(item => item.destination.toLowerCase().includes(dest) || item.locality.toLowerCase().includes(dest));
    }
    return list;
  }

  async function getRestaurantById(id) {
    const numId = parseInt(id, 10);
    const currentMode = getMode();

    if (currentMode === "api") {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/restaurants/${numId}`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn("API request failed, falling back to local catalog:", err);
      }
    }

    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESTAURANTS) || "[]");
    return list.find(item => item.restaurant_id === numId) || null;
  }

  // Reviews
  async function getReviews(experienceId) {
    const numId = parseInt(experienceId, 10);

    if (!Number.isInteger(numId) || numId < 1) {
      throw new Error("Invalid experience.");
    }

    if (getMode() === "api") {
      let res;
      try {
        res = await fetch(`${getApiBaseUrl()}/api/experiences/${numId}/reviews`);
      } catch (error) {
        throw new Error("Could not connect to Explorely. Please try again.");
      }

      if (!res.ok) {
        throw new Error("Could not load reviews. Please try again.");
      }
      return await res.json();
    }

    // Local reviews are used only in standalone/demo mode.
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || "[]");
    return list.filter(item => Number(item.experience_id) === numId);
  }

  async function addReview(reviewData) {
    const experienceId = parseInt(reviewData.experience_id, 10);
    const rating = Number(reviewData.rating);
    const comment = String(reviewData.comment || "").trim();

    if (!Number.isInteger(experienceId) || experienceId < 1) {
      throw new Error("Invalid experience.");
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error("Please select a rating from 1 to 5.");
    }
    if (!comment) {
      throw new Error("Please enter a review comment.");
    }

    if (getMode() === "api") {
      if (!getToken()) {
        const err = new Error("Please log in to write a review.");
        err.code = "LOGIN_REQUIRED";
        throw err;
      }

      let res;
      try {
        // The server derives the reviewer identity from the JWT.
        // Never send a user_name or user_id supplied by the browser.
        res = await fetch(`${getApiBaseUrl()}/api/reviews`, {
          method: "POST",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            experience_id: experienceId,
            rating,
            comment
          })
        });
      } catch (error) {
        throw new Error("Could not connect to Explorely. Your review was not submitted.");
      }

      if (res.status === 401) {
        handleUnauthorized();
        const err = new Error("Please log in to write a review.");
        err.code = "LOGIN_REQUIRED";
        throw err;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          typeof body.detail === "string" ? body.detail : "Could not submit review. Please try again."
        );
      }
      // API mode never falls back to local storage.
      return await res.json();
    }

    // Standalone/demo mode only.
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || "[]");
    const user = getCurrentUser();
    const newReview = {
      review_id: Date.now(),
      experience_id: experienceId,
      user_name: user.name || "Traveler",
      user_avatar: user.avatar || "TR",
      rating,
      date: new Date().toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric"
      }),
      comment
    };

    list.unshift(newReview);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(list));

    const experiences = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPERIENCES) || "[]");
    const index = experiences.findIndex(e => Number(e.experience_id) === experienceId);
    if (index !== -1) {
      const matchingReviews = list.filter(r => Number(r.experience_id) === experienceId);
      experiences[index].rating = Number((
        matchingReviews.reduce((sum, r) => sum + Number(r.rating), 0) / matchingReviews.length
      ).toFixed(1));
      experiences[index].review_count = matchingReviews.length;
      localStorage.setItem(STORAGE_KEYS.EXPERIENCES, JSON.stringify(experiences));
    }

    return newReview;
  }

  // Saved Items Management
  function getSavedIds() {
    return {
      experiences: JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_EXPERIENCES) || "[]"),
      restaurants: JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_RESTAURANTS) || "[]")
    };
  }

  async function getSavedExperiences() {
    const currentMode = getMode();
    if (currentMode === "api") {
      try {
        if (!getToken()) return [];
        const res = await fetch(`${getApiBaseUrl()}/api/saved/experiences`, { headers: authHeaders() });
        if (res.ok) {
          const items = await res.json();
          cacheSavedIds("experience", items);
          return items;
        }
        if (res.status === 401) { handleUnauthorized(); return []; }
      } catch (err) {
        console.warn("API fetch saved failed:", err);
      }
    }

    const savedIds = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_EXPERIENCES) || "[]");
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPERIENCES) || "[]");
    return all.filter(item => savedIds.includes(item.experience_id));
  }

  async function getSavedRestaurants() {
    const currentMode = getMode();
    if (currentMode === "api") {
      try {
        if (!getToken()) return [];
        const res = await fetch(`${getApiBaseUrl()}/api/saved/restaurants`, { headers: authHeaders() });
        if (res.ok) {
          const items = await res.json();
          cacheSavedIds("restaurant", items);
          return items;
        }
        if (res.status === 401) { handleUnauthorized(); return []; }
      } catch (err) {
        console.warn("API fetch saved restaurants failed:", err);
      }
    }

    const savedIds = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_RESTAURANTS) || "[]");
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESTAURANTS) || "[]");
    return all.filter(item => savedIds.includes(item.restaurant_id));
  }

  function isExperienceSaved(id) {
    const numId = parseInt(id, 10);
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_EXPERIENCES) || "[]");
    return list.includes(numId);
  }

  function isRestaurantSaved(id) {
    const numId = parseInt(id, 10);
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_RESTAURANTS) || "[]");
    return list.includes(numId);
  }

  // Shared toggle logic. kind: "experience" | "restaurant"
  async function toggleSave(kind, id) {
    const numId = parseInt(id, 10);
    const isExp = kind === "experience";
    const key = isExp ? STORAGE_KEYS.SAVED_EXPERIENCES : STORAGE_KEYS.SAVED_RESTAURANTS;
    const path = isExp ? "experiences" : "restaurants";
    const bodyKey = isExp ? "experience_id" : "restaurant_id";

    let list = JSON.parse(localStorage.getItem(key) || "[]");
    const isSaved = list.includes(numId);

    if (getMode() === "api") {
      if (!getToken()) {
        redirectToLogin("Please log in to save items.");
        return isSaved; // unchanged
      }
      try {
        const res = isSaved
          ? await fetch(`${getApiBaseUrl()}/api/saved/${path}/${numId}`, { method: "DELETE", headers: authHeaders() })
          : await fetch(`${getApiBaseUrl()}/api/saved/${path}`, {
              method: "POST",
              headers: authHeaders({ "Content-Type": "application/json" }),
              body: JSON.stringify({ [bodyKey]: numId })
            });
        if (res.status === 401) {
          handleUnauthorized();
          return isSaved;
        }
        if (!res.ok && !(isSaved && res.status === 404)) {
          if (window.showToast) window.showToast("Could not update saved items. Please try again.", "error");
          return isSaved;
        }
      } catch (err) {
        console.warn("API toggle save sync failed:", err);
        const error = new Error("Could not reach the server. Your saved items were not changed. Please try again.");
        error.code = "NETWORK";
        throw error;
      }
    }

    list = isSaved ? list.filter(item => item !== numId) : [...list, numId];
    localStorage.setItem(key, JSON.stringify(list));

    window.dispatchEvent(new CustomEvent("explorely:saved-updated", {
      detail: isExp
        ? { type: "experience", id: numId, isSaved: !isSaved, count: list.length }
        : { type: "restaurant", id: numId, isSaved: !isSaved }
    }));
    return !isSaved;
  }

  function toggleSaveExperience(id) { return toggleSave("experience", id); }
  function toggleSaveRestaurant(id) { return toggleSave("restaurant", id); }

  function clearAllSaved() {
    localStorage.setItem(STORAGE_KEYS.SAVED_EXPERIENCES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SAVED_RESTAURANTS, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent("explorely:saved-updated", { detail: { count: 0 } }));
  }

  // User Authentication & Profile
  function getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || JSON.stringify(DEFAULT_USER));
  }

  function updateUser(userData) {
    const user = { ...getCurrentUser(), ...userData };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  }

  // Standalone (offline, no backend) fallback only - used when the API cannot be reached
  function localStandaloneLogin(email, name) {
    const user = {
      user_id: 1,
      name: name || email.split("@")[0].replace(".", " ").replace(/\b\w/g, l => l.toUpperCase()),
      email: email,
      avatar: (name || email).substring(0, 2).toUpperCase(),
      bio: "Active traveler exploring curated Indian getaways."
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  }

  async function authRequest(path, payload) {
    let res;
    try {
      res = await fetch(`${getApiBaseUrl()}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (networkErr) {
      const err = new Error("Cannot reach the Explorely server. Please make sure it is running.");
      err.code = "NETWORK";
      throw err;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      let message = "Something went wrong. Please try again.";
      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (Array.isArray(data.detail) && data.detail.length) {
        // FastAPI/Pydantic validation errors -> friendly text
        message = (data.detail[0].msg || message).replace(/^Value error, /, "");
      }
      const err = new Error(message);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  async function completeAuth(data) {
    setToken(data.access_token);
    setMode("api");
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithAvatar(data.user)));
    await syncSavedFromServer();
    window.dispatchEvent(new CustomEvent("explorely:auth-changed", { detail: { loggedIn: true } }));
    return getCurrentUser();
  }

  async function login(email, password) {
    try {
      return await completeAuth(await authRequest("/api/auth/login", { email, password }));
    } catch (err) {
      if (err.code === "NETWORK" && getMode() !== "api") return localStandaloneLogin(email);
      throw err;
    }
  }

  async function register(name, email, password) {
    try {
      return await completeAuth(await authRequest("/api/auth/register", { name, email, password }));
    } catch (err) {
      if (err.code === "NETWORK" && getMode() !== "api") return localStandaloneLogin(email, name);
      throw err;
    }
  }

  // Re-fetch the logged-in user from GET /api/auth/me (validates the token)
  async function refreshCurrentUser() {
    const token = getToken();
    if (!token) return null;
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/me`, { headers: authHeaders() });
      if (res.status === 401) {
        clearSession();
        window.dispatchEvent(new CustomEvent("explorely:auth-changed", { detail: { loggedIn: false } }));
        return null;
      }
      if (res.ok) {
        const user = userWithAvatar(await res.json());
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        return user;
      }
    } catch (err) {
      console.warn("Could not refresh user:", err);
    }
    return getCurrentUser();
  }

  function logout() {
    clearSession();
    window.dispatchEvent(new CustomEvent("explorely:auth-changed", { detail: { loggedIn: false } }));
    return true;
  }

  // Cross-Project Integration Spec: Export for Project 1 (Smart Travel Planner)
  async function generateProject1ExportPayload() {
    const experiences = await getSavedExperiences();
    const restaurants = await getSavedRestaurants();
    const user = getCurrentUser();

    return {
      application_source: "Explorely (Project 2 - Experience Finder)",
      api_version: "v1.1.0",
      export_timestamp: new Date().toISOString(),
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email
      },
      summary: {
        total_experiences: experiences.length,
        total_restaurants: restaurants.length,
        destinations: Array.from(new Set([...experiences.map(e => e.destination), ...restaurants.map(r => r.destination)])),
        total_estimated_value_inr: experiences.reduce((sum, e) => sum + e.price, 0)
      },
      payload: {
        experiences: experiences.map(e => ({
          experience_id: e.experience_id,
          name: e.name,
          destination: e.destination,
          category: e.category,
          price: e.price,
          duration: e.duration,
          rating: e.rating,
          latitude: e.latitude,
          longitude: e.longitude,
          image_url: e.image_url
        })),
        restaurants: restaurants.map(r => ({
          restaurant_id: r.restaurant_id,
          name: r.name,
          destination: r.destination,
          cuisine: r.cuisine,
          price_range: r.price_range,
          rating: r.rating,
          image_url: r.image_url
        }))
      }
    };
  }

  // Export API object to window
  window.ExplorelyAPI = {
    getMode,
    setMode,
    getApiBaseUrl,
    testApiConnection,
    autoDetectMode,
    getExperiences,
    getExperienceById,
    getRestaurants,
    getRestaurantById,
    getReviews,
    addReview,
    getSavedExperiences,
    getSavedRestaurants,
    getSavedIds,
    isExperienceSaved,
    isRestaurantSaved,
    toggleSaveExperience,
    toggleSaveRestaurant,
    clearAllSaved,
    getCurrentUser,
    updateUser,
    login,
    register,
    logout,
    getToken,
    authHeaders,
    isLoggedIn,
    requiresLogin,
    getNextUrl,
    redirectToLogin,
    refreshCurrentUser,
    syncSavedFromServer,
    generateProject1ExportPayload,
    SEED_EXPERIENCES,
    SEED_RESTAURANTS
  };

  // Run initial auto-detection
  autoDetectMode().catch(() => {});

})(window);
