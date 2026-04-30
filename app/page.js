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
      const res = await fetch(`/api/events?location=${encodeURIComponent(location)}&query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#F8F7F2", minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#1F1F1F", padding: "80px 20px" }}>
      <header style={{ textAlign: "center", marginBottom: "60px" }}>
        <div style={{ fontSize: "3.2rem", fontWeight: "200", letterSpacing: "-3px" }}>🌙 Nook</div>
        <p style={{ textTransform: "uppercase", letterSpacing: "5px", fontSize: "0.6rem", marginTop: "12px", color: "#9A9A91" }}>
          The Nervous System Sanctuary
        </p>
      </header>

      <div style={{ maxWidth: "800px", margin: "0 auto", background: "white", borderRadius: "30px", padding: "8px", display: "flex", boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}>
        <input placeholder="City" value={location} onChange={(e) => setLocation(e.target.value)} style={{ flex: 1, border: "none", padding: "15px 25px", outline: "none", fontSize: "1rem" }} />
        <input placeholder="Search (e.g. Library)" value={query} onChange={(e) => setQuery(e.target.value)} style={{ flex: 1.5, border: "none", padding: "15px 25px", outline: "none", fontSize: "1rem" }} />
        <button onClick={handleSearch} style={{ background: "#1F1F1F", color: "#FFF", border: "none", padding: "0 35px", borderRadius: "22px", cursor: "pointer", fontWeight: "600" }}>
          {loading ? "..." : "Find"}
        </button>
      </div>

      <div style={{ marginTop: "80px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "50px", maxWidth: "1100px", margin: "80px auto 0" }}>
        {results.map((item) => (
          <a key={item.id} href={item.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ borderTop: "1px solid #EAE9E1", paddingTop: "25px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <h3 style={{ fontSize: "1.1rem", margin: 0 }}>{item.name}</h3>
                <span style={{ fontSize: "0.7rem", color: "#9CAF88", fontWeight: "800" }}>{item.quietScore}% QUIET</span>
              </div>
              <p style={{ fontSize: "0.9rem", color: "#6B6B63", lineHeight: "1.6" }}>{item.reason}</p>
              <div style={{ marginTop: "15px", display: "flex", gap: "10px", alignItems: "center" }}>
                 <span style={{ fontSize: "0.6rem", background: "#F1F0E8", padding: "4px 8px", borderRadius: "2px", textTransform: "uppercase" }}>{item.category}</span>
                 {item.rating && <span style={{ fontSize: "0.7rem", color: "#F39C12" }}>★ {item.rating}</span>}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
