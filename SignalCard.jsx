import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import { api } from '../api';

export default function SignalCard({ data, apiKey, onTradeComplete }) {
  const [status, setStatus] = useState('PENDING'); // PENDING -> ACTIVE -> DONE
  
  const isCall = data.direction === 'CALL';
  const colorClass = isCall ? 'text-bull' : 'text-bear';
  const bgClass = isCall ? 'bg-bull/5 border-bull/20' : 'bg-bear/5 border-bear/20';

  const handleResult = async (result) => {
    // If win, ask for payout. If loss, 0.
    const payout = result === 'WIN' ? prompt("Enter Total Payout Amount (e.g. 182):") : 0;
    if (result === 'WIN' && !payout) return; // Prevent empty payout on win

    await api.logResult(data.signal_id, result, Number(payout), apiKey);
    onTradeComplete(result, Number(payout)); // Update parent state
    setStatus('DONE');
  };

  if (status === 'DONE') return null; // Remove card after trade

  return (
    <div className={`p-5 rounded-2xl border ${bgClass} mb-6 relative overflow-hidden animate-fade-in-up shadow-2xl`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            {data.pair}
            <span className="text-[10px] font-mono text-gray-500 bg-black/40 px-2 py-1 rounded">
              {data.confidence}% CONF
            </span>
          </h2>
          <div className={`text-sm font-bold mt-1 ${colorClass} flex items-center gap-1`}>
            {isCall ? <ArrowUpRight size={18}/> : <ArrowDownRight size={18}/>}
            {data.display_strength}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Position Size</div>
          <div className="text-2xl font-mono text-white font-bold tracking-tight">₹{data.amount}</div>
        </div>
      </div>

      {/* Logic Breakdown */}
      <div className="space-y-2 mb-6 bg-black/20 p-3 rounded-lg">
        {Object.entries(data.details || {}).map(([k, v]) => (
          v !== 0 && (
            <div key={k} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-400">
                <Activity size={12} />
                <span className="uppercase font-medium">{k.replace(/_/g, ' ')}</span>
              </div>
              <span className={`font-bold ${v > 0 ? 'text-bull' : 'text-bear'}`}>
                {v > 0 ? 'BULL' : 'BEAR'}
              </span>
            </div>
          )
        ))}
      </div>

      {/* Interaction Flow */}
      {status === 'PENDING' ? (
        <button 
          onClick={() => setStatus('ACTIVE')}
          className="w-full py-4 bg-surface hover:bg-zinc-800 border border-border text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Clock size={18} /> WAIT FOR CANDLE CLOSE
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => handleResult('LOSS')}
            className="py-4 bg-bear/10 hover:bg-bear/20 border border-bear/30 text-bear font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <XCircle size={18} /> LOSS
          </button>
          <button 
            onClick={() => handleResult('WIN')}
            className="py-4 bg-bull/10 hover:bg-bull/20 border border-bull/30 text-bull font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle size={18} /> WIN
          </button>
        </div>
      )}
    </div>
  );
}