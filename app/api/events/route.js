import { NextResponse } from "next/server";

const clampQuietScore = (score) => Math.max(0, Math.min(100, Math.round(score)));

function calculateGoogleQuietScore(place, displayCategory) {
  const types = place.types || [];
  const typeScores = {
    Library: 96,
    Bookstore: 90,
    "Museum/Gallery": 84,
    "Quiet Park": 82,
    "Campus Spot": 76,
    Cafe: 70,
    "Focus Spot": 64,
  };

  let score = typeScores[displayCategory] || 64;

  if (types.includes("night_club") || types.includes("bar")) score -= 35;
  if (types.includes("tourist_attraction")) score -= 8;
  if (types.includes("restaurant")) score -= 6;
  if (typeof place.rating === "number") score += (place.rating - 4) * 5;

  return clampQuietScore(score);
}

function calculateTicketmasterQuietScore(event, segment, genre) {
  const eventName = event.name.toLowerCase();
  let score = 45;

  if (segment === "Arts & Theatre") score += 24;
  if (genre === "Classical") score += 30;
  if (genre === "Jazz") score += 14;
  if (genre === "Fine Art" || genre === "Theatre") score += 18;
  if (segment === "Sports") score -= 34;
  if (segment === "Music") score -= 12;
  if (genre === "Comedy") score -= 8;
  if (eventName.includes("acoustic") || eventName.includes("lecture")) score += 12;
  if (eventName.includes("rock") || eventName.includes("metal")) score -= 38;
  if (eventName.includes("festival") || eventName.includes("party")) score -= 24;

  return clampQuietScore(score);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location");
  const mood = searchParams.get("mood") || "cozy";
  const cozy = searchParams.get("cozy") === "true";
  const query = searchParams.get("query") || "";

  const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;
  const TM_KEY = process.env.TICKETMASTER_API_KEY;

  try {
    let googleResults = [];
    let ticketmasterResults = [];

    // --- 1. GOOGLE PLACES (Physical Locations) ---
    if (cozy || query) {
      const searchTerms = cozy 
        ? `quiet study spots libraries cafes in ${location}` 
        : `${query} in ${location}`;
        
      const googleUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchTerms)}&key=${GOOGLE_KEY}`;
      
      const gRes = await fetch(googleUrl);
      const gData = await gRes.json();

      if (gData.results) {
        googleResults = gData.results.slice(0, 10).map(place => {
          const types = place.types || [];
          let displayCategory = "Focus Spot";

          // Mapping Google Types to clean UI Labels
          if (types.includes("library")) displayCategory = "Library";
          else if (types.includes("cafe") || types.includes("coffee_shop")) displayCategory = "Cafe";
          else if (types.includes("book_store")) displayCategory = "Bookstore";
          else if (types.includes("park")) displayCategory = "Quiet Park";
          else if (types.includes("museum") || types.includes("art_gallery")) displayCategory = "Museum/Gallery";
          else if (types.includes("university")) displayCategory = "Campus Spot";

          const quietScore = calculateGoogleQuietScore(place, displayCategory);

          return {
            id: place.place_id,
            name: place.name,
            category: displayCategory,
            date: "Open Now", 
            rating: place.rating,
            reason: `Rated ${place.rating} stars. Perfect for a ${mood} atmosphere.`,
            quietScore,
            score: quietScore + 15, // Higher priority for physical spots in study mode
            url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`
          };
        });
      }
    }

    // --- 2. TICKETMASTER (Scheduled Events) ---
    const tmUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TM_KEY}&city=${location}&sort=date,asc`;
    const tmRes = await fetch(tmUrl);
    const tmData = await tmRes.json();
    const events = tmData._embedded?.events || [];

    ticketmasterResults = events.map(event => {
      const segment = event.classifications?.[0]?.segment?.name || "Event";
      const genre = event.classifications?.[0]?.genre?.name || "";
      const eventName = event.name.toLowerCase();
      const quietScore = calculateTicketmasterQuietScore(event, segment, genre);
      
      let score = 20;
      if (cozy) {
        if (segment === "Arts & Theatre" || genre === "Classical") score += 40;
        if (segment === "Sports" || segment === "Music") score -= 80;
        if (eventName.includes("rock") || eventName.includes("metal")) score -= 100;
      }

      return {
        id: event.id,
        name: event.name,
        category: genre && genre !== "Undefined" ? genre : segment,
        date: event.dates?.start?.localDate,
        rating: null,
        reason: "A scheduled event that fits your energy profile.",
        quietScore,
        score: score,
        url: event.url
      };
    });

    // --- 3. MERGE & FILTER ---
    const finalResults = [...googleResults, ...ticketmasterResults]
      .filter(item => item.score > -50)
      .sort((a, b) => b.score - a.score);

    return NextResponse.json(finalResults.slice(0, 15));

  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
