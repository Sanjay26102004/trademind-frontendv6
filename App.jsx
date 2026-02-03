import { useState, useEffect } from 'react';
import Login from './components/Login';
import RiskPanel from './components/RiskPanel';
import SignalCard from './components/SignalCard';
import { api } from './api';
import { Search, Wifi, WifiOff } from 'lucide-react';

// FIX: Added 'export default' here to solve the Netlify build error
export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('tm_key'));
  const [pair, setPair] = useState('EUR/USD');
  const [pairList, setPairList] = useState([]); 
  const [currentSignal, setCurrentSignal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(10000); 

  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await api.getPairs();
        setPairList(data.pairs);
        if (data.pairs && data.pairs.length > 0) {
          setPair(data.pairs[0]);
        }
      } catch (e) {
        console.error("Using default pairs due to error", e);
        setPairList(["EUR/USD", "GBP/USD", "USD/JPY", "XAU/USD"]); 
      }
    }
    loadConfig();
  }, []);

  if (!apiKey) {
    return <Login onLogin={(k) => { 
      localStorage.setItem('tm_key', k); 
      setApiKey(k); 
    }} />;
  }

  const scan = async () => {
    setLoading(true);
    try {
      const data = await api.scan(pair, '5min', apiKey);
      
      if (data.status === 'SIGNAL') {
        setCurrentSignal(data);
      } else {
        const reason = data.details?.filter || data.strategy_breakdown?.filter || 'Low Confidence';
        alert(`MARKET STATUS: ${data.status}\nReason: ${reason}\nConfidence: ${data.confidence}%`);
        setCurrentSignal(null);
      }
    } catch (e) {
      alert("❌ Connection Error.\nCheck if Backend is running or API Key is correct.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 max-w-md mx-auto flex flex-col">
      <header className="flex justify-between items-center mb-6 mt-2">
        <div>
          <h1 className="text-xl font-black text-white tracking-tighter">
            TRADEMIND <span className="text-primary">AI</span>
          </h1>
          <div className="text-[10px] text-gray-500 font-mono tracking-widest">
            INSTITUTIONAL TERMINAL
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pairList.length > 0 ? (
            <Wifi size={14} className="text-bull" /> 
          ) : (
            <WifiOff size={14} className="text-bear" />
          )}
        </div>
      </header>

      <RiskPanel balance={balance} nextTrade={Math.round(balance * 0.01)} />

      <div className="bg-surface p-4 rounded-xl border border-border mb-6 shadow-lg">
        <label className="text-[10px] text-gray-500 font-bold uppercase mb-2 block tracking-wider">
          Market Scanner
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <select 
              value={pair} 
              onChange={(e) => setPair(e.target.value)}
              className="w-full bg-black text-white font-mono text-sm p-4 rounded-xl border border-border outline-none focus:border-primary appearance-none"
            >
              {pairList.length > 0 ? (
                pairList.map(p => <option key={p} value={p}>{p}</option>)
              ) : (
                <option>Loading...</option>
              )}
            </select>
          </div>
          
          <button 
            onClick={scan}
            disabled={loading}
            className="bg-primary text-black px-6 rounded-xl font-bold hover:bg-cyan-400 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            {loading ? <span className="animate-spin block text-xl">↻</span> : <Search size={24} />}
          </button>
        </div>
      </div>

      {currentSignal ? (
        <SignalCard 
          data={currentSignal} 
          apiKey={apiKey}
          onTradeComplete={(result, payout) => {
            const invested = currentSignal.amount;
            if (result === 'WIN') setBalance(prev => prev - invested + payout);
            else setBalance(prev => prev - invested);
            setCurrentSignal(null);
          }}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-600 space-y-4 opacity-50">
          <Search size={48} strokeWidth={1} />
          <p className="text-xs font-mono">WAITING FOR MARKET DATA...</p>
        </div>
      )}
    </div>
  );
}
