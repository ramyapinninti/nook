import { NextResponse } from "next/server";

const clampQuietScore = (score) => Math.max(0, Math.min(100, Math.round(score)));
const LOUD_EVENT_CATEGORIES = ["Rock", "Metal", "Concert", "Stadium", "Arena", "Tour", "Festival"];
const PREMIUM_QUIET_CATEGORIES = ["Library", "Museum", "Botanical", "Acoustic"];
const SANCTUARY_VENUES = ["Library", "Museum", "Botanical Garden"];

const includesCategory = (values, categories) => {
  const normalizedValues = values
    .filter(Boolean)
    .map((value) => value.toLowerCase());

  return categories.some((category) =>
    normalizedValues.some((value) => value.includes(category.toLowerCase()))
  );
};

const capLoudEventQuietScore = (score, values) => {
  if (includesCategory(values, LOUD_EVENT_CATEGORIES)) {
    return Math.min(score, 15); // Dropped from 29 to 15 for extra safety
  }
  return score;
};

const applySanctuaryVenueFloor = (score, values) => {
  if (includesCategory(values, SANCTUARY_VENUES)) {
    return Math.max(score, 91);
  }
  return score;
};

function calculateGoogleQuietScore(place, displayCategory) {
  const types = place.types || [];
  const typeScores = {
    Library: 98, // Increased
    Bookstore: 92,
    "Museum/Gallery": 88,
    Botanical: 94,
    "Quiet Park": 82,
    "Campus Spot": 78,
    Cafe: 68,
    "Focus Spot": 64,
  };

  let score = typeScores[displayCategory] || 64;

  if (types.includes("night_club") || types.includes("bar")) score -= 40;
  if (types.includes("tourist_attraction")) score -= 10;
  if (typeof place.rating === "number") score += (place.rating - 4) * 5;

  return applySanctuaryVenueFloor(clampQuietScore(score), [displayCategory, place.name]);
}

function calculateTicketmasterQuietScore(event, segment, genre) {
  const eventName = event.name.toLowerCase();
  const venueName = event._embedded?.venues?.[0]?.name || "";
  const isUncertainEvent = !segment || segment === "Event" || !genre || genre === "Undefined";
  let score = 40;

  if (segment === "Arts & Theatre") score += 25;
  if (genre === "Classical") score += 35;
  if (genre === "Fine Art" || genre === "Theatre") score += 20;
  if (segment === "Sports" || segment === "Music") score -= 40;
  if (eventName.includes("rock") || eventName.includes("metal")) score -= 50;
  
  const scored = applySanctuaryVenueFloor(clampQuietScore(score), [venueName]);
  if (isUncertainEvent) return Math.min(scored, 20);

  return capLoudEventQuietScore(scored, [segment, genre, event.name]);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location");
  const mood = searchParams.get("mood") || "cozy";
  const query = searchParams.get("query") || "";

  const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;
  const TM_KEY = process.env.TICKETMASTER_API_KEY;

  try {
    let googleResults = [];
    let ticketmasterResults = [];

    // --- 1. GOOGLE PLACES ---
    // Change: Refined search logic to focus on the specific query
    const googleSearchQuery = query 
      ? `${query} in ${location}` 
      : `quiet study spots libraries cafes in ${location}`;
        
    const googleUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(googleSearchQuery)}&key=${GOOGLE_KEY}`;
    const gRes = await fetch(googleUrl);
    const gData = await gRes.json();

    if (gData.results) {
      // Increased slice to 20 to find more libraries when requested
      googleResults = gData.results.slice(0, 20).map(place => {
        const types = place.types || [];
        const name = place.name.toLowerCase();
        let displayCategory = "Focus Spot";

        if (types.includes("library") || name.includes("library")) displayCategory = "Library";
        else if (types.includes("cafe") || types.includes("coffee_shop")) displayCategory = "Cafe";
        else if (types.includes("book_store")) displayCategory = "Bookstore";
        else if (types.includes("museum") || types.includes("art_gallery")) displayCategory = "Museum/Gallery";

        const quietScore = calculateGoogleQuietScore(place, displayCategory);
        
        // Boost points if it matches the user's specific query
        let relevanceScore = quietScore;
        if (query && (name.includes(query.toLowerCase()) || displayCategory.toLowerCase().includes(query.toLowerCase()))) {
          relevanceScore += 50; 
        }

        return {
          id: place.place_id,
          name: place.name,
          category: displayCategory,
          rating: place.rating,
          reason: `Rated ${place.rating} stars. Perfect for a ${mood} atmosphere.`,
          quietScore,
          score: relevanceScore, // Use boosted score for sorting
          url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " " + location)}`
        };
      });
    }

    // --- 2. TICKETMASTER ---
    const tmUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TM_KEY}&city=${location}&sort=date,asc`;
    const tmRes = await fetch(tmUrl);
    const tmData = await tmRes.json();
    const events = tmData._embedded?.events || [];

    ticketmasterResults = events.map(event => {
      const segment = event.classifications?.[0]?.segment?.name || "Event";
      const genre = event.classifications?.[0]?.genre?.name || "";
      const quietScore = calculateTicketmasterQuietScore(event, segment, genre);
      
      let score = quietScore;
      // Penalty: If user searched for a specific place type (like 'library'), 
      // deprioritize events that aren't related.
      if (query && !event.name.toLowerCase().includes(query.toLowerCase())) {
        score -= 60;
      }

      return {
        id: event.id,
        name: event.name,
        category: genre !== "Undefined" ? genre : segment,
        quietScore,
        score,
        url: event.url
      };
    });

    // --- 3. MERGE & FILTER ---
    const finalResults = [...googleResults, ...ticketmasterResults]
      .filter(item => item.quietScore > 20) // Filter out clearly loud stuff
      .sort((a, b) => b.score - a.score);

    return NextResponse.json(finalResults.slice(0, 15));

  } catch (err) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
