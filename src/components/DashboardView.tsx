import React from 'react';
import {
  Flame,
  Target,
  CheckCircle2,
  Clock,
  ArrowRight,
  Layers,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { ActiveTab, SubjectName } from '../types/mission';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onQuickAddLecture: () => void;
}

const SUBJECT_THEMES: Record<
  SubjectName,
  {
    accentText: string;
    barClass: string;
    borderHover: string;
  }
> = {
  Physics: {
    accentText: 'text-[#06B6D4]',
    barClass: 'from-[#06B6D4] to-[#3B82F6]',
    borderHover: 'hover:border-[#06B6D4]/40',
  },
  Chemistry: {
    accentText: 'text-[#F59E0B]',
    barClass: 'from-[#F59E0B] to-[#EF4444]',
    borderHover: 'hover:border-[#F59E0B]/40',
  },
  Mathematics: {
    accentText: 'text-[#10B981]',
    barClass: 'from-[#10B981] to-[#14B8A6]',
    borderHover: 'hover:border-[#10B981]/40',
  },
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onQuickAddLecture,
}) => {
  const {
    summary,
    chapters,
    lectures,
    tasks,
    todayISO,
    toggleLectureCompletion,
    toggleTaskCompletion,
  } = useMission();

  const todayTasks = tasks.filter((t) => t.niosType === 'None');
  const completedTodayTasks = todayTasks.filter((t) => t.completed).length;

  const organicChapter = chapters.find((c) => c.title === 'Organic Chemistry');
  const physicalChapter = chapters.find((c) => c.title === 'Physical Chemistry');

  const recentLectures = lectures.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Mission Telemetry Banner */}
      <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-slate-400">
            Challenge Day {summary.currentDayNumber} of {summary.challengeDurationDays} · {todayISO} · Active Streak: {summary.streakDays} {summary.streakDays === 1 ? 'Day' : 'Days'}
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white font-display tracking-tight">
            21-Day High-Velocity Backlog Command Deck
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Daily target locked at {summary.dailyTargetTotal} lectures ({summary.subjectStats.Physics.dailyTarget} Physics · {summary.subjectStats.Chemistry.dailyTarget} Chemistry · {summary.subjectStats.Mathematics.dailyTarget} Mathematics) across your {summary.totalBacklogLectures}-lecture JEE syllabus.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('lectures')}
            className="px-4 py-2.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>Open Lecture Tracker</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className="px-4 py-2.5 rounded-lg bg-[#16223B] hover:bg-[#1E293B] border border-[#2B3954] text-slate-200 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            View 21-Day Calendar
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: Daily Lecture Target & Completed Today */}
        <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span>Completed Today vs Target</span>
            <Target className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {summary.completedTodayTotal}{' '}
              <span className="text-base font-normal text-slate-400">
                / {summary.dailyTargetTotal}
              </span>
            </div>
            <span className="text-xs font-mono tabular-nums text-[#8B5CF6] font-semibold">
              {summary.todayCompletionPercent}%
            </span>
          </div>
          <div className="mt-3 w-full h-2 bg-[#16223B] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] transition-all duration-200"
              style={{ width: `${summary.todayCompletionPercent}%` }}
            />
          </div>
          <div className="mt-2.5 text-xs text-slate-400 font-mono tabular-nums">
            Remaining Today: {summary.remainingTodayTotal} lectures
          </div>
        </div>

        {/* Card 2: Overall Backlog Completion & Remaining Backlog */}
        <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span>Remaining Total Backlog</span>
            <Layers className="w-4 h-4 text-[#06B6D4]" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {summary.remainingBacklogLectures}
            </div>
            <span className="text-xs font-mono tabular-nums text-[#06B6D4] font-semibold">
              {summary.overallCompletionPercent}% Done
            </span>
          </div>
          <div className="mt-3 w-full h-2 bg-[#16223B] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] transition-all duration-200"
              style={{ width: `${summary.overallCompletionPercent}%` }}
            />
          </div>
          <div className="mt-2.5 text-xs text-slate-400 font-mono tabular-nums">
            Completed: {summary.completedTotalLectures} of {summary.totalBacklogLectures} lectures
          </div>
        </div>

        {/* Card 3: Study Streak & Challenge Velocity */}
        <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span>Study Streak & Challenge Day</span>
            <Flame className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {summary.streakDays} {summary.streakDays === 1 ? 'Day' : 'Days'}
            </div>
            <span className="text-xs font-mono tabular-nums text-[#F59E0B] font-semibold">
              Day {summary.currentDayNumber}/{summary.challengeDurationDays}
            </span>
          </div>
          <div className="mt-3 w-full h-2 bg-[#16223B] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#F59E0B] to-[#EF4444] transition-all duration-200"
              style={{
                width: `${Math.min(
                  100,
                  Math.round((summary.currentDayNumber / summary.challengeDurationDays) * 100)
                )}%`,
              }}
            />
          </div>
          <div className="mt-2.5 text-xs text-slate-400 font-mono tabular-nums">
            {Math.max(0, summary.challengeDurationDays - summary.currentDayNumber)} challenge days after today
          </div>
        </div>

        {/* Card 4: Watch Time & Daily Tasks */}
        <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span>Actual Watch Hours & Planner</span>
            <Clock className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {summary.totalStudyHours}h
            </div>
            <span className="text-xs font-mono tabular-nums text-[#10B981] font-semibold">
              {completedTodayTasks}/{todayTasks.length} Tasks
            </span>
          </div>
          <div className="mt-3 w-full h-2 bg-[#16223B] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#10B981] to-[#14B8A6] transition-all duration-200"
              style={{
                width: `${
                  todayTasks.length > 0
                    ? Math.round((completedTodayTasks / todayTasks.length) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
          <div className="mt-2.5 text-xs text-slate-400 font-mono tabular-nums">
            Today Watch Time: {summary.todayStudyMinutes} mins
          </div>
        </div>
      </div>

      {/* Subject-Wise Progress Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {(['Physics', 'Chemistry', 'Mathematics'] as SubjectName[]).map((subj) => {
          const st = summary.subjectStats[subj];
          const theme = SUBJECT_THEMES[subj];
          return (
            <div
              key={subj}
              className={`bg-[#111A2D] border border-[#1E293B] ${theme.borderHover} rounded-2xl p-5 transition-colors`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-bold text-white font-display">{subj}</h2>
                  <p className="text-xs text-slate-400 font-mono tabular-nums">
                    Daily Target: {st.completedToday}/{st.dailyTarget} · Remaining Today: {st.remainingToday}
                  </p>
                </div>
                <span className={`text-sm font-bold font-mono tabular-nums ${theme.accentText}`}>
                  {st.completionPercent}%
                </span>
              </div>

              {/* Daily Progress Bar */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono tabular-nums">
                  <span>Today Quota</span>
                  <span>{st.todayPercent}%</span>
                </div>
                <div className="w-full h-2 bg-[#16223B] rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${theme.barClass} transition-all duration-200`}
                    style={{ width: `${st.todayPercent}%` }}
                  />
                </div>
              </div>

              {/* Overall Subject Backlog Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono tabular-nums">
                  <span>Syllabus Backlog ({st.completedTotal}/{st.totalBacklog})</span>
                  <span>{st.remainingBacklog} left</span>
                </div>
                <div className="w-full h-2 bg-[#16223B] rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${theme.barClass} transition-all duration-200`}
                    style={{ width: `${st.completionPercent}%` }}
                  />
                </div>
              </div>

              {subj === 'Chemistry' && (organicChapter || physicalChapter) && (
                <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs text-slate-300 font-mono tabular-nums">
                  <span>
                    Organic: {organicChapter ? `${organicChapter.completedLectures}/${organicChapter.totalLectures}` : '0/32'}
                  </span>
                  <span>·</span>
                  <span>
                    Physical: {physicalChapter ? `${physicalChapter.completedLectures}/${physicalChapter.totalLectures}` : '0/47'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Two-Column Split: Active Lecture Queue & Daily Planner Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 cols: Active Backlog Lectures */}
        <div className="lg:col-span-7 bg-[#111A2D] border border-[#1E293B] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white font-display">
                  Priority Backlog Queue
                </h2>
                <p className="text-xs text-slate-400">
                  Mark lectures completed as you finish them to update today&apos;s telemetry
                </p>
              </div>
              <button
                type="button"
                onClick={onQuickAddLecture}
                className="px-3 py-1.5 rounded-lg bg-[#16223B] hover:bg-[#1E293B] border border-[#2B3954] text-xs font-semibold text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                + New Lecture
              </button>
            </div>

            <div className="divide-y divide-[#1E293B]">
              {recentLectures.map((lec) => (
                <div
                  key={lec.id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-[#16223B]/40 px-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {lec.title}
                    </div>
                    <div className="text-xs text-slate-400 font-mono tabular-nums">
                      {lec.subject} · {lec.chapterTitle} · {lec.durationMinutes}m @ {lec.playbackSpeed}x ({lec.actualWatchMinutes}m watch)
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleLectureCompletion(lec.id)}
                    aria-label={
                      lec.completed
                        ? `Undo completion for ${lec.title}`
                        : `Mark ${lec.title} completed`
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer whitespace-nowrap ${
                      lec.completed
                        ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                        : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'
                    }`}
                  >
                    {lec.completed ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              Showing {recentLectures.length} of {lectures.length} tracked lectures
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('lectures')}
              className="text-xs font-semibold text-[#8B5CF6] hover:text-white transition-colors cursor-pointer"
            >
              Manage All Lectures →
            </button>
          </div>
        </div>

        {/* Right 5 cols: Today's Daily Tasks Checklist */}
        <div className="lg:col-span-5 bg-[#111A2D] border border-[#1E293B] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white font-display">
                  Daily Mission Checklist
                </h2>
                <p className="text-xs text-slate-400 font-mono tabular-nums">
                  {completedTodayTasks} of {todayTasks.length} daily tasks completed
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('planner')}
                className="text-xs font-semibold text-[#8B5CF6] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                Full Planner →
              </button>
            </div>

            <div className="space-y-2">
              {todayTasks.slice(0, 8).map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => toggleTaskCompletion(task.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    task.completed
                      ? 'bg-[#0C1424] border-[#1E293B] text-slate-400 line-through'
                      : 'bg-[#16223B] border-[#2B3954] text-white hover:border-[#8B5CF6]/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                        task.completed
                          ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white'
                          : 'bg-[#0C1424] border-[#2B3954]'
                      }`}
                    >
                      {task.completed && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                    <span className="text-xs font-medium truncate">{task.title}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {task.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs text-slate-400">
            <span>Includes Physics, Chemistry, Math & NIOS</span>
            <button
              type="button"
              onClick={() => setActiveTab('nios')}
              className="text-xs font-semibold text-[#06B6D4] hover:text-white transition-colors cursor-pointer"
            >
              NIOS Manager →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
