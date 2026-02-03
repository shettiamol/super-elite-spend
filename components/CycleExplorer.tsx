
import React, { useMemo, useState } from 'react';
import { useAppState } from '../store';
import { TransactionType, Transaction, Account, SubAccount, BillReminder } from '../types';

interface Props {
  onCompleteBill: (bill: Partial<BillReminder>) => void;
}

interface AssignedSettlement {
  transaction: Transaction;
  amountApplied: number;
}

interface CyclePeriod {
  id: string;
  start: Date;
  end: Date;
  dueDate: Date;
  spent: number;
  paid: number;
  externalSettlements: AssignedSettlement[];
  cumulativeAtEnd: number;
  outstandingDebt: number; 
  isSettled: boolean;
  isCurrent: boolean;
  localTransactions: Transaction[];
}

const CycleExplorer: React.FC<Props> = ({ onCompleteBill }) => {
  const { 
    transactions, 
    accounts, 
    settings, 
    theme,
  } = useAppState();

  const [expandedCycleId, setExpandedCycleId] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getCycleStart = (date: Date, startDay: number) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    if (d.getDate() < startDay) {
      d.setMonth(d.getMonth() - 1);
    }
    d.setDate(startDay);
    return d;
  };

  const masterLedger = useMemo(() => {
    const results: { 
      account: Account, 
      sub: SubAccount, 
      cycles: CyclePeriod[],
      totalCredit: number,
      totalDebit: number,
      totalBalance: number
    }[] = [];

    accounts.forEach(acc => {
      acc.subAccounts.forEach(sub => {
        if (!sub.billingCycle?.enabled) return;

        const bc = sub.billingCycle;
        const startDay = bc.startDay || 27;
        const subTxs = transactions.filter(t => t.subAccountId === sub.id || t.toSubAccountId === sub.id)
          .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());

        const totalCredit = subTxs.filter(t => (t.type === TransactionType.INCOME && t.subAccountId === sub.id) || (t.type === TransactionType.TRANSFER && t.toSubAccountId === sub.id))
          .reduce((s, t) => s + t.amount, 0);
        const totalDebit = subTxs.filter(t => (t.type === TransactionType.EXPENSE && t.subAccountId === sub.id) || (t.type === TransactionType.TRANSFER && t.subAccountId === sub.id))
          .reduce((s, t) => s + t.amount, 0);

        if (subTxs.length === 0) {
          results.push({ account: acc, sub, cycles: [], totalCredit, totalDebit, totalBalance: totalCredit - totalDebit });
          return;
        }

        const earliestTxDate = new Date(subTxs[0].date + 'T00:00:00');
        let currentCycleStart = getCycleStart(earliestTxDate, startDay);
        const todayCycleStart = getCycleStart(today, startDay);
        
        const subCycles: CyclePeriod[] = [];

        while (currentCycleStart <= todayCycleStart) {
          const currentCycleEnd = new Date(currentCycleStart);
          currentCycleEnd.setMonth(currentCycleEnd.getMonth() + 1);
          currentCycleEnd.setDate(currentCycleEnd.getDate() - 1);
          currentCycleEnd.setHours(23, 59, 59, 999);

          const cycleTxs = subTxs.filter(t => {
            const td = new Date(t.date + 'T00:00:00');
            return td >= currentCycleStart && td <= currentCycleEnd;
          });

          const spent = cycleTxs.filter(t => (t.type === TransactionType.EXPENSE || (t.type === TransactionType.TRANSFER && t.subAccountId === sub.id)))
            .reduce((s, t) => s + t.amount, 0);
          
          const paid = cycleTxs.filter(t => (t.type === TransactionType.INCOME && t.subAccountId === sub.id) || (t.type === TransactionType.TRANSFER && t.toSubAccountId === sub.id))
            .reduce((s, t) => s + t.amount, 0);

          subCycles.push({
            id: `${sub.id}-${currentCycleStart.getTime()}`,
            start: new Date(currentCycleStart),
            end: new Date(currentCycleEnd),
            dueDate: new Date(currentCycleEnd.getTime() + (bc.dueDaysAfterEnd * 86400000)),
            spent,
            paid,
            externalSettlements: [],
            cumulativeAtEnd: 0,
            outstandingDebt: 0,
            isSettled: false,
            isCurrent: today >= currentCycleStart && today <= currentCycleEnd,
            localTransactions: cycleTxs
          });

          currentCycleStart.setMonth(currentCycleStart.getMonth() + 1);
        }

        const allPayments = subTxs
          .filter(t => (t.type === TransactionType.INCOME && t.subAccountId === sub.id) || (t.type === TransactionType.TRANSFER && t.toSubAccountId === sub.id))
          .map(t => ({ transaction: t, available: t.amount }));

        subCycles.forEach(cycle => {
          let cycleDebtRemaining = cycle.spent;
          cycle.paid = 0;
          for (const payObj of allPayments) {
            const payDate = new Date(payObj.transaction.date + 'T00:00:00');
            if (payDate >= cycle.start && payDate <= cycle.end) {
              const applied = Math.min(cycleDebtRemaining, payObj.available);
              payObj.available -= applied;
              cycleDebtRemaining -= applied;
              cycle.paid += applied;
            }
          }
          for (const payObj of allPayments) {
            if (cycleDebtRemaining <= 0) break;
            if (payObj.available <= 0) continue;
            const payDate = new Date(payObj.transaction.date + 'T00:00:00');
            const isExternal = payDate < cycle.start || payDate > cycle.end;
            if (isExternal) {
              const applied = Math.min(cycleDebtRemaining, payObj.available);
              payObj.available -= applied;
              cycleDebtRemaining -= applied;
              cycle.externalSettlements.push({ transaction: payObj.transaction, amountApplied: applied });
            }
          }
          cycle.outstandingDebt = cycleDebtRemaining;
          cycle.isSettled = cycleDebtRemaining <= 0;
        });

        let rollingGlobalBalance = 0;
        subCycles.forEach(cycle => {
          const externalCredits = cycle.externalSettlements.reduce((s, e) => s + e.amountApplied, 0);
          rollingGlobalBalance += (cycle.paid - cycle.spent + externalCredits);
          cycle.cumulativeAtEnd = rollingGlobalBalance;
        });

        results.push({ account: acc, sub, cycles: subCycles.reverse(), totalCredit, totalDebit, totalBalance: totalCredit - totalDebit });
      });
    });

    return results;
  }, [accounts, transactions, today]);

  const formatDateShort = (d: Date) => d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

  return (
    <div className="p-6 pb-24 h-full overflow-y-auto hide-scrollbar">
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tight mb-2">Cycle Explorer</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Automatic period reconciliation</p>
      </div>

      <div className="space-y-12">
        {masterLedger.map((vault) => (
          <div key={vault.sub.id} className="space-y-6">
            <div className="flex items-center gap-4 px-2">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: vault.account.color }}>
                  <i className={`fa-solid ${vault.sub.icon || 'fa-credit-card'}`}></i>
                </div>
                <div>
                  <h3 className="text-xs font-black dark:text-white uppercase leading-none mb-1">{vault.sub.name}</h3>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Settlement History</p>
                </div>
            </div>

            <div className="space-y-4">
              {vault.cycles.map((cycle) => (
                <div 
                  key={cycle.id}
                  onClick={() => setExpandedCycleId(expandedCycleId === cycle.id ? null : cycle.id)}
                  className={`p-6 rounded-[2.5rem] border transition-all cursor-pointer ${cycle.isCurrent ? 'ring-2 ring-indigo-500/30' : ''} ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}
                >
                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${cycle.isSettled ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {cycle.isCurrent ? 'Current' : cycle.isSettled ? 'Settled' : 'Unsettled'}
                        </span>
                        <h4 className="text-sm font-black dark:text-slate-100 uppercase">{formatDateShort(cycle.start)} — {formatDateShort(cycle.end)}</h4>
                     </div>
                     <div className="text-right">
                        <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Due</span>
                        <span className={`text-lg font-black ${cycle.isSettled ? 'text-slate-300' : 'text-rose-500'}`} style={{ fontFamily: 'JetBrains Mono' }}>
                          {settings.currencySymbol}{cycle.outstandingDebt.toLocaleString()}
                        </span>
                     </div>
                  </div>

                  {expandedCycleId === cycle.id && (
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4 animate-in slide-in-from-top-2">
                       <div className="space-y-2">
                         {cycle.localTransactions.map((t) => (
                           <div key={t.id} className="flex justify-between items-center text-[10px]">
                              <span className="font-black dark:text-slate-300">{t.title}</span>
                              <span className="font-black" style={{ fontFamily: 'JetBrains Mono' }}>{settings.currencySymbol}{t.amount.toLocaleString()}</span>
                           </div>
                         ))}
                       </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CycleExplorer;