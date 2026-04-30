"use client";

import { useState } from "react";

export default function Home() {
  const [location, setLocation] = useState("");
  const [mood, setMood] = useState("cozy");
  const [cozy, setCozy] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!location) return alert("Please enter a city!");
    setLoading(true);
    try {
      const res = await fetch(
        `/api/events?location=${encodeURIComponent(location)}&mood=${mood}&cozy=${cozy}&query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("UI error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: "40px 20px", 
      maxWidth: "800px", 
      margin: "0 auto", 
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      backgroundColor: "#F9F9F7", // Soft off-white background
      minHeight: "100vh"
    }}>
      <header style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#1A1A1A", marginBottom: "10px" }}>
          📍 Nook
        </h1>
        <p style={{ color: "#666", fontSize: "1.1rem" }}>
          Find your sanctuary. Quiet study spots and low-stimulation events.
        </p>
      </header>
      
      {/* Search Container */}
      <div style={{ 
        backgroundColor: "#ffffff", 
        padding: "30px", 
        borderRadius: "24px", 
        boxShadow: "0 10px 25px rgba(0,0,0,0.03)", 
        border: "1px solid #F0F0EE", 
        display: "flex", 
        flexDirection: "column", 
        gap: "20px" 
      }}>
        <div style={{ display: "flex", gap: "12px" }}>
          <input
            placeholder="City (e.g., Downingtown)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid #E2E2E0", fontSize: "1rem" }}
          />
          <select 
            value={mood} 
            onChange={(e) => setMood(e.target.value)} 
            style={{ padding: "14px", borderRadius: "12px", border: "1px solid #E2E2E0", backgroundColor: "#fff" }}
          >
            <option value="cozy">Cozy Mood</option>
            <option value="energetic">Energetic Mood</option>
          </select>
        </div>

        <input
          placeholder="What are you looking for? (e.g. 'library', 'jazz', 'cafe')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: "14px", borderRadius: "12px", border: "1px solid #E2E2E0", fontSize: "1rem" }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", fontWeight: "500", color: "#444" }}>
            <input 
              type="checkbox" 
              checked={cozy} 
              onChange={() => setCozy(!cozy)} 
              style={{ width: "20px", height: "20px", accentColor: "#8DA399" }}
            />
            Quiet / Study Mode
          </label>
          <button 
            onClick={handleSearch} 
            disabled={loading} 
            style={{ 
              padding: "14px 30px", 
              backgroundColor: "#1A1A1A", 
              color: "#fff", 
              borderRadius: "12px", 
              border: "none", 
              cursor: "pointer", 
              fontWeight: "600",
              transition: "background-color 0.2s" 
            }}
          >
            {loading ? "Seeking..." : "Find Spots"}
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div style={{ marginTop: "40px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {results.length === 0 && !loading && (
          <div style={{ textAlign: "center", marginTop: "50px", color: "#999" }}>
            <p style={{ fontStyle: "italic" }}>It's a noisy world out there. Let's find you a sanctuary.</p>
          </div>
        )}

        {results.map((item) => (
          <a key={item.id} href={item.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <div style={{ 
              padding: "24px", 
              border: "1px solid #F0F0EE", 
              borderRadius: "20px", 
              backgroundColor: "#fff", 
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.02)";
            }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0", color: "#1A1A1A", fontSize: "1.2rem", fontWeight: "700" }}>
                    {item.name} {item.rating && <span style={{ color: "#f39c12", fontSize: "0.95rem", marginLeft: "8px" }}>★ {item.rating}</span>}
                  </h3>
                  <p style={{ margin: "6px 0", fontSize: "0.9rem", color: "#888", fontWeight: "500" }}>
                    {item.date}
                  </p>
                </div>
                
                {/* Quiet Score Badge */}
                {item.quietScore && (
                  <div style={{ 
                    backgroundColor: "#F5F5DC", 
                    color: "#5D5C45", 
                    padding: "6px 14px", 
                    borderRadius: "100px", 
                    fontSize: "0.8rem", 
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    border: "1px solid #E5E5CA",
                    whiteSpace: "nowrap"
                  }}>
                    🌙 Quiet {item.quietScore}
                  </div>
                )}
              </div>

              <p style={{ margin: "12px 0 0 0", fontSize: "1rem", color: "#444", lineHeight: "1.6" }}>
                {item.reason}
              </p>
              
              <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                <span style={{ 
                  fontSize: "0.7rem", 
                  backgroundColor: "#F0F0F0", 
                  color: "#666", 
                  padding: "4px 10px", 
                  borderRadius: "6px", 
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: "600"
                }}>
                  {item.category}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
