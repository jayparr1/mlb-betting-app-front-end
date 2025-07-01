
import React, { useEffect, useState } from "react";

export default function MlbBettingApp() {
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEVOnly, setShowEVOnly] = useState(false);
  const [showParlayOnly, setShowParlayOnly] = useState(false);
  const [history, setHistory] = useState([]);
  const [results, setResults] = useState({});

  useEffect(() => {
    fetch("https://mlb-betting-app.onrender.com/api/mlb/picks")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched picks:", data);
        setPicks(Array.isArray(data) ? data : []);
        setHistory((prev) => [...prev, { date: new Date().toISOString(), picks: data }]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching MLB picks:", err);
        setPicks([]);
        setLoading(false);
      });

    fetch("https://mlb-betting-app.onrender.com/api/mlb/results")
      .then((res) => res.json())
      .then((data) => setResults(data))
      .catch((err) => console.error("Error fetching results:", err));
  }, []);

  const filteredPicks = Array.isArray(picks) ? picks.filter((pick) => {
    if (showEVOnly && pick.ev <= 0) return false;
    if (showParlayOnly && !pick.parlay) return false;
    return true;
  }) : [];

  const getResult = (matchup, recommendation) => {
    const game = results[matchup];
    if (!game) return null;
    return game.result === recommendation ? "Win" : "Loss";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">MLB Daily Betting Picks</h1>
      <div className="flex flex-col md:flex-row md:justify-center gap-4 mb-6">
        <button
          className={\`px-4 py-2 rounded-full border \${showEVOnly ? "bg-green-500 text-white" : "bg-white"}\`}
          onClick={() => setShowEVOnly(!showEVOnly)}
        >
          {showEVOnly ? "Showing +EV Only" : "Show +EV Only"}
        </button>
        <button
          className={\`px-4 py-2 rounded-full border \${showParlayOnly ? "bg-blue-500 text-white" : "bg-white"}\`}
          onClick={() => setShowParlayOnly(!showParlayOnly)}
        >
          {showParlayOnly ? "Showing Parlay Picks" : "Show Parlay Picks"}
        </button>
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : filteredPicks.length === 0 ? (
        <p className="text-center">No picks found for today.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPicks.map((pick, index) => (
            <div
              key={index}
              className="border rounded-2xl bg-white shadow-md p-6 text-sm md:text-base space-y-2"
            >
              <div className="text-lg font-semibold">{pick.matchup || "Unknown Matchup"}</div>
              <div className="text-gray-600">Away Pitcher: <span className="font-medium">{pick.away_pitcher || "TBD"}</span></div>
              <div className="text-gray-600">Home Pitcher: <span className="font-medium">{pick.home_pitcher || "TBD"}</span></div>
              <div>Recommendation: <strong>{pick.recommendation || "N/A"}</strong></div>
              <div>Win Probability: <strong>{pick.winProb ? \`\${Math.round(pick.winProb * 100)}%\` : "N/A"}</strong></div>
              <div>Odds: <strong>{typeof pick.odds === "number" ? (pick.odds > 0 ? "+" + pick.odds : pick.odds) : "N/A"}</strong></div>
              <div>Expected Value: <strong>{typeof pick.ev === "number" ? pick.ev : "N/A"}</strong></div>
              <div>Parlay Worthy: <strong>{typeof pick.parlay === "boolean" ? (pick.parlay ? "Yes" : "No") : "N/A"}</strong></div>
              <div>Result: <strong>{getResult(pick.matchup, pick.recommendation) || "Pending"}</strong></div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-xl font-bold text-center mb-4">Pick History (Last {history.length} Days)</h2>
        <ul className="space-y-4">
          {history.slice(-5).map((entry, i) => (
            <li key={i} className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-500 mb-2">{new Date(entry.date).toLocaleString()}</div>
              {entry.picks.map((p, idx) => (
                <div key={idx} className="text-sm">
                  {p.matchup || "N/A"}: <strong>{p.recommendation || "N/A"}</strong> — Odds: {typeof p.odds === "number" ? p.odds : "N/A"}, EV: {typeof p.ev === "number" ? p.ev : "N/A"}, Result: {getResult(p.matchup, p.recommendation) || "Pending"}
                </div>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
