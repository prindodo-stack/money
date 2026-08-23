import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Check,
  Calendar,
  Clock,
  User,
  Users,
  FileText,
  DollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react';
import { Transaction, TransactionType, CATEGORIES } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface TransactionFormModalProps {
  isOpen: boolean;
  editingTransaction?: Transaction | null;
  members: string[];
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'>, id?: string) => void;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  editingTransaction,
  members,
  onClose,
  onSave,
}) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('식비/회식');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' })
  );
  const [payer, setPayer] = useState<string>(members[0] || '나');
  const [participants, setParticipants] = useState<string[]>(members);
  const [memo, setMemo] = useState<string>('');

  // Reset or initialize when modal opens or editing item changes
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setDescription(editingTransaction.description);
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setTime(editingTransaction.time || '');
      setPayer(editingTransaction.payer);
      setParticipants(
        editingTransaction.participants.length > 0 ? editingTransaction.participants : members
      );
      setMemo(editingTransaction.memo || '');
    } else {
      setType('EXPENSE');
      setAmount('');
      setDescription('');
      setCategory('식비/회식');
      setDate(new Date().toISOString().split('T')[0]);
      setTime(
        new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' })
      );
      setPayer(members[0] || '나');
      setParticipants(members);
      setMemo('');
    }
  }, [editingTransaction, isOpen, members]);

  // If type changes and category isn't in that type, switch to default
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'EXPENSE') {
      setCategory('식비/회식');
    } else {
      setCategory('회비납부');
    }
  };

  const handleAddAmount = (addValue: number) => {
    const current = Number(amount.replace(/,/g, '')) || 0;
    setAmount(String(current + addValue));
  };

  const handleToggleParticipant = (member: string) => {
    if (participants.includes(member)) {
      if (participants.length === 1) return; // keep at least 1
      setParticipants(participants.filter((p) => p !== member));
    } else {
      setParticipants([...participants, member]);
    }
  };

  const handleSelectAllParticipants = () => {
    setParticipants(members);
  };

  const handleSelectOnlyMe = (targetPayer: string) => {
    setParticipants([targetPayer]);
  };

  const handleInvertParticipants = () => {
    const inverted = members.filter((m) => !participants.includes(m));
    if (inverted.length > 0) {
      setParticipants(inverted);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amount.replace(/,/g, ''));
    if (!numericAmount || numericAmount <= 0) {
      alert('금액을 올바르게 입력해주세요.');
      return;
    }
    if (!description.trim()) {
      alert('항목명을 입력해주세요.');
      return;
    }

    onSave(
      {
        type,
        amount: numericAmount,
        description: description.trim(),
        category,
        date,
        time: time || undefined,
        payer: payer || members[0] || '미지정',
        participants: type === 'EXPENSE' ? (participants.length > 0 ? participants : members) : [payer],
        memo: memo.trim() || undefined,
      },
      editingTransaction?.id
    );

    onClose();
  };

  const currentCategories = type === 'EXPENSE' ? CATEGORIES.EXPENSE : CATEGORIES.INCOME;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 shadow-2xl z-10 border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {editingTransaction ? '내역 수정' : '새 항목 등록'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Type Switcher: 지출 vs 수입 */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => handleTypeChange('EXPENSE')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    type === 'EXPENSE'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <ArrowDownCircle className="w-4 h-4" />
                  <span>지출 (경비)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('INCOME')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    type === 'INCOME'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  <span>수입 (회비/지원금)</span>
                </button>
              </div>

              {/* Amount Input with Quick Addition Chips */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  금액 (원) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-2xl sm:text-3xl font-extrabold tracking-tight px-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 outline-hidden transition-all text-right pr-12"
                    required
                    autoFocus={!editingTransaction}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">
                    원
                  </span>
                </div>

                {/* Quick Add Chips */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => handleAddAmount(10000)}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    +1만
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddAmount(30000)}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    +3만
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddAmount(50000)}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    +5만
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddAmount(100000)}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    +10만
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmount('')}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-auto transition-colors"
                  >
                    초기화
                  </button>
                </div>
              </div>

              {/* Description / Item Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  항목명 (내용) *
                </label>
                <input
                  type="text"
                  placeholder={type === 'EXPENSE' ? '예: 삼겹살 저녁 회식, 펜션 예약금' : '예: 1차 회비 입금, 지자체 보조금'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                  required
                />
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  카테고리
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {currentCategories.map((cat) => {
                    const isSelected = category === cat.name;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.name)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        <CategoryIcon
                          category={cat.name}
                          type={type}
                          className={`mb-1 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
                          size={18}
                        />
                        <span className="text-xs font-semibold truncate w-full">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    날짜
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-hidden text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    시간 (선택)
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-hidden text-sm"
                  />
                </div>
              </div>

              {/* Payer / Receiver */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>{type === 'EXPENSE' ? '💳 결제자 (누가 먼저 카드로 결제했나요?)' : '🏦 수납자 (누가 돈을 받았나요?)'}</span>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">1명 선택</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {members.map((member) => (
                    <button
                      key={member}
                      type="button"
                      onClick={() => setPayer(member)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        payer === member
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-400'
                          : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {member}
                    </button>
                  ))}
                </div>
              </div>

              {/* Participants (Only for Expenses) */}
              {type === 'EXPENSE' && (
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>해당 지출 관련 참여자 선택 ({participants.length}명)</span>
                      </label>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        이 지출을 함께 혜택/소비한 사람들을 선택하면 1/N 분담액이 자동 반영됩니다.
                      </p>
                    </div>

                    {/* Quick batch selectors */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleSelectAllParticipants}
                        className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50"
                      >
                        전체 선택
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectOnlyMe(payer)}
                        className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      >
                        결제자만
                      </button>
                      <button
                        type="button"
                        onClick={handleInvertParticipants}
                        className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      >
                        반전
                      </button>
                    </div>
                  </div>

                  {/* Member interactive chips */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {members.map((member) => {
                      const isSelected = participants.includes(member);
                      const isPayer = payer === member;
                      return (
                        <button
                          key={member}
                          type="button"
                          onClick={() => handleToggleParticipant(member)}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40'
                              : 'bg-white dark:bg-slate-800 text-slate-400 line-through border border-slate-200 dark:border-slate-700 opacity-60'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                              isSelected ? 'bg-white text-indigo-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                            }`}
                          >
                            {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : '✕'}
                          </div>
                          <span>{member}</span>
                          {isPayer && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-800 text-indigo-200 ml-0.5">
                              결제자
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Real-time Share Preview Banner */}
                  <div className="mt-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                      <span>1인당 예상 분담액:</span>
                      <b className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">
                        {participants.length > 0
                          ? `${Math.round(
                              (Number(amount.replace(/,/g, '')) || 0) / participants.length
                            ).toLocaleString()}원`
                          : '0원'}
                      </b>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      총 {participants.length}명에게 균등 분담
                    </span>
                  </div>
                </div>
              )}

              {/* Memo */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  메모 (선택)
                </label>
                <input
                  type="text"
                  placeholder="예: 영수증 번호, 할인 적용, 특이사항"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-hidden text-sm"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className={`w-full py-3.5 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 ${
                    type === 'EXPENSE'
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-500/25 hover:from-rose-600 hover:to-pink-700'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  <span>{editingTransaction ? '수정사항 저장' : `${type === 'EXPENSE' ? '지출' : '수입'} 내역 등록`}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
