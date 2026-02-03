
import React, { useState } from 'react';
import { useAppState } from '../store';
import { BillReminder } from '../types';
import PriorityWidget from './PriorityWidget';

const Dashboard: React.FC<{ 
  onCompleteBill: (bill: Partial<BillReminder>) => void 
}> = ({ onCompleteBill }) => {
  const { 
    settings, 
    updateSettings,
  } = useAppState();
  
  const [isManagingWidgets, setIsManagingWidgets] = useState(false);

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      {settings.dashboardWidgets.find(w => w.id === 'PRIORITY_COMMAND')?.enabled && (
        <div className="w-full -mx-4">
          <PriorityWidget />
        </div>
      )}

      <div className="space-y-4 animate-in slide-in-from-bottom-2">
        <div className="p-8 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 text-center opacity-40">
           <i className="fa-solid fa-shield-halved text-xl text-indigo-300 mb-2"></i>
           <p className="text-[8px] font-bold uppercase tracking-widest">Financial Core Ready</p>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button onClick={() => setIsManagingWidgets(true)} className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-indigo-500 transition-colors">
          <i className="fa-solid fa-sliders mr-2"></i> Manage Dashboard
        </button>
      </div>

      {isManagingWidgets && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-sm p-8 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-black uppercase tracking-tight dark:text-white">Widget Management</h2>
                 <button onClick={() => setIsManagingWidgets(false)} className="text-slate-400 hover:text-rose-500"><i className="fa-solid fa-xmark text-xl"></i></button>
              </div>
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 hide-scrollbar">
                {settings.dashboardWidgets.map(w => (
                  <div key={w.id} onClick={() => {
                    const updated = settings.dashboardWidgets.map(x => x.id === w.id ? { ...x, enabled: !x.enabled } : x);
                    updateSettings({ dashboardWidgets: updated });
                  }} className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${w.enabled ? 'border-indigo-100 bg-indigo-50/30 dark:bg-indigo-500/10' : 'border-slate-100 dark:border-slate-800'}`}>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${w.enabled ? 'text-indigo-600' : 'text-slate-400'}`}>{w.name}</span>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${w.enabled ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-200'}`}>
                      {w.enabled && <i className="fa-solid fa-check text-[10px]"></i>}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setIsManagingWidgets(false)} className="mt-8 w-full gradient-purple text-white py-4 rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-xl">Apply</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;