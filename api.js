// Use Environment Variable or fallback to localhost
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const api = {
  scan: async (pair, timeframe, apiKey) => {
    // FIX: URL Encode the pair (EUR/USD -> EUR%2FUSD) to prevent errors
    const encodedPair = encodeURIComponent(pair);
    
    const res = await fetch(`${BASE_URL}/scan/${encodedPair}?timeframe=${timeframe}`, {
      headers: { "x-api-key": apiKey }
    });
    
    if (!res.ok) throw new Error("Connection Failed");
    return res.json();
  },

  logResult: async (signalId, result, payout, apiKey) => {
    const res = await fetch(`${BASE_URL}/trade/result`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-api-key": apiKey 
      },
      body: JSON.stringify({ signal_id: signalId, result, payout })
    });
    return res.json();
  },

  // Fetch Dynamic Pair List from Backend
  getPairs: async () => {
    const res = await fetch(`${BASE_URL}/pairs`);
    if (!res.ok) throw new Error("Failed to load pairs");
    return res.json();
  }
};