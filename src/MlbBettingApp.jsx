
import React, { useEffect, useState } from "react";

function MlbBettingApp() {
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://mlb-betting-app.onrender.com/api/mlb/picks")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPicks(data);
        } else {
          console.warn("Invalid picks response:", data);
          setPicks([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setPicks([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-center mb-6">MLB Betting Picks</h1>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : picks.length === 0 ? (
        <p className="text-center text-red-500">No picks available.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {picks.map((pick, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow">
              <h2 className="text-lg font-semibold">{pick.matchup || "Matchup"}</h2>
              <p>Pick: {pick.recommendation}</p>
              <p>Win Probability: {pick.winProb ? Math.round(pick.winProb * 100) + "%" : "N/A"}</p>
              <p>Odds: {typeof pick.odds === "number" ? pick.odds : "N/A"}</p>
              <p>EV: {typeof pick.ev === "number" ? pick.ev : "N/A"}</p>
              <p>Parlay: {pick.parlay ? "Yes" : "No"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MlbBettingApp;
