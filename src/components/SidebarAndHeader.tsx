import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  PlaySquare,
  CheckSquare,
  Calendar,
  GraduationCap,
  BarChart3,
  Settings,
  Menu,
  X,
  Plus,
  Cloud,
  LogOut,
} from 'lucide-react';
import { ActiveTab } from '../types/mission';
import { useMission } from '../context/MissionContext';

interface SidebarAndHeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onOpenAuthModal: () => void;
  onQuickAddLecture: () => void;
}

const NAV_ITEMS: { id: ActiveTab; label: string; shortLabel: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Daily Dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard },
  { id: 'subjects', label: 'Subjects & Chapters', shortLabel: 'Chapters', icon: BookOpen },
  { id: 'lectures', label: 'Lecture Tracker', shortLabel: 'Lectures', icon: PlaySquare },
  { id: 'planner', label: 'Daily Planner', shortLabel: 'Planner', icon: CheckSquare },
  { id: 'calendar', label: '21-Day Calendar', shortLabel: 'Calendar', icon: Calendar },
  { id: 'nios', label: 'NIOS Manager', shortLabel: 'NIOS', icon: GraduationCap },
  { id: 'analytics', label: 'Analytics', shortLabel: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings & Data', shortLabel: 'Settings', icon: Settings },
];

export const SidebarNavigation: React.FC<SidebarAndHeaderProps> = ({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  onOpenAuthModal,
}) => {
  const { summary, user, logoutUser } = useMission();

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#111A2D] border-r border-[#1E293B] w-60 select-none">
      {/* Brand Unit */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-[#1E293B]">
        <button
          type="button"
          onClick={() => {
            setActiveTab('dashboard');
            setMobileMenuOpen(false);
          }}
          className="text-left focus:outline-none"
        >
          <span className="text-base font-extrabold tracking-tight text-white font-display whitespace-nowrap">
            JEE MISSION 21
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close navigation menu"
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mission Day Progress Compact Widget */}
      <div className="p-4 border-b border-[#1E293B]">
        <div className="p-3.5 rounded-xl bg-[#16223B] border border-[#2B3954]">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
            <span className="font-semibold text-white">
              Day {summary.currentDayNumber} of {summary.challengeDurationDays}
            </span>
            <span className="font-mono tabular-nums text-[#8B5CF6] font-bold">
              {summary.completedTodayTotal}/{summary.dailyTargetTotal}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#0C1424] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] transition-all duration-200"
              style={{ width: `${summary.todayCompletionPercent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums">
            <span>Backlog: {summary.remainingBacklogLectures} left</span>
            <span>{summary.overallCompletionPercent}%</span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Rail */}
      <nav aria-label="Sidebar Navigation" className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#8B5CF6] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#16223B]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Account & Firebase Sync Footer */}
      <div className="p-3 border-t border-[#1E293B] space-y-2">
        <button
          type="button"
          onClick={onOpenAuthModal}
          className="w-full px-3 py-2 rounded-xl bg-[#0C1424] hover:bg-[#16223B] border border-[#1E293B] flex items-center justify-between text-xs text-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate">
            <Cloud className="w-3.5 h-3.5 text-[#06B6D4] shrink-0" />
            <span className="truncate font-medium">
              {user ? user.email : 'Connect Cloud Account'}
            </span>
          </div>
        </button>

        {user && (
          <button
            type="button"
            onClick={logoutUser}
            className="w-full px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden lg:block shrink-0">{renderSidebarContent()}</aside>

      {/* Mobile Sliding Sheet Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10">{renderSidebarContent()}</div>
        </div>
      )}
    </>
  );
};

export const TopHeaderBar: React.FC<{
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  setMobileMenuOpen: (open: boolean) => void;
  onQuickAddLecture: () => void;
}> = ({ activeTab, setActiveTab, setMobileMenuOpen, onQuickAddLecture }) => {
  const activeItem = NAV_ITEMS.find((n) => n.id === activeTab) || NAV_ITEMS[0];
  return (
    <header className="h-16 px-5 lg:px-7 bg-[#111A2D] border-b border-[#1E293B] flex items-center justify-between gap-8 shrink-0">
      {/* Zone 1: Brand / Contextual Breadcrumb */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#16223B]"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold tracking-tight text-white font-display whitespace-nowrap shrink-0">
          JEE MISSION 21 <span className="text-slate-500 font-normal mx-1.5">/</span>{' '}
          <span className="text-slate-300 font-semibold">{activeItem.label}</span>
        </span>
      </div>

      {/* Zone 2: 5 Concise Single-Line Navigation Links */}
      <nav aria-label="Top Quick Navigation" className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
        {(['dashboard', 'lectures', 'planner', 'calendar', 'analytics'] as ActiveTab[]).map((id) => {
          const item = NAV_ITEMS.find((n) => n.id === id)!;
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'text-white underline underline-offset-8 decoration-[#8B5CF6] decoration-2 font-semibold'
                  : 'hover:text-white'
              }`}
            >
              {item.shortLabel}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 Primary Action Button */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onQuickAddLecture}
          className="px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Lecture</span>
        </button>
      </div>
    </header>
  );
};
