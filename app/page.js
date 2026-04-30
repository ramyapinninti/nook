"use client";
import { useState } from "react";

export default function Home() {
  const [location, setLocation] = useState("");
  const [query, setQuery] = useState("");
  const [mood, setMood] = useState("cozy"); // Default to cozy
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!location) return;
    setLoading(true);
    try {
      // Passes both the query and the mood toggle to your backend
      const res = await fetch(`/api/events?location=${encodeURIComponent(location)}&query=${encodeURIComponent(query)}&mood=${mood}&cozy=${mood === "cozy"}`);
      const data = await res.json();
      
      const loudKeywords = ["rock", "concert", "stadium", "arena", "bat out of hell", "metal", "tour", "festival"];
      
      const filtered = data.filter(item => {
        const name = item.name.toLowerCase();
        const isLoud = loudKeywords.some(keyword => name.includes(keyword));
        
        if (query.trim().length > 0) {
          const searchTerm = query.toLowerCase();
          const category = (item.category || "").toLowerCase();
          return !isLoud && (name.includes(searchTerm) || category.includes(searchTerm));
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
    <div style={{ backgroundColor: "#F8F7F2", minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#1F1F1F", padding: "60px 20px" }}>
      <header style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ fontSize: "3.2rem", fontWeight: "200", letterSpacing: "-3px", display: "flex", justifyContent: "center", alignItems: "center", gap: "15px" }}>
          <span style={{ opacity: 0.7 }}>🌙</span> Nook
        </div>
        <p style={{ textTransform: "uppercase", letterSpacing: "5px", fontSize: "0.6rem", marginTop: "12px", color: "#9A9A91", fontWeight: "500" }}>
          The Nervous System Sanctuary
        </p>
      </header>

      {/* Mood Toggle */}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "30px" }}>
        {["cozy", "energetic"].map((m) => (
          <button
            key={m}
            onClick={() => setMood(m)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "2px",
              color: mood === m ? "#1F1F1F" : "#BDBDB4",
              fontWeight: mood === m ? "700" : "400",
              borderBottom: mood === m ? "2px solid #1F1F1F" : "2px solid transparent",
              paddingBottom: "5px",
              transition: "all 0.3s"
            }}
          >
            {m}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: "850px", margin: "0 auto", background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(25px)", borderRadius: "30px", padding: "10px", display: "flex", gap: "5px", border: "1px solid rgba(255, 255, 255, 0.6)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.05)" }}>
        <input placeholder="City" value={location} onChange={(e) => setLocation(e.target.value)} style={{ flex: 1, background: "transparent", border: "none", padding: "15px 25px", outline: "none", fontSize: "1rem" }} />
        <div style={{ width: "1px", background: "#EAE9E1", margin: "12px 0" }}></div>
        <input placeholder="I need a... (Library, Cafe)" value={query} onChange={(e) => setQuery(e.target.value)} style={{ flex: 1.4, background: "transparent", border: "none", padding: "15px 25px", outline: "none", fontSize: "1rem" }} />
        <button onClick={handleSearch} style={{ background: "#1F1F1F", color: "#FFF", border: "none", padding: "0 45px", borderRadius: "22px", cursor: "pointer", fontWeight: "500" }}>
          {loading ? "Seeking..." : "Explore"}
        </button>
      </div>

      <div style={{ marginTop: "80px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "60px 40px", maxWidth: "1200px", margin: "80px auto 0" }}>
        {results.map((item) => (
          <a key={item.id} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + " " + location)}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ borderTop: "1px solid #EAE9E1", paddingTop: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "500", margin: 0 }}>{item.name}</h3>
                <span style={{ fontSize: "0.7rem", fontWeight: "800", color: "#9CAF88", letterSpacing: "1.5px" }}>{item.quietScore}% QUIET</span>
              </div>
              <p style={{ fontSize: "0.92rem", color: "#6B6B63", lineHeight: "1.7" }}>{item.reason}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
