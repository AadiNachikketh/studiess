/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MissionProvider, useMission } from './context/MissionContext';
import { ActiveTab } from './types/mission';
import { SidebarNavigation, TopHeaderBar } from './components/SidebarAndHeader';
import { DashboardView } from './components/DashboardView';
import { SubjectsChaptersView } from './components/SubjectsChaptersView';
import { LectureTrackerView } from './components/LectureTrackerView';
import { DailyPlannerView } from './components/DailyPlannerView';
import { Calendar21View } from './components/Calendar21View';
import { NiosManagerView } from './components/NiosManagerView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsDataView } from './components/SettingsDataView';
import { AuthGateModal } from './components/AuthGateModal';

const MissionAppContent: React.FC = () => {
  const { isWorkspaceActive, authLoading } = useMission();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedChapterFilter, setSelectedChapterFilter] = useState<string>('All');
  const [quickAddLectureSignal, setQuickAddLectureSignal] = useState<boolean>(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#080D1B] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#111A2D] border border-[#1E293B] rounded-2xl p-6 space-y-4 animate-pulse">
          <div className="h-5 w-44 bg-[#16223B] rounded" />
          <div className="h-3 w-64 bg-[#16223B] rounded" />
          <div className="h-24 w-full bg-[#16223B] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!isWorkspaceActive) {
    return <AuthGateModal isOpen={true} fullScreen={true} />;
  }

  const handleQuickAddLecture = () => {
    setActiveTab('lectures');
    setQuickAddLectureSignal(true);
  };

  const handleNavigateToChapterLectures = (chapterId: string) => {
    setSelectedChapterFilter(chapterId);
    setActiveTab('lectures');
  };

  return (
    <div className="min-h-screen bg-[#080D1B] text-slate-100 flex">
      <SidebarNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onQuickAddLecture={handleQuickAddLecture}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeaderBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setMobileMenuOpen={setMobileMenuOpen}
          onQuickAddLecture={handleQuickAddLecture}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1440px] w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              setActiveTab={setActiveTab}
              onQuickAddLecture={handleQuickAddLecture}
            />
          )}

          {activeTab === 'subjects' && (
            <SubjectsChaptersView
              onNavigateToChapterLectures={handleNavigateToChapterLectures}
            />
          )}

          {activeTab === 'lectures' && (
            <LectureTrackerView
              initialChapterFilter={selectedChapterFilter}
              showAddModalSignal={quickAddLectureSignal}
              onClearAddModalSignal={() => setQuickAddLectureSignal(false)}
            />
          )}

          {activeTab === 'planner' && <DailyPlannerView />}

          {activeTab === 'calendar' && <Calendar21View />}

          {activeTab === 'nios' && <NiosManagerView />}

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'settings' && (
            <SettingsDataView onOpenAuthModal={() => setAuthModalOpen(true)} />
          )}
        </main>
      </div>

      <AuthGateModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        fullScreen={false}
      />
    </div>
  );
};

export default function App() {
  return (
    <MissionProvider>
      <MissionAppContent />
    </MissionProvider>
  );
}
