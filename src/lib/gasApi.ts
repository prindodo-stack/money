import { Transaction, EventConfig } from '../types';

export interface GasResponse<T = any> {
  status: 'ok' | 'error';
  message?: string;
  data?: T;
  [key: string]: any;
}

/**
 * Format GAS Web App URL to ensure it has valid structure
 */
export function normalizeGasUrl(url: string): string {
  let cleaned = url.trim();
  if (cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }
  return cleaned;
}

/**
 * Test connectivity with GAS Web App endpoint
 */
export async function testGasConnection(webAppUrl: string): Promise<{ success: boolean; message: string; timestamp?: string }> {
  try {
    const url = new URL(normalizeGasUrl(webAppUrl));
    url.searchParams.set('action', 'ping');

    const res = await fetch(url.toString(), {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error(`HTTP 오류 (${res.status}): ${res.statusText}`);
    }

    const json = await res.json();
    if (json.status === 'ok') {
      return {
        success: true,
        message: json.message || 'GAS 백엔드 서버와 성공적으로 연결되었습니다!',
        timestamp: json.timestamp,
      };
    } else {
      throw new Error(json.message || 'GAS 응답 상태 에러');
    }
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'GAS 웹 앱에 연결할 수 없습니다. URL 및 배포 설정을 확인해주세요.',
    };
  }
}

/**
 * Fetch all data (config, transactions, budget summary) from GAS Web App
 */
export async function fetchAllDataFromGas(webAppUrl: string): Promise<{
  config?: Partial<EventConfig>;
  transactions?: Transaction[];
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  budgetSummary?: {
    totalBudget: number;
    totalExpense: number;
    totalIncome: number;
    remainingBudget: number;
    budgetBurnRate: number;
    transactionCount: number;
  };
}> {
  const url = new URL(normalizeGasUrl(webAppUrl));
  url.searchParams.set('action', 'getAllData');

  const res = await fetch(url.toString(), { method: 'GET' });
  if (!res.ok) {
    throw new Error(`GAS 데이터 조회 실패 (${res.status}): ${res.statusText}`);
  }

  const json = await res.json();
  if (json.status !== 'ok') {
    throw new Error(json.message || 'GAS 서버에서 오류를 반환했습니다.');
  }

  return {
    config: json.config,
    transactions: json.transactions,
    spreadsheetId: json.spreadsheetId,
    spreadsheetUrl: json.spreadsheetUrl,
    budgetSummary: json.budgetSummary,
  };
}

/**
 * Save / Update a transaction to GAS Web App
 */
export async function saveTransactionToGas(
  webAppUrl: string,
  transaction: Transaction
): Promise<boolean> {
  const url = normalizeGasUrl(webAppUrl);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Prevents preflight CORS issues with GAS
      },
      body: JSON.stringify({
        action: 'saveTransaction',
        transaction,
      }),
    });

    if (!res.ok) {
      throw new Error(`저장 실패 (${res.status})`);
    }
    return true;
  } catch (err) {
    console.error('GAS save transaction error:', err);
    throw err;
  }
}

/**
 * Delete a transaction from GAS Web App
 */
export async function deleteTransactionFromGas(
  webAppUrl: string,
  transactionId: string
): Promise<boolean> {
  const url = normalizeGasUrl(webAppUrl);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'deleteTransaction',
        id: transactionId,
      }),
    });

    if (!res.ok) {
      throw new Error(`삭제 실패 (${res.status})`);
    }
    return true;
  } catch (err) {
    console.error('GAS delete transaction error:', err);
    throw err;
  }
}

/**
 * Sync all transactions and config to GAS Web App (Bulk sync)
 */
export async function syncAllToGas(
  webAppUrl: string,
  transactions: Transaction[],
  config: EventConfig
): Promise<boolean> {
  const url = normalizeGasUrl(webAppUrl);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'syncAll',
        transactions,
        config: {
          title: config.title,
          totalBudget: config.totalBudget,
          members: config.members,
          bankName: config.bankName,
          accountNumber: config.accountNumber,
          accountHolder: config.accountHolder,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`전체 동기화 실패 (${res.status})`);
    }
    return true;
  } catch (err) {
    console.error('GAS bulk sync error:', err);
    throw err;
  }
}

/**
 * Update budget and config in GAS
 */
export async function updateGasConfig(
  webAppUrl: string,
  config: Partial<EventConfig>
): Promise<boolean> {
  const url = normalizeGasUrl(webAppUrl);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'updateConfig',
        config,
      }),
    });

    if (!res.ok) {
      throw new Error(`설정 업데이트 실패 (${res.status})`);
    }
    return true;
  } catch (err) {
    console.error('GAS update config error:', err);
    throw err;
  }
}
