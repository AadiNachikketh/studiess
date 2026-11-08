import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';

export const Calendar21View: React.FC = () => {
  const {
    calendarDays,
    lectures,
    todayISO,
    toggleLectureCompletion,
  } = useMission();

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const todayCell = calendarDays.find((c) => c.isToday);
    return todayCell ? todayCell.date : calendarDays[0]?.date || todayISO;
  });

  const activeDayCell =
    calendarDays.find((c) => c.date === selectedDate) || calendarDays[0];

  const completedOnSelectedDay = lectures.filter(
    (l) => l.completed && l.completedDate === activeDayCell?.date
  );
  const pendingLectures = lectures.filter((l) => !l.completed).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">
            Interactive 21-Day Challenge Calendar
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Inspect any day of your 21-day sprint. Incomplete days are never auto-marked completed, and moving to a new day preserves all historical progress.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-300 font-mono tabular-nums shrink-0 whitespace-nowrap">
          <span>Target Reached: {calendarDays.filter((c) => c.status === 'completed_target').length}d</span>
          <span>·</span>
          <span>Active Today: {todayISO}</span>
        </div>
      </div>

      {/* 21-Day Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-3.5">
        {calendarDays.map((day) => {
          const isSelected = day.date === activeDayCell?.date;
          let borderClass = 'border-[#1E293B] hover:border-[#2B3954]';
          if (isSelected) {
            borderClass = 'border-[#8B5CF6] ring-2 ring-[#8B5CF6]/25';
          } else if (day.isToday) {
            borderClass = 'border-[#06B6D4]/60';
          } else if (day.status === 'completed_target') {
            borderClass = 'border-emerald-500/50';
          }

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => setSelectedDate(day.date)}
              aria-label={`Inspect Day ${day.dayNumber} (${day.date})`}
              className={`bg-[#111A2D] border ${borderClass} rounded-2xl p-4 text-left flex flex-col justify-between transition-all cursor-pointer`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-sm font-extrabold text-white font-display">
                    Day {day.dayNumber}
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-slate-400">
                    {day.date.slice(5)}
                  </span>
                </div>

                {/* Target, Completed, Remaining, % */}
                <div className="space-y-1 text-[11px] font-mono tabular-nums text-slate-300 mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target:</span>
                    <span>{day.target} lecs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Completed:</span>
                    <span className="text-white font-bold">{day.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Remaining:</span>
                    <span>{day.remaining}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Completion:</span>
                    <span className="text-[#8B5CF6] font-bold">{day.completionPercent}%</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar & Subject-wise Breakdown */}
              <div>
                <div className="w-full h-1.5 bg-[#16223B] rounded-full overflow-hidden mb-2.5">
                  <div
                    className={`h-full transition-all duration-200 ${
                      day.status === 'completed_target'
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4]'
                    }`}
                    style={{ width: `${day.completionPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-slate-400 pt-1.5 border-t border-[#1E293B]">
                  <span className="text-[#06B6D4]">P:{day.physicsCompleted}</span>
                  <span className="text-[#F59E0B]">C:{day.chemistryCompleted}</span>
                  <span className="text-[#10B981]">M:{day.mathCompleted}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Detailed Telemetry Inspector */}
      {activeDayCell && (
        <div className="bg-[#111A2D] border border-[#2B3954] rounded-2xl p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1E293B] pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
                <CalendarIcon className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>
                  Day {activeDayCell.dayNumber} Telemetry · {activeDayCell.date}
                  {activeDayCell.isToday ? ' (Today)' : ''}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white font-display mt-1">
                Day {activeDayCell.dayNumber} Breakdown — {activeDayCell.completed} / {activeDayCell.target} Lectures ({activeDayCell.completionPercent}%)
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums">
              <div className="bg-[#16223B] border border-[#2B3954] rounded-xl px-3.5 py-2">
                <span className="text-slate-400">Remaining: </span>
                <strong className="text-white">{activeDayCell.remaining} lecs</strong>
              </div>
              <div className="bg-[#16223B] border border-[#2B3954] rounded-xl px-3.5 py-2">
                <span className="text-[#06B6D4]">Physics: {activeDayCell.physicsCompleted}</span>
                <span className="mx-2 text-slate-500">·</span>
                <span className="text-[#F59E0B]">Chemistry: {activeDayCell.chemistryCompleted}</span>
                <span className="mx-2 text-slate-500">·</span>
                <span className="text-[#10B981]">Math: {activeDayCell.mathCompleted}</span>
              </div>
              <div className="bg-[#16223B] border border-[#2B3954] rounded-xl px-3.5 py-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-white font-bold">{activeDayCell.studyMinutes} mins watched</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Completed on this day */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white font-display">
                Lectures Completed on {activeDayCell.date} ({completedOnSelectedDay.length})
              </h3>
              {completedOnSelectedDay.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#0C1424] border border-[#1E293B] text-xs text-slate-400">
                  No lectures recorded for {activeDayCell.date} yet. Use the right panel to log a completed lecture for this day.
                </div>
              ) : (
                <div className="space-y-2">
                  {completedOnSelectedDay.map((lec) => (
                    <div
                      key={lec.id}
                      className="p-3 rounded-xl bg-[#16223B] border border-[#2B3954] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{lec.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                          {lec.subject} · {lec.chapterTitle} · {lec.actualWatchMinutes}m watch
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleLectureCompletion(lec.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Undo</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick log pending lecture onto selected date */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white font-display">
                Log Pending Backlog Lecture to Day {activeDayCell.dayNumber} ({activeDayCell.date})
              </h3>
              <div className="space-y-2">
                {pendingLectures.map((lec) => (
                  <div
                    key={lec.id}
                    className="p-3 rounded-xl bg-[#0C1424] border border-[#1E293B] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{lec.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                        {lec.subject} · {lec.chapterTitle} · {lec.durationMinutes}m @ {lec.playbackSpeed}x
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleLectureCompletion(lec.id, activeDayCell.date)}
                      className="px-3 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer whitespace-nowrap"
                    >
                      <Play className="w-3 h-3" />
                      <span>Complete on D{activeDayCell.dayNumber}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
