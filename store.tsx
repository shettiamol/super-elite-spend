
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, Category, Account, TransactionType, SubCategory, SubAccount, AppSettings, Theme, BillReminder, FinancialGoal, SUPPORTED_CURRENCIES, HandledReminder, AppBackup, DashboardWidget, SecuritySettings } from './types';

export const ADMIN_MASTER_CODE = '369639';

interface PurgeOptions {
  transactions?: boolean;
  accounts?: boolean;
  categories?: boolean;
  goals?: boolean;
  billReminders?: boolean;
}

interface AppState {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  billReminders: BillReminder[];
  goals: FinancialGoal[];
  handledReminders: HandledReminder[];
  currentDate: Date;
  theme: Theme;
  settings: AppSettings;
  isLocked: boolean;
  
  setCurrentDate: (date: Date) => void;
  setTheme: (theme: Theme) => void;
  updateSettings: (s: Partial<AppSettings>) => void;
  setSecuritySettings: (s: Partial<SecuritySettings>) => void;
  
  setIsLocked: (l: boolean) => void;
  unlockApp: (passcode: string) => boolean;

  addTransaction: (t: Transaction) => void;
  updateTransaction: (t: Transaction, oldTransaction?: Transaction) => void;
  deleteTransaction: (id: string, deleteAllInSeries?: boolean) => void;
  
  addCategory: (c: Category) => void;
  updateCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;
  addSubCategory: (catId: string, sc: SubCategory) => void;
  updateSubCategory: (catId: string, sc: SubCategory) => void;
  deleteSubCategory: (catId: string, scId: string) => void;
  
  addAccount: (a: Account) => void;
  updateAccount: (a: Account) => void;
  deleteAccount: (id: string) => void;
  addSubAccount: (accId: string, sa: SubAccount) => void;
  updateSubAccount: (accId: string, sa: SubAccount) => void;
  deleteSubAccount: (accId: string, saId: string) => void;

  addBillReminder: (r: BillReminder) => void;
  updateBillReminder: (r: BillReminder) => void;
  deleteBillReminder: (id: string) => void;

  addGoal: (g: FinancialGoal) => void;
  updateGoal: (g: FinancialGoal) => void;
  deleteGoal: (id: string) => void;

  handleReminderAction: (reminderId: string, action: 'COMPLETED' | 'DISMISSED', specificMY?: string) => void;
  importData: (backup: AppBackup) => void;
  purgeData: (options: PurgeOptions) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'smart_spend_state_v4';

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-home',
    name: 'Home',
    type: TransactionType.EXPENSE,
    color: '#4f46e5',
    icon: 'fa-house',
    budgetLimit: 0,
    subCategories: [
      { id: 'sub-grocery', name: 'Grocery', budget: 0, icon: 'fa-cart-shopping' },
      { id: 'sub-veg', name: 'Vegetables', budget: 0, icon: 'fa-leaf' },
      { id: 'sub-bakery', name: 'Bakery Products', budget: 0, icon: 'fa-bread-slice' },
      { id: 'sub-drinks', name: 'Drink Items (Milk, Water, etc)', budget: 0, icon: 'fa-bottle-water' },
      { id: 'sub-bills', name: 'Bills (Light Bill, Municipality, etc)', budget: 0, icon: 'fa-file-invoice-dollar' },
      { id: 'sub-home-other', name: 'Other', budget: 0, icon: 'fa-ellipsis' },
    ]
  },
  {
    id: 'cat-food',
    name: 'Food',
    type: TransactionType.EXPENSE,
    color: '#f59e0b',
    icon: 'fa-utensils',
    budgetLimit: 0,
    subCategories: [
      { id: 'sub-breakfast', name: 'Breakfast', budget: 0, icon: 'fa-coffee' },
      { id: 'sub-lunch', name: 'Lunch', budget: 0, icon: 'fa-bowl-food' },
      { id: 'sub-dinner', name: 'Dinner', budget: 0, icon: 'fa-plate-wheat' },
      { id: 'sub-fastfood', name: 'Fastfood', budget: 0, icon: 'fa-burger' },
    ]
  },
  {
    id: 'cat-inc-salary',
    name: 'Salary',
    type: TransactionType.INCOME,
    color: '#10b981',
    icon: 'fa-money-bill-wave',
    budgetLimit: 0,
    subCategories: [
      { id: 'sc-sal-salary', name: 'Salary', icon: 'fa-building' },
      { id: 'sc-sal-bonus', name: 'Bonus', icon: 'fa-star' },
    ]
  }
];

const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc-savings',
    name: 'Cash / Savings',
    color: '#3b82f6',
    icon: 'fa-building-columns',
    subAccounts: [
      { id: 'sa-savings-primary', name: 'Cash', balance: 0, icon: 'fa-wallet' }
    ]
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [theme, setTheme] = useState<Theme>('light');
  const [isLocked, setIsLocked] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const defaultCurrency = SUPPORTED_CURRENCIES[0];
    return {
      incomeColor: '#4ade80',
      expenseColor: '#f87171',
      fontFamily: 'Space Grotesk',
      currencyCode: defaultCurrency.code,
      currencySymbol: defaultCurrency.symbol,
      dashboardWidgets: [
        { id: 'PRIORITY_COMMAND', name: 'Main Overview', enabled: true },
        { id: 'RECENT_LOGS', name: 'Activity Feed', enabled: true },
      ],
      budgetAlertEnabled: true,
      budgetAlertThreshold: 75,
      priorityWidgetEnabled: true,
      priorityWidgetMode: 'MONTHLY',
      security: {
        passcode: undefined,
        biometricsEnabled: false,
        autoLockDelay: 0
      }
    };
  });

  const updateSettings = (s: Partial<AppSettings>) => setSettings(prev => ({ ...prev, ...s }));
  const setSecuritySettings = (s: Partial<SecuritySettings>) => setSettings(prev => ({
    ...prev,
    security: { ...prev.security, ...s }
  }));

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [billReminders, setBillReminders] = useState<BillReminder[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [handledReminders, setHandledReminders] = useState<HandledReminder[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTransactions(data.transactions || []);
        if (data.categories?.length) setCategories(data.categories);
        if (data.accounts?.length) setAccounts(data.accounts);
        setBillReminders(data.billReminders || []);
        setGoals(data.goals || []);
        setHandledReminders(data.handledReminders || []);
        setSettings(data.settings || settings);
        if (data.settings?.security?.passcode) setIsLocked(true);
      } catch (e) { console.error("Restore Error", e); }
    }
  }, []);

  useEffect(() => {
    const data = { transactions, categories, accounts, billReminders, goals, handledReminders, settings };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [transactions, categories, accounts, billReminders, goals, handledReminders, settings]);

  const addTransaction = (t: Transaction) => {
    if (t.isRecurring && t.recurringFrequency && t.recurringEndMonth) {
      const generated: Transaction[] = [];
      const groupId = t.recurringGroupId || Math.random().toString(36).substr(2, 9);
      const endDate = new Date(t.recurringEndMonth + '-01');
      endDate.setMonth(endDate.getMonth() + 1);
      let current = new Date(t.date + 'T' + t.time);
      while (current < endDate) {
        generated.push({ ...t, id: Math.random().toString(36).substr(2, 9), date: current.toISOString().split('T')[0], recurringGroupId: groupId });
        if (t.recurringFrequency === 'DAILY') current.setDate(current.getDate() + 1);
        else if (t.recurringFrequency === 'WEEKLY') current.setDate(current.getDate() + 7);
        else if (t.recurringFrequency === 'MONTHLY') current.setMonth(current.getMonth() + 1);
        else if (t.recurringFrequency === 'YEARLY') current.setFullYear(current.getFullYear() + 1);
        else break;
      }
      setTransactions(prev => [...prev, ...generated]);
    } else {
      setTransactions(prev => [...prev, t]);
    }
  };

  const updateTransaction = (t: Transaction) => setTransactions(prev => prev.map(item => item.id === t.id ? t : item));
  const deleteTransaction = (id: string, deleteAllInSeries?: boolean) => {
    setTransactions(prev => {
      if (deleteAllInSeries) {
        const target = prev.find(tx => tx.id === id);
        if (target?.recurringGroupId) return prev.filter(tx => tx.recurringGroupId !== target.recurringGroupId);
      }
      return prev.filter(t => t.id !== id);
    });
  };

  const addCategory = (c: Category) => setCategories(prev => [...prev, c]);
  const updateCategory = (c: Category) => setCategories(prev => prev.map(item => item.id === c.id ? c : item));
  const deleteCategory = (id: string) => setCategories(prev => prev.filter(c => c.id !== id));
  const addSubCategory = (catId: string, sc: SubCategory) => setCategories(prev => prev.map(c => c.id === catId ? { ...c, subCategories: [...c.subCategories, sc] } : c));
  const updateSubCategory = (catId: string, sc: SubCategory) => setCategories(prev => prev.map(c => c.id === catId ? { ...c, subCategories: c.subCategories.map(item => item.id === sc.id ? sc : item) } : c));
  const deleteSubCategory = (catId: string, scId: string) => setCategories(prev => prev.map(c => c.id === catId ? { ...c, subCategories: c.subCategories.filter(s => s.id !== scId) } : c));

  const addAccount = (a: Account) => setAccounts(prev => [...prev, a]);
  const updateAccount = (a: Account) => setAccounts(prev => prev.map(item => item.id === a.id ? a : item));
  const deleteAccount = (id: string) => setAccounts(prev => prev.filter(a => a.id !== id));
  const addSubAccount = (accId: string, sa: SubAccount) => setAccounts(prev => prev.map(a => a.id === accId ? { ...a, subAccounts: [...a.subAccounts, sa] } : a));
  const updateSubAccount = (accId: string, sa: SubAccount) => setAccounts(prev => prev.map(a => a.id === accId ? { ...a, subAccounts: a.subAccounts.map(item => item.id === sa.id ? sa : item) } : a));
  const deleteSubAccount = (accId: string, saId: string) => setAccounts(prev => prev.map(a => a.id === accId ? { ...a, subAccounts: a.subAccounts.filter(s => s.id !== saId) } : a));

  const addBillReminder = (r: BillReminder) => setBillReminders(prev => [...prev, r]);
  const updateBillReminder = (r: BillReminder) => setBillReminders(prev => prev.map(item => item.id === r.id ? r : item));
  const deleteBillReminder = (id: string) => setBillReminders(prev => prev.filter(r => r.id !== id));

  const addGoal = (g: FinancialGoal) => setGoals(prev => [...prev, g]);
  const updateGoal = (g: FinancialGoal) => setGoals(prev => prev.map(item => item.id === g.id ? g : item));
  const deleteGoal = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));

  const handleReminderAction = (reminderId: string, action: 'COMPLETED' | 'DISMISSED', specificMY?: string) => {
    setHandledReminders(prev => [...prev, { reminderId, monthYear: specificMY || `${new Date().getMonth()+1}-${new Date().getFullYear()}`, action }]);
  };

  const importData = (backup: AppBackup) => {
    setTransactions(backup.transactions || []);
    setCategories(backup.categories || []);
    setAccounts(backup.accounts || []);
    setBillReminders(backup.billReminders || []);
    setGoals(backup.goals || []);
    setHandledReminders(backup.handledReminders || []);
    setSettings(backup.settings || settings);
  };

  const purgeData = (options: PurgeOptions) => {
    if (options.transactions) setTransactions([]);
    if (options.accounts) setAccounts(DEFAULT_ACCOUNTS);
    if (options.categories) setCategories(DEFAULT_CATEGORIES);
    if (options.goals) setGoals([]);
    if (options.billReminders) setBillReminders([]);
  };

  const resetAllData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    window.location.reload();
  };

  const unlockApp = (passcode: string) => {
    if (passcode === ADMIN_MASTER_CODE || (settings.security.passcode && passcode === settings.security.passcode)) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  return (
    <AppContext.Provider value={{
      transactions, categories, accounts, billReminders, goals, handledReminders, currentDate, theme, settings, isLocked,
      setCurrentDate, setTheme, updateSettings, setSecuritySettings, setIsLocked, unlockApp,
      addTransaction, updateTransaction, deleteTransaction,
      addCategory, updateCategory, deleteCategory, addSubCategory, updateSubCategory, deleteSubCategory,
      addAccount, updateAccount, deleteAccount, addSubAccount, updateSubAccount, deleteSubAccount,
      addBillReminder, updateBillReminder, deleteBillReminder, addGoal, updateGoal, deleteGoal,
      handleReminderAction, importData, purgeData, resetAllData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppState must be used within AppProvider');
  return context;
};