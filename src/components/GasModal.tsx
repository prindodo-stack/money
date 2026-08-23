import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Play,
  Terminal,
  Layers,
  ArrowRight,
  Sparkles,
  Cloud,
  FileSpreadsheet,
} from 'lucide-react';
import { EventConfig, Transaction } from '../types';
import { GAS_BACKEND_CODE } from '../lib/gasCode';
import {
  testGasConnection,
  fetchAllDataFromGas,
  syncAllToGas,
} from '../lib/gasApi';

interface GasModalProps {
  isOpen: boolean;
  config: EventConfig;
  transactions: Transaction[];
  onClose: () => void;
  onUpdateGasUrl: (url: string | null) => void;
  onImportFromGas: (data: { config?: Partial<EventConfig>; transactions?: Transaction[] }) => void;
}

export const GasModal: React.FC<GasModalProps> = ({
  isOpen,
  config,
  transactions,
  onClose,
  onUpdateGasUrl,
  onImportFromGas,
}) => {
  const [activeTab, setActiveTab] = useState<'DEPLOY_GUIDE' | 'CODE' | 'CONNECT'>('CONNECT');
  const [urlInput, setUrlInput] = useState(config.gasWebAppUrl || '');
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GAS_BACKEND_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTestAndSave = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      onUpdateGasUrl(null);
      setTestResult({ success: true, message: 'GAS 연동이 해제되었습니다.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await testGasConnection(trimmed);
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      onUpdateGasUrl(trimmed);
    }
  };

  const handleFetchFromGas = async () => {
    if (!config.gasWebAppUrl) {
      alert('먼저 GAS 웹 앱 URL을 등록하고 테스트를 완료해주세요.');
      return;
    }
    setIsSyncing(true);
    try {
      const data = await fetchAllDataFromGas(config.gasWebAppUrl);
      onImportFromGas({
        config: data.config,
        transactions: data.transactions,
      });
      alert('Google Apps Script에서 최신 데이터를 성공적으로 가져왔습니다!');
    } catch (err: any) {
      alert(`데이터 가져오기 실패: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePushAllToGas = async () => {
    if (!config.gasWebAppUrl) {
      alert('먼저 GAS 웹 앱 URL을 등록해주세요.');
      return;
    }
    setIsSyncing(true);
    try {
      await syncAllToGas(config.gasWebAppUrl, transactions, config);
      alert('현재 앱의 모든 예산 및 지출 내역이 구글 시트(GAS)로 성공적으로 동기화되었습니다!');
    } catch (err: any) {
      alert(`GAS 동기화 실패: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  Google Apps Script (GAS) 백엔드 연동
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase">
                  Full-Stack
                </span>
              </div>
              <p className="text-xs text-teal-100 mt-0.5">
                구글 스프레드시트를 전용 서버리스 백엔드 데이터베이스로 직접 활용합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 pt-3 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('CONNECT')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'CONNECT'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>1. 웹 앱 URL 연결</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DEPLOY_GUIDE')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'DEPLOY_GUIDE'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>2. 3분 배포 가이드</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CODE')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'CODE'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>3. Code.gs 스크립트 코드</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-slate-700 dark:text-slate-300 text-sm">
          {activeTab === 'CONNECT' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                      Google Apps Script Web App 동작 원리
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 leading-relaxed">
                      구글 스프레드시트의 Apps Script를 웹 앱(Web App)으로 배포하면, 본 웹 프론트엔드와 실시간 양방향 통신(API)을 수행하며 모든 예산과 지출 내역, 1/N 정산 계산을 구글 시트 백엔드에 안전하게 저장합니다.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  배포된 GAS 웹 앱 URL (Web App URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleTestAndSave}
                    disabled={isTesting}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-xs"
                  >
                    {isTesting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>연결 및 저장</span>
                  </button>
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="leading-relaxed">
                    <span className="font-bold">
                      {testResult.success ? '연결 성공:' : '연결 실패:'}
                    </span>{' '}
                    {testResult.message}
                  </div>
                </div>
              )}

              {/* Two-way Sync Controls */}
              {config.gasWebAppUrl && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        GAS 백엔드 활성화됨
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      현재 행사: {config.title}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleFetchFromGas}
                      disabled={isSyncing}
                      className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>GAS에서 최신 데이터 가져오기</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePushAllToGas}
                      disabled={isSyncing}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Cloud className="w-3.5 h-3.5" />
                      <span>앱 전체 데이터 GAS로 밀어넣기</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'DEPLOY_GUIDE' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                📌 3분 안에 완성하는 GAS 웹 앱 배포 가이드
              </h4>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      스프레드시트에서 Apps Script 열기
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      구글 스프레드시트 상단 메뉴에서 <b>[확장 프로그램]</b> &gt; <b>[Apps Script]</b>를 클릭합니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Code.gs 코드 붙여넣기
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      [3. Code.gs 스크립트 코드] 탭에서 [코드 복사] 버튼을 누른 후, 에디터의 기존 코드를 지우고 붙여넣고 저장(Ctrl+S)합니다.
                    </p>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]"
                    >
                      {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? '복사 완료!' : 'Code.gs 코드 원클릭 복사'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      웹 앱으로 배포 설정 (가장 중요)
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      우측 상단 <b>[배포]</b> &gt; <b>[새 배포]</b> 클릭 &gt; 유형 톱니바퀴에서 <b>[웹 앱]</b> 선택<br />
                      • <b>다음 사용자로 실행</b>: <b>나(내 계정)</b><br />
                      • <b>액세스 권한이 있는 사용자</b>: <b>모든 사용자(Anyone)</b> 선택 후 [배포] 클릭!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      URL 복사 및 연결
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      배포 완료 창에 표시된 <b>웹 앱 URL</b>(https://script.google.com/.../exec)을 복사하여 [1. 웹 앱 URL 연결] 탭에 붙여넣으면 완료됩니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'CODE' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Google Apps Script 백엔드 코드 (Code.gs)
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? '복사 완료!' : '전체 코드 복사'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-80 border border-slate-800 leading-relaxed">
                {GAS_BACKEND_CODE}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            {config.gasWebAppUrl ? '🟢 GAS 백엔드 주소 등록됨' : '⚪ GAS 백엔드 미연결 상태'}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs"
          >
            닫기
          </button>
        </div>
      </motion.div>
    </div>
  );
};
