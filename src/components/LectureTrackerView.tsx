import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  CheckCircle2,
  RotateCcw,
  Edit3,
  Trash2,
  Clock,
  Gauge,
  FileText,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { LectureDoc, SubjectName } from '../types/mission';
import { calculateActualWatchMinutes } from '../utils/missionLogic';

interface LectureTrackerViewProps {
  initialChapterFilter?: string;
  showAddModalSignal?: boolean;
  onClearAddModalSignal?: () => void;
}

export const LectureTrackerView: React.FC<LectureTrackerViewProps> = ({
  initialChapterFilter = 'All',
  showAddModalSignal = false,
  onClearAddModalSignal,
}) => {
  const {
    chapters,
    lectures,
    addLecture,
    updateLecture,
    toggleLectureCompletion,
    deleteLecture,
  } = useMission();

  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<'All' | SubjectName>('All');
  const [chapterFilter, setChapterFilter] = useState<string>(initialChapterFilter || 'All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Completed'>('All');

  // Sync external chapter filter navigation
  React.useEffect(() => {
    if (initialChapterFilter) {
      setChapterFilter(initialChapterFilter);
    }
  }, [initialChapterFilter]);

  // Add Lecture Form State
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  React.useEffect(() => {
    if (showAddModalSignal) {
      setShowAddForm(true);
      if (onClearAddModalSignal) onClearAddModalSignal();
    }
  }, [showAddModalSignal, onClearAddModalSignal]);

  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState<SubjectName>('Chemistry');
  const [newChapterId, setNewChapterId] = useState<string>('ch_chem_organic');
  const [newDuration, setNewDuration] = useState('90');
  const [newSpeed, setNewSpeed] = useState('1.5');
  const [newNotes, setNewNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState<SubjectName>('Chemistry');
  const [editChapterId, setEditChapterId] = useState('');
  const [editDuration, setEditDuration] = useState('90');
  const [editSpeed, setEditSpeed] = useState('1.5');
  const [editNotes, setEditNotes] = useState('');

  // Delete Confirmation State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const availableChaptersForNew = useMemo(
    () => chapters.filter((c) => c.subject === newSubject),
    [chapters, newSubject]
  );

  React.useEffect(() => {
    if (
      availableChaptersForNew.length > 0 &&
      !availableChaptersForNew.some((c) => c.id === newChapterId)
    ) {
      setNewChapterId(availableChaptersForNew[0].id);
    }
  }, [availableChaptersForNew, newChapterId]);

  const filteredLectures = useMemo(() => {
    return lectures.filter((l) => {
      if (subjectFilter !== 'All' && l.subject !== subjectFilter) return false;
      if (chapterFilter !== 'All' && l.chapterId !== chapterFilter) return false;
      if (statusFilter === 'Pending' && l.completed) return false;
      if (statusFilter === 'Completed' && !l.completed) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = l.title.toLowerCase().includes(q);
        const matchChap = l.chapterTitle.toLowerCase().includes(q);
        const matchNotes = l.notes.toLowerCase().includes(q);
        if (!matchTitle && !matchChap && !matchNotes) return false;
      }
      return true;
    });
  }, [lectures, subjectFilter, chapterFilter, statusFilter, searchQuery]);

  const previewWatchMinutes = calculateActualWatchMinutes(
    Number(newDuration) || 90,
    Number(newSpeed) || 1.5
  );

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newTitle.trim()) {
      setFormError('Please enter a lecture title.');
      return;
    }
    const dur = Number(newDuration);
    if (isNaN(dur) || dur < 1 || dur > 600) {
      setFormError('Duration must be between 1 and 600 minutes.');
      return;
    }
    const spd = Number(newSpeed);
    if (isNaN(spd) || spd < 0.5 || spd > 4) {
      setFormError('Playback speed must be between 0.5x and 4.0x.');
      return;
    }

    await addLecture({
      title: newTitle.trim(),
      subject: newSubject,
      chapterId: newChapterId,
      durationMinutes: dur,
      playbackSpeed: spd,
      notes: newNotes.trim(),
    });

    setNewTitle('');
    setNewNotes('');
    setShowAddForm(false);
  };

  const startEdit = (lec: LectureDoc) => {
    setEditingId(lec.id);
    setEditTitle(lec.title);
    setEditSubject(lec.subject);
    setEditChapterId(lec.chapterId);
    setEditDuration(String(lec.durationMinutes));
    setEditSpeed(String(lec.playbackSpeed));
    setEditNotes(lec.notes);
  };

  const handleSaveEdit = async (lecId: string) => {
    if (!editTitle.trim()) return;
    await updateLecture(lecId, {
      title: editTitle.trim(),
      subject: editSubject,
      chapterId: editChapterId,
      durationMinutes: Number(editDuration) || 90,
      playbackSpeed: Number(editSpeed) || 1.5,
      notes: editNotes.trim(),
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Action */}
      <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">
            JEE Backlog Lecture Tracker
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track lecture duration, playback speed (1.25x–2.0x), actual watching time, completion date, and personal revision notes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="px-4 py-2.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-2 self-start sm:self-auto transition-colors cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Hide Lecture Form' : 'Add New Lecture'}</span>
        </button>
      </div>

      {/* Add Lecture Panel */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          noValidate
          className="bg-[#111A2D] border border-[#2B3954] rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-display">
              Log New Backlog Lecture
            </h2>
            <span className="text-xs font-mono tabular-nums text-[#06B6D4]">
              Actual Watch Time: {previewWatchMinutes} mins
            </span>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5">
              <label htmlFor="lec-title" className="block text-xs font-medium text-slate-300 mb-1">
                Lecture Title
              </label>
              <input
                id="lec-title"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., L06: Aldehydes & Ketones — Aldol Condensation"
                className="w-full h-10 px-3 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="lec-subject" className="block text-xs font-medium text-slate-300 mb-1">
                Subject
              </label>
              <select
                id="lec-subject"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value as SubjectName)}
                className="w-full h-10 px-3 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="Chemistry">Chemistry</option>
                <option value="Physics">Physics</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label htmlFor="lec-chapter" className="block text-xs font-medium text-slate-300 mb-1">
                Chapter
              </label>
              <select
                id="lec-chapter"
                value={newChapterId}
                onChange={(e) => setNewChapterId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
              >
                {availableChaptersForNew.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <label htmlFor="lec-duration" className="block text-xs font-medium text-slate-300 mb-1">
                Mins
              </label>
              <input
                id="lec-duration"
                type="number"
                min={1}
                max={600}
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                className="w-full h-10 px-2.5 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white font-mono tabular-nums focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="lec-speed" className="block text-xs font-medium text-slate-300 mb-1">
                Speed
              </label>
              <select
                id="lec-speed"
                value={newSpeed}
                onChange={(e) => setNewSpeed(e.target.value)}
                className="w-full h-10 px-2 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white font-mono tabular-nums focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="1">1.0x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="1.75">1.75x</option>
                <option value="2">2.0x</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-9">
              <label htmlFor="lec-notes" className="block text-xs font-medium text-slate-300 mb-1">
                Personal Notes & Key Takeaways
              </label>
              <input
                id="lec-notes"
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Key formulas, exceptions, or PYQ references..."
                className="w-full h-10 px-3 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div className="md:col-span-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="w-1/3 h-10 rounded-lg bg-[#16223B] text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-2/3 h-10 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-xs font-semibold text-white cursor-pointer"
              >
                Save Lecture
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Search & Multi-Filter Bar */}
      <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search Omnibar */}
        <div className="md:col-span-3 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Search lectures by title, chapter, or notes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lecture title, chapter, or notes..."
            className="w-full h-10 pl-9 pr-8 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search query"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Subject Filter */}
        <div className="md:col-span-3 flex items-center gap-1 p-1 bg-[#0C1424] border border-[#1E293B] rounded-lg">
          {(['All', 'Physics', 'Chemistry', 'Mathematics'] as const).map((subj) => (
            <button
              key={subj}
              type="button"
              onClick={() => {
                setSubjectFilter(subj);
                setChapterFilter('All');
              }}
              className={`flex-1 py-1.5 px-2 rounded text-[11px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                subjectFilter === subj
                  ? 'bg-[#8B5CF6] text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {subj === 'Mathematics' ? 'Math' : subj}
            </button>
          ))}
        </div>

        {/* Chapter Filter */}
        <div className="md:col-span-3">
          <select
            aria-label="Filter by chapter"
            value={chapterFilter}
            onChange={(e) => setChapterFilter(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
          >
            <option value="All">All Chapters ({chapters.length})</option>
            {chapters
              .filter((c) => subjectFilter === 'All' || c.subject === subjectFilter)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.totalLectures} Lecs)
                </option>
              ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="md:col-span-3 flex items-center gap-1 p-1 bg-[#0C1424] border border-[#1E293B] rounded-lg">
          {(['All', 'Pending', 'Completed'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`flex-1 py-1.5 px-2 rounded text-[11px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#16223B] text-white border border-[#2B3954]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Lecture Rows Table / List */}
      <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#1E293B] flex items-center justify-between text-xs text-slate-400 font-mono tabular-nums">
          <span>Showing {filteredLectures.length} lectures</span>
          <span>
            Completed: {filteredLectures.filter((l) => l.completed).length} · Pending:{' '}
            {filteredLectures.filter((l) => !l.completed).length}
          </span>
        </div>

        {filteredLectures.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <div className="text-sm font-semibold text-white">No matching lectures found</div>
            <p className="text-xs text-slate-400">
              Adjust your search filters or click &ldquo;Add New Lecture&rdquo; to log a lecture.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#1E293B]">
            {filteredLectures.map((lec) => {
              const isEditing = editingId === lec.id;
              return (
                <div
                  key={lec.id}
                  className="p-4 hover:bg-[#16223B]/50 transition-colors flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                  {isEditing ? (
                    <div className="w-full space-y-3 bg-[#0C1424] p-4 rounded-xl border border-[#2B3954]">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-5">
                          <label className="block text-[10px] text-slate-400 mb-1">Title</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full h-9 px-3 rounded bg-[#111A2D] border border-[#1E293B] text-xs text-white"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-[10px] text-slate-400 mb-1">Duration (mins)</label>
                          <input
                            type="number"
                            value={editDuration}
                            onChange={(e) => setEditDuration(e.target.value)}
                            className="w-full h-9 px-3 rounded bg-[#111A2D] border border-[#1E293B] text-xs text-white font-mono"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] text-slate-400 mb-1">Speed</label>
                          <select
                            value={editSpeed}
                            onChange={(e) => setEditSpeed(e.target.value)}
                            className="w-full h-9 px-2 rounded bg-[#111A2D] border border-[#1E293B] text-xs text-white font-mono"
                          >
                            <option value="1">1.0x</option>
                            <option value="1.25">1.25x</option>
                            <option value="1.5">1.5x</option>
                            <option value="1.75">1.75x</option>
                            <option value="2">2.0x</option>
                          </select>
                        </div>
                        <div className="md:col-span-2 flex items-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="h-9 px-3 rounded bg-[#16223B] text-xs text-slate-300 flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(lec.id)}
                            className="h-9 px-3 rounded bg-[#8B5CF6] text-xs text-white font-semibold flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Save
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Personal Notes</label>
                        <input
                          type="text"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="w-full h-9 px-3 rounded bg-[#111A2D] border border-[#1E293B] text-xs text-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`text-sm font-bold font-display ${
                              lec.completed ? 'text-slate-400 line-through' : 'text-white'
                            }`}
                          >
                            {lec.title}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-mono tabular-nums">
                          <span
                            className={
                              lec.subject === 'Physics'
                                ? 'text-[#06B6D4]'
                                : lec.subject === 'Chemistry'
                                ? 'text-[#F59E0B]'
                                : 'text-[#10B981]'
                            }
                          >
                            {lec.subject}
                          </span>
                          <span>·</span>
                          <span>{lec.chapterTitle}</span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {lec.durationMinutes}m
                          </span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Gauge className="w-3 h-3" /> {lec.playbackSpeed}x →{' '}
                            <strong className="text-slate-200">{lec.actualWatchMinutes}m actual</strong>
                          </span>
                          {lec.completed && lec.completedDate && (
                            <>
                              <span>·</span>
                              <span className="text-emerald-400">
                                Completed on {lec.completedDate}
                              </span>
                            </>
                          )}
                        </div>

                        {lec.notes && (
                          <div className="pt-1 flex items-start gap-1.5 text-xs text-slate-300">
                            <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                            <span>{lec.notes}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleLectureCompletion(lec.id)}
                          aria-label={
                            lec.completed
                              ? `Undo completion for ${lec.title}`
                              : `Mark ${lec.title} completed`
                          }
                          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                            lec.completed
                              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                              : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'
                          }`}
                        >
                          {lec.completed ? (
                            <>
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Undo Complete</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Completed</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => startEdit(lec)}
                          aria-label={`Edit ${lec.title}`}
                          className="p-2 rounded-lg bg-[#16223B] hover:bg-[#1E293B] border border-[#2B3954] text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {confirmDeleteId === lec.id ? (
                          <div className="flex items-center gap-1 bg-red-500/15 border border-red-500/40 px-2 py-1 rounded-lg">
                            <button
                              type="button"
                              onClick={async () => {
                                await deleteLecture(lec.id);
                                setConfirmDeleteId(null);
                              }}
                              className="text-xs font-semibold text-red-300 hover:text-white px-1.5 py-0.5"
                            >
                              Confirm Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-slate-400 hover:text-white px-1"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(lec.id)}
                            aria-label={`Delete ${lec.title}`}
                            className="p-2 rounded-lg bg-[#16223B] hover:bg-red-500/15 border border-[#2B3954] text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
