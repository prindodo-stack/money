export type TransactionType = 'EXPENSE' | 'INCOME';

export interface Transaction {
  id: string;
  eventId?: string; // ID of the event this transaction belongs to
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  payer: string; // Person who paid or received
  participants: string[]; // People who share this expense
  memo?: string;
  createdAt: number;
}

export interface Member {
  id: string;
  name: string;
  accountInfo?: string;
}

export interface EventConfig {
  id: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  totalBudget: number; // 총 사업(행사) 예산
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  sheetName: string;
  gasWebAppUrl?: string | null; // Google Apps Script Web App URL
  members: string[];
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  settlementMemo?: string;
  createdAt: number;
  isArchived?: boolean;
  color?: string; // Theme accent color
}

export interface MemberTransactionShare {
  transactionId: string;
  date: string;
  description: string;
  category: string;
  totalAmount: number;
  payer: string;
  participantCount: number;
  myShare: number;
}

export interface MemberSettlement {
  name: string;
  totalPaid: number; // 총 결제한 금액 (내가 카드로 긁음/지출함)
  totalIncomeReceived: number; // 본인이 수납/보관한 수입 금액 (회비 등)
  totalShare: number; // 본인이 실질적으로 분담해야 할 금액 (1/N 지출 몫)
  netBalance: number; // totalPaid - totalShare (양수면 받을 돈, 음수면 보낼 돈)
  participatedCount: number; // 참여한 지출 건수
  paidCount: number; // 직접 결제한 건수
  breakdown: MemberTransactionShare[]; // 참여한 지출 항목 상세 내역
}

export interface TransferPlan {
  from: string;
  to: string;
  amount: number;
}

export interface SettlementReport {
  totalBudget: number;
  totalExpense: number;
  totalIncome: number;
  remainingBudget: number; // totalBudget - totalExpense
  budgetBurnRate: number; // (totalExpense / totalBudget) * 100
  netBalance: number;
  memberCount: number;
  memberSummaries: MemberSettlement[];
  transfers: TransferPlan[];
  generatedAt: string;
}

export const CATEGORIES = {
  EXPENSE: [
    { id: 'food', name: '식비/회식', icon: 'Utensils', color: 'bg-orange-500' },
    { id: 'stay', name: '숙박비', icon: 'Hotel', color: 'bg-indigo-500' },
    { id: 'transport', name: '교통/유류', icon: 'Car', color: 'bg-blue-500' },
    { id: 'snack', name: '간식/음료', icon: 'Coffee', color: 'bg-amber-500' },
    { id: 'entry', name: '대관/입장료', icon: 'Ticket', color: 'bg-emerald-500' },
    { id: 'supplies', name: '물품/비품', icon: 'ShoppingBag', color: 'bg-purple-500' },
    { id: 'activity', name: '체험/문화', icon: 'Sparkles', color: 'bg-pink-500' },
    { id: 'other_exp', name: '기타지출', icon: 'MoreHorizontal', color: 'bg-slate-500' },
  ],
  INCOME: [
    { id: 'fee', name: '회비납부', icon: 'Users', color: 'bg-teal-500' },
    { id: 'sponsor', name: '찬조/후원금', icon: 'Gift', color: 'bg-rose-500' },
    { id: 'support', name: '지원금/보조금', icon: 'Landmark', color: 'bg-cyan-500' },
    { id: 'refund', name: '환불/정산금', icon: 'RotateCcw', color: 'bg-green-500' },
    { id: 'other_inc', name: '기타수입', icon: 'PlusCircle', color: 'bg-emerald-600' },
  ],
} as const;

export const DEFAULT_MEMBERS = ['김민수', '이서연', '박준형', '최지우', '정현우'];
