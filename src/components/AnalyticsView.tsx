import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Flame,
  CalendarCheck,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';

export const AnalyticsView: React.FC = () => {
  const { summary, analytics } = useMission();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">
            Mission Telemetry & Velocity Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time charts computed from your Firestore lecture completions, watching speeds, and subject backlogs.
          </p>
        </div>

        <div className="text-xs font-mono tabular-nums text-slate-300 bg-[#16223B] border border-[#2B3954] rounded-xl px-4 py-2.5">
          Predicted Backlog Completion:{' '}
          <strong className="text-[#06B6D4]">{analytics.predictedDaysToFinish} days</strong> ({analytics.predictedCompletionDate})
        </div>
      </div>

      {/* 4 Telemetry Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Study Hours</span>
            <Clock className="w-4 h-4 text-[#06B6D4]" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
            {analytics.totalStudyHours}h
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
            Today: {summary.todayStudyMinutes} mins watched
          </div>
        </div>

        <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Average Lectures / Day</span>
            <TrendingUp className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
            {analytics.averageLecturesPerDay}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
            Daily Target: {summary.dailyTargetTotal} lectures/day
          </div>
        </div>

        <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Backlog Completion Prediction</span>
            <CalendarCheck className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
            {analytics.predictedDaysToFinish} Days
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
            Est. Finish: {analytics.predictedCompletionDate}
          </div>
        </div>

        <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Active Study Streak</span>
            <Flame className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
            {summary.streakDays} {summary.streakDays === 1 ? 'Day' : 'Days'}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
            Remaining Backlog: {summary.remainingBacklogLectures} lectures
          </div>
        </div>
      </div>

      {/* Chart 1: 21-Day Daily Lecture Completion vs Target */}
      <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-6">
        <div className="mb-4">
          <h2 className="text-base font-bold text-white font-display">
            Daily Lecture Completion Across 21-Day Mission
          </h2>
          <p className="text-xs text-slate-400">
            Subject-stacked daily completions compared against your {summary.dailyTargetTotal} lectures/day target
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.dailySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="dayLabel" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111A2D',
                  borderColor: '#2B3954',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#F8FAFC',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Physics" stackId="a" fill="#06B6D4" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Chemistry" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Mathematics" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2 & 3: Weekly Progress & Subject-Wise Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress Chart */}
        <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white font-display">
              Weekly Progress Comparison (Weeks 1–3)
            </h2>
            <p className="text-xs text-slate-400">
              Completed lectures vs 140-lecture weekly target
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.weeklySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="week" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111A2D',
                    borderColor: '#2B3954',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="target"
                  name="Weekly Target"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.12}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Completed Lectures"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.35}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject-Wise Completion Breakdown */}
        <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white font-display">
              Subject-Wise Backlog vs Completed
            </h2>
            <p className="text-xs text-slate-400">
              Physics, Chemistry, and Mathematics syllabus completion
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.subjectDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} />
                <YAxis dataKey="subject" type="category" stroke="#94A3B8" fontSize={12} width={95} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111A2D',
                    borderColor: '#2B3954',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="completed" name="Completed" stackId="s" fill="#8B5CF6" />
                <Bar dataKey="remaining" name="Remaining Backlog" stackId="s" fill="#1E293B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
