import React, { useState } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Sparkles,
  Check,
  X,
  AlertCircle,
  BookOpen,
  RefreshCw,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { ChapterDoc, ChapterPriority, SubjectName } from '../types/mission';
import { DRONA_CHAPTER_BLUEPRINTS } from '../utils/dronaSyllabus';

export const SubjectsChaptersView: React.FC<{
  onNavigateToChapterLectures: (chapterId: string) => void;
}> = ({ onNavigateToChapterLectures }) => {
  const {
    summary,
    chapters,
    lectures,
    addChapter,
    updateChapter,
    deleteChapter,
    generateChapterLecturesBatch,
    resetOrRestoreMissionData,
  } = useMission();

  const [selectedSubject, setSelectedSubject] = useState<'All' | SubjectName>('All');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<SubjectName>('Chemistry');
  const [totalLectures, setTotalLectures] = useState('25');
  const [priority, setPriority] = useState<ChapterPriority>('High');
  const [formError, setFormError] = useState<string | null>(null);
  const [syncingDrona, setSyncingDrona] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTotal, setEditTotal] = useState('0');
  const [editCompleted, setEditCompleted] = useState('0');
  const [editPriority, setEditPriority] = useState<ChapterPriority>('High');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredChapters = chapters.filter(
    (c) => selectedSubject === 'All' || c.subject === selectedSubject
  );

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const cleanTitle = title.trim();
    const numTotal = Number(totalLectures);

    if (!cleanTitle) {
      setFormError('Chapter title is required.');
      return;
    }
    if (isNaN(numTotal) || numTotal < 1 || numTotal > 500) {
      setFormError('Total lectures must be between 1 and 500.');
      return;
    }

    await addChapter({
      subject,
      title: cleanTitle,
      totalLectures: numTotal,
      priority,
    });
    setTitle('');
    setTotalLectures('25');
  };

  const handleSyncDronaSyllabus = async () => {
    setSyncingDrona(true);
    try {
      await resetOrRestoreMissionData();
    } finally {
      setSyncingDrona(false);
    }
  };

  const startEdit = (ch: ChapterDoc) => {
    setEditingId(ch.id);
    setEditTitle(ch.title);
    setEditTotal(String(ch.totalLectures));
    setEditCompleted(String(ch.completedLectures));
    setEditPriority(ch.priority);
  };

  const saveEdit = async (chId: string) => {
    const cleanTitle = editTitle.trim();
    if (!cleanTitle) return;
    await updateChapter(chId, {
      title: cleanTitle,
      totalLectures: Math.max(1, Number(editTotal) || 1),
      completedLectures: Math.max(0, Number(editCompleted) || 0),
      priority: editPriority,
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Subject Overview */}
      <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">
            Drona JEE 2.0 2027 — Subjects & Syllabus Chapters
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Official Mission JEET Batch Planner synced: Organic Chemistry (32 lectures), Physical Chemistry (47 lectures), Inorganic (32 lectures), Physics (147 lectures) & Mathematics (126 lectures).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start">
          {/* Subject Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#0C1424] border border-[#1E293B] rounded-xl">
            {(['All', 'Physics', 'Chemistry', 'Mathematics'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedSubject(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedSubject === tab
                    ? 'bg-[#8B5CF6] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSyncDronaSyllabus}
            disabled={syncingDrona}
            className="h-9 px-3.5 rounded-xl bg-[#16223B] hover:bg-[#1E293B] border border-[#2B3954] text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#06B6D4] ${syncingDrona ? 'animate-spin' : ''}`} />
            <span>Sync Drona 2.0 Planner</span>
          </button>
        </div>
      </div>

      {/* Add New Chapter Form */}
      <form
        onSubmit={handleAddChapter}
        noValidate
        className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white font-display">
            Add Custom Syllabus Chapter
          </h2>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            Total Chapters: {chapters.length} · Total Backlog: {summary.totalBacklogLectures} lectures
          </span>
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-3">
            <label htmlFor="ch-subject" className="block text-xs font-medium text-slate-300 mb-1">
              Subject
            </label>
            <select
              id="ch-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value as SubjectName)}
              className="w-full h-10 px-3 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
            >
              <option value="Chemistry">Chemistry</option>
              <option value="Physics">Physics</option>
              <option value="Mathematics">Mathematics</option>
            </select>
          </div>

          <div className="md:col-span-4">
            <label htmlFor="ch-title" className="block text-xs font-medium text-slate-300 mb-1">
              Chapter Name
            </label>
            <input
              id="ch-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Electrochemistry & Surface Chemistry"
              className="w-full h-10 px-3 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="ch-total" className="block text-xs font-medium text-slate-300 mb-1">
              Lecture Count
            </label>
            <input
              id="ch-total"
              type="number"
              min={1}
              max={500}
              value={totalLectures}
              onChange={(e) => setTotalLectures(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white font-mono tabular-nums focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          <div className="md:col-span-1">
            <label htmlFor="ch-priority" className="block text-xs font-medium text-slate-300 mb-1">
              Priority
            </label>
            <select
              id="ch-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as ChapterPriority)}
              className="w-full h-10 px-2 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full h-10 px-4 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Chapter</span>
            </button>
          </div>
        </div>
      </form>

      {/* Chapters Grid */}
      {filteredChapters.length === 0 ? (
        <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-10 text-center space-y-2">
          <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
          <div className="text-sm font-semibold text-white">No chapters in this view</div>
          <p className="text-xs text-slate-400">
            Use the form above to add a chapter to your syllabus.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredChapters.map((ch) => {
            const trackedInChapter = lectures.filter((l) => l.chapterId === ch.id);
            const completedTracked = trackedInChapter.filter((l) => l.completed).length;
            const effectiveCompleted = Math.max(ch.completedLectures, completedTracked);
            const pct =
              ch.totalLectures > 0
                ? Math.min(100, Math.round((effectiveCompleted / ch.totalLectures) * 100))
                : 0;
            const isEditing = editingId === ch.id;
            const blueprint = DRONA_CHAPTER_BLUEPRINTS.find((b) => b.id === ch.id);

            return (
              <div
                key={ch.id}
                className="bg-[#111A2D] border border-[#1E293B] hover:border-[#2B3954] rounded-2xl p-5 flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="text-xs text-slate-400 font-mono">
                      {ch.subject} · {ch.priority} Priority
                      {blueprint ? ` · ${blueprint.dateRange}` : ''}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(ch)}
                        aria-label={`Edit chapter ${ch.title}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#16223B] transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(ch.id)}
                        aria-label={`Delete chapter ${ch.title}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2.5 my-2 p-3 rounded-xl bg-[#0C1424] border border-[#2B3954]">
                      <input
                        type="text"
                        aria-label="Edit chapter title"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full h-8 px-2.5 rounded bg-[#111A2D] border border-[#1E293B] text-xs text-white"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">
                            Completed
                          </label>
                          <input
                            type="number"
                            value={editCompleted}
                            onChange={(e) => setEditCompleted(e.target.value)}
                            className="w-full h-8 px-2 rounded bg-[#111A2D] border border-[#1E293B] text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">
                            Total Lectures
                          </label>
                          <input
                            type="number"
                            value={editTotal}
                            onChange={(e) => setEditTotal(e.target.value)}
                            className="w-full h-8 px-2 rounded bg-[#111A2D] border border-[#1E293B] text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 rounded bg-[#16223B] text-xs text-slate-300 flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEdit(ch.id)}
                          className="px-2.5 py-1 rounded bg-[#8B5CF6] text-xs text-white font-semibold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-base font-bold text-white font-display mb-1.5">
                        {ch.title}
                      </h3>

                      {blueprint && (
                        <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
                          {blueprint.subtopicsSummary}
                        </p>
                      )}

                      <div className="flex items-baseline justify-between text-xs font-mono tabular-nums mb-1.5">
                        <span className="text-slate-300">
                          {effectiveCompleted} / {ch.totalLectures} Lectures Completed
                        </span>
                        <span className="text-white font-bold">{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#16223B] rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] transition-all duration-200"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </>
                  )}

                  {confirmDeleteId === ch.id && (
                    <div className="my-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-2">
                      <span className="text-xs text-red-200">Delete this chapter?</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 rounded bg-[#16223B] text-xs text-slate-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await deleteChapter(ch.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2 py-1 rounded bg-red-600 text-xs text-white font-semibold"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigateToChapterLectures(ch.id)}
                    className="text-xs font-semibold text-[#8B5CF6] hover:text-white transition-colors cursor-pointer"
                  >
                    View Lectures ({trackedInChapter.length}) →
                  </button>

                  {trackedInChapter.length < ch.totalLectures && (
                    <button
                      type="button"
                      onClick={() =>
                        generateChapterLecturesBatch(
                          ch.id,
                          Math.min(10, ch.totalLectures - trackedInChapter.length)
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-[#16223B] hover:bg-[#1E293B] border border-[#2B3954] text-[11px] font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#06B6D4]" />
                      <span>
                        +Load Next {Math.min(10, ch.totalLectures - trackedInChapter.length)} Drona Lectures
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
