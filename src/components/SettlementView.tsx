import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Calculator,
  Copy,
  Check,
  Share2,
  Users,
  Plus,
  Trash2,
  Building2,
  CreditCard,
  User,
  ArrowRight,
  Sparkles,
  Receipt,
  FileCheck,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Wallet,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Transaction, EventConfig, SettlementReport, MemberSettlement } from '../types';
import { calculateSettlement, generateSettlementText } from '../lib/settlement';

interface SettlementViewProps {
  transactions: Transaction[];
  members: string[];
  config: EventConfig;
  onUpdateConfig: (newConfig: Partial<EventConfig>) => void;
  onUpdateMembers: (newMembers: string[]) => void;
}

export const SettlementView: React.FC<SettlementViewProps> = ({
  transactions,
  members,
  config,
  onUpdateConfig,
  onUpdateMembers,
}) => {
  const [copied, setCopied] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  const [bankName, setBankName] = useState(config.bankName || '카카오뱅크');
  const [accountNumber, setAccountNumber] = useState(config.accountNumber || '');
  const [accountHolder, setAccountHolder] = useState(config.accountHolder || '');
  const [settlementMemo, setSettlementMemo] = useState(config.settlementMemo || '');

  // Calculate settlement
  const report: SettlementReport = useMemo(() => {
    return calculateSettlement(transactions, members, config.totalBudget || 0);
  }, [transactions, members, config.totalBudget]);

  const toggleExpand = (name: string) => {
    setExpandedMember((prev) => (prev === name ? null : name));
  };

  // Handle member addition
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newMemberName.trim();
    if (!name) return;
    if (members.includes(name)) {
      alert('이미 등록된 참여자 이름입니다.');
      return;
    }
    onUpdateMembers([...members, name]);
    setNewMemberName('');
  };

  // Handle member removal
  const handleRemoveMember = (nameToRemove: string) => {
    if (members.length <= 1) {
      alert('최소 1명 이상의 참여자가 필요합니다.');
      return;
    }
    // Check if member has transactions
    const hasTx = transactions.some(
      (t) => t.payer === nameToRemove || t.participants.includes(nameToRemove)
    );
    if (hasTx) {
      if (
        !window.confirm(
          `'${nameToRemove}' 님이 참여한 내역이 있습니다. 그래도 삭제하시겠습니까? 정산 결과가 변경될 수 있습니다.`
        )
      ) {
        return;
      }
    }
    onUpdateMembers(members.filter((m) => m !== nameToRemove));
  };

  // Save bank account settings
  const handleSaveAccount = () => {
    onUpdateConfig({
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim(),
      settlementMemo: settlementMemo.trim(),
    });
    setIsEditingAccount(false);
  };

  // 1-Click Copy formatted report
  const handleCopyReport = () => {
    const text = generateSettlementText(report, {
      ...config,
      bankName,
      accountNumber,
      accountHolder,
      settlementMemo,
    });

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
      });
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const totalBudget = config.totalBudget || 0;
  const isOverBudget = totalBudget > 0 && report.totalExpense > totalBudget;

  return (
    <div className="space-y-5 pb-20">
      {/* Top Banner: Action Buttons & Budget Overview */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
              <Receipt className="w-4 h-4 text-indigo-300" />
              <span>1/N 개인별 분담 및 정산서</span>
            </div>
            {totalBudget > 0 && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isOverBudget
                    ? 'bg-rose-500/30 text-rose-200 border border-rose-400/30'
                    : 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
                }`}
              >
                {isOverBudget ? '⚠️ 예산 초과' : '🟢 예산 내 집행'}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold mt-1.5">
            {config.title || '행사 경비 정산'}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/15 text-xs">
            {totalBudget > 0 && (
              <div>
                <span className="text-indigo-200 text-[11px] block">총 사업 예산</span>
                <span className="text-base sm:text-lg font-bold">
                  {totalBudget.toLocaleString()}원
                </span>
              </div>
            )}
            <div>
              <span className="text-indigo-200 text-[11px] block">총 지출 (집행액)</span>
              <span className="text-base sm:text-lg font-bold text-rose-200">
                {report.totalExpense.toLocaleString()}원
              </span>
            </div>
            {totalBudget > 0 && (
              <div>
                <span className="text-indigo-200 text-[11px] block">현재 예산 잔액</span>
                <span
                  className={`text-base sm:text-lg font-extrabold ${
                    isOverBudget ? 'text-rose-300' : 'text-emerald-300'
                  }`}
                >
                  {isOverBudget
                    ? `-${(report.totalExpense - totalBudget).toLocaleString()}원`
                    : `+${report.remainingBudget.toLocaleString()}원`}
                </span>
              </div>
            )}
            <div>
              <span className="text-indigo-200 text-[11px] block">참여 인원</span>
              <span className="text-base sm:text-lg font-bold">{report.memberCount}명</span>
            </div>
          </div>

          {/* Copy Button */}
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={handleCopyReport}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-900 font-bold text-sm shadow-md hover:bg-indigo-50 transition-all active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '카카오톡 정산서 복사 완료!' : '카톡/문자용 정산서 텍스트 복사'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 1: Transfer Plan (최소 송금 안내) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>최소 송금 안내 ({report.transfers.length}건)</span>
          </h3>
          <span className="text-xs text-slate-400">복잡한 송금을 최소 횟수로 계산</span>
        </div>

        {report.transfers.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            🎉 모든 참여자의 결제 및 정산이 완벽하게 일치합니다! (송금 불필요)
          </div>
        ) : (
          <div className="space-y-2.5">
            {report.transfers.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>

                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 truncate">
                    <span className="text-rose-600 dark:text-rose-400">{t.from}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-emerald-600 dark:text-emerald-400">{t.to}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {t.amount.toLocaleString()}원
                  </div>
                  <span className="text-[10px] text-slate-400">송금하기</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Individual 1/N Breakdown List with Accordion */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              개인별 분담 금액 및 정산 현황
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              각 개인을 클릭하면 참여한 개별 지출 항목과 분담 상세를 확인할 수 있습니다.
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
            총 {report.memberSummaries.length}명
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {report.memberSummaries.map((m) => {
            const isCreditor = m.netBalance > 0;
            const isDebtor = m.netBalance < 0;
            const isExpanded = expandedMember === m.name;

            return (
              <div key={m.name} className="py-3.5 transition-colors">
                <div
                  onClick={() => toggleExpand(m.name)}
                  className="flex items-center justify-between gap-3 text-xs cursor-pointer select-none hover:bg-slate-50/60 dark:hover:bg-slate-800/40 p-2 rounded-xl"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{m.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCreditor
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : isDebtor
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {isCreditor ? '받을 사람' : isDebtor ? '보낼 사람' : '정산 완료'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-slate-500 text-[11px]">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        내 몫(분담액): {m.totalShare.toLocaleString()}원
                      </span>
                      <span>•</span>
                      <span>직접 결제: {m.totalPaid.toLocaleString()}원</span>
                      <span>•</span>
                      <span>참여 지출: {m.participatedCount}건</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div
                        className={`text-sm font-black ${
                          isCreditor
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isDebtor
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {isCreditor ? `+${m.netBalance.toLocaleString()}` : m.netBalance.toLocaleString()}원
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {isCreditor ? '환급받기' : isDebtor ? '송금하기' : '0원'}
                      </span>
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Itemized Breakdown */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-2 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 px-3"
                    >
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        📋 {m.name}님이 참여한 지출 상세 내역 ({m.breakdown.length}건)
                      </div>

                      {m.breakdown.length === 0 ? (
                        <div className="text-xs text-slate-400 py-2">참여한 지출 내역이 없습니다.</div>
                      ) : (
                        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                          {m.breakdown.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs border border-slate-100 dark:border-slate-800"
                            >
                              <div>
                                <div className="font-semibold text-slate-800 dark:text-slate-200">
                                  {item.description}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {item.date} • {item.category} • 결제자: {item.payer} (총 {item.participantCount}명 분담)
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-indigo-600 dark:text-indigo-400">
                                  {item.myShare.toLocaleString()}원
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  (전체 {item.totalAmount.toLocaleString()}원)
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Bank Account & Settlement Note Setting */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>입금 계좌 및 정산 메모</span>
          </h3>
          <button
            type="button"
            onClick={() => {
              if (isEditingAccount) {
                handleSaveAccount();
              } else {
                setIsEditingAccount(true);
              }
            }}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {isEditingAccount ? '저장하기' : '계좌 정보 수정'}
          </button>
        </div>

        {isEditingAccount ? (
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  은행명
                </label>
                <input
                  type="text"
                  placeholder="예: 카카오뱅크, 토스, 국민"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  예금주
                </label>
                <input
                  type="text"
                  placeholder="예: 홍길동"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                계좌번호
              </label>
              <input
                type="text"
                placeholder="예: 3333-01-1234567"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                정산 추가 안내 메모
              </label>
              <input
                type="text"
                placeholder="예: 일요일 오후 6시까지 입금 부탁드립니다."
                value={settlementMemo}
                onChange={(e) => setSettlementMemo(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveAccount}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors"
            >
              계좌 정보 적용
            </button>
          </div>
        ) : (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs space-y-1">
            {accountNumber ? (
              <>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    {bankName} {accountNumber} ({accountHolder || '예금주'})
                  </span>
                </div>
                {settlementMemo && (
                  <p className="text-slate-500 dark:text-slate-400 mt-1">💬 {settlementMemo}</p>
                )}
              </>
            ) : (
              <div className="text-slate-400">
                입금받을 계좌를 등록하면 카카오톡 정산서 복사 시 함께 첨부됩니다.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section 4: Member Management */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          <span>참여자 관리 ({members.length}명)</span>
        </h3>

        {/* Add member form */}
        <form onSubmit={handleAddMember} className="flex gap-2">
          <input
            type="text"
            placeholder="새 참여자 이름 입력..."
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0"
          >
            추가
          </button>
        </form>

        {/* Member tags */}
        <div className="flex flex-wrap gap-2 pt-1">
          {members.map((member) => (
            <div
              key={member}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <span>{member}</span>
              <button
                type="button"
                onClick={() => handleRemoveMember(member)}
                className="p-0.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
