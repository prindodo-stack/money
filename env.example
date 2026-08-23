import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  Award,
} from 'lucide-react';
import { Transaction, EventConfig } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface StatisticsViewProps {
  transactions: Transaction[];
  members: string[];
  config: EventConfig;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  transactions,
  members,
  config,
}) => {
  const [activeTab, setActiveTab] = useState<'CATEGORY' | 'DAILY' | 'MEMBERS'>('CATEGORY');

  // Overall calculations
  const stats = useMemo(() => {
    let totalExpense = 0;
    let totalIncome = 0;
    let expenseCount = 0;
    let incomeCount = 0;

    const categoryExpenseMap: Record<string, number> = {};
    const categoryIncomeMap: Record<string, number> = {};
    const dailyMap: Record<string, { expense: number; income: number }> = {};
    const memberPaidMap: Record<string, number> = {};
    const memberShareMap: Record<string, number> = {};

    members.forEach((m) => {
      memberPaidMap[m] = 0;
      memberShareMap[m] = 0;
    });

    transactions.forEach((t) => {
      const dateKey = t.date;
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { expense: 0, income: 0 };
      }

      if (t.type === 'EXPENSE') {
        totalExpense += t.amount;
        expenseCount++;
        categoryExpenseMap[t.category] = (categoryExpenseMap[t.category] || 0) + t.amount;
        dailyMap[dateKey].expense += t.amount;

        // Member paid
        memberPaidMap[t.payer] = (memberPaidMap[t.payer] || 0) + t.amount;

        // Member share
        const validParticipants = t.participants.length > 0 ? t.participants : members;
        const share = t.amount / (validParticipants.length || 1);
        validParticipants.forEach((p) => {
          memberShareMap[p] = (memberShareMap[p] || 0) + share;
        });
      } else {
        totalIncome += t.amount;
        incomeCount++;
        categoryIncomeMap[t.category] = (categoryIncomeMap[t.category] || 0) + t.amount;
        dailyMap[dateKey].income += t.amount;
      }
    });

    const netBalance = totalIncome - totalExpense;
    const avgPerPerson = members.length > 0 ? Math.round(totalExpense / members.length) : 0;

    // Categories sorted by amount
    const sortedExpenseCategories = Object.entries(categoryExpenseMap)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Daily sorted chronologically
    const sortedDaily = Object.entries(dailyMap)
      .map(([date, values]) => ({
        date,
        ...values,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top 5 largest expenses
    const topExpenses = [...transactions]
      .filter((t) => t.type === 'EXPENSE')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      totalExpense,
      totalIncome,
      netBalance,
      expenseCount,
      incomeCount,
      avgPerPerson,
      sortedExpenseCategories,
      sortedDaily,
      memberPaidMap,
      memberShareMap,
      topExpenses,
    };
  }, [transactions, members]);

  // Color palette for charts
  const chartColors = [
    '#6366F1', // indigo
    '#EC4899', // pink
    '#F59E0B', // amber
    '#10B981', // emerald
    '#3B82F6', // blue
    '#8B5CF6', // purple
    '#F97316', // orange
    '#14B8A6', // teal
    '#64748B', // slate
  ];

  const maxDailyExpense = Math.max(...stats.sortedDaily.map((d) => d.expense), 1);

  return (
    <div className="space-y-5 pb-20">
      {/* 4-KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Expense */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>총 지출 (경비)</span>
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            {stats.totalExpense.toLocaleString()}
            <span className="text-xs font-normal text-slate-500 ml-1">원</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            총 {stats.expenseCount}건 결제
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>총 수입 (회비)</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {stats.totalIncome.toLocaleString()}
            <span className="text-xs font-normal text-slate-500 ml-1">원</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            총 {stats.incomeCount}건 입금
          </div>
        </div>

        {/* Current Balance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>현재 잔액</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`mt-2 text-xl sm:text-2xl font-black tracking-tight ${
              stats.netBalance >= 0
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {stats.netBalance.toLocaleString()}
            <span className="text-xs font-normal text-slate-500 ml-1">원</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {stats.netBalance >= 0 ? '잔여 예산 있음' : '초과 지출 상태'}
          </div>
        </div>

        {/* 1/N Average Per Person */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>1인 평균 지출</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.avgPerPerson.toLocaleString()}
            <span className="text-xs font-normal text-slate-500 ml-1">원</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            총 {members.length}명 기준
          </div>
        </div>
      </div>

      {/* Analytics Tabs Selector */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('CATEGORY')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'CATEGORY'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>카테고리별 비중</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('DAILY')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'DAILY'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>일자별 지출 추이</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('MEMBERS')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'MEMBERS'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>인원별 결제액</span>
        </button>
      </div>

      {/* Tab 1: Category Breakdown */}
      {activeTab === 'CATEGORY' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>항목별 지출 분석</span>
            <span className="text-xs text-slate-500 font-normal">
              총 {stats.sortedExpenseCategories.length}개 카테고리
            </span>
          </h3>

          {stats.sortedExpenseCategories.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              지출 데이터가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {/* Stacked Multi-bar representation */}
              <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
                {stats.sortedExpenseCategories.map((cat, idx) => (
                  <div
                    key={cat.name}
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: chartColors[idx % chartColors.length],
                    }}
                    className="h-full transition-all"
                    title={`${cat.name}: ${cat.percentage}%`}
                  />
                ))}
              </div>

              {/* Itemized Progress Rows */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-2">
                {stats.sortedExpenseCategories.map((cat, idx) => {
                  const color = chartColors[idx % chartColors.length];
                  return (
                    <div
                      key={cat.name}
                      className="py-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className="w-3 h-3 rounded-md shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <CategoryIcon category={cat.name} size={16} className="text-slate-500" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {cat.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {cat.amount.toLocaleString()}원
                        </span>
                        <span className="w-10 text-right font-medium text-slate-400">
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Daily Spending Trend */}
      {activeTab === 'DAILY' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>일자별 지출 추이</span>
            <span className="text-xs text-slate-500 font-normal">
              {stats.sortedDaily.length}일간의 기록
            </span>
          </h3>

          {stats.sortedDaily.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              일자별 데이터가 없습니다.
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="space-y-2.5">
                {stats.sortedDaily.map((d) => {
                  const percent = Math.round((d.expense / maxDailyExpense) * 100);
                  return (
                    <div key={d.date} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">{d.date}</span>
                        <span className="text-rose-600 dark:text-rose-400">
                          {d.expense.toLocaleString()}원
                          {d.income > 0 && (
                            <span className="text-emerald-600 text-[10px] ml-1.5">
                              (수입 +{d.income.toLocaleString()}원)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-rose-500 to-indigo-600 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Member Spending Comparison */}
      {activeTab === 'MEMBERS' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>참여자별 결제 및 부담액</span>
            <span className="text-xs text-slate-500 font-normal">총 {members.length}명</span>
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {members.map((m) => {
              const paid = stats.memberPaidMap[m] || 0;
              const share = Math.round(stats.memberShareMap[m] || 0);
              const diff = paid - share;

              return (
                <div key={m} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{m}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          diff > 0
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : diff < 0
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {diff > 0
                          ? `+${diff.toLocaleString()}원 환급 예정`
                          : diff < 0
                          ? `${diff.toLocaleString()}원 송금 예정`
                          : '0원 정산 완료'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>결제한 금액: {paid.toLocaleString()}원</span>
                      <span>•</span>
                      <span>부담할 금액: {share.toLocaleString()}원</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top 5 Expenses Highlight */}
      {stats.topExpenses.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>주요 지출 TOP 5</span>
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats.topExpenses.map((t, idx) => (
              <div key={t.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {t.description}
                    </p>
                    <span className="text-[11px] text-slate-400">
                      {t.date} · {t.payer} 결제 ({t.category})
                    </span>
                  </div>
                </div>

                <div className="font-extrabold text-rose-600 dark:text-rose-400 shrink-0">
                  {t.amount.toLocaleString()}원
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
