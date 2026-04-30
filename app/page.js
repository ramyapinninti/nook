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
      const res = await fetch(`/api/events?location=${encodeURIComponent(location)}&query=${encodeURIComponent(query)}&cozy=true`);
      const data = await res.json();
      
      // Strict filter for loud events that might sneak through
      const loudKeywords = ["rock", "concert", "stadium", "arena", "bat out of hell", "metal", "tour", "festival"];
      
      const filtered = data.filter(item => {
        const name = item.name.toLowerCase();
        const isLoud = loudKeywords.some(keyword => name.includes(keyword));
        
        // If we are searching for a specific term, ensure the name or category matches it
        if (query.trim().length > 0) {
          const searchTerm = query.toLowerCase();
          const category = (item.category || "").toLowerCase();
          const matchesQuery = name.includes(searchTerm) || category.includes(searchTerm);
          return !isLoud && matchesQuery;
        }

        return !isLoud;
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
        <div style={{ fontSize: "3.2rem", fontWeight: "200", letterSpacing: "-3px", display: "flex", justifyContent: "center", alignItems: "center", gap: "15px" }}>
          <span style={{ opacity: 0.7 }}>🌙</span> Nook
        </div>
        <p style={{ textTransform: "uppercase", letterSpacing: "5px", fontSize: "0.6rem", marginTop: "12px", color: "#9A9A91", fontWeight: "500" }}>
          The Nervous System Sanctuary
        </p>
      </header>

      {/* Professional Dual Search Bar */}
      <div style={{ 
        maxWidth: "850px", 
        margin: "0 auto", 
        background: "rgba(255, 255, 255, 0.85)", 
        backdropFilter: "blur(25px)", 
        borderRadius: "30px", 
        padding: "10px", 
        display: "flex", 
        gap: "5px",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.05)"
      }}>
        <input 
          placeholder="City (e.g. Philadelphia)" 
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ flex: 1, background: "transparent", border: "none", padding: "15px 25px", outline: "none", fontSize: "1rem", fontWeight: "300" }} 
        />
        <div style={{ width: "1px", background: "#EAE9E1", margin: "12px 0" }}></div>
        <input 
          placeholder="I need a... (e.g. Library, Cafe)" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1.4, background: "transparent", border: "none", padding: "15px 25px", outline: "none", fontSize: "1rem", fontWeight: "300" }} 
        />
        <button 
          onClick={handleSearch}
          style={{ 
            background: "#1F1F1F", 
            color: "#FFF", 
            border: "none", 
            padding: "0 45px", 
            borderRadius: "22px", 
            cursor: "pointer", 
            fontWeight: "500",
            letterSpacing: "0.5px",
            transition: "opacity 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
          onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
        >
          {loading ? "Seeking..." : "Explore"}
        </button>
      </div>

      {/* Results Grid */}
      <div style={{ 
        marginTop: "100px", 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", 
        gap: "70px 40px", 
        maxWidth: "1200px", 
        margin: "100px auto 0" 
      }}>
        {results.map((item) => (
          <a 
            key={item.id} 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + " " + location)}`} 
            target="_blank" 
            rel="noreferrer" 
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div 
              style={{ borderTop: "1px solid #EAE9E1", paddingTop: "28px", transition: "all 0.4s ease" }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = "#1F1F1F"}
              onMouseOut={(e) => e.currentTarget.style.borderColor = "#EAE9E1"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "500", margin: 0, flex: 1, letterSpacing: "-0.3px" }}>{item.name}</h3>
                <span style={{ fontSize: "0.7rem", fontWeight: "800", color: "#9CAF88", marginLeft: "12px", letterSpacing: "1.5px" }}>
                  {item.quietScore}% QUIET
                </span>
              </div>
              <p style={{ fontSize: "0.92rem", color: "#6B6B63", lineHeight: "1.7", fontWeight: "300" }}>
                {item.reason}
              </p>
              <div style={{ marginTop: "22px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "0.62rem", fontWeight: "700", color: "#A0A096", textTransform: "uppercase", background: "#F1F0E8", padding: "5px 10px", borderRadius: "2px", letterSpacing: "0.5px" }}>
                  {item.category}
                </span>
                {item.rating && <span style={{ fontSize: "0.7rem", color: "#D4AF37", fontWeight: "600" }}>★ {item.rating}</span>}
              </div>
            </div>
          </a>
        ))}
      </div>
      
      {results.length === 0 && !loading && location && (
        <p style={{ textAlign: "center", color: "#9A9A91", marginTop: "100px", fontWeight: "300" }}>No quiet sanctuaries found. Try a different search.</p>
      )}
    </div>
  );
}
