
import React, { useEffect, useState } from "react";

export default function MlbBettingApp() {
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEVOnly, setShowEVOnly] = useState(false);
  const [showParlayOnly, setShowParlayOnly] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("mlb_pick_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [results, setResults] = useState({});

  useEffect(() => {
    fetch("https://mlb-betting-app-1.onrender.com/api/mlb/picks")
      .then((res) => res.json())
      .then((data) => {
        setPicks(Array.isArray(data) ? data : []);
        const newEntry = { date: new Date().toISOString(), picks: data };
        const updatedHistory = [...history, newEntry];
        setHistory(updatedHistory);
        localStorage.setItem("mlb_pick_history", JSON.stringify(updatedHistory));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching MLB picks:", err);
        setPicks([]);
        setLoading(false);
      });

    fetch("https://mlb-betting-app-1.onrender.com/api/mlb/results")
      .then((res) => res.json())
      .then((data) => setResults(data))
      .catch((err) => console.error("Error fetching results:", err));
  }, []);

  const filteredPicks = picks.filter((pick) => {
    if (showEVOnly && pick.ev <= 0) return false;
    if (showParlayOnly && !pick.parlay) return false;
    return true;
  });

  const normalize = (str) => str?.toLowerCase().replace(/[^a-z0-9]/gi, "").trim();

  const getResult = (matchup, recommendation) => {
    const normalizedKey = normalize(matchup);
    const game = Object.entries(results).find(([key]) => normalize(key) === normalizedKey);
    if (!game) return null;
    return game[1].result === recommendation ? "Win" : "Loss";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 to-blue-200 p-4 md:p-8 font-sans">
      <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800 shadow-lg">MLB Daily Betting Picks</h1>
      <div className="flex flex-col md:flex-row md:justify-center gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-full border shadow ${showEVOnly ? "bg-green-600 text-white" : "bg-white text-gray-800"}`}
          onClick={() => setShowEVOnly(!showEVOnly)}
        >
          {showEVOnly ? "Showing +EV Only" : "Show +EV Only"}
        </button>
        <button
          className={`px-4 py-2 rounded-full border shadow ${showParlayOnly ? "bg-blue-600 text-white" : "bg-white text-gray-800"}`}
          onClick={() => setShowParlayOnly(!showParlayOnly)}
        >
          {showParlayOnly ? "Showing Parlay Picks" : "Show Parlay Picks"}
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-700">Loading...</p>
      ) : filteredPicks.length === 0 ? (
        <p className="text-center text-gray-700">No picks found for today.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPicks.map((pick, index) => (
            <div
              key={index}
              className="border rounded-2xl bg-white shadow-xl p-6 text-sm md:text-base space-y-2 hover:shadow-2xl transition duration-300"
            >
              <div className="text-lg font-semibold text-gray-900">{pick.matchup || "Unknown Matchup"}</div>
              <div className="text-gray-600">Away Pitcher: <span className="font-medium">{pick.away_pitcher || "TBD"}</span></div>
              <div className="text-gray-600">Home Pitcher: <span className="font-medium">{pick.home_pitcher || "TBD"}</span></div>
              <div>Recommendation: <strong>{pick.recommendation || "N/A"}</strong></div>
              <div>Win Probability: <strong>{pick.winProb ? Math.round(pick.winProb * 100) + "%" : "N/A"}</strong></div>
              <div>Odds: <strong>{typeof pick.odds === "number" ? (pick.odds > 0 ? "+" + pick.odds : pick.odds) : "N/A"}</strong></div>
              <div>Expected Value: <strong>{typeof pick.ev === "number" ? pick.ev : "N/A"}</strong></div>
              <div>Parlay Worthy: <strong>{typeof pick.parlay === "boolean" ? (pick.parlay ? "Yes" : "No") : "N/A"}</strong></div>
              <div>Result: <strong>{getResult(pick.matchup, pick.recommendation) || "Pending"}</strong></div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Pick History</h2>
        <div className="space-y-6">
          {history.slice(-5).map((entry, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-4">
              <div className="text-sm text-gray-500 font-medium mb-3">{new Date(entry.date).toLocaleString()}</div>
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="py-1 pr-4 font-semibold">Matchup</th>
                    <th className="py-1 pr-4 font-semibold">Pick</th>
                    <th className="py-1 pr-4 font-semibold">Odds</th>
                    <th className="py-1 pr-4 font-semibold">EV</th>
                    <th className="py-1 font-semibold">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.picks.map((p, idx) => (
                    <tr key={idx} className="border-t text-gray-800">
                      <td className="py-1 pr-4">{p.matchup || "N/A"}</td>
                      <td className="py-1 pr-4 font-medium">{p.recommendation || "N/A"}</td>
                      <td className="py-1 pr-4">{typeof p.odds === "number" ? (p.odds > 0 ? "+" + p.odds : p.odds) : "N/A"}</td>
                      <td className="py-1 pr-4">{typeof p.ev === "number" ? p.ev : "N/A"}</td>
                      <td className="py-1">{getResult(p.matchup, p.recommendation) || "Pending"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
