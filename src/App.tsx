import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import {
  Receipt,
  BarChart3,
  Calendar,
  Plus,
  FileSpreadsheet,
  Users,
  Settings,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  ChevronDown,
  Info,
} from 'lucide-react';
import { Transaction, EventConfig, DEFAULT_MEMBERS } from './types';
import { initAuth, googleSignIn, logout, getAccessToken } from './lib/auth';
import {
  fetchTransactionsFromSheet,
  appendTransactionToSheet,
  syncAllTransactionsToSheet,
  createEventSpreadsheet,
} from './lib/sheetsApi';
import { Navbar } from './components/Navbar';
import { DailySummaryView } from './components/DailySummaryView';
import { StatisticsView } from './components/StatisticsView';
import { SettlementView } from './components/SettlementView';
import { TransactionFormModal } from './components/TransactionFormModal';
import { SheetsModal } from './components/SheetsModal';
import { EventManagerModal } from './components/EventManagerModal';
import { ConfirmModal } from './components/ConfirmModal';

const STORAGE_KEY_EVENTS = 'event_expense_events_v2';
const STORAGE_KEY_ACTIVE_EVENT = 'event_expense_active_id_v2';
const STORAGE_KEY_TRANSACTIONS = 'event_expense_transactions_v2';

// Legacy keys for automatic migration
const LEGACY_STORAGE_KEY_CONFIG = 'event_expense_config_v1';
const LEGACY_STORAGE_KEY_TRANSACTIONS = 'event_expense_transactions_v1';

const INITIAL_EVENTS: EventConfig[] = [
  {
    id: 'event-1',
    title: '2026 하계 워크숍 및 경비 정산',
    description: '강원도 양양 펜션 워크숍 및 서핑 모임',
    startDate: '2026-08-22',
    endDate: '2026-08-23',
    totalBudget: 1200000,
    spreadsheetId: null,
    spreadsheetUrl: null,
    sheetName: '경비내역',
    gasWebAppUrl: null,
    members: ['김민수', '이서연', '박준형', '최지우', '정현우'],
    bankName: '카카오뱅크',
    accountNumber: '3333-01-9876543',
    accountHolder: '김민수',
    settlementMemo: '영수증 확인 후 이번 주 일요일까지 입금 부탁드립니다.',
    createdAt: Date.now() - 86400000 * 3,
    isArchived: false,
    color: 'indigo',
  },
  {
    id: 'event-2',
    title: '3분기 프로젝트 런칭 기념 회식',
    description: '강남역 삼겹살 & 2차 볼링장 모임',
    startDate: '2026-08-15',
    endDate: '2026-08-15',
    totalBudget: 500000,
    spreadsheetId: null,
    spreadsheetUrl: null,
    sheetName: '경비내역',
    gasWebAppUrl: null,
    members: ['김민수', '이서연', '박준형', '최지우', '윤도현', '한소희'],
    bankName: '토스뱅크',
    accountNumber: '1000-2345-6789',
    accountHolder: '이서연',
    settlementMemo: '카카오페이나 토스로 보내주시면 됩니다!',
    createdAt: Date.now() - 86400000 * 8,
    isArchived: false,
    color: 'blue',
  },
  {
    id: 'event-3',
    title: '제주도 힐링 동호회 여행',
    description: '서귀포 올레길 및 한라산 등반',
    startDate: '2026-07-10',
    endDate: '2026-07-12',
    totalBudget: 800000,
    spreadsheetId: null,
    spreadsheetUrl: null,
    sheetName: '경비내역',
    gasWebAppUrl: null,
    members: ['김민수', '박준형', '최지우', '강태오'],
    bankName: '국민은행',
    accountNumber: '479001-04-123456',
    accountHolder: '박준형',
    settlementMemo: '정산 완료되었습니다. 감사합니다!',
    createdAt: Date.now() - 86400000 * 40,
    isArchived: true,
    color: 'emerald',
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  // Event 1 Transactions
  {
    id: 'tx-1',
    eventId: 'event-1',
    date: '2026-08-22',
    time: '19:30',
    type: 'EXPENSE',
    category: '식비/회식',
    description: '저녁 삼겹살 & 음료 회식',
    amount: 165000,
    payer: '김민수',
    participants: ['김민수', '이서연', '박준형', '최지우', '정현우'],
    memo: '고기 5인분 + 냉면 + 음료',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'tx-2',
    eventId: 'event-1',
    date: '2026-08-22',
    time: '14:00',
    type: 'EXPENSE',
    category: '숙박비',
    description: '행사장 인근 펜션 예약금',
    amount: 280000,
    payer: '이서연',
    participants: ['김민수', '이서연', '박준형', '최지우', '정현우'],
    memo: '기준 5인실 1박',
    createdAt: Date.now() - 86400000 * 2 + 1000,
  },
  {
    id: 'tx-3',
    eventId: 'event-1',
    date: '2026-08-23',
    time: '10:30',
    type: 'EXPENSE',
    category: '교통/유류',
    description: '카풀 차량 주유비 및 톨게이트',
    amount: 45000,
    payer: '박준형',
    participants: ['김민수', '이서연', '박준형', '최지우', '정현우'],
    memo: '왕복 유류비 정산',
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'tx-4',
    eventId: 'event-1',
    date: '2026-08-23',
    time: '15:20',
    type: 'EXPENSE',
    category: '간식/음료',
    description: '오후 디저트 카페',
    amount: 32000,
    payer: '최지우',
    participants: ['김민수', '이서연', '박준형', '최지우'],
    memo: '정현우님 외출로 4인 참여',
    createdAt: Date.now() - 86400000 + 2000,
  },
  {
    id: 'tx-5',
    eventId: 'event-1',
    date: '2026-08-22',
    time: '11:00',
    type: 'INCOME',
    category: '회비납부',
    description: '1차 사전 회비 모금 (5만원x5명)',
    amount: 250000,
    payer: '김민수',
    participants: ['김민수'],
    memo: '김민수 계좌로 사전 수납',
    createdAt: Date.now() - 86400000 * 2 - 5000,
  },
  {
    id: 'tx-6',
    eventId: 'event-1',
    date: '2026-08-23',
    time: '18:00',
    type: 'EXPENSE',
    category: '물품/비품',
    description: '행사용 간식 및 생수 마트 장보기',
    amount: 58000,
    payer: '정현우',
    participants: ['김민수', '이서연', '박준형', '최지우', '정현우'],
    memo: '영수증 보관',
    createdAt: Date.now() - 4000000,
  },
  // Event 2 Transactions
  {
    id: 'tx-201',
    eventId: 'event-2',
    date: '2026-08-15',
    time: '18:30',
    type: 'EXPENSE',
    category: '식비/회식',
    description: '강남 삼겹살 1차 회식',
    amount: 184000,
    payer: '이서연',
    participants: ['김민수', '이서연', '박준형', '최지우', '윤도현', '한소희'],
    memo: '법카 한도 초과분 개인 결제',
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    id: 'tx-202',
    eventId: 'event-2',
    date: '2026-08-15',
    time: '21:00',
    type: 'EXPENSE',
    category: '체험/문화',
    description: '2차 락볼링장 게임비 및 맥주',
    amount: 96000,
    payer: '박준형',
    participants: ['김민수', '이서연', '박준형', '최지우', '윤도현'],
    memo: '한소희님 먼저 귀가',
    createdAt: Date.now() - 86400000 * 7 + 1000,
  },
  {
    id: 'tx-203',
    eventId: 'event-2',
    date: '2026-08-15',
    time: '17:00',
    type: 'INCOME',
    category: '지원금/보조금',
    description: '팀 분기 회식비 회사 지원금',
    amount: 150000,
    payer: '이서연',
    participants: ['이서연'],
    memo: '팀장 법인 계좌 지원 수령',
    createdAt: Date.now() - 86400000 * 7 - 5000,
  },
];

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Events state with migration support
  const [events, setEvents] = useState<EventConfig[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved events:', e);
      }
    }

    // Check legacy single-config storage
    const legacySaved = localStorage.getItem(LEGACY_STORAGE_KEY_CONFIG);
    if (legacySaved) {
      try {
        const parsedConfig = JSON.parse(legacySaved);
        return [
          {
            ...parsedConfig,
            id: 'event-1',
            totalBudget: parsedConfig.totalBudget ?? 1000000,
            gasWebAppUrl: parsedConfig.gasWebAppUrl ?? null,
            createdAt: Date.now(),
            isArchived: false,
          },
          ...INITIAL_EVENTS.slice(1),
        ];
      } catch (e) {
        console.error('Failed to parse legacy config:', e);
      }
    }

    return INITIAL_EVENTS;
  });

  // Current active event ID
  const [currentEventId, setCurrentEventId] = useState<string>(() => {
    const savedId = localStorage.getItem(STORAGE_KEY_ACTIVE_EVENT);
    if (savedId && events.some((e) => e.id === savedId)) {
      return savedId;
    }
    return events[0]?.id || 'event-1';
  });

  // Current active event object (fallback to first event or default)
  const currentEvent: EventConfig = useMemo(() => {
    const found = events.find((e) => e.id === currentEventId);
    return found || events[0] || INITIAL_EVENTS[0];
  }, [events, currentEventId]);

  // All transactions state
  const [allTransactions, setAllTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // ensure all have eventId
          return parsed.map((t) => ({
            ...t,
            eventId: t.eventId || 'event-1',
          }));
        }
      } catch (e) {
        console.error('Failed to parse transactions:', e);
      }
    }

    // Check legacy transactions
    const legacyTxs = localStorage.getItem(LEGACY_STORAGE_KEY_TRANSACTIONS);
    if (legacyTxs) {
      try {
        const parsed = JSON.parse(legacyTxs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((t) => ({ ...t, eventId: 'event-1' }));
        }
      } catch (e) {
        console.error('Failed to parse legacy transactions:', e);
      }
    }

    return INITIAL_TRANSACTIONS;
  });

  // Transactions filtered for currently selected event
  const currentTransactions: Transaction[] = useMemo(() => {
    return allTransactions.filter(
      (t) => (t.eventId || events[0]?.id || 'event-1') === currentEvent.id
    );
  }, [allTransactions, currentEvent.id, events]);

  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'STATS' | 'SETTLEMENT'>('SUMMARY');
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isEventManagerOpen, setIsEventManagerOpen] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Save events & transactions to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE_EVENT, currentEventId);
  }, [currentEventId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(allTransactions));
  }, [allTransactions]);

  // Initialize auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
        setIsAuthChecking(false);
      },
      () => {
        setUser(null);
        setIsAuthChecking(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Google Login
  const handleLogin = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        if (currentEvent.spreadsheetId) {
          handlePullFromSheets(currentEvent.spreadsheetId, currentEvent.sheetName);
        }
      }
    } catch (err: any) {
      alert(`로그인 실패: ${err.message || err}`);
    }
  };

  // Google Logout
  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  // Pull data from Google Sheets for current event
  const handlePullFromSheets = async (spreadsheetId: string, sheetName = '경비내역') => {
    setIsSyncing(true);
    try {
      const sheetTxs = await fetchTransactionsFromSheet(spreadsheetId, sheetName);
      if (sheetTxs && sheetTxs.length > 0) {
        // Tag with current eventId and merge
        const taggedSheetTxs = sheetTxs.map((t) => ({ ...t, eventId: currentEvent.id }));
        setAllTransactions((prev) => {
          const otherEventTxs = prev.filter((t) => (t.eventId || events[0]?.id) !== currentEvent.id);
          return [...taggedSheetTxs, ...otherEventTxs];
        });
      }
    } catch (err: any) {
      console.error('Fetch from sheet error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Force sync / Push all to Google Sheets for current event
  const handleForceSync = async () => {
    if (!currentEvent.spreadsheetId) {
      setIsSheetsModalOpen(true);
      return;
    }
    const token = await getAccessToken();
    if (!token) {
      handleLogin();
      return;
    }
    setIsSyncing(true);
    try {
      await syncAllTransactionsToSheet(
        currentEvent.spreadsheetId,
        currentTransactions,
        currentEvent.sheetName
      );
      alert(`'${currentEvent.title}' 스프레드시트에 데이터가 성공적으로 동기화되었습니다!`);
    } catch (err: any) {
      alert(`동기화 실패: ${err.message || err}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Connect spreadsheet to current event
  const handleConnectSpreadsheet = async (
    spreadsheetId: string,
    spreadsheetUrl?: string,
    title?: string
  ) => {
    const updatedEvents = events.map((e) =>
      e.id === currentEvent.id
        ? {
            ...e,
            spreadsheetId,
            spreadsheetUrl: spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
            title: title || e.title,
          }
        : e
    );
    setEvents(updatedEvents);

    // Initial sync of current event's transactions to sheet
    try {
      setIsSyncing(true);
      await syncAllTransactionsToSheet(spreadsheetId, currentTransactions, currentEvent.sheetName);
    } catch (err) {
      console.error('Initial sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Disconnect spreadsheet
  const handleDisconnectSpreadsheet = () => {
    setConfirmModal({
      isOpen: true,
      title: '구글 스프레드시트 연동 해제',
      message: `'${currentEvent.title}'의 스프레드시트 연동을 해제하시겠습니까? 로컬 데이터는 안전하게 보존됩니다.`,
      onConfirm: () => {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === currentEvent.id
              ? { ...e, spreadsheetId: null, spreadsheetUrl: null }
              : e
          )
        );
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // --- EVENT MANAGEMENT HANDLERS ---

  // Select / Switch active event
  const handleSelectEvent = (eventId: string) => {
    setCurrentEventId(eventId);
  };

  // Create new Event
  const handleCreateEvent = async (
    newEventData: Omit<EventConfig, 'id' | 'createdAt'>
  ): Promise<string> => {
    const newId = `event-${Date.now()}`;
    const newEvent: EventConfig = {
      ...newEventData,
      id: newId,
      createdAt: Date.now(),
      isArchived: false,
    };
    setEvents((prev) => [newEvent, ...prev]);
    setCurrentEventId(newId);
    return newId;
  };

  // Update existing Event
  const handleUpdateEvent = (eventId: string, updates: Partial<EventConfig>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, ...updates } : e))
    );
  };

  // Delete Event
  const handleDeleteEvent = (eventToDelete: EventConfig) => {
    if (events.length <= 1) {
      alert('최소 1개 이상의 행사가 유지되어야 합니다.');
      return;
    }

    const eventTxs = allTransactions.filter(
      (t) => (t.eventId || events[0]?.id) === eventToDelete.id
    );

    setConfirmModal({
      isOpen: true,
      title: '행사 삭제 확인',
      message: `'${eventToDelete.title}' 행사 및 관련 내역 ${eventTxs.length}건을 완전히 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
      onConfirm: () => {
        const remainingEvents = events.filter((e) => e.id !== eventToDelete.id);
        setEvents(remainingEvents);
        // remove transactions of this event
        setAllTransactions((prev) =>
          prev.filter((t) => (t.eventId || events[0]?.id) !== eventToDelete.id)
        );

        if (currentEventId === eventToDelete.id) {
          setCurrentEventId(remainingEvents[0].id);
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Duplicate Event (Clone members and configs)
  const handleDuplicateEvent = (sourceEvent: EventConfig) => {
    const newId = `event-${Date.now()}`;
    const clonedEvent: EventConfig = {
      ...sourceEvent,
      id: newId,
      title: `[복사본] ${sourceEvent.title}`,
      spreadsheetId: null,
      spreadsheetUrl: null,
      createdAt: Date.now(),
      isArchived: false,
    };
    setEvents((prev) => [clonedEvent, ...prev]);
    setCurrentEventId(newId);
    alert(`'${sourceEvent.title}' 행사가 복제되었습니다! 참여자 명단이 그대로 유지됩니다.`);
  };

  // Toggle Archive
  const handleToggleArchive = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, isArchived: !e.isArchived } : e
      )
    );
  };

  // --- TRANSACTION HANDLERS ---

  // Add or Edit Transaction
  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    id?: string
  ) => {
    if (id) {
      // Edit existing transaction
      const updated = allTransactions.map((t) =>
        t.id === id ? { ...t, ...data, eventId: currentEvent.id } : t
      );
      setAllTransactions(updated);

      // If connected to sheets for current event, sync
      if (currentEvent.spreadsheetId) {
        try {
          const token = await getAccessToken();
          if (token) {
            const currentEventUpdated = updated.filter(
              (t) => (t.eventId || events[0]?.id) === currentEvent.id
            );
            syncAllTransactionsToSheet(
              currentEvent.spreadsheetId,
              currentEventUpdated,
              currentEvent.sheetName
            );
          }
        } catch (e) {
          console.error('Sheet update error:', e);
        }
      }
    } else {
      // Create new transaction for current event
      const newTx: Transaction = {
        ...data,
        id: `tx-${Date.now()}`,
        eventId: currentEvent.id,
        createdAt: Date.now(),
      };
      const updated = [newTx, ...allTransactions];
      setAllTransactions(updated);

      // If connected to sheets, append
      if (currentEvent.spreadsheetId) {
        try {
          const token = await getAccessToken();
          if (token) {
            appendTransactionToSheet(
              currentEvent.spreadsheetId,
              newTx,
              currentEvent.sheetName
            );
          }
        } catch (e) {
          console.error('Sheet append error:', e);
        }
      }
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = (tx: Transaction) => {
    setConfirmModal({
      isOpen: true,
      title: '내역 삭제 확인',
      message: `'${tx.description}' (${tx.amount.toLocaleString()}원) 항목을 삭제하시겠습니까?\n이 작업은 구글 스프레드시트에도 반영됩니다.`,
      onConfirm: async () => {
        const updated = allTransactions.filter((t) => t.id !== tx.id);
        setAllTransactions(updated);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));

        if (currentEvent.spreadsheetId) {
          try {
            const token = await getAccessToken();
            if (token) {
              const currentEventUpdated = updated.filter(
                (t) => (t.eventId || events[0]?.id) === currentEvent.id
              );
              await syncAllTransactionsToSheet(
                currentEvent.spreadsheetId,
                currentEventUpdated,
                currentEvent.sheetName
              );
            }
          } catch (e) {
            console.error('Sheet delete sync error:', e);
          }
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Top Sticky Navbar with Event Switcher */}
      <Navbar
        user={user}
        events={events}
        currentEvent={currentEvent}
        isSyncing={isSyncing}
        isSheetConnected={Boolean(currentEvent.spreadsheetId)}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onOpenEventManager={() => setIsEventManagerOpen(true)}
        onSelectEvent={handleSelectEvent}
        onOpenCreateEvent={() => setIsEventManagerOpen(true)}
        onSync={handleForceSync}
        onUpdateTitle={(newTitle) =>
          handleUpdateEvent(currentEvent.id, { title: newTitle })
        }
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-4 pb-16">
        {/* Navigation Tabs (Mobile-Friendly Pill Navigation) */}
        <div className="flex p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('SUMMARY')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'SUMMARY'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>일자별 내역</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('STATS')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'STATS'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>실시간 통계</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SETTLEMENT')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'SETTLEMENT'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>1/N 정산서</span>
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === 'SUMMARY' && (
          <DailySummaryView
            transactions={currentTransactions}
            members={currentEvent.members}
            config={currentEvent}
            onUpdateBudget={(newBudget) =>
              handleUpdateEvent(currentEvent.id, { totalBudget: newBudget })
            }
            onEdit={(tx) => {
              setEditingTransaction(tx);
              setIsFormOpen(true);
            }}
            onDelete={handleDeleteTransaction}
            onAddNew={() => {
              setEditingTransaction(null);
              setIsFormOpen(true);
            }}
          />
        )}

        {activeTab === 'STATS' && (
          <StatisticsView
            transactions={currentTransactions}
            members={currentEvent.members}
            config={currentEvent}
          />
        )}

        {activeTab === 'SETTLEMENT' && (
          <SettlementView
            transactions={currentTransactions}
            members={currentEvent.members}
            config={currentEvent}
            onUpdateConfig={(updates) => handleUpdateEvent(currentEvent.id, updates)}
            onUpdateMembers={(newMembers) =>
              handleUpdateEvent(currentEvent.id, { members: newMembers })
            }
          />
        )}
      </main>

      {/* Floating Action Button (Quick Add on Mobile & Desktop) */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => {
            setEditingTransaction(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 hover:from-indigo-700 hover:to-blue-700 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>지출/수입 등록</span>
        </motion.button>
      </div>

      {/* Modals */}
      <TransactionFormModal
        isOpen={isFormOpen}
        editingTransaction={editingTransaction}
        members={currentEvent.members}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
      />

      <SheetsModal
        isOpen={isSheetsModalOpen}
        user={user}
        config={currentEvent}
        isSyncing={isSyncing}
        onClose={() => setIsSheetsModalOpen(false)}
        onLogin={handleLogin}
        onConnectSpreadsheet={handleConnectSpreadsheet}
        onForceSync={handleForceSync}
        onDisconnect={handleDisconnectSpreadsheet}
      />

      <EventManagerModal
        isOpen={isEventManagerOpen}
        events={events}
        currentEventId={currentEvent.id}
        transactions={allTransactions}
        onClose={() => setIsEventManagerOpen(false)}
        onSelectEvent={handleSelectEvent}
        onCreateEvent={handleCreateEvent}
        onUpdateEvent={handleUpdateEvent}
        onDeleteEvent={handleDeleteEvent}
        onDuplicateEvent={handleDuplicateEvent}
        onToggleArchive={handleToggleArchive}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
