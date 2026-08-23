import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Edit3,
  Check,
  X,
  Users,
  ArrowDownRight,
  ArrowUpRight,
  PieChart,
  Sparkles,
  Info,
} from 'lucide-react';
import { EventConfig, Transaction } from '../types';

interface BudgetHeroCardProps {
  config: EventConfig;
  transactions: Transaction[];
  onUpdateBudget: (newBudget: number) => void;
}

export const BudgetHeroCard: React.FC<BudgetHeroCardProps> = ({
  config,
  transactions,
  onUpdateBudget,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(config.totalBudget || 0));

  // Compute live budget metrics
  let totalExpense = 0;
  let totalIncome = 0;
  let expenseCount = 0;

  transactions.forEach((t) => {
    if (t.type === 'EXPENSE') {
      totalExpense += t.amount;
      expenseCount++;
    } else {
      totalIncome += t.amount;
    }
  });

  const totalBudget = config.totalBudget || 0;
  const remainingBudget = totalBudget > 0 ? totalBudget - totalExpense : 0;
  const burnRate = totalBudget > 0 ? Math.min(100, Math.round((totalExpense / totalBudget) * 100)) : 0;
  const isOverBudget = totalBudget > 0 && totalExpense > totalBudget;
  const overAmount = isOverBudget ? totalExpense - totalBudget : 0;
  const memberCount = config.members?.length || 1;
  const avgExpensePerPerson = Math.round(totalExpense / memberCount);

  const handleSaveBudget = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const num = Number(budgetInput.replace(/,/g, '')) || 0;
    onUpdateBudget(num);
    setIsEditing(false);
  };

  const handleAddBudgetPreset = (addVal: number) => {
    const curr = Number(budgetInput.replace(/,/g, '')) || 0;
    setBudgetInput(String(curr + addVal));
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/50 p-5 sm:p-6 mb-6">
      {/* Subtle glowing backdrop */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top bar: Event Title & Budget Edit Button */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-indigo-800/40">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-bold tracking-wide flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 text-indigo-300" />
              사업 예산 현황
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-200 truncate">
              {config.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              setBudgetInput(String(config.totalBudget || 0));
              setIsEditing(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-indigo-100 hover:text-white transition-colors border border-white/10"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>총 예산 변경</span>
          </button>
        </div>

        {/* Primary Row: Total Budget vs Current Balance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {/* Total Budget Card */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>총 사업(행사) 예산</span>
              <Wallet className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {totalBudget > 0 ? `${totalBudget.toLocaleString()}원` : '예산 미설정'}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
              <span>총 {expenseCount}건 지출 집행 중</span>
            </div>
          </div>

          {/* Current Remaining Balance Card (The Most Prominent Metric Requested) */}
          <div
            className={`rounded-2xl p-4 border transition-all ${
              isOverBudget
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-100'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-medium mb-1">
              <span className={isOverBudget ? 'text-rose-300 font-bold' : 'text-emerald-300 font-bold'}>
                {isOverBudget ? '⚠️ 예산 초과 지출액' : '현재 잔액 (남은 예산)'}
              </span>
              {isOverBudget ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isOverBudget ? (
                <span className="text-rose-400">-{overAmount.toLocaleString()}원 초과</span>
              ) : totalBudget > 0 ? (
                <span className="text-emerald-300">+{remainingBudget.toLocaleString()}원</span>
              ) : (
                <span className="text-slate-300">0원</span>
              )}
            </div>

            <div className="mt-1 flex items-center justify-between text-xs">
              <span className={isOverBudget ? 'text-rose-300' : 'text-emerald-300/90'}>
                {totalBudget > 0
                  ? isOverBudget
                    ? `예산 대비 ${((totalExpense / totalBudget) * 100).toFixed(1)}% 집행 (한도 초과)`
                    : `예산의 ${(100 - (totalExpense / totalBudget) * 100).toFixed(1)}% 잔여`
                  : '총 예산을 입력하면 잔액이 자동 계산됩니다.'}
              </span>
            </div>
          </div>
        </div>

        {/* Budget Progress Bar */}
        {totalBudget > 0 && (
          <div className="space-y-1.5 mb-5 bg-white/5 p-3 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-300">예산 소진율</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isOverBudget
                    ? 'bg-rose-500/30 text-rose-300'
                    : burnRate > 80
                    ? 'bg-amber-500/30 text-amber-300'
                    : 'bg-indigo-500/30 text-indigo-300'
                }`}>
                  {((totalExpense / totalBudget) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-slate-400 text-[11px]">
                집행 {totalExpense.toLocaleString()}원 / 총 {totalBudget.toLocaleString()}원
              </div>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverBudget
                    ? 'bg-gradient-to-r from-rose-500 to-red-600'
                    : burnRate > 80
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                    : 'bg-gradient-to-r from-indigo-400 via-blue-500 to-emerald-400'
                }`}
                style={{ width: `${Math.min(100, (totalExpense / totalBudget) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Secondary Info Stats Row */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-indigo-800/30">
          <div className="py-1">
            <div className="text-[11px] text-slate-400">총 집행액 (지출)</div>
            <div className="text-xs sm:text-sm font-bold text-rose-300 mt-0.5">
              -{totalExpense.toLocaleString()}원
            </div>
          </div>

          <div className="py-1 border-x border-indigo-800/30">
            <div className="text-[11px] text-slate-400">수입/지원금</div>
            <div className="text-xs sm:text-sm font-bold text-emerald-300 mt-0.5">
              +{totalIncome.toLocaleString()}원
            </div>
          </div>

          <div className="py-1">
            <div className="text-[11px] text-slate-400">1인당 평균 분담액</div>
            <div className="text-xs sm:text-sm font-bold text-indigo-200 mt-0.5">
              {avgExpensePerPerson.toLocaleString()}원 ({memberCount}명)
            </div>
          </div>
        </div>
      </div>

      {/* Edit Budget Modal / Popover */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold">총 사업(행사) 예산 설정</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBudget} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    예산 금액 (원)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={Number(budgetInput.replace(/,/g, '') || 0).toLocaleString()}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, '');
                        setBudgetInput(raw);
                      }}
                      placeholder="예: 1,500,000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      원
                    </span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[100000, 300000, 500000, 1000000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddBudgetPreset(preset)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      +{(preset / 10000).toLocaleString()}만원
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setBudgetInput('0')}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                  >
                    초기화
                  </button>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
                  >
                    저장하기
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
