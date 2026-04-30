"use client";
import { useState } from "react";

export default function Home() {
  const [location, setLocation] = useState("");
  const [mood, setMood] = useState("cozy");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!location) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/events?location=${encodeURIComponent(location)}&mood=${mood}&cozy=true`);
      const data = await res.json();
      // Filter out broken links on the frontend as a safety net
      const validResults = data.filter(item => item.url && !item.url.includes("undefined"));
      setResults(validResults);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      backgroundColor: "#F8F7F2", // Designer "Greige"
      minHeight: "100vh",
      fontFamily: "'Inter', sans-serif",
      color: "#1F1F1F",
      padding: "80px 20px"
    }}>
      {/* Sleek Navigation / Logo */}
      <header style={{ textAlign: "center", marginBottom: "80px" }}>
        <div style={{ fontSize: "3rem", fontWeight: "200", letterSpacing: "-3px", display: "flex", justifyContent: "center", alignItems: "center", gap: "15px" }}>
          <span style={{ opacity: 0.6 }}>🌙</span> Nook
        </div>
        <p style={{ textTransform: "uppercase", letterSpacing: "4px", fontSize: "0.7rem", marginTop: "10px", color: "#9A9A91" }}>
          The Nervous System Sanctuary
        </p>
      </header>

      {/* Glassmorphism Search Bar */}
      <div style={{ 
        maxWidth: "700px", 
        margin: "0 auto", 
        background: "rgba(255, 255, 255, 0.7)", 
        backdropFilter: "blur(10px)", 
        borderRadius: "40px", 
        padding: "10px", 
        display: "flex", 
        alignItems: "center",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.03)"
      }}>
        <input 
          placeholder="Enter your city..." 
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ flex: 1, background: "transparent", border: "none", padding: "15px 25px", outline: "none", fontSize: "1.1rem", fontWeight: "300" }} 
        />
        <button 
          onClick={handleSearch}
          style={{ background: "#1F1F1F", color: "#FFF", border: "none", padding: "15px 35px", borderRadius: "30px", cursor: "pointer", fontWeight: "500", transition: "all 0.3s" }}
        >
          {loading ? "Seeking..." : "Explore"}
        </button>
      </div>

      {/* Results Grid: Minimal & Professional */}
      <div style={{ 
        marginTop: "100px", 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
        gap: "40px",
        maxWidth: "1100px",
        margin: "100px auto 0"
      }}>
        {results.map((item) => (
          <a key={item.id} href={item.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ transition: "transform 0.4s ease" }} onMouseOver={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}>
              <div style={{ height: "1px", background: "#EAE9E1", marginBottom: "20px" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "500", margin: 0 }}>{item.name}</h3>
                <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#9CAF88" }}>{item.quietScore}% QUIET</span>
              </div>
              <p style={{ fontSize: "0.95rem", color: "#6B6B63", marginTop: "15px", lineHeight: "1.7", fontWeight: "300" }}>{item.reason}</p>
              <div style={{ marginTop: "20px", fontSize: "0.7rem", fontWeight: "600", color: "#BDBDB4", textTransform: "uppercase" }}>{item.category}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
