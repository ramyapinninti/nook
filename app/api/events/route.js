
import { NextResponse } from "next/server";

const clampQuietScore = (score) => Math.max(0, Math.min(100, Math.round(score)));
const LOUD_EVENT_CATEGORIES = ["Rock", "Metal", "Concert", "Stadium", "Arena", "Tour", "Festival"];
const SANCTUARY_VENUES = ["Library", "Museum", "Botanical Garden"];

const includesCategory = (values, categories) => {
  const normalizedValues = values.filter(Boolean).map((v) => v.toLowerCase());
  return categories.some((cat) => normalizedValues.some((val) => val.includes(cat.toLowerCase())));
};

function calculateGoogleQuietScore(place, displayCategory) {
  const types = place.types || [];
  const typeScores = {
    Library: 98,
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

  if (includesCategory([displayCategory, place.name], SANCTUARY_VENUES)) {
    score = Math.max(score, 91);
  }

  return clampQuietScore(score);
}

function calculateTicketmasterQuietScore(event, segment, genre) {
  const eventName = event.name.toLowerCase();
  const isUncertainEvent = !segment || segment === "Event" || !genre || genre === "Undefined";
  let score = 40;

  if (segment === "Arts & Theatre") score += 25;
  if (genre === "Classical") score += 35;
  if (segment === "Sports" || segment === "Music") score -= 45;
  if (includesCategory([eventName], LOUD_EVENT_CATEGORIES)) score = 15;
  
  return isUncertainEvent ? Math.min(score, 20) : clampQuietScore(score);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location");
  const query = searchParams.get("query") || "";

  const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;
  const TM_KEY = process.env.TICKETMASTER_API_KEY;

  try {
    const googleSearchQuery = query ? `${query} in ${location}` : `quiet study spots in ${location}`;
    const googleUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(googleSearchQuery)}&key=${GOOGLE_KEY}`;
    
    const [gRes, tmRes] = await Promise.all([
      fetch(googleUrl),
      fetch(`https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TM_KEY}&city=${location}&sort=date,asc`)
    ]);

    const gData = await gRes.json();
    const tmData = await tmRes.json();

    const googleResults = (gData.results || []).slice(0, 20).map(place => {
      const types = place.types || [];
      const name = place.name.toLowerCase();
      let displayCategory = "Focus Spot";

      if (types.includes("library") || name.includes("library")) displayCategory = "Library";
      else if (types.includes("cafe") || types.includes("coffee_shop")) displayCategory = "Cafe";
      else if (types.includes("book_store")) displayCategory = "Bookstore";
      else if (types.includes("museum")) displayCategory = "Museum/Gallery";

      const quietScore = calculateGoogleQuietScore(place, displayCategory);
      let finalScore = quietScore;

      // Heavy boost for specific keyword matches
      if (query && (name.includes(query.toLowerCase()) || displayCategory.toLowerCase().includes(query.toLowerCase()))) {
        finalScore += 100; 
      }

      return {
        id: place.place_id,
        name: place.name,
        category: displayCategory,
        rating: place.rating,
        quietScore,
        score: finalScore,
        reason: `A calm environment rated ${place.rating || 'well'} for focus.`,
        url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " " + location)}`
      };
    });

    const ticketmasterResults = (tmData._embedded?.events || []).map(event => {
      const segment = event.classifications?.[0]?.segment?.name || "Event";
      const genre = event.classifications?.[0]?.genre?.name || "";
      const quietScore = calculateTicketmasterQuietScore(event, segment, genre);
      
      return {
        id: event.id,
        name: event.name,
        category: genre !== "Undefined" ? genre : segment,
        quietScore,
        score: quietScore,
        reason: "A scheduled event matching your profile.",
        url: event.url
      };
    });

    const finalResults = [...googleResults, ...ticketmasterResults]
      .filter(item => item.quietScore > 30)
      .sort((a, b) => b.score - a.score);

    return NextResponse.json(finalResults.slice(0, 15));
  } catch (err) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
