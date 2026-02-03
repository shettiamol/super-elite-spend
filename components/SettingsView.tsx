
import React, { useState } from 'react';
import { useAppState } from '../store';
import { AppTab, SUPPORTED_CURRENCIES } from '../types';

interface Props {
  onTabChange: (tab: AppTab) => void;
}

const SettingsView: React.FC<Props> = ({ onTabChange }) => {
  const { theme, settings, updateSettings, purgeData, resetAllData } = useAppState();
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);

  const fonts = [
    'Space Grotesk', 'Inter', 'JetBrains Mono', 'Playfair Display',
    'Montserrat', 'Raleway', 'Oswald', 'Lora'
  ];

  const [purgeOptions, setPurgeOptions] = useState({
    transactions: false,
    accounts: false,
    categories: false,
    goals: false,
    billReminders: false
  });

  const handlePurge = () => {
    const hasSelected = Object.values(purgeOptions).some(v => v);
    if (!hasSelected) {
      alert("Please select at least one data type to delete.");
      return;
    }
    
    if (window.confirm("CRITICAL: Selected data will be permanently deleted. This cannot be undone. Proceed?")) {
      purgeData(purgeOptions);
      setIsPurgeModalOpen(false);
      setPurgeOptions({
        transactions: false, accounts: false, categories: false, goals: false, billReminders: false
      });
      alert("Selected records have been cleared from the local ledger.");
    }
  };

  const toggleWidget = (id: string) => {
    const updatedWidgets = settings.dashboardWidgets.map(w => 
      w.id === id ? { ...w, enabled: !w.enabled } : w
    );
    updateSettings({ dashboardWidgets: updatedWidgets });
  };

  const moveWidget = (id: string, direction: 'up' | 'down') => {
    const index = settings.dashboardWidgets.findIndex(w => w.id === id);
    if (index === -1) return;
    const newWidgets = [...settings.dashboardWidgets];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newWidgets.length) {
      [newWidgets[index], newWidgets[targetIndex]] = [newWidgets[targetIndex], newWidgets[index]];
      updateSettings({ dashboardWidgets: newWidgets });
    }
  };

  const handleResetApp = () => {
    if (window.confirm("CRITICAL WARNING: This will permanently delete ALL financial records stored on this device. This operation is irreversible. Proceed?")) {
      resetAllData();
    }
  };

  return (
    <div className="p-6 pb-32">
      <div className="mb-10">
        <h1 className="text-2xl font-black uppercase tracking-tight mb-2">System Settings</h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Configuration & Controls</p>
      </div>

      <section className="space-y-10">
        <div>
          <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">Core Settings</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
             <button onClick={() => onTabChange('REMINDERS')} className={`p-5 rounded-[2rem] border flex flex-col items-center gap-3 transition-all active:scale-95 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                <i className="fa-solid fa-bell text-rose-500 text-lg"></i>
                <span className="text-[9px] font-black uppercase tracking-widest">Bill Alerts</span>
              </button>
              <button onClick={() => onTabChange('GOALS')} className={`p-5 rounded-[2rem] border flex flex-col items-center gap-3 transition-all active:scale-95 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                <i className="fa-solid fa-bullseye text-indigo-500 text-lg"></i>
                <span className="text-[9px] font-black uppercase tracking-widest">Goals</span>
              </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => onTabChange('TYPES')} className={`p-3 rounded-[1.5rem] border flex flex-col items-center gap-2 transition-all active:scale-95 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
              <i className="fa-solid fa-tags text-slate-500 text-xs"></i>
              <span className="text-[7px] font-black uppercase tracking-widest">Categories</span>
            </button>
            <button onClick={() => onTabChange('VAULTS')} className={`p-3 rounded-[1.5rem] border flex flex-col items-center gap-2 transition-all active:scale-95 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
              <i className="fa-solid fa-wallet text-emerald-500 text-xs"></i>
              <span className="text-[7px] font-black uppercase tracking-widest">Accounts</span>
            </button>
            <button onClick={() => setIsWidgetModalOpen(true)} className={`p-3 rounded-[1.5rem] border flex flex-col items-center gap-2 transition-all active:scale-95 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
              <i className="fa-solid fa-sliders text-indigo-500 text-xs"></i>
              <span className="text-[7px] font-black uppercase tracking-widest">Widgets</span>
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">Appearance & Currency</h2>
          <div className={`p-6 rounded-3xl border space-y-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Currency</label>
              <select value={settings.currencyCode} onChange={(e) => {
                const curr = SUPPORTED_CURRENCIES.find(c => c.code === e.target.value);
                if (curr) updateSettings({ currencyCode: curr.code, currencySymbol: curr.symbol });
              }} className="w-full bg-slate-50 dark:bg-slate-700 dark:text-white rounded-xl px-4 py-3 text-sm font-bold outline-none border border-slate-100 dark:border-slate-600 appearance-none">
                {SUPPORTED_CURRENCIES.map(curr => <option key={curr.code} value={curr.code}>{curr.name} ({curr.symbol})</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Typography</label>
              <select value={settings.fontFamily} onChange={(e) => updateSettings({ fontFamily: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-700 dark:text-white rounded-xl px-4 py-3 text-sm font-bold outline-none border border-slate-100 dark:border-slate-600 appearance-none">
                {fonts.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button onClick={() => setIsPurgeModalOpen(true)} className="w-full p-6 rounded-[2rem] border border-rose-100 bg-rose-50 text-rose-600 flex items-center justify-between group active:scale-95 transition-all dark:bg-rose-500/5 dark:border-rose-500/20">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                  <i className="fa-solid fa-trash-can"></i>
               </div>
               <div className="text-left">
                  <span className="text-xs font-black uppercase tracking-tight block">Delete Data</span>
                  <span className="text-[8px] font-bold text-rose-400 uppercase tracking-widest">Selective Purge Operations</span>
               </div>
            </div>
            <i className="fa-solid fa-chevron-right text-rose-300"></i>
          </button>

          <button onClick={handleResetApp} className="w-full p-6 rounded-[2rem] border border-red-200 bg-red-50 text-red-600 flex items-center justify-between group active:scale-95 transition-all dark:bg-red-500/10 dark:border-red-500/20">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                  <i className="fa-solid fa-power-off"></i>
               </div>
               <div className="text-left">
                  <span className="text-xs font-black uppercase tracking-tight block">Factory Reset</span>
                  <span className="text-[8px] font-bold text-red-400 uppercase tracking-widest">Wipe everything from device</span>
               </div>
            </div>
          </button>
        </div>
      </section>

      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-sm p-8 shadow-2xl animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">Purge Protocol</h2>
                <button onClick={() => setIsPurgeModalOpen(false)} className="text-slate-300 hover:text-rose-500"><i className="fa-solid fa-xmark text-xl"></i></button>
             </div>
             <div className="space-y-4 mb-8">
                {['transactions', 'accounts', 'categories', 'goals', 'billReminders'].map((opt) => (
                  <div key={opt} onClick={() => setPurgeOptions(prev => ({ ...prev, [opt]: !prev[opt as keyof typeof prev] }))} className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${purgeOptions[opt as keyof typeof purgeOptions] ? 'border-rose-300 bg-rose-50 dark:bg-rose-500/10' : 'border-slate-100 bg-slate-50 dark:bg-slate-800'}`}>
                     <span className={`text-xs font-black uppercase tracking-widest ${purgeOptions[opt as keyof typeof purgeOptions] ? 'text-rose-600' : 'text-slate-500'}`}>{opt}</span>
                     <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 ${purgeOptions[opt as keyof typeof purgeOptions] ? 'border-rose-500 bg-rose-500 text-white' : 'border-slate-200'}`}>
                        {purgeOptions[opt as keyof typeof purgeOptions] && <i className="fa-solid fa-check text-[10px]"></i>}
                     </div>
                  </div>
                ))}
             </div>
             <div className="flex gap-3">
                <button onClick={() => setIsPurgeModalOpen(false)} className="flex-1 py-4 text-slate-400 font-bold uppercase text-[10px]">Cancel</button>
                <button onClick={handlePurge} className="flex-2 bg-rose-500 text-white px-8 py-4 rounded-[1.5rem] font-bold uppercase text-[10px]">Confirm</button>
             </div>
          </div>
        </div>
      )}

      {isWidgetModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-sm p-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">Dashboard Widgets</h2>
              <button onClick={() => setIsWidgetModalOpen(false)} className="text-slate-400"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {settings.dashboardWidgets.map((w, idx) => (
                <div key={w.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <button onClick={() => toggleWidget(w.id)} className={`w-8 h-8 rounded-lg flex items-center justify-center ${w.enabled ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                         <i className={`fa-solid ${w.enabled ? 'fa-check' : 'fa-plus'}`}></i>
                      </button>
                      <span className="text-[10px] font-black uppercase tracking-widest">{w.name}</span>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => moveWidget(w.id, 'up')} disabled={idx === 0} className="text-slate-400 disabled:opacity-20"><i className="fa-solid fa-chevron-up"></i></button>
                      <button onClick={() => moveWidget(w.id, 'down')} disabled={idx === settings.dashboardWidgets.length-1} className="text-slate-400 disabled:opacity-20"><i className="fa-solid fa-chevron-down"></i></button>
                   </div>
                </div>
              ))}
            </div>
            <button onClick={() => setIsWidgetModalOpen(false)} className="mt-8 w-full gradient-purple text-white py-4 rounded-3xl font-black uppercase text-[10px]">Done</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;