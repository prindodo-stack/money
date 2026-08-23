/**
 * Google Apps Script (GAS) Backend Code Generator
 * Users can paste this script into Google Sheets -> Extensions -> Apps Script.
 */

export const GAS_BACKEND_CODE = `/**
 * ============================================================
 * [행사 경비 및 예산 정산 시스템 - GAS Backend API]
 * Google Apps Script Web App Backend
 * ============================================================
 * 
 * 🚀 배포 방법:
 * 1. 스프레드시트 메뉴 > [확장 프로그램] > [Apps Script] 클릭
 * 2. 이 코드 전체를 Code.gs에 덮어씌우기 후 저장 (Ctrl+S)
 * 3. 우측 상단 [배포] > [새 배포] 클릭
 * 4. 유형 선택(톱니바퀴) > [웹 앱] 선택
 * 5. 설정:
 *    - 설명: 경비 정산 백엔드 v1
 *    - 다음 사용자로 실행: [나] (Me)
 *    - 액세스 권한이 있는 사용자: [모든 사용자] (Anyone)  <-- 중요!
 * 6. [배포] 클릭 후 승인 절차 진행 -> 생성된 [웹 앱 URL] 복사
 * 7. 앱의 [GAS 연동] 창에 웹 앱 URL을 붙여넣고 연결 완료!
 */

var SHEET_NAME = '경비내역';
var CONFIG_SHEET_NAME = '_설정_';

var HEADERS = [
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
  '생성일시'
];

/**
 * GET 요청 핸들러 (CORS 지원)
 */
function doGet(e) {
  try {
    var params = e.parameter || {};
    var action = params.action || 'getAllData';
    var callback = params.callback; // JSONP 지원

    var result = {};

    if (action === 'ping') {
      result = { status: 'ok', timestamp: new Date().toISOString(), message: 'GAS 백엔드가 정상 작동 중입니다.' };
    } else if (action === 'getAllData') {
      result = handleGetAllData();
    } else if (action === 'getTransactions') {
      result = { status: 'ok', transactions: getTransactionsList() };
    } else if (action === 'getConfig') {
      result = { status: 'ok', config: getConfigData() };
    } else {
      result = { status: 'error', message: '알 수 없는 action: ' + action };
    }

    return createJsonResponse(result, callback);
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() }, e ? e.parameter.callback : null);
  }
}

/**
 * POST 요청 핸들러
 */
function doPost(e) {
  try {
    var postData = {};
    if (e && e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      postData = e.parameter;
    }

    var action = postData.action || 'saveTransaction';
    var result = {};

    if (action === 'saveTransaction') {
      result = handleSaveTransaction(postData.transaction);
    } else if (action === 'deleteTransaction') {
      result = handleDeleteTransaction(postData.id);
    } else if (action === 'updateConfig') {
      result = handleUpdateConfig(postData.config);
    } else if (action === 'syncAll') {
      result = handleSyncAll(postData.transactions, postData.config);
    } else {
      result = { status: 'error', message: '알 수 없는 POST action: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 시트 준비 및 초기화
 */
function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME, 0);
    // 헤더 추가
    sheet.appendRow(HEADERS);
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground('#4F46E5');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getOrCreateConfigSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG_SHEET_NAME);
    sheet.appendRow(['KEY', 'VALUE']);
    sheet.getRange(1, 1, 1, 2).setBackground('#334155').setFontColor('#FFFFFF').setFontWeight('bold');
    sheet.hideSheet(); // 설정 시트는 숨김
  }
  return sheet;
}

/**
 * 설정 불러오기
 */
function getConfigData() {
  var sheet = getOrCreateConfigSheet();
  var data = sheet.getDataRange().getValues();
  var config = {
    totalBudget: 1500000,
    title: SpreadsheetApp.getActiveSpreadsheet().getName(),
    members: ['김민수', '이서연', '박준형', '최지우', '정현우']
  };

  for (var i = 1; i < data.length; i++) {
    var key = data[i][0];
    var val = data[i][1];
    if (key === 'totalBudget') config.totalBudget = Number(val) || 0;
    if (key === 'title') config.title = String(val);
    if (key === 'members') config.members = String(val).split(',').map(function(s) { return s.trim(); });
    if (key === 'bankName') config.bankName = String(val);
    if (key === 'accountNumber') config.accountNumber = String(val);
    if (key === 'accountHolder') config.accountHolder = String(val);
  }
  return config;
}

/**
 * 설정 저장
 */
function handleUpdateConfig(newConfig) {
  if (!newConfig) return { status: 'error', message: '설정 데이터가 없습니다.' };
  var sheet = getOrCreateConfigSheet();
  sheet.clearContents();
  sheet.appendRow(['KEY', 'VALUE']);
  sheet.getRange(1, 1, 1, 2).setBackground('#334155').setFontColor('#FFFFFF').setFontWeight('bold');

  if (newConfig.totalBudget !== undefined) sheet.appendRow(['totalBudget', newConfig.totalBudget]);
  if (newConfig.title) sheet.appendRow(['title', newConfig.title]);
  if (newConfig.members) sheet.appendRow(['members', newConfig.members.join(',')]);
  if (newConfig.bankName) sheet.appendRow(['bankName', newConfig.bankName]);
  if (newConfig.accountNumber) sheet.appendRow(['accountNumber', newConfig.accountNumber]);
  if (newConfig.accountHolder) sheet.appendRow(['accountHolder', newConfig.accountHolder]);

  return { status: 'ok', config: getConfigData() };
}

/**
 * 모든 트랜잭션 목록 조회
 */
function getTransactionsList() {
  var sheet = getOrCreateSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  var data = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  var transactions = [];

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (!row[0] && !row[5]) continue; // 빈 행 스킵

    var participantsStr = String(row[8] || '');
    var participants = participantsStr ? participantsStr.split(',').map(function(s) { return s.trim(); }) : [];

    transactions.push({
      id: String(row[0] || 'tx-' + (i + 1)),
      date: formatDate(row[1]),
      time: String(row[2] || ''),
      type: String(row[3] || 'EXPENSE'),
      category: String(row[4] || '기타'),
      description: String(row[5] || ''),
      amount: Number(row[6]) || 0,
      payer: String(row[7] || ''),
      participants: participants,
      memo: String(row[9] || ''),
      createdAt: row[10] ? new Date(row[10]).getTime() : Date.now()
    });
  }

  return transactions;
}

/**
 * 전체 데이터 한번에 조회 (프론트엔드 초기화용)
 */
function handleGetAllData() {
  var transactions = getTransactionsList();
  var config = getConfigData();
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var totalExpense = 0;
  var totalIncome = 0;
  for (var i = 0; i < transactions.length; i++) {
    if (transactions[i].type === 'EXPENSE') totalExpense += transactions[i].amount;
    else totalIncome += transactions[i].amount;
  }

  var remainingBudget = config.totalBudget - totalExpense;
  var budgetBurnRate = config.totalBudget > 0 ? (totalExpense / config.totalBudget) * 100 : 0;

  return {
    status: 'ok',
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl(),
    config: config,
    transactions: transactions,
    budgetSummary: {
      totalBudget: config.totalBudget,
      totalExpense: totalExpense,
      totalIncome: totalIncome,
      remainingBudget: remainingBudget,
      budgetBurnRate: budgetBurnRate,
      transactionCount: transactions.length
    }
  };
}

/**
 * 단일 내역 추가/수정
 */
function handleSaveTransaction(tx) {
  if (!tx) return { status: 'error', message: '내역 데이터가 없습니다.' };
  var sheet = getOrCreateSheet();
  var lastRow = sheet.getLastRow();
  
  var targetRowIndex = -1;
  if (tx.id && lastRow > 1) {
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(tx.id)) {
        targetRowIndex = i + 2;
        break;
      }
    }
  }

  var rowData = [
    tx.id || ('tx-' + Date.now()),
    tx.date || new Date().toISOString().split('T')[0],
    tx.time || '',
    tx.type || 'EXPENSE',
    tx.category || '식비/회식',
    tx.description || '',
    Number(tx.amount) || 0,
    tx.payer || '',
    (tx.participants && tx.participants.length > 0) ? tx.participants.join(', ') : '',
    tx.memo || '',
    new Date().toLocaleString('ko-KR')
  ];

  if (targetRowIndex > 0) {
    sheet.getRange(targetRowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  return { status: 'ok', transaction: tx };
}

/**
 * 단일 내역 삭제
 */
function handleDeleteTransaction(id) {
  if (!id) return { status: 'error', message: 'ID가 필요합니다.' };
  var sheet = getOrCreateSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { status: 'ok', message: '삭제할 데이터 없음' };

  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      sheet.deleteRow(i + 2);
      return { status: 'ok', message: '삭제 완료' };
    }
  }
  return { status: 'ok', message: '해당 ID를 찾지 못함' };
}

/**
 * 전체 동기화 (앱 -> 시트 덮어쓰기)
 */
function handleSyncAll(transactions, config) {
  var sheet = getOrCreateSheet();
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 기존 데이터 지우기
  sheet.clear();
  sheet.appendRow(HEADERS);
  var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setBackground('#4F46E5');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);

  if (transactions && transactions.length > 0) {
    var rows = transactions.map(function(t) {
      return [
        t.id,
        t.date,
        t.time || '',
        t.type,
        t.category,
        t.description,
        Number(t.amount) || 0,
        t.payer,
        (t.participants && t.participants.length > 0) ? t.participants.join(', ') : '',
        t.memo || '',
        new Date(t.createdAt || Date.now()).toLocaleString('ko-KR')
      ];
    });
    sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
  }

  if (config) {
    handleUpdateConfig(config);
  }

  return {
    status: 'ok',
    message: '성공적으로 전체 동기화되었습니다.',
    count: transactions ? transactions.length : 0
  };
}

function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, 'Asia/Seoul', 'yyyy-MM-dd');
  }
  return String(val);
}

function createJsonResponse(obj, callback) {
  var json = JSON.stringify(obj);
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}
`;
