
import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../store';
import { Transaction, TransactionType, BillReminder, RecurringFrequency } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: Transaction;
  prefillBill?: Partial<BillReminder & { accountId?: string; subAccountId?: string; monthYear?: string }>;
}

const FREQUENCIES: { value: RecurringFrequency; label: string; icon: string }[] = [
  { value: 'DAILY', label: '1D', icon: 'fa-sun' },
  { value: 'WEEKLY', label: '7D', icon: 'fa-calendar-week' },
  { value: 'MONTHLY', label: '1M', icon: 'fa-calendar-day' },
  { value: 'YEARLY', label: '1Y', icon: 'fa-calendar' }
];

const TransactionModal: React.FC<Props> = ({ isOpen, onClose, editingTransaction, prefillBill }) => {
  const { categories, accounts, addTransaction, updateTransaction, settings, handleReminderAction } = useAppState();
  
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [subAccountId, setSubAccountId] = useState('');
  
  const [toAccountId, setToAccountId] = useState('');
  const [toSubAccountId, setToSubAccountId] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>('MONTHLY');
  const [recurringEndMonth, setRecurringEndMonth] = useState('');
  const [attachment, setAttachment] = useState<string | undefined>(undefined);
  const [isAccessingHardware, setIsAccessingHardware] = useState<'CAMERA' | 'GALLERY' | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
      
      if (editingTransaction) {
        setType(editingTransaction.type);
        setAmount(editingTransaction.amount.toString());
        setCategoryId(editingTransaction.categoryId || '');
        setSubCategoryId(editingTransaction.subCategoryId || '');
        setAccountId(editingTransaction.accountId);
        setSubAccountId(editingTransaction.subAccountId || '');
        setToAccountId(editingTransaction.toAccountId || '');
        setToSubAccountId(editingTransaction.toSubAccountId || '');
        setTitle(editingTransaction.title);
        setDescription(editingTransaction.description);
        setDate(editingTransaction.date);
        setTime(editingTransaction.time);
        setIsRecurring(editingTransaction.isRecurring);
        setRecurringFrequency(editingTransaction.recurringFrequency || 'MONTHLY');
        setRecurringEndMonth(editingTransaction.recurringEndMonth || '');
        setAttachment(editingTransaction.attachment);
      } else if (prefillBill) {
        const isCycle = prefillBill.id?.startsWith('vault-');
        setType(isCycle ? TransactionType.TRANSFER : TransactionType.EXPENSE);
        setAmount(prefillBill.amount?.toString() || '');
        setTitle(prefillBill.title || '');
        setAccountId(prefillBill.accountId || accounts[0]?.id || '');
        setSubAccountId(prefillBill.subAccountId || accounts[0]?.subAccounts[0]?.id || '');
        if (isCycle) {
          setToAccountId(prefillBill.accountId || '');
          setToSubAccountId(prefillBill.subAccountId || '');
        }
      } else {
        setAmount(''); setTitle(''); setDescription('');
        setAccountId(accounts[0]?.id || '');
        setSubAccountId(accounts[0]?.subAccounts[0]?.id || '');
        setCategoryId(''); setSubCategoryId('');
        const end = new Date(); end.setMonth(end.getMonth() + 6);
        setRecurringEndMonth(end.toISOString().slice(0, 7));
      }
    } else {
      setIsAnimating(false);
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isOpen, editingTransaction, prefillBill, accounts]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setIsAccessingHardware(null);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAttachment(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return alert("Missing account link.");

    const transaction: Transaction = {
      id: editingTransaction?.id || Math.random().toString(36).substr(2, 9),
      title, description, date, time, amount: parseFloat(amount) || 0,
      type, categoryId, subCategoryId, accountId, subAccountId,
      toAccountId, toSubAccountId, isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      recurringEndMonth: isRecurring ? recurringEndMonth : undefined,
      attachment
    };

    if (editingTransaction) updateTransaction(transaction, editingTransaction);
    else {
      addTransaction(transaction);
      if (prefillBill?.id) handleReminderAction(prefillBill.id, 'COMPLETED', prefillBill.monthYear);
    }
    setIsAnimating(false);
    setTimeout(onClose, 300);
  };

  if (!shouldRender) return null;

  const selectedCategory = categories.find(c => c.id === categoryId);
  const selectedAccount = accounts.find(a => a.id === accountId);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-end">
      <div className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`} onClick={() => { setIsAnimating(false); setTimeout(onClose, 300); }}></div>
      <div className={`relative w-full max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-t-[3rem] shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isAnimating ? 'translate-y-0' : 'translate-y-full'}`} style={{ maxHeight: '95vh' }}>
        <div className="flex flex-col items-center pt-4 pb-2 sticky top-0 bg-inherit z-10">
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mb-6"></div>
          <div className="w-full px-8 flex justify-between items-center">
            <h2 className="text-xl font-black uppercase tracking-tight dark:text-white">{editingTransaction ? 'Revise Log' : 'New Entry'}</h2>
            <button onClick={() => { setIsAnimating(false); setTimeout(onClose, 300); }} className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all"><i className="fa-solid fa-xmark"></i></button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto hide-scrollbar px-8 pb-12 pt-4 space-y-8">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl shadow-inner border border-slate-200/50 dark:border-slate-700/50">
            {(Object.values(TransactionType)).map((t) => (
              <button key={t} type="button" onClick={() => setType(t)} className={`flex-1 py-3.5 rounded-xl text-[9px] font-black uppercase transition-all ${type === t ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
                {t === TransactionType.EXPENSE ? 'Expenditure' : t === TransactionType.INCOME ? 'Revenue' : 'Transfer'}
              </button>
            ))}
          </div>

          <div className="text-center space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</label>
             <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-black text-indigo-500">{settings.currencySymbol}</span>
                <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} onFocus={(e) => e.currentTarget.select()} className="w-full max-w-[200px] bg-transparent text-center text-5xl font-black outline-none dark:text-white" placeholder="0.00" autoFocus required />
             </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
             {type !== TransactionType.TRANSFER && (
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Main Class</label>
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl px-4 py-3.5 text-[10px] font-black outline-none border border-slate-100 dark:border-slate-700" required>
                      <option value="">Select Category</option>
                      {categories.filter(c => c.type === type).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Sub Branch</label>
                    <select value={subCategoryId} onChange={e => setSubCategoryId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl px-4 py-3.5 text-[10px] font-black outline-none border border-slate-100 dark:border-slate-700">
                      <option value="">None</option>
                      {selectedCategory?.subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
               </div>
             )}

             <div className="p-6 rounded-[2.5rem] bg-indigo-50/30 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10 space-y-4">
               <h3 className="text-[8px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-vault"></i> Source Account</h3>
               <div className="grid grid-cols-2 gap-4">
                  <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full bg-white dark:bg-slate-800 dark:text-white rounded-xl px-4 py-3 text-[10px] font-black outline-none border border-indigo-100/20" required>
                    <option value="">Vault</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <select value={subAccountId} onChange={e => setSubAccountId(e.target.value)} className="w-full bg-white dark:bg-slate-800 dark:text-white rounded-xl px-4 py-3 text-[10px] font-black outline-none border border-indigo-100/20" required>
                    <option value="">Branch</option>
                    {selectedAccount?.subAccounts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
               </div>
             </div>
          </div>

          <div className="space-y-4">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Entry Title..." className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl px-5 py-4 text-xs font-black outline-none border border-slate-100 dark:border-slate-700" required />
            
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { setIsAccessingHardware('CAMERA'); cameraInputRef.current?.click(); }} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 transition-all active:scale-95">
                <i className={`fa-solid ${isAccessingHardware === 'CAMERA' ? 'fa-circle-notch animate-spin' : 'fa-camera'} text-indigo-500 mb-2`}></i>
                <span className="text-[7px] font-black uppercase text-slate-400">Camera</span>
              </button>
              <button type="button" onClick={() => { setIsAccessingHardware('GALLERY'); galleryInputRef.current?.click(); }} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 transition-all active:scale-95">
                <i className={`fa-solid ${isAccessingHardware === 'GALLERY' ? 'fa-circle-notch animate-spin' : 'fa-image'} text-indigo-500 mb-2`}></i>
                <span className="text-[7px] font-black uppercase text-slate-400">Gallery</span>
              </button>
            </div>
            
            <input type="file" ref={galleryInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
            <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
          </div>

          <button type="submit" className="w-full gradient-purple text-white font-black py-5 rounded-[2rem] shadow-2xl active:scale-95 transition-all uppercase tracking-[0.2em] text-[10px]">Commit Log</button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;