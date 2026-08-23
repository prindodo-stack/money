import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Users,
  User,
  ArrowDownRight,
  ArrowUpRight,
  Tag,
  Clock,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { Transaction, TransactionType, CATEGORIES, EventConfig } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { BudgetHeroCard } from './BudgetHeroCard';

interface DailySummaryViewProps {
  transactions: Transaction[];
  members: string[];
  config: EventConfig;
  onUpdateBudget: (newBudget: number) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onAddNew: () => void;
}

export const DailySummaryView: React.FC<DailySummaryViewProps> = ({
  transactions,
  members,
  config,
  onUpdateBudget,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | TransactionType>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedMember, setSelectedMember] = useState<string>('ALL');
  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>({});

  const toggleDateCollapse = (dateKey: string) => {
    setCollapsedDates((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Type match
      if (selectedType !== 'ALL' && t.type !== selectedType) return false;

      // Category match
      if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;

      // Member match (either payer or participant)
      if (selectedMember !== 'ALL') {
        const isPayer = t.payer === selectedMember;
        const isParticipant = t.participants.includes(selectedMember);
        if (!isPayer && !isParticipant) return false;
      }

      // Search keyword match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const descMatch = t.description.toLowerCase().includes(q);
        const memoMatch = t.memo?.toLowerCase().includes(q) || false;
        const payerMatch = t.payer.toLowerCase().includes(q);
        const catMatch = t.category.toLowerCase().includes(q);
        if (!descMatch && !memoMatch && !payerMatch && !catMatch) return false;
      }

      return true;
    });
  }, [transactions, selectedType, selectedCategory, selectedMember, searchQuery]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const map: Record<
      string,
      {
        date: string;
        transactions: Transaction[];
        totalExpense: number;
        totalIncome: number;
        net: number;
      }
    > = {};

    filteredTransactions.forEach((t) => {
      const dateKey = t.date;
      if (!map[dateKey]) {
        map[dateKey] = {
          date: dateKey,
          transactions: [],
          totalExpense: 0,
          totalIncome: 0,
          net: 0,
        };
      }

      map[dateKey].transactions.push(t);
      if (t.type === 'EXPENSE') {
        map[dateKey].totalExpense += t.amount;
      } else {
        map[dateKey].totalIncome += t.amount;
      }
      map[dateKey].net = map[dateKey].totalIncome - map[dateKey].totalExpense;
    });

    // Sort descending by date
    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredTransactions]);

  const allCategories = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.category)));
  }, [transactions]);

  const formatDateLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      const dayOfWeek = days[d.getDay()];
      return `${dateStr} (${dayOfWeek})`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Primary Budget & Remaining Balance Hero Card (Requested Top Priority) */}
      <BudgetHeroCard
        config={config}
        transactions={transactions}
        onUpdateBudget={onUpdateBudget}
      />

      {/* 2. Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200 dark:border-slate-800 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="내역명, 결제자, 참여자, 메모 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-hidden transition-all"
          />
        </div>

        {/* Filter Badges Scrollable */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {/* Type Filter Buttons */}
          <button
            type="button"
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              selectedType === 'ALL'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            전체 내역
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('EXPENSE')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              selectedType === 'EXPENSE'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            지출만
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('INCOME')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              selectedType === 'INCOME'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            수입만
          </button>

          {/* Member Dropdown */}
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-transparent focus:border-indigo-400 outline-hidden"
          >
            <option value="ALL">모든 인원</option>
            {members.map((m) => (
              <option key={m} value={m}>
                {m} 관련
              </option>
            ))}
          </select>

          {/* Category Dropdown */}
          {allCategories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-transparent focus:border-indigo-400 outline-hidden"
            >
              <option value="ALL">모든 카테고리</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Empty State */}
      {groupedByDate.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 mx-auto flex items-center justify-center mb-3">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {transactions.length === 0 ? '등록된 내역이 없습니다' : '조건에 맞는 내역이 없습니다'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            {transactions.length === 0
              ? '하단의 [+] 버튼을 눌러 지출 또는 수입 내역을 간편하게 입력해보세요.'
              : '검색어나 필터 조건을 변경해보세요.'}
          </p>
          {transactions.length === 0 && (
            <button
              type="button"
              onClick={onAddNew}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>첫 지출 내역 등록하기</span>
            </button>
          )}
        </div>
      )}

      {/* Date Grouped Timeline */}
      {groupedByDate.map((group) => {
        const isCollapsed = collapsedDates[group.date];
        return (
          <div
            key={group.date}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all"
          >
            {/* Group Header: Date and Daily Summaries */}
            <div
              onClick={() => toggleDateCollapse(group.date)}
              className="px-4 py-3.5 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800/80"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatDateLabel(group.date)}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    총 {group.transactions.length}건
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Daily Totals */}
                <div className="text-right text-xs">
                  {group.totalExpense > 0 && (
                    <div className="text-rose-600 dark:text-rose-400 font-bold">
                      지출 -{group.totalExpense.toLocaleString()}원
                    </div>
                  )}
                  {group.totalIncome > 0 && (
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                      수입 +{group.totalIncome.toLocaleString()}원
                    </div>
                  )}
                </div>

                <div className="text-slate-400">
                  {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {/* Transactions List */}
            {!isCollapsed && (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {group.transactions.map((t) => {
                  const isExpense = t.type === 'EXPENSE';
                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors flex items-start justify-between gap-3"
                    >
                      {/* Left: Category Icon & Details */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs ${
                            isExpense
                              ? 'bg-gradient-to-br from-rose-500 to-pink-600'
                              : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                          }`}
                        >
                          <CategoryIcon category={t.category} type={t.type} size={20} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {t.description}
                            </h4>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                              {t.category}
                            </span>
                          </div>

                          {/* Details line: Payer & Participants */}
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                              <User className="w-3 h-3 text-indigo-500" />
                              <span>{isExpense ? '결제:' : '수납:'} {t.payer}</span>
                            </span>

                            {isExpense && (
                              <div className="inline-flex items-center gap-1 flex-wrap">
                                <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">
                                  <Users className="w-3 h-3" />
                                  <span>{t.participants.length}명 분담</span>
                                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                    (1인당 {Math.round(t.amount / (t.participants.length || 1)).toLocaleString()}원)
                                  </span>
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  [{t.participants.join(', ')}]
                                </span>
                              </div>
                            )}

                            {t.time && (
                              <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-400">
                                <Clock className="w-3 h-3" />
                                <span>{t.time}</span>
                              </span>
                            )}
                          </div>

                          {/* Memo if any */}
                          {t.memo && (
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/70 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800 inline-block max-w-full truncate">
                              💬 {t.memo}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex flex-col items-end shrink-0">
                        <div
                          className={`text-base sm:text-lg font-extrabold tracking-tight ${
                            isExpense
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {isExpense ? '-' : '+'}
                          {t.amount.toLocaleString()}원
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 mt-2">
                          <button
                            type="button"
                            onClick={() => onEdit(t)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="수정"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(t)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
