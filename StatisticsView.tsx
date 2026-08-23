import { Transaction } from '../types';
import { getAccessToken } from './auth';

const HEADER_ROW = [
  'ID',
  '날짜',
  '시간',
  '구분',
  '카테고리',
  '항목명',
  '금액',
  '결제/수납자',
  '정산참여자',
  '메모',
  '생성일시',
];

export async function createEventSpreadsheet(
  title: string = '행사 경비 정산부'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; sheetName: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google 계정 로그인이 필요합니다.');
  }

  const sheetName = '경비내역';

  const body = {
    properties: {
      title: `[경비정산] ${title} - ${new Date().toLocaleDateString('ko-KR')}`,
    },
    sheets: [
      {
        properties: {
          title: sheetName,
          gridProperties: {
            frozenRowCount: 1,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: HEADER_ROW.map((header) => ({
                  userEnteredValue: { stringValue: header },
                  userEnteredFormat: {
                    textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                    backgroundColor: { red: 0.15, green: 0.38, blue: 0.72 },
                    horizontalAlignment: 'CENTER',
                  },
                })),
              },
            ],
          },
        ],
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create spreadsheet error:', errorText);
    throw new Error(`스프레드시트 생성 실패: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl,
    sheetName: sheetName,
  };
}

export async function fetchSpreadsheetMetadata(spreadsheetId: string): Promise<{ title: string; firstSheetName: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google 계정 로그인이 필요합니다.');
  }

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties.title`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`스프레드시트 정보 조회 실패: ${res.statusText}`);
  }

  const data = await res.json();
  const title = data.properties?.title || '스프레드시트';
  const firstSheetName = data.sheets?.[0]?.properties?.title || '경비내역';

  return { title, firstSheetName };
}

export async function fetchTransactionsFromSheet(
  spreadsheetId: string,
  sheetName: string = '경비내역'
): Promise<Transaction[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google 계정 로그인이 필요합니다.');
  }

  const range = encodeURIComponent(`${sheetName}!A2:K`);
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`데이터 조회 실패 (${response.status})`);
  }

  const data = await response.json();
  const rows = data.values || [];

  const transactions: Transaction[] = [];

  for (const row of rows) {
    if (!row || row.length === 0 || !row[0]) continue;
    const [id, date, time, typeStr, category, description, amountStr, payer, participantsStr, memo, createdAtStr] = row;

    const amount = Number(String(amountStr).replace(/[^0-9.-]+/g, '')) || 0;
    const type = typeStr === '수입' ? 'INCOME' : 'EXPENSE';
    const participants = participantsStr
      ? String(participantsStr).split(',').map((p: string) => p.trim()).filter(Boolean)
      : [];
    const createdAt = createdAtStr ? Number(createdAtStr) : Date.now();

    transactions.push({
      id: String(id),
      date: String(date || new Date().toISOString().split('T')[0]),
      time: time ? String(time) : undefined,
      type,
      category: String(category || '기타'),
      description: String(description || '내역 없음'),
      amount,
      payer: String(payer || '미지정'),
      participants: participants.length > 0 ? participants : [String(payer || '전체')],
      memo: memo ? String(memo) : '',
      createdAt: isNaN(createdAt) ? Date.now() : createdAt,
    });
  }

  return transactions;
}

export async function appendTransactionToSheet(
  spreadsheetId: string,
  transaction: Transaction,
  sheetName: string = '경비내역'
): Promise<void> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google 계정 로그인이 필요합니다.');
  }

  const range = encodeURIComponent(`${sheetName}!A:K`);
  const rowValues = [
    transaction.id,
    transaction.date,
    transaction.time || '',
    transaction.type === 'INCOME' ? '수입' : '지출',
    transaction.category,
    transaction.description,
    transaction.amount,
    transaction.payer,
    transaction.participants.join(', '),
    transaction.memo || '',
    transaction.createdAt,
  ];

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowValues],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Append transaction error:', errorText);
    throw new Error(`구글 시트 저장 실패 (${response.status})`);
  }
}

export async function syncAllTransactionsToSheet(
  spreadsheetId: string,
  transactions: Transaction[],
  sheetName: string = '경비내역'
): Promise<void> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google 계정 로그인이 필요합니다.');
  }

  const rows = [
    HEADER_ROW,
    ...transactions.map((t) => [
      t.id,
      t.date,
      t.time || '',
      t.type === 'INCOME' ? '수입' : '지출',
      t.category,
      t.description,
      t.amount,
      t.payer,
      t.participants.join(', '),
      t.memo || '',
      t.createdAt,
    ]),
  ];

  // First clear the sheet
  const clearRange = encodeURIComponent(`${sheetName}!A1:K1000`);
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${clearRange}:clear`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  // Then update with new rows
  const updateRange = encodeURIComponent(`${sheetName}!A1:K${rows.length}`);
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${updateRange}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`동기화 실패 (${response.status})`);
  }
}

export async function listDriveSpreadsheets(): Promise<Array<{ id: string; name: string; webViewLink?: string }>> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google 계정 로그인이 필요합니다.');
  }

  const q = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=modifiedTime desc&pageSize=15&fields=files(id,name,webViewLink)`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('구글 드라이브 파일 목록을 가져오지 못했습니다.');
  }

  const data = await response.json();
  return data.files || [];
}
