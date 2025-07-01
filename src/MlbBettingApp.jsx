
import React, { useEffect, useState } from "react";

function MlbBettingApp() {
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEVOnly, setShowEVOnly] = useState(false);
  const [showParlayOnly, setShowParlayOnly] = useState(false);

  useEffect(() => {
    fetch("https://mlb-betting-app.onrender.com/api/mlb/picks")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPicks(data);
        } else {
          console.warn("Unexpected API data:", data);
          setPicks([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setPicks([]);
        setLoading(false);
      });
  }, []);

  const filtered = Array.isArray(picks)
    ? picks.filter((pick) => {
        if (showEVOnly && pick.ev <= 0) return false;
        if (showParlayOnly && !pick.parlay) return false;
        return true;
      })
    : [];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">MLB Betting Picks</h1>
      <div className="flex justify-center gap-4 mb-6">
        <button
          className={showEVOnly ? "bg-green-500 text-white px-4 py-2 rounded" : "bg-white border px-4 py-2 rounded"}
          onClick={() => setShowEVOnly(!showEVOnly)}
        >
          {showEVOnly ? "Showing +EV Only" : "Show +EV Only"}
        </button>
        <button
          className={showParlayOnly ? "bg-blue-500 text-white px-4 py-2 rounded" : "bg-white border px-4 py-2 rounded"}
          onClick={() => setShowParlayOnly(!showParlayOnly)}
        >
          {showParlayOnly ? "Showing Parlays" : "Show Parlays"}
        </button>
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-red-600">No picks found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pick, index) => (
            <div key={index} className="bg-white p-4 shadow rounded-lg">
              <h2 className="font-bold">{pick.matchup || "Matchup"}</h2>
              <p>Pick: {pick.recommendation}</p>
              <p>Win Prob: {pick.winProb ? Math.round(pick.winProb * 100) + "%" : "N/A"}</p>
              <p>Odds: {typeof pick.odds === "number" ? pick.odds : "N/A"}</p>
              <p>EV: {typeof pick.ev === "number" ? pick.ev : "N/A"}</p>
              <p>Parlay Worthy: {pick.parlay ? "Yes" : "No"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MlbBettingApp;
