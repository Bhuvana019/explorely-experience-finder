import json
from sqlalchemy.orm import Session
from app.models import Experience, Restaurant, Review, User, SavedExperience, SavedRestaurant
from app.security import hash_password, is_bcrypt_hash

LEGACY_PREFIXES = ("hash:", "pbkdf2:sha256:")


def upgrade_legacy_password_hashes(db: Session):
    """One-time upgrade for databases created before bcrypt was introduced.
    Old placeholder values looked like 'hash:<password>' or 'pbkdf2:sha256:<password>'
    (i.e. NOT real hashes). They are re-hashed with bcrypt so existing accounts
    (including the demo user) keep working and no plaintext stays in the DB."""
    changed = False
    for user in db.query(User).all():
        if is_bcrypt_hash(user.password_hash):
            continue
        for prefix in LEGACY_PREFIXES:
            if user.password_hash.startswith(prefix):
                user.password_hash = hash_password(user.password_hash[len(prefix):])
                changed = True
                break
    if changed:
        db.commit()

def seed_database(db: Session):
    # Check if database is already seeded
    if db.query(Experience).first():
        return

    # Seed User
    user = User(
        name="Ananya Sharma",
        email="ananya@explorely.com",
        password_hash=hash_password("explorely2026"),
        bio="Passionate coastal and heritage travel enthusiast exploring the soul of India."
    )
    db.add(user)
    db.flush()

    # Experiences
    experiences_data = [
        {
            "name": "Grand Island Scuba Diving & Dolphin Safari Combo",
            "destination": "Goa",
            "locality": "Grand Island, South Goa",
            "category": "Adventure",
            "description": "Dive into the crystalline waters of Grand Island. Encounter vibrant coral reefs, shipwrecks, and friendly marine life, followed by a dolphin spotting speedboat cruise and a secluded beach barbecue.",
            "price": 2499,
            "rating": 4.9,
            "review_count": 340,
            "duration": "6 Hours",
            "duration_category": "half_day",
            "best_time": "October – May",
            "group_size": "Max 12 Guests",
            "guide": "PADI Certified & Bilingual",
            "address": "Sinquerim Jetty, Candolim, Goa 403515",
            "latitude": 15.4852,
            "longitude": 73.7699,
            "image_url": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
            "gallery_json": json.dumps([
                "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80"
            ]),
            "highlights_json": json.dumps([
                "PADI certified briefing and underwater diving gear included",
                "Complimentary high-definition underwater photos and video footage",
                "Dolphin spotting boat cruise along Aguada Bay",
                "Buffet lunch with authentic Goan fish curry, rice & barbecue"
            ]),
            "itinerary_json": json.dumps([
                {"time": "07:30 AM", "title": "Reporting & Boat Boarding", "desc": "Arrive at Sinquerim Jetty for equipment check-in and briefing."},
                {"time": "08:30 AM", "title": "Dolphin Sighting & Sea Cruise", "desc": "Cruise through the Arabian Sea with active dolphin pods."},
                {"time": "10:30 AM", "title": "Guided Scuba Diving", "desc": "One-on-one dive at Grand Island Coral Reef with a master instructor."},
                {"time": "01:30 PM", "title": "Beach BBQ & Goan Lunch", "desc": "Secluded island feast with grilled delicacies and chilled refreshments."},
                {"time": "03:30 PM", "title": "Jetty Return", "desc": "Scenic speedboat transfer back to mainland jetty."}
            ])
        },
        {
            "name": "Mandovi River Sunset Luxury Catamaran Cruise",
            "destination": "Goa",
            "locality": "Panaji, North Goa",
            "category": "Beach & Leisure",
            "description": "Sail down the tranquil Mandovi River into the sunset aboard a premium catamaran. Enjoy live Goan folk music, cocktail pairings, and panoramic views of the coastal skyline.",
            "price": 1199,
            "rating": 4.8,
            "review_count": 180,
            "duration": "2 Hours",
            "duration_category": "half_day",
            "best_time": "All Year",
            "group_size": "Max 25 Guests",
            "guide": "Captain & Host",
            "address": "Captain of Ports Jetty, Panaji, Goa 403001",
            "latitude": 15.4989,
            "longitude": 73.8278,
            "image_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
            "gallery_json": json.dumps([
                "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80"
            ]),
            "highlights_json": json.dumps([
                "Chilled welcome mocktails and Goan savory tapas",
                "Live Konkani and international acoustic music performers",
                "Unimpeded 360-degree sunset photo deck"
            ]),
            "itinerary_json": json.dumps([
                {"time": "05:00 PM", "title": "Boarding & Welcome Drink", "desc": "Step aboard our double-deck twin hull vessel."},
                {"time": "05:45 PM", "title": "Golden Hour Cruise", "desc": "Pass by historic churches and riverside forts as the sun descends."},
                {"time": "07:00 PM", "title": "Music & Twilight Return", "desc": "Twilight reflections under illuminated bridges."}
            ])
        },
        {
            "name": "Kayaking in the Sal Backwaters & Mangroves",
            "destination": "Goa",
            "locality": "Sal River, South Goa",
            "category": "Nature",
            "description": "Paddle silently through hidden mangrove canals and untouched backwater estuaries. Spot kingfishers, eagles, and river otters in their lush pristine sanctuary.",
            "price": 1450,
            "rating": 4.9,
            "review_count": 95,
            "duration": "3 Hours",
            "duration_category": "half_day",
            "best_time": "October – April",
            "group_size": "Max 8 Guests",
            "guide": "Naturalist Guide",
            "address": "Mobor Beach Backwater Club, Cavelossim, Goa 403731",
            "latitude": 15.1558,
            "longitude": 73.9452,
            "image_url": "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=1200&q=80",
            "gallery_json": json.dumps(["https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=1200&q=80"]),
            "highlights_json": json.dumps(["Single & tandem sit-on-top sea kayaks", "Accompanied by veteran naturalists", "Fresh coconut water stop"]),
            "itinerary_json": json.dumps([
                {"time": "06:30 AM", "title": "Paddling Briefing", "desc": "Safety gear fitment and basic stroke demonstration."},
                {"time": "07:00 AM", "title": "Mangrove Labyrinth", "desc": "Glide through tidal tunnels beneath canopy shade."}
            ])
        },
        {
            "name": "Historic Old Goa Churches & Fontainhas Heritage Walk",
            "destination": "Goa",
            "locality": "Fontainhas, Panaji",
            "category": "Historical",
            "description": "Step back 450 years into Goa's colonial legacy. Explore Asia's grandest cathedrals in Old Goa, then stroll pastel-hued cobblestone alleys in the Latin Quarter.",
            "price": 850,
            "rating": 4.7,
            "review_count": 112,
            "duration": "4 Hours",
            "duration_category": "half_day",
            "best_time": "Morning / Late Afternoon",
            "group_size": "Max 15 Guests",
            "guide": "Historian Storyteller",
            "address": "Basilica of Bom Jesus Plaza, Old Goa, Goa 403402",
            "latitude": 15.5009,
            "longitude": 73.9116,
            "image_url": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
            "gallery_json": json.dumps(["https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80"]),
            "highlights_json": json.dumps(["Visit Basilica of Bom Jesus", "Fontainhas Portuguese villas", "Traditional bebinca tasting"]),
            "itinerary_json": json.dumps([
                {"time": "08:30 AM", "title": "Old Goa Monuments", "desc": "Baroque church architecture and relics."},
                {"time": "11:00 AM", "title": "Fontainhas Latin Quarter", "desc": "Azulejo tile art and wooden balconies."}
            ])
        },
        {
            "name": "North Goa Bungee Jumping from 55m",
            "destination": "Goa",
            "locality": "Mayem Lake, North Goa",
            "category": "Adventure",
            "description": "Feel the ultimate rush leaping from a 55-meter cantilever platform suspended above picturesque Mayem Lake. Complies with strict Australia/NZ safety guidelines.",
            "price": 3750,
            "rating": 4.8,
            "review_count": 88,
            "duration": "1.5 Hours",
            "duration_category": "half_day",
            "best_time": "October – June",
            "group_size": "Individual Jumpers",
            "guide": "Master Jump Masters",
            "address": "Mayem Lake Tourism Complex, Bicholim, Goa 403504",
            "latitude": 15.5866,
            "longitude": 73.9458,
            "image_url": "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1200&q=80",
            "gallery_json": json.dumps(["https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1200&q=80"]),
            "highlights_json": json.dumps(["55-meter jump height overlooking lake", "100% safety certified redundant harnesses", "Jump certificate & HD video"]),
            "itinerary_json": json.dumps([
                {"time": "Session 1", "title": "Registration", "desc": "Weigh-in and safety briefing."},
                {"time": "Session 2", "title": "The Jump", "desc": "55-meter adrenaline plunge over water."}
            ])
        },
        {
            "name": "Spice Village Organic Tour with Traditional Goan Lunch",
            "destination": "Goa",
            "locality": "Ponda, Central Goa",
            "category": "Food",
            "description": "Walk under canopies of cardamom, vanilla, nutmeg, and black pepper. Learn age-old Ayurvedic remedies, see betel-nut tree climbers, and savor a traditional banquet on banana leaves.",
            "price": 950,
            "rating": 4.6,
            "review_count": 140,
            "duration": "5 Hours",
            "duration_category": "half_day",
            "best_time": "All Year",
            "group_size": "Max 20 Guests",
            "guide": "Plantation Botanist",
            "address": "Sahakari Spice Farm, Curti, Ponda, Goa 403401",
            "latitude": 15.4026,
            "longitude": 74.0152,
            "image_url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80",
            "gallery_json": json.dumps(["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80"]),
            "highlights_json": json.dumps(["Traditional floral greeting", "Aromatic spice walk", "Clay-pot wood-fired buffet feast"]),
            "itinerary_json": json.dumps([
                {"time": "10:00 AM", "title": "Spice Trail", "desc": "Botanical exploration."},
                {"time": "01:00 PM", "title": "Grand Feast", "desc": "Traditional buffet with local cashew beverages."}
            ])
        },
        {
            "name": "Sunrise Hot Air Balloon Flight over Amber Palace",
            "destination": "Jaipur",
            "locality": "Amber, Jaipur",
            "category": "Adventure",
            "description": "Drift peacefully above the Aravalli hills, 16th-century fortress walls, and royal royal reservoirs as morning mist rises over the Pink City.",
            "price": 8500,
            "rating": 4.9,
            "review_count": 215,
            "duration": "3 Hours",
            "duration_category": "half_day",
            "best_time": "September – April",
            "group_size": "Max 8 Guests",
            "guide": "Commercial Balloon Pilot",
            "address": "Amber Launch Field, Amer, Jaipur, Rajasthan 302028",
            "latitude": 26.9855,
            "longitude": 75.8513,
            "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
            "gallery_json": json.dumps(["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"]),
            "highlights_json": json.dumps(["60-minute aerial flight", "Landing champagne celebration", "Signed flight certificate"]),
            "itinerary_json": json.dumps([
                {"time": "05:15 AM", "title": "Inflation & Takeoff", "desc": "Pre-flight burner ignition."},
                {"time": "06:00 AM", "title": "Sunrise Drift", "desc": "Panoramic vistas of Amber Fort."}
            ])
        },
        {
            "name": "Old Delhi Midnight Heritage Food Walk",
            "destination": "Delhi",
            "locality": "Chandni Chowk, Old Delhi",
            "category": "Food",
            "description": "Navigate the vibrant lanes of Shahjahanabad under lantern light. Sample legendary 100-year-old jalebis, succulent seekh kebabs, paranthas, and saffron kulfi.",
            "price": 1200,
            "rating": 4.9,
            "review_count": 310,
            "duration": "3.5 Hours",
            "duration_category": "half_day",
            "best_time": "All Year (Evening)",
            "group_size": "Max 10 Guests",
            "guide": "Culinary Historian",
            "address": "Gate 1, Jama Masjid Metro Station, Old Delhi 110006",
            "latitude": 28.6507,
            "longitude": 77.2334,
            "image_url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
            "gallery_json": json.dumps(["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"]),
            "highlights_json": json.dumps(["Tastings across 6 heirloom kitchens", "Rickshaw ride in spice market", "Safe and curated food stops"]),
            "itinerary_json": json.dumps([
                {"time": "07:30 PM", "title": "Jama Masjid", "desc": "Seekh kebabs and rotis."},
                {"time": "09:00 PM", "title": "Paranthe Wali Gali", "desc": "Stuffed crispy flatbreads."}
            ])
        },
        {
            "name": "Trek to Dudhsagar Waterfalls & Jeep Safari",
            "destination": "Goa",
            "locality": "Mollem National Park, Goa",
            "category": "Adventure",
            "description": "An exhilarating jungle 4x4 safari across forest streams followed by a hike to the four-tiered 'Sea of Milk' cascade plunging 310 meters.",
            "price": 1850,
            "rating": 4.8,
            "review_count": 165,
            "duration": "7 Hours",
            "duration_category": "full_day",
            "best_time": "October – May",
            "group_size": "Max 7 per Jeep",
            "guide": "Forest Department Guide",
            "address": "Mollem National Park Entry, Sancordem, Goa 403410",
            "latitude": 15.3144,
            "longitude": 74.3143,
            "image_url": "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1200&q=80",
            "gallery_json": json.dumps(["https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1200&q=80"]),
            "highlights_json": json.dumps(["Off-road 4x4 river crossing", "Freshwater dip at waterfall base", "Forest permits and lifejackets included"]),
            "itinerary_json": json.dumps([
                {"time": "08:00 AM", "title": "Mollem Departure", "desc": "Boarding open safari jeeps."},
                {"time": "09:30 AM", "title": "Waterfall Swim", "desc": "Relaxing swim under thunderous cascade."}
            ])
        },
        {
            "name": "Solang Valley Paragliding & Zorbing Adventure",
            "destination": "Manali",
            "locality": "Solang Valley, Manali",
            "category": "Adventure",
            "description": "Soar like a bird high above snow-capped Himalayan peaks. Experience tandem paragliding with panoramic views of the Pir Panjal range.",
            "price": 3200,
            "rating": 4.9,
            "review_count": 190,
            "duration": "2.5 Hours",
            "duration_category": "half_day",
            "best_time": "All Year (Except Monsoons)",
            "group_size": "Tandem Solo",
            "guide": "Certified Pilot",
            "address": "Solang Valley Adventure Ground, Manali, HP 175131",
            "latitude": 32.3166,
            "longitude": 77.1585,
            "image_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
            "gallery_json": json.dumps(["https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"]),
            "highlights_json": json.dumps(["High-altitude takeoff at 8,000 feet", "Action camera video footage", "Zorbing roll"]),
            "itinerary_json": json.dumps([
                {"time": "10:00 AM", "title": "Equipment Check", "desc": "Harness fitment and safety instructions."},
                {"time": "10:45 AM", "title": "Flight Launch", "desc": "15-minute glide above cedar valleys."}
            ])
        },
        {
            "name": "Bangalore Craft Brewery & Pub Crawl Experience",
            "destination": "Bangalore",
            "locality": "Indiranagar, Bangalore",
            "category": "Nightlife",
            "description": "Explore the pub capital of India! Visit 3 award-winning microbreweries, taste house-brewed IPAs, stouts, and witbiers paired with signature gastropub bites.",
            "price": 2100,
            "rating": 4.8,
            "review_count": 128,
            "duration": "4 Hours",
            "duration_category": "half_day",
            "best_time": "All Year",
            "group_size": "Max 12 Guests",
            "guide": "Brewmaster Host",
            "address": "100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038",
            "latitude": 12.9719,
            "longitude": 77.6412,
            "image_url": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
            "gallery_json": json.dumps(["https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80"]),
            "highlights_json": json.dumps(["Tasting flight at 3 curated taprooms", "Fermentation tank walkthrough", "Reserved VIP seating"]),
            "itinerary_json": json.dumps([
                {"time": "06:30 PM", "title": "Stop 1: Microbrewery", "desc": "Malt tasting and brewing tour."},
                {"time": "08:00 PM", "title": "Stop 2: Rooftop Tasting", "desc": "Ales and sourdough pizza."}
            ])
        },
        {
            "name": "Mahabalipuram Shore Temple & Stone Carving Tour",
            "destination": "Chennai",
            "locality": "Mahabalipuram, Chennai",
            "category": "Historical",
            "description": "Marvel at 7th-century UNESCO World Heritage rock monoliths facing the Bay of Bengal, Arjuna's Penance, and Krishna's Butter Ball.",
            "price": 1600,
            "rating": 4.8,
            "review_count": 145,
            "duration": "5 Hours",
            "duration_category": "half_day",
            "best_time": "November – February",
            "group_size": "Max 10 Guests",
            "guide": "Pallava Heritage Expert",
            "address": "Shore Temple Complex, Mahabalipuram, Tamil Nadu 603104",
            "latitude": 12.6163,
            "longitude": 80.1983,
            "image_url": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
            "gallery_json": json.dumps(["https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"]),
            "highlights_json": json.dumps(["700 AD Shore Temple", "Stone carving live artisan demo", "Seaside coastal meal"]),
            "itinerary_json": json.dumps([
                {"time": "08:00 AM", "title": "Scenic Coast Drive", "desc": "AC drive along East Coast Road."},
                {"time": "09:30 AM", "title": "Five Rathas", "desc": "Monolithic carved chariot temples."}
            ])
        },
        {
            "name": "South Bombay Art Deco & Marine Drive Cycling Tour",
            "destination": "Mumbai",
            "locality": "Colaba & Marine Drive, Mumbai",
            "category": "Beach & Leisure",
            "description": "Cycle along the breezy Queen's Necklace at dawn before city traffic awakens. Discover the world's second-largest cluster of Art Deco buildings.",
            "price": 1500,
            "rating": 4.8,
            "review_count": 176,
            "duration": "3 Hours",
            "duration_category": "half_day",
            "best_time": "Sunrise (06:00 AM)",
            "group_size": "Max 10 Guests",
            "guide": "Urban Architecture Guide",
            "address": "Gateway of India, Colaba, Mumbai 400001",
            "latitude": 18.9220,
            "longitude": 72.8347,
            "image_url": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
            "gallery_json": json.dumps(["https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80"]),
            "highlights_json": json.dumps(["Geared bicycle and helmet provided", "Sunrise photos at Gateway of India", "Irani cafe breakfast: Bun Maska & Chai"]),
            "itinerary_json": json.dumps([
                {"time": "06:00 AM", "title": "Gateway Assembly", "desc": "Bicycle fitting and safety briefing."},
                {"time": "06:30 AM", "title": "Marine Drive Promenade", "desc": "Sea-breeze cycling along Queen's Necklace."}
            ])
        }
    ]

    for data in experiences_data:
        exp = Experience(**data)
        db.add(exp)
    db.flush()

    # Restaurants
    restaurants_data = [
        {
            "name": "The Fisherman's Wharf",
            "destination": "Goa",
            "locality": "Cavelossim, South Goa",
            "cuisine": "Goan & Coastal Seafood",
            "description": "An iconic riverside haven on the banks of River Sal serving heirloom Goan seafood recipes, peri-peri crab, butter garlic tiger prawns, and live sunset melodies.",
            "price_range": "₹₹ (Moderate)",
            "price_for_two": 1800,
            "rating": 4.8,
            "review_count": 410,
            "address": "Near Mobor Football Ground, Cavelossim, Goa 403731",
            "opening_hours": "12:00 PM – 11:30 PM",
            "must_try_json": json.dumps(["Kingfish Recheado", "Goan Crab Curry", "Bebinca with Vanilla Ice Cream"]),
            "image_url": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "name": "1135 AD Royal Dining at Amber Fort",
            "destination": "Jaipur",
            "locality": "Amer Fort, Jaipur",
            "cuisine": "Royal Rajasthani Heritage",
            "description": "Dine like Rajput royalty within the palace ramparts featuring gold-enameled ceilings, silver candelabras, and recipes recreated from historic royal court archives.",
            "price_range": "₹₹₹₹ (Luxury)",
            "price_for_two": 4200,
            "rating": 4.9,
            "review_count": 385,
            "address": "Level 2, Jaleb Chowk, Amber Fort, Jaipur, Rajasthan 302001",
            "opening_hours": "11:00 AM – 11:00 PM",
            "must_try_json": json.dumps(["Laal Maas", "Safed Maas", "Thaal-e-Amer Platter"]),
            "image_url": "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "name": "Vidyarthi Bhavan Heritage Tiffin",
            "destination": "Bangalore",
            "locality": "Gandhi Bazaar, Basavanagudi",
            "cuisine": "Iconic South Indian",
            "description": "Serving crispy golden ghee roast dosas since 1943. A cultural landmark where writers, artists, and families gather for authentic tiffin and foaming filter coffee.",
            "price_range": "₹ (Budget)",
            "price_for_two": 300,
            "rating": 4.8,
            "review_count": 890,
            "address": "32, Gandhi Bazaar Main Rd, Basavanagudi, Bengaluru 560004",
            "opening_hours": "06:30 AM – 11:30 AM, 02:00 PM – 08:00 PM",
            "must_try_json": json.dumps(["Crisp Ghee Masala Dosa", "Khara Bhath", "Brass Tumbler Filter Coffee"]),
            "image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80"
        }
    ]

    for r_data in restaurants_data:
        rest = Restaurant(**r_data)
        db.add(rest)
    db.flush()

    # Reviews for Experience 1
    reviews_data = [
        {
            "experience_id": 1,
            "user_id": 1,
            "user_name": "Rahul Sharma",
            "rating": 5,
            "comment": "Incredible scuba experience! The PADI instructors were extremely calm and attentive with first-time divers. The underwater photos were crystal clear, and the secluded island lunch was delicious."
        },
        {
            "experience_id": 1,
            "user_id": 1,
            "user_name": "Pooja Nair",
            "rating": 5,
            "comment": "Seeing dolphins leaping next to our boat right before the dive was magical! The entire team handled safety impeccably. Best adventure in South Goa by far."
        }
    ]

    for rev_data in reviews_data:
        rev = Review(**rev_data)
        db.add(rev)

    # Saved items for default user
    db.add(SavedExperience(user_id=1, experience_id=1))
    db.add(SavedRestaurant(user_id=1, restaurant_id=1))

    db.commit()
