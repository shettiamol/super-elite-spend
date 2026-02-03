import React, { useEffect, useState } from 'react';
import { AppProvider, useAppState } from './store';
import { AppTab, Transaction, BillReminder } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Logs from './components/Logs';
import Taxonomy from './components/Taxonomy';
import Vaults from './components/Vaults';
import SettingsView from './components/SettingsView';
import TransactionModal from './components/TransactionModal';
import Reminders from './components/Reminders';
import Goals from './components/Goals';
import AccountAnalysis from './components/AccountAnalysis';
import DataManagement from './components/DataManagement';
import SecurityView from './components/SecurityView';
import LockScreen from './components/LockScreen';
import Analysis from './components/Analysis';
import CycleExplorer from './components/CycleExplorer';

const AppContent: React.FC = () => {
  const { theme, settings, isLocked } = useAppState();
  const [activeTab, setActiveTab] = useState<AppTab>('DASH');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [prefillBill, setPrefillBill] = useState<Partial<BillReminder> | undefined>(undefined);

  useEffect(() => {
    // Notify the window that the application has mounted and is visible.
    // This removes the loading screen from index.html
    if (typeof (window as any).onAppMounted === 'function') {
      (window as any).onAppMounted();
    }
  }, []);

  useEffect(() => {
    // Sync theme with document class list
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handle Security Lock Screen
  if (isLocked && settings.security.passcode) return <LockScreen />;

  const openNewTransaction = () => {
    setEditingTransaction(undefined);
    setPrefillBill(undefined);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(undefined);
    setPrefillBill(undefined);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'DASH': return <Dashboard onCompleteBill={(b) => { setPrefillBill(b); setIsModalOpen(true); }} />;
      case 'LOGS': return <Logs />;
      case 'ANALYSIS': return <Analysis />;
      case 'TYPES': return <Taxonomy />;
      case 'VAULTS': return <Vaults />;
      case 'REMINDERS': return <Reminders />;
      case 'GOALS': return <Goals />;
      case 'ACC_ANALYSIS': return <AccountAnalysis />;
      case 'CYCLES': return <CycleExplorer onCompleteBill={(b) => { setPrefillBill(b); setIsModalOpen(true); }} />;
      case 'DATA_OPS': return <DataManagement />;
      case 'SECURITY': return <SecurityView />;
      case 'SETTINGS': return <SettingsView onTabChange={setActiveTab} />;
      default: return <Dashboard onCompleteBill={() => {}} />;
    }
  };

  return (
    <div 
      className={`flex flex-col h-full w-full max-w-md mx-auto relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-[#F8F9FD] text-slate-800'}`}
      style={{ fontFamily: settings.fontFamily }}
    >
      <Header onSettingsClick={() => setActiveTab('SETTINGS')} />
      
      <main className="flex-1 overflow-y-auto hide-scrollbar min-h-0">
        {renderContent()}
      </main>

      {['DASH', 'LOGS'].includes(activeTab) && (
        <button 
          onClick={openNewTransaction}
          className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 w-14 h-14 gradient-purple rounded-full flex items-center justify-center text-white text-xl shadow-2xl active:scale-90 transition-transform z-40"
        >
          <i className="fa-solid fa-plus"></i>
        </button>
      )}

      <nav 
        className={`flex items-center justify-around px-1 z-50 ${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-slate-100'} backdrop-blur-md border-t flex-none`}
        style={{ height: 'calc(4rem + env(safe-area-inset-bottom))', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <NavButton active={activeTab === 'DASH'} icon="fa-gauge-high" label="Center" onClick={() => setActiveTab('DASH')} />
        <NavButton active={activeTab === 'LOGS'} icon="fa-list-ul" label="Ledger" onClick={() => setActiveTab('LOGS')} />
        <NavButton active={activeTab === 'ANALYSIS'} icon="fa-chart-pie" label="Flow" onClick={() => setActiveTab('ANALYSIS')} />
        <NavButton active={activeTab === 'ACC_ANALYSIS'} icon="fa-building-columns" label="Vaults" onClick={() => setActiveTab('ACC_ANALYSIS')} />
        <NavButton active={activeTab === 'CYCLES'} icon="fa-bell" label="Alerts" onClick={() => setActiveTab('CYCLES')} />
      </nav>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        editingTransaction={editingTransaction}
        prefillBill={prefillBill}
      />
    </div>
  );
};

const NavButton: React.FC<{ active: boolean, icon: string, label: string, onClick: () => void }> = ({ active, icon, label, onClick }) => {
  const { theme } = useAppState();
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-1 group flex-1 py-2">
      <div className={`transition-all duration-300 ${active ? 'text-indigo-500 scale-110' : theme === 'dark' ? 'text-slate-500' : 'text-slate-300'}`}>
        <i className={`fa-solid ${icon} text-lg`}></i>
      </div>
      <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-indigo-500' : theme === 'dark' ? 'text-slate-500' : 'text-slate-300'}`}>
        {label}
      </span>
    </button>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;