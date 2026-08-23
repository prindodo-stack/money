import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileSpreadsheet,
  Plus,
  Link,
  ExternalLink,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Cloud,
  Check,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { EventConfig } from '../types';
import {
  createEventSpreadsheet,
  fetchSpreadsheetMetadata,
  listDriveSpreadsheets,
} from '../lib/sheetsApi';

interface SheetsModalProps {
  isOpen: boolean;
  user: User | null;
  config: EventConfig;
  isSyncing: boolean;
  onClose: () => void;
  onLogin: () => void;
  onConnectSpreadsheet: (spreadsheetId: string, spreadsheetUrl?: string, title?: string) => Promise<void>;
  onForceSync: () => Promise<void>;
  onDisconnect: () => void;
}

export const SheetsModal: React.FC<SheetsModalProps> = ({
  isOpen,
  user,
  config,
  isSyncing,
  onClose,
  onLogin,
  onConnectSpreadsheet,
  onForceSync,
  onDisconnect,
}) => {
  const [activeTab, setActiveTab] = useState<'CREATE' | 'LINK' | 'DRIVE'>('CREATE');
  const [newTitle, setNewTitle] = useState(config.title || '행사 경비 정산부');
  const [manualInput, setManualInput] = useState('');
  const [driveFiles, setDriveFiles] = useState<Array<{ id: string; name: string; webViewLink?: string }>>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load drive files if authenticated and tab is DRIVE
  useEffect(() => {
    if (isOpen && user && activeTab === 'DRIVE') {
      loadDriveFiles();
    }
  }, [isOpen, user, activeTab]);

  const loadDriveFiles = async () => {
    setIsLoadingDrive(true);
    setErrorMessage(null);
    try {
      const files = await listDriveSpreadsheets();
      setDriveFiles(files);
    } catch (err: any) {
      setErrorMessage(err.message || '드라이브 파일 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoadingDrive(false);
    }
  };

  // 1. Create New Spreadsheet
  const handleCreateNew = async () => {
    if (!user) {
      onLogin();
      return;
    }
    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const result = await createEventSpreadsheet(newTitle.trim() || '행사 경비 정산부');
      await onConnectSpreadsheet(result.spreadsheetId, result.spreadsheetUrl, newTitle);
      setSuccessMessage('구글 스프레드시트가 성공적으로 생성 및 연동되었습니다!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || '스프레드시트 생성 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Link Existing by URL/ID
  const handleLinkManual = async () => {
    if (!user) {
      onLogin();
      return;
    }
    const input = manualInput.trim();
    if (!input) return;

    let spreadsheetId = input;
    // Extract ID if URL: https://docs.google.com/spreadsheets/d/{ID}/edit...
    const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      spreadsheetId = match[1];
    }

    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const meta = await fetchSpreadsheetMetadata(spreadsheetId);
      const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
      await onConnectSpreadsheet(spreadsheetId, url, meta.title);
      setSuccessMessage(`'${meta.title}' 스프레드시트에 성공적으로 연동되었습니다!`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || '유효하지 않은 스프레드시트 ID 또는 URL입니다.');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Connect from Drive File
  const handleSelectDriveFile = async (file: { id: string; name: string; webViewLink?: string }) => {
    setActionLoading(true);
    setErrorMessage(null);
    try {
      const url = file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`;
      await onConnectSpreadsheet(file.id, url, file.name);
      setSuccessMessage(`'${file.name}'에 연동되었습니다!`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || '연동 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
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
            className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 shadow-2xl z-10 border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Google Sheets DB 연동
                  </h2>
                  <p className="text-xs text-slate-500">실시간 클라우드 영구 저장 및 엑셀 연동</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Auth Prompt if not logged in */}
              {!user && (
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-indigo-950 dark:text-indigo-200 text-center sm:text-left">
                    <p className="font-bold">Google 계정 로그인이 필요합니다</p>
                    <p className="text-indigo-600 dark:text-indigo-400 mt-0.5">
                      로그인하면 본인의 구글 드라이브에 시트가 생성/연동됩니다.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onLogin}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all shrink-0"
                  >
                    Google 로그인
                  </button>
                </div>
              )}

              {/* Connected Status Card if already connected */}
              {config.spreadsheetId && (
                <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                          연동된 스프레드시트
                        </div>
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                          {config.title || '경비 정산 시트'}
                        </div>
                      </div>
                    </div>

                    {config.spreadsheetUrl && (
                      <a
                        href={config.spreadsheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-xs hover:bg-slate-50 transition-colors shrink-0"
                      >
                        <span>시트 열기</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60 text-xs">
                    <button
                      type="button"
                      onClick={onForceSync}
                      disabled={isSyncing}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? '동기화 중...' : '전체 데이터 즉시 동기화'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={onDisconnect}
                      className="px-3 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-auto"
                    >
                      연동 해제
                    </button>
                  </div>
                </div>
              )}

              {/* Messages */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-900">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-900">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Tabs for Connecting */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {config.spreadsheetId ? '다른 시트로 변경하기' : '시트 연동 방법 선택'}
                </div>

                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveTab('CREATE')}
                    className={`py-2 rounded-xl transition-all ${
                      activeTab === 'CREATE'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    새 시트 생성
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('DRIVE')}
                    className={`py-2 rounded-xl transition-all ${
                      activeTab === 'DRIVE'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    드라이브에서 선택
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('LINK')}
                    className={`py-2 rounded-xl transition-all ${
                      activeTab === 'LINK'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    URL/ID 입력
                  </button>
                </div>

                {/* Tab 1: Create New */}
                {activeTab === 'CREATE' && (
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                      새로 생성할 스프레드시트 이름
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="예: 2026년 봄 워크숍 경비 정산"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleCreateNew}
                      disabled={actionLoading || !user}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{actionLoading ? '시트 생성 중...' : '원클릭으로 구글 시트 생성 및 연동'}</span>
                    </button>
                  </div>
                )}

                {/* Tab 2: Drive Select */}
                {activeTab === 'DRIVE' && (
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        최근 구글 드라이브 시트 파일
                      </span>
                      <button
                        type="button"
                        onClick={loadDriveFiles}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${isLoadingDrive ? 'animate-spin' : ''}`} />
                        <span>새로고침</span>
                      </button>
                    </div>

                    {isLoadingDrive ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        드라이브 파일 목록을 불러오는 중...
                      </div>
                    ) : driveFiles.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        드라이브에서 스프레드시트를 찾을 수 없습니다.
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {driveFiles.map((file) => (
                          <button
                            key={file.id}
                            type="button"
                            onClick={() => handleSelectDriveFile(file)}
                            disabled={actionLoading}
                            className="w-full py-2.5 px-2 text-left hover:bg-white dark:hover:bg-slate-800 rounded-lg flex items-center justify-between gap-2 text-xs transition-colors"
                          >
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {file.name}
                            </span>
                            <span className="text-[11px] font-bold text-indigo-600 shrink-0">
                              연동
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Link by ID / URL */}
                {activeTab === 'LINK' && (
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                      스프레드시트 URL 또는 ID
                    </label>
                    <input
                      type="text"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleLinkManual}
                      disabled={actionLoading || !manualInput.trim() || !user}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Link className="w-4 h-4" />
                      <span>{actionLoading ? '연동 중...' : '기존 시트에 연동하기'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
