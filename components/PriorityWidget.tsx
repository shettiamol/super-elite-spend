
import React from 'react';
import { useAppState } from '../store';
import { TransactionType } from '../types';

const PriorityWidget: React.FC = () => {
  const { transactions, settings, updateSettings, theme } = useAppState();
  
  const mode = settings.priorityWidgetMode;
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const monthName = today.toLocaleString('default', { month: 'long' });
  
  const filteredTxs = transactions.filter(t => {
    const d = new Date(t.date + 'T00:00:00');
    if (mode === 'MONTHLY') {
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    } else if (mode === 'YEARLY') {
      return d.getFullYear() === currentYear;
    }
    return true; // Cumulative
  });

  const inflow = filteredTxs.filter(t => t.type === TransactionType.INCOME).reduce((s,t) => s + t.amount, 0);
  const outflow = filteredTxs.filter(t => t.type === TransactionType.EXPENSE).reduce((s,t) => s + t.amount, 0);
  const net = inflow - outflow;

  const setMode = (m: 'MONTHLY' | 'YEARLY' | 'CUMULATIVE') => {
    updateSettings({ priorityWidgetMode: m });
  };

  const label = mode === 'MONTHLY' 
    ? `${monthName} Overview` 
    : mode === 'YEARLY' 
      ? `${currentYear} Overview` 
      : 'Consolidated overview';

  return (
    <div className="px-1 mb-2 animate-in slide-in-from-top-4 duration-1000">
      <div className={`p-6 rounded-[2.5rem] relative overflow-hidden shadow-2xl transition-all duration-700 ${theme === 'dark' ? 'bg-gradient-to-br from-slate-800 to-indigo-950 border border-white/5' : 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-700 shadow-indigo-100'}`}>
        
        {/* Smooth Royal Glow Effects */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-[90px] -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/10 rounded-full blur-[60px] -ml-12 -mb-12"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${theme === 'dark' ? 'bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.7)]' : 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]'}`}></div>
              <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-50'}`}>
                {label}
              </span>
            </div>
            
            {/* Multi-Toggle Controller */}
            <div className={`p-1 rounded-full flex items-center transition-all ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-black/10'}`}>
              <button 
                onClick={() => setMode('MONTHLY')}
                className={`px-3 py-1.5 rounded-full text-[7px] font-black uppercase tracking-widest transition-all ${mode === 'MONTHLY' ? 'bg-white text-indigo-700 shadow-lg' : 'text-white/40 hover:text-white/60'}`}
              >
                Month
              </button>
              <button 
                onClick={() => setMode('YEARLY')}
                className={`px-3 py-1.5 rounded-full text-[7px] font-black uppercase tracking-widest transition-all ${mode === 'YEARLY' ? 'bg-white text-indigo-700 shadow-lg' : 'text-white/40 hover:text-white/60'}`}
              >
                Year
              </button>
              <button 
                onClick={() => setMode('CUMULATIVE')}
                className={`px-3 py-1.5 rounded-full text-[7px] font-black uppercase tracking-widest transition-all ${mode === 'CUMULATIVE' ? 'bg-white text-indigo-700 shadow-lg' : 'text-white/40 hover:text-white/60'}`}
              >
                Total
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center mb-8">
            <h2 className="text-5xl font-black text-white tracking-tighter drop-shadow-xl" style={{ fontFamily: 'JetBrains Mono' }}>
              {settings.currencySymbol}{net.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h2>
            <div className="flex items-center gap-2 mt-2 opacity-90">
               <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme === 'dark' ? 'text-slate-400' : 'text-indigo-100'}`}>
                 Net Balance
               </span>
               <i className="fa-solid fa-crown text-[8px] text-amber-300/40"></i>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={`py-4 px-4 rounded-[1.75rem] flex flex-col items-center gap-1.5 transition-all ${theme === 'dark' ? 'bg-slate-900/30 border border-white/5' : 'bg-white/10 border border-white/10'}`}>
               <span className={`text-[8px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-indigo-200'}`}>Revenue</span>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]"></div>
                  <span className="text-base font-black text-white" style={{ fontFamily: 'JetBrains Mono' }}>
                    {settings.currencySymbol}{inflow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
               </div>
            </div>
            <div className={`py-4 px-4 rounded-[1.75rem] flex flex-col items-center gap-1.5 transition-all ${theme === 'dark' ? 'bg-slate-900/30 border border-white/5' : 'bg-white/10 border border-white/10'}`}>
               <span className={`text-[8px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-indigo-200'}`}>Expenditure</span>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.6)]"></div>
                  <span className="text-base font-black text-white" style={{ fontFamily: 'JetBrains Mono' }}>
                    {settings.currencySymbol}{outflow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriorityWidget;
