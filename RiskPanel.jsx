import { Wallet, ShieldAlert } from 'lucide-react';

export default function RiskPanel({ balance, nextTrade }) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {/* Capital Card */}
      <div className="bg-surface border border-border p-4 rounded-xl flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-2 text-gray-400">
          <Wallet size={16} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Capital</span>
        </div>
        <div className="text-xl font-mono text-white font-bold">
          ₹{balance.toLocaleString()}
        </div>
      </div>

      {/* Risk Card */}
      <div className="bg-surface border border-primary/30 p-4 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <ShieldAlert size={40} />
        </div>
        <div className="flex items-center gap-2 mb-2 text-primary">
          <ShieldAlert size={16} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Risk Amount</span>
        </div>
        <div className="text-xl font-mono text-primary font-bold">
          ₹{nextTrade}
        </div>
      </div>
    </div>
  );
}