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
      padding: "60px 20px", 
      maxWidth: "1000px", 
      margin: "0 auto", 
      fontFamily: "'Inter', sans-serif",
      backgroundColor: "#FDFBF7", 
      minHeight: "100vh",
      color: "#2D2A26"
    }}>
      <header style={{ textAlign: "center", marginBottom: "60px" }}>
        <h1 style={{ fontSize: "3.5rem", fontWeight: "300", letterSpacing: "-2px", marginBottom: "10px" }}>
          📍 Nook
        </h1>
        <p style={{ color: "#8C8A82", fontSize: "1.2rem", fontWeight: "300", fontStyle: "italic" }}>
          Find your sanctuary. Filter the noise.
        </p>
      </header>
      
      <div style={{ 
        backgroundColor: "#ffffff", 
        padding: "40px", 
        borderRadius: "32px", 
        boxShadow: "0 20px 50px rgba(0,0,0,0.04)", 
        border: "1px solid #F0F0EE", 
        display: "flex", 
        flexDirection: "column", 
        gap: "24px" 
      }}>
        <div style={{ display: "flex", gap: "15px" }}>
          <input
            placeholder="Where are you? (e.g. Downingtown)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ flex: 2, padding: "18px", borderRadius: "16px", border: "1px solid #E2E2E0", fontSize: "1rem", outline: "none", backgroundColor: "#FAFAFA" }}
          />
          <select 
            value={mood} 
            onChange={(e) => setMood(e.target.value)} 
            style={{ flex: 1, padding: "18px", borderRadius: "16px", border: "1px solid #E2E2E0", backgroundColor: "#fff", cursor: "pointer" }}
          >
            <option value="cozy">Cozy Mood</option>
            <option value="energetic">Energetic Mood</option>
          </select>
        </div>

        <input
          placeholder="What do you need? (e.g. library, jazz, cafe)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: "18px", borderRadius: "16px", border: "1px solid #E2E2E0", fontSize: "1rem", outline: "none", backgroundColor: "#FAFAFA" }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", fontWeight: "400", color: "#666" }}>
            <input 
              type="checkbox" 
              checked={cozy} 
              onChange={() => setCozy(!cozy)} 
              style={{ width: "22px", height: "22px", accentColor: "#9CAF88" }}
            />
            Quiet / Study Mode
          </label>
          <button 
            onClick={handleSearch} 
            disabled={loading} 
            style={{ 
              padding: "18px 45px", 
              backgroundColor: "#2D2A26", 
              color: "#fff", 
              borderRadius: "16px", 
              border: "none", 
              cursor: "pointer", 
              fontWeight: "500",
              fontSize: "1.1rem",
              transition: "transform 0.2s ease" 
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {loading ? "Seeking..." : "Reveal Spots"}
          </button>
        </div>
      </div>

      {/* Results Grid */}
      <div style={{ 
        marginTop: "60px", 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", 
        gap: "25px" 
      }}>
        {results.length === 0 && !loading && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", marginTop: "50px", color: "#B0AFA8" }}>
            <p style={{ fontStyle: "italic", fontSize: "1.1rem" }}>The world is waiting. Find your nook.</p>
          </div>
        )}

        {results.map((item) => (
          <a key={item.id} href={item.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <div style={{ 
              padding: "30px", 
              border: "1px solid #F0F0EE", 
              borderRadius: "24px", 
              backgroundColor: "#fff", 
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.06)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.02)";
            }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                  <h3 style={{ margin: "0", color: "#2D2A26", fontSize: "1.4rem", fontWeight: "500" }}>
                    {item.name}
                  </h3>
                  {item.quietScore && (
                    <div style={{ 
                      backgroundColor: "#F5F5DC", 
                      color: "#9CAF88", 
                      padding: "6px 16px", 
                      borderRadius: "100px", 
                      fontSize: "0.85rem", 
                      fontWeight: "700",
                      border: "1px solid #E5E5CA"
                    }}>
                      🌙 {item.quietScore}
                    </div>
                  )}
                </div>
                <p style={{ color: "#666", lineHeight: "1.6", fontSize: "1rem" }}>{item.reason}</p>
              </div>
              
              <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", color: "#9CAF88", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>
                  {item.category}
                </span>
                {item.rating && <span style={{ color: "#F39C12", fontWeight: "600" }}>★ {item.rating}</span>}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
