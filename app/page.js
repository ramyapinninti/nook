"use client";
import { useState } from "react";

export default function Home() {
  const [location, setLocation] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!location) return;
    setLoading(true);
    try {
      // 1. Pass the user's specific query (e.g., "Library") to the API
      const res = await fetch(`/api/events?location=${encodeURIComponent(location)}&query=${encodeURIComponent(query)}&cozy=true`);
      const data = await res.json();
      
      // 2. Logic Hardening: Manual override to catch loud events the AI might miss
      const loudKeywords = ["rock", "concert", "stadium", "arena", "bat out of hell", "metal", "tour"];
      const filtered = data.filter(item => {
        const name = item.name.toLowerCase();
        // Keep it only if the name doesn't contain loud keywords
        return !loudKeywords.some(keyword => name.includes(keyword));
      });

      setResults(filtered);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      backgroundColor: "#F8F7F2", 
      minHeight: "100vh", 
      fontFamily: "'Inter', sans-serif", 
      color: "#1F1F1F", 
      padding: "80px 20px" 
    }}>
      {/* Sleek Header */}
      <header style={{ textAlign: "center", marginBottom: "60px" }}>
        <div style={{ fontSize: "3rem", fontWeight: "200", letterSpacing: "-3px", display: "flex", justifyContent: "center", alignItems: "center", gap: "15px" }}>
          <span style={{ opacity: 0.6 }}>🌙</span> Nook
        </div>
        <p style={{ textTransform: "uppercase", letterSpacing: "4px", fontSize: "0.65rem", marginTop: "10px", color: "#9A9A91" }}>
          The Nervous System Sanctuary
        </p>
      </header>

      {/* Professional Search Bar */}
      <div style={{ 
        maxWidth: "800px", 
        margin: "0 auto", 
        background: "rgba(255, 255, 255, 0.8)", 
        backdropFilter: "blur(20px)", 
        borderRadius: "24px", 
        padding: "8px", 
        display: "flex", 
        gap: "10px",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        boxShadow: "0 30px 60px rgba(0,0,0,0.04)"
      }}>
        <input 
          placeholder="City (e.g. Philadelphia)" 
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ flex: 1, background: "transparent", border: "none", padding: "15px 20px", outline: "none", fontSize: "1rem" }} 
        />
        <div style={{ width: "1px", background: "#EAE9E1", margin: "10px 0" }}></div>
        <input 
          placeholder="I need a... (e.g. Library, Cafe)" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1.5, background: "transparent", border: "none", padding: "15px 20px", outline: "none", fontSize: "1rem" }} 
        />
        <button 
          onClick={handleSearch}
          style={{ background: "#1F1F1F", color: "#FFF", border: "none", padding: "0 40px", borderRadius: "18px", cursor: "pointer", fontWeight: "500" }}
        >
          {loading ? "Searching..." : "Explore"}
        </button>
      </div>

      {/* Results Grid */}
      <div style={{ 
        marginTop: "100px", 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", 
        gap: "60px 30px", 
        maxWidth: "1200px", 
        margin: "100px auto 0" 
      }}>
        {results.map((item) => (
          /* THE HREF FIX: Directs to Google Maps search to avoid 404s */
          <a 
            key={item.id} 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + " " + location)}`} 
            target="_blank" 
            rel="noreferrer" 
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div 
              style={{ borderTop: "1px solid #EAE9E1", paddingTop: "25px", transition: "all 0.3s" }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = "#1F1F1F"}
              onMouseOut={(e) => e.currentTarget.style.borderColor = "#EAE9E1"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "600", margin: 0, flex: 1 }}>{item.name}</h3>
                <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#9CAF88", marginLeft: "10px", letterSpacing: "1px" }}>
                  {item.quietScore}% QUIET
                </span>
              </div>
              <p style={{ fontSize: "0.9rem", color: "#6B6B63", marginTop: "12px", lineHeight: "1.6", fontWeight: "400" }}>
                {item.reason || item.description}
              </p>
              <div style={{ marginTop: "15px", display: "flex", gap: "8px" }}>
                <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "#BDBDB4", textTransform: "uppercase", background: "#F1F0E8", padding: "4px 8px", borderRadius: "4px" }}>
                  {item.category}
                </span>
                {item.rating && <span style={{ fontSize: "0.65rem", color: "#F39C12" }}>★ {item.rating}</span>}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
