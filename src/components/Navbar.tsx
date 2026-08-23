import React, { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  Edit3,
  Check,
  X,
  LogOut,
  Sparkles,
  Cloud,
  CloudOff,
  ChevronDown,
  Calendar,
  Plus,
  Layers,
  FolderOpen,
} from 'lucide-react';
import { EventConfig } from '../types';

interface NavbarProps {
  user: User | null;
  events: EventConfig[];
  currentEvent: EventConfig;
  isSyncing: boolean;
  isSheetConnected: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onOpenSheetsModal: () => void;
  onOpenEventManager: () => void;
  onSelectEvent: (eventId: string) => void;
  onOpenCreateEvent: () => void;
  onSync: () => void;
  onUpdateTitle: (newTitle: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  events,
  currentEvent,
  isSyncing,
  isSheetConnected,
  onLogin,
  onLogout,
  onOpenSheetsModal,
  onOpenEventManager,
  onSelectEvent,
  onOpenCreateEvent,
  onSync,
  onUpdateTitle,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(currentEvent.title);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitleInput(currentEvent.title);
  }, [currentEvent.title]);

  // Click outside listener for event dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveTitle = () => {
    if (titleInput.trim()) {
      onUpdateTitle(titleInput.trim());
      setIsEditingTitle(false);
    }
  };

  const activeEvents = events.filter((e) => !e.isArchived);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 dark:bg-slate-900/90 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-2.5 sm:gap-3">
          {/* Left: App Logo & Event Title & Switcher */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            {/* Event Manager Launcher Icon */}
            <button
              type="button"
              onClick={onOpenEventManager}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              title="전체 행사 목록 및 관리 열기"
            >
              <FileSpreadsheet className="w-5 h-5" />
            </button>

            <div className="min-w-0 flex-1">
              {isEditingTitle ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                    className="px-2 py-1 text-sm sm:text-base font-bold rounded-lg border border-indigo-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500 w-full max-w-xs"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveTitle}
                    className="p-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    title="저장"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTitleInput(currentEvent.title);
                      setIsEditingTitle(false);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="취소"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative inline-block max-w-full" ref={dropdownRef}>
                  <div className="flex items-center gap-1.5 max-w-full">
                    {/* Event Switcher Button */}
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen((prev) => !prev)}
                      className="group flex items-center gap-1.5 text-left text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-0.5 rounded-lg max-w-full"
                    >
                      <h1 className="text-sm sm:text-base font-extrabold truncate max-w-[160px] sm:max-w-[280px]">
                        {currentEvent.title || '행사 경비 정산'}
                      </h1>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                          {events.length}개 행사
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-transform duration-200 ${
                            isDropdownOpen ? 'rotate-180 text-indigo-600' : ''
                          }`}
                        />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTitleInput(currentEvent.title);
                        setIsEditingTitle(true);
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-600 opacity-60 hover:opacity-100 transition-opacity shrink-0"
                      title="행사명 즉시 수정"
                    >
                      <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>

                  {/* Dropdown Menu for Quick Event Switch */}
                  {isDropdownOpen && (
                    <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 dark:border-slate-800 mb-1">
                        <span>행사 목록 ({activeEvents.length})</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onOpenEventManager();
                          }}
                          className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 capitalize font-bold"
                        >
                          <Layers className="w-3 h-3" />
                          <span>전체 관리</span>
                        </button>
                      </div>

                      <div className="max-h-60 overflow-y-auto px-1.5 py-1 space-y-0.5">
                        {activeEvents.map((ev) => {
                          const isSelected = ev.id === currentEvent.id;
                          return (
                            <button
                              key={ev.id}
                              type="button"
                              onClick={() => {
                                onSelectEvent(ev.id);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-xs transition-colors ${
                                isSelected
                                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium'
                              }`}
                            >
                              <div className="min-w-0 flex-1 truncate">
                                <div className="truncate">{ev.title}</div>
                                <div className="text-[10px] text-slate-400 font-normal">
                                  {ev.members.length}명 참여 {ev.startDate ? `• ${ev.startDate}` : ''}
                                </div>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      <div className="px-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onOpenCreateEvent();
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>새 행사 만들기</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-status: Sheets connection indicator */}
              <div className="flex items-center gap-2 mt-0.5 text-xs">
                {isSheetConnected ? (
                  <button
                    type="button"
                    onClick={onOpenSheetsModal}
                    className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>구글 시트 연동됨</span>
                    {currentEvent.spreadsheetUrl && (
                      <a
                        href={currentEvent.spreadsheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center text-slate-400 hover:text-indigo-600 ml-0.5"
                        title="구글 스프레드시트 새창에서 열기"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenSheetsModal}
                    className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium hover:underline cursor-pointer"
                  >
                    <CloudOff className="w-3.5 h-3.5" />
                    <span>로컬 모드 (시트 미연동)</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions, Event Manager button, and User Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Event Manager Button */}
            <button
              type="button"
              onClick={onOpenEventManager}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
              title="행사 목록 및 관리"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">행사 관리</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px]">
                {events.length}
              </span>
            </button>

            {/* Sync button */}
            {isSheetConnected && (
              <button
                type="button"
                onClick={onSync}
                disabled={isSyncing}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="스프레드시트 동기화"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
              </button>
            )}

            {/* Google Sheets Modal Button */}
            <button
              type="button"
              onClick={onOpenSheetsModal}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>시트 설정</span>
            </button>

            {/* Auth Button */}
            {user ? (
              <div className="flex items-center gap-1.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || '사용자'}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700"
                    title={`${user.displayName || user.email}`}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                  title="로그아웃"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span className="hidden sm:inline">Google 로그인</span>
                <span className="sm:hidden">로그인</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
