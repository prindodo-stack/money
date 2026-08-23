import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Archive,
  ArchiveRestore,
  Check,
  X,
  FileSpreadsheet,
  Users,
  Building2,
  CreditCard,
  Sparkles,
  ArrowRight,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { EventConfig, Transaction, DEFAULT_MEMBERS } from '../types';

interface EventManagerModalProps {
  isOpen: boolean;
  events: EventConfig[];
  currentEventId: string;
  transactions: Transaction[];
  onClose: () => void;
  onSelectEvent: (eventId: string) => void;
  onCreateEvent: (newEvent: Omit<EventConfig, 'id' | 'createdAt'>) => Promise<string>;
  onUpdateEvent: (eventId: string, updates: Partial<EventConfig>) => void;
  onDeleteEvent: (event: EventConfig) => void;
  onDuplicateEvent: (event: EventConfig) => void;
  onToggleArchive: (eventId: string) => void;
}

const THEME_COLORS = [
  { id: 'indigo', name: '인디고', bg: 'bg-indigo-600', text: 'text-indigo-600', ring: 'ring-indigo-500' },
  { id: 'blue', name: '오션 블루', bg: 'bg-blue-600', text: 'text-blue-600', ring: 'ring-blue-500' },
  { id: 'emerald', name: '에메랄드', bg: 'bg-emerald-600', text: 'text-emerald-600', ring: 'ring-emerald-500' },
  { id: 'violet', name: '바이올렛', bg: 'bg-violet-600', text: 'text-violet-600', ring: 'ring-violet-500' },
  { id: 'rose', name: '로즈 핑크', bg: 'bg-rose-600', text: 'text-rose-600', ring: 'ring-rose-500' },
  { id: 'amber', name: '앰버 골드', bg: 'bg-amber-600', text: 'text-amber-600', ring: 'ring-amber-500' },
];

export const EventManagerModal: React.FC<EventManagerModalProps> = ({
  isOpen,
  events,
  currentEventId,
  transactions,
  onClose,
  onSelectEvent,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  onDuplicateEvent,
  onToggleArchive,
}) => {
  const [viewMode, setViewMode] = useState<'LIST' | 'CREATE' | 'EDIT'>('LIST');
  const [filterTab, setFilterTab] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [members, setMembers] = useState<string[]>(DEFAULT_MEMBERS);
  const [newMemberInput, setNewMemberInput] = useState('');
  const [bankName, setBankName] = useState('카카오뱅크');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [settlementMemo, setSettlementMemo] = useState('');
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [isSaving, setIsSaving] = useState(false);

  // Switch to Create Mode
  const handleOpenCreate = () => {
    setTitle('');
    setDescription('');
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    // Inherit bank account from current event for convenience if available
    const current = events.find((e) => e.id === currentEventId);
    setMembers(current ? [...current.members] : [...DEFAULT_MEMBERS]);
    setBankName(current?.bankName || '카카오뱅크');
    setAccountNumber(current?.accountNumber || '');
    setAccountHolder(current?.accountHolder || '');
    setSettlementMemo(current?.settlementMemo || '');
    setSelectedColor('indigo');
    setEditingEventId(null);
    setViewMode('CREATE');
  };

  // Switch to Edit Mode
  const handleOpenEdit = (event: EventConfig) => {
    setEditingEventId(event.id);
    setTitle(event.title);
    setDescription(event.description || '');
    setStartDate(event.startDate || '');
    setEndDate(event.endDate || '');
    setMembers([...event.members]);
    setBankName(event.bankName || '카카오뱅크');
    setAccountNumber(event.accountNumber || '');
    setAccountHolder(event.accountHolder || '');
    setSettlementMemo(event.settlementMemo || '');
    setSelectedColor(event.color || 'indigo');
    setViewMode('EDIT');
  };

  // Add member to form
  const handleAddMember = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = newMemberInput.trim();
    if (!name) return;
    if (members.includes(name)) {
      alert('이미 참여자 목록에 있는 이름입니다.');
      return;
    }
    setMembers([...members, name]);
    setNewMemberInput('');
  };

  // Remove member from form
  const handleRemoveMember = (nameToRemove: string) => {
    if (members.length <= 1) {
      alert('최소 1명 이상의 참여자가 필요합니다.');
      return;
    }
    setMembers(members.filter((m) => m !== nameToRemove));
  };

  // Save Event (Create or Update)
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('행사명을 입력해주세요.');
      return;
    }
    if (members.length === 0) {
      alert('최소 1명 이상의 참여자를 등록해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      if (viewMode === 'CREATE') {
        const newId = await onCreateEvent({
          title: title.trim(),
          description: description.trim() || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          spreadsheetId: null,
          spreadsheetUrl: null,
          sheetName: '경비내역',
          members,
          bankName: bankName.trim() || undefined,
          accountNumber: accountNumber.trim() || undefined,
          accountHolder: accountHolder.trim() || undefined,
          settlementMemo: settlementMemo.trim() || undefined,
          color: selectedColor,
          isArchived: false,
        });
        onSelectEvent(newId);
      } else if (viewMode === 'EDIT' && editingEventId) {
        onUpdateEvent(editingEventId, {
          title: title.trim(),
          description: description.trim() || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          members,
          bankName: bankName.trim() || undefined,
          accountNumber: accountNumber.trim() || undefined,
          accountHolder: accountHolder.trim() || undefined,
          settlementMemo: settlementMemo.trim() || undefined,
          color: selectedColor,
        });
      }
      setViewMode('LIST');
    } catch (err: any) {
      alert(`저장 중 오류가 발생했습니다: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Quick member presets from other events
  const handleImportMembersFrom = (fromEventId: string) => {
    const target = events.find((e) => e.id === fromEventId);
    if (target) {
      setMembers([...target.members]);
    }
  };

  // Filter events
  const filteredEvents = events.filter((ev) => {
    const matchesTab = filterTab === 'ACTIVE' ? !ev.isArchived : ev.isArchived;
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.description && ev.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ev.members.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  // Calculate event statistics
  const getEventStats = (eventId: string) => {
    const eventTxs = transactions.filter((t) => (t.eventId || events[0]?.id) === eventId);
    const totalExpense = eventTxs
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = eventTxs
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      txCount: eventTxs.length,
      totalExpense,
      totalIncome,
    };
  };

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
            className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 shadow-2xl z-10 border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {viewMode === 'LIST'
                      ? '행사 목록 및 관리'
                      : viewMode === 'CREATE'
                      ? '새 행사 만들기'
                      : '행사 정보 수정'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {viewMode === 'LIST'
                      ? '여러 행사를 생성하고 자유롭게 전환하며 정산하세요'
                      : '행사 기본 정보 및 참여자 명단을 설정합니다'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {viewMode !== 'LIST' ? (
                  <button
                    type="button"
                    onClick={() => setViewMode('LIST')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    목록으로
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>새 행사</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {viewMode === 'LIST' ? (
                <div className="space-y-4">
                  {/* Search and Tabs */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold shrink-0">
                      <button
                        type="button"
                        onClick={() => setFilterTab('ACTIVE')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          filterTab === 'ACTIVE'
                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        진행 중 ({events.filter((e) => !e.isArchived).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterTab('ARCHIVED')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          filterTab === 'ARCHIVED'
                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        보관됨 ({events.filter((e) => e.isArchived).length})
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="행사명, 참여자 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-3.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden w-full sm:w-56"
                    />
                  </div>

                  {/* Event Cards Grid */}
                  {filteredEvents.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-3">
                      <Calendar className="w-10 h-10 mx-auto opacity-40 text-slate-400" />
                      <p className="text-xs">
                        {searchQuery
                          ? '검색 결과와 일치하는 행사가 없습니다.'
                          : filterTab === 'ARCHIVED'
                          ? '보관된 행사가 없습니다.'
                          : '등록된 행사가 없습니다. 새 행사를 만들어보세요!'}
                      </p>
                      <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>새 행사 만들기</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {filteredEvents.map((ev) => {
                        const isCurrent = ev.id === currentEventId;
                        const stats = getEventStats(ev.id);

                        return (
                          <motion.div
                            key={ev.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-2xl border transition-all ${
                              isCurrent
                                ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800 ring-2 ring-indigo-500/20'
                                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                                    {ev.title}
                                  </h3>
                                  {isCurrent && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white">
                                      <Check className="w-3 h-3" />
                                      <span>현재 선택됨</span>
                                    </span>
                                  )}
                                  {ev.isArchived && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                      보관됨
                                    </span>
                                  )}
                                </div>

                                {/* Date and description */}
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                  {ev.startDate && (
                                    <span>
                                      📅 {ev.startDate} {ev.endDate && ev.endDate !== ev.startDate ? `~ ${ev.endDate}` : ''}
                                    </span>
                                  )}
                                  {ev.description && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate max-w-[200px]">{ev.description}</span>
                                    </>
                                  )}
                                </div>

                                {/* Members preview */}
                                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                    {ev.members.length}명 ({ev.members.slice(0, 4).join(', ')}
                                    {ev.members.length > 4 ? ` 외 ${ev.members.length - 4}명` : ''})
                                  </span>
                                </div>
                              </div>

                              {/* Google Sheets Badge */}
                              <div className="shrink-0 text-right">
                                {ev.spreadsheetId ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-200/60 dark:border-emerald-800">
                                    <FileSpreadsheet className="w-3.5 h-3.5" />
                                    <span>시트 연동</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-medium">
                                    로컬
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Financial Summary & Actions bar */}
                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3 text-xs">
                                <div>
                                  <span className="text-slate-400 text-[10px] block">총 지출</span>
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {stats.totalExpense.toLocaleString()}원
                                  </span>
                                </div>
                                {stats.totalIncome > 0 && (
                                  <div>
                                    <span className="text-slate-400 text-[10px] block">수납 회비</span>
                                    <span className="font-bold text-teal-600 dark:text-teal-400">
                                      {stats.totalIncome.toLocaleString()}원
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <span className="text-slate-400 text-[10px] block">내역 건수</span>
                                  <span className="font-bold text-slate-700 dark:text-slate-300">
                                    {stats.txCount}건
                                  </span>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                                {!isCurrent && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onSelectEvent(ev.id);
                                      onClose();
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                                  >
                                    이 행사 열기
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(ev)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                                  title="행사 정보 수정"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onDuplicateEvent(ev)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 transition-colors"
                                  title="행사 복제 (참여자 명단 복사)"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onToggleArchive(ev.id)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-amber-600 transition-colors"
                                  title={ev.isArchived ? '보관 해제' : '행사 보관'}
                                >
                                  {ev.isArchived ? (
                                    <ArchiveRestore className="w-4 h-4" />
                                  ) : (
                                    <Archive className="w-4 h-4" />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onDeleteEvent(ev)}
                                  disabled={events.length <= 1}
                                  className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors disabled:opacity-30"
                                  title="행사 삭제"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* CREATE & EDIT FORM */
                <form onSubmit={handleSaveEvent} className="space-y-4">
                  {/* Event Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      행사 이름 *
                    </label>
                    <input
                      type="text"
                      placeholder="예: 2026 하계 워크숍, 3분기 개발팀 회식, 제주도 여행"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
                    />
                  </div>

                  {/* Dates & Description */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        시작일
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        종료일
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      행사 설명 또는 메모 (선택)
                    </label>
                    <input
                      type="text"
                      placeholder="예: 강원도 양양 펜션 워크숍 및 서핑 모임"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                    />
                  </div>

                  {/* Members Management */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-indigo-500" />
                        <span>참여자 명단 ({members.length}명) *</span>
                      </label>

                      {events.length > 0 && (
                        <div className="relative group">
                          <select
                            onChange={(e) => {
                              if (e.target.value) handleImportMembersFrom(e.target.value);
                            }}
                            defaultValue=""
                            className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold bg-transparent cursor-pointer outline-hidden"
                          >
                            <option value="" disabled>
                              기존 행사 인원 복사 ▾
                            </option>
                            {events.map((ev) => (
                              <option key={ev.id} value={ev.id}>
                                {ev.title} ({ev.members.length}명)
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Member Add Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="새 참여자 이름 (엔터 입력)..."
                        value={newMemberInput}
                        onChange={(e) => setNewMemberInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddMember();
                          }
                        }}
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddMember()}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
                      >
                        추가
                      </button>
                    </div>

                    {/* Member Chips */}
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pt-1">
                      {members.map((name) => (
                        <div
                          key={name}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium"
                        >
                          <span>{name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(name)}
                            className="text-slate-400 hover:text-rose-600 ml-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bank Account Settings */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                    <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      <span>입금 계좌 및 정산 메모 (선택)</span>
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="text"
                          placeholder="은행명 (예: 카카오뱅크, 토스)"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="예금주 (예: 홍길동)"
                          value={accountHolder}
                          onChange={(e) => setAccountHolder(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="계좌번호 (예: 3333-01-1234567)"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="정산 안내 메모 (예: 일요일 오후 6시까지 입금)"
                        value={settlementMemo}
                        onChange={(e) => setSettlementMemo(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setViewMode('LIST')}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>{viewMode === 'CREATE' ? '행사 만들기 완료' : '수정사항 저장'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
