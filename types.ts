
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export enum CycleType {
  FIXED_DATE = 'FIXED_DATE'
}

export type RecurringFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface SubCategory {
  id: string;
  name: string;
  budget?: number;
  icon?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  budgetLimit: number;
  subCategories: SubCategory[];
}

export interface BillingCycle {
  enabled: boolean;
  startDay: number;
  dueDaysAfterEnd: number;
  alertDaysBefore: number;
}

export interface SubAccount {
  id: string;
  name: string;
  balance: number;
  icon?: string;
  billingCycle?: BillingCycle;
}

export interface Account {
  id: string;
  name: string;
  color: string;
  icon: string;
  subAccounts: SubAccount[];
}

export interface Transaction {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  amount: number;
  type: TransactionType;
  categoryId?: string;
  subCategoryId?: string;
  accountId: string; 
  subAccountId?: string;
  toAccountId?: string; 
  toSubAccountId?: string;
  isRecurring: boolean;
  recurringFrequency?: RecurringFrequency;
  recurringEndMonth?: string;
  recurringEndDay?: number;
  recurringGroupId?: string;
  attachment?: string; // Base64 image data
}

export interface BillReminder {
  id: string;
  title: string;
  dueDay: number; 
  alertDaysBefore: number;
  amount?: number;
  icon?: string;
  createdAt: string; 
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  linkedSubAccountId?: string;
  deadline: string;
  alertDaysBefore: number;
  icon: string;
  imageUrl?: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }
];

export interface DashboardWidget {
  id: string;
  name: string;
  enabled: boolean;
}

export interface SecuritySettings {
  passcode?: string;
  biometricsEnabled: boolean;
  autoLockDelay: number; 
}

export interface AppSettings {
  incomeColor: string;
  expenseColor: string;
  fontFamily: string;
  currencyCode: string;
  currencySymbol: string;
  dashboardWidgets: DashboardWidget[];
  security: SecuritySettings;
  budgetAlertEnabled: boolean;
  budgetAlertThreshold: number;
  priorityWidgetEnabled: boolean;
  priorityWidgetMode: 'MONTHLY' | 'YEARLY' | 'CUMULATIVE';
}

export type Theme = 'light' | 'dark';

export type AppTab = 'DASH' | 'LOGS' | 'ANALYSIS' | 'TYPES' | 'VAULTS' | 'SETTINGS' | 'REMINDERS' | 'GOALS' | 'ACC_ANALYSIS' | 'DATA_OPS' | 'SECURITY' | 'CYCLES';

export interface HandledReminder {
  reminderId: string;
  monthYear: string; 
  action: 'COMPLETED' | 'DISMISSED';
}

export interface AppBackup {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  billReminders: BillReminder[];
  goals: FinancialGoal[];
  handledReminders: HandledReminder[];
  settings: AppSettings;
  version: string;
}