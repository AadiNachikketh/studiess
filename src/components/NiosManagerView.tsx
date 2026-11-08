import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  CheckCircle2,
  Trash2,
  Edit3,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { NiosTaskType, PriorityLevel, TaskDoc } from '../types/mission';

const NIOS_SECTIONS: { id: NiosTaskType; label: string; desc: string }[] = [
  { id: 'Subject', label: 'NIOS Subjects', desc: 'Core Senior Secondary subject syllabus modules' },
  { id: 'Assignment', label: 'Assignments (TMA)', desc: 'Tutor Marked Assignments & submission deadlines' },
  { id: 'Practical', label: 'Practical Work', desc: 'Lab manual records, experiments & viva prep' },
  { id: 'ExamPrep', label: 'Exam Preparation', desc: 'Previous year board papers & answer writing' },
  { id: 'Revision', label: 'Revision Tasks', desc: 'Formula & derivation sheets for NIOS boards' },
];

export const NiosManagerView: React.FC = () => {
  const {
    todayISO,
    tasks,
    addTask,
    updateTask,
    toggleTaskCompletion,
    deleteTask,
  } = useMission();

  const [activeFilter, setActiveFilter] = useState<'All' | NiosTaskType>('All');
  const [title, setTitle] = useState('');
  const [niosType, setNiosType] = useState<NiosTaskType>('Assignment');
  const [priority, setPriority] = useState<PriorityLevel>('High');
  const [deadline, setDeadline] = useState(todayISO);
  const [formError, setFormError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDeadline, setEditDeadline] = useState(todayISO);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const niosTasks = tasks.filter((t) => t.niosType !== 'None' || t.category === 'NIOS');
  const filteredTasks = niosTasks.filter(
    (t) => activeFilter === 'All' || t.niosType === activeFilter
  );

  const completedCount = niosTasks.filter((t) => t.completed).length;
  const pct = niosTasks.length > 0 ? Math.round((completedCount / niosTasks.length) * 100) : 0;

  const handleAddNiosItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!title.trim()) {
      setFormError('Please enter a title for the NIOS item.');
      return;
    }

    await addTask({
      title: title.trim(),
      category: 'NIOS',
      priority,
      deadline: deadline || todayISO,
      date: todayISO,
      niosType,
    });
    setTitle('');
  };

  const startEdit = (t: TaskDoc) => {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditDeadline(t.deadline);
  };

  const saveEdit = async (id: string) => {
    if (!editTitle.trim()) return;
    await updateTask(id, {
      title: editTitle.trim(),
      deadline: editDeadline,
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#06B6D4]/15 border border-[#06B6D4]/40 flex items-center justify-center text-[#06B6D4] shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-display">
              NIOS Academic & Board Manager
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage NIOS subjects, Tutor Marked Assignments (TMAs), practical records, examination preparation, deadlines, and revision tasks alongside JEE.
            </p>
          </div>
        </div>

        <div className="bg-[#16223B] border border-[#2B3954] rounded-xl px-5 py-3 flex items-center gap-4 shrink-0">
          <div>
            <div className="text-xs text-slate-400">NIOS Completion</div>
            <div className="text-xl font-extrabold text-white font-mono tabular-nums">
              {completedCount} / {niosTasks.length} ({pct}%)
            </div>
          </div>
          <div className="w-24 h-2 bg-[#0C1424] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] transition-all duration-200"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5 Category Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {NIOS_SECTIONS.map((sec) => {
          const items = niosTasks.filter((t) => t.niosType === sec.id);
          const done = items.filter((t) => t.completed).length;
          const isSelected = activeFilter === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveFilter(isSelected ? 'All' : sec.id)}
              className={`bg-[#111A2D] border rounded-2xl p-4 text-left transition-colors cursor-pointer ${
                isSelected ? 'border-[#8B5CF6] bg-[#16223B]' : 'border-[#1E293B] hover:border-[#2B3954]'
              }`}
            >
              <div className="text-xs font-bold text-white font-display mb-1">{sec.label}</div>
              <div className="text-lg font-extrabold text-[#06B6D4] font-mono tabular-nums">
                {done} / {items.length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{sec.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Add NIOS Item Form */}
      <form
        onSubmit={handleAddNiosItem}
        noValidate
        className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white font-display">
            Add NIOS Subject, Assignment, Practical, Exam Prep or Revision Task
          </h2>
          {activeFilter !== 'All' && (
            <button
              type="button"
              onClick={() => setActiveFilter('All')}
              className="text-xs text-[#8B5CF6] hover:text-white cursor-pointer"
            >
              Show All NIOS Items ({niosTasks.length})
            </button>
          )}
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-4">
            <label htmlFor="nios-title" className="block text-xs text-slate-300 mb-1">
              Title / Requirement
            </label>
            <input
              id="nios-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., NIOS English (302) TMA Submission"
              className="w-full h-10 px-3 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          <div className="md:col-span-3">
            <label htmlFor="nios-type" className="block text-xs text-slate-300 mb-1">
              NIOS Category
            </label>
            <select
              id="nios-type"
              value={niosType}
              onChange={(e) => setNiosType(e.target.value as NiosTaskType)}
              className="w-full h-10 px-3 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
            >
              <option value="Subject">NIOS Subject</option>
              <option value="Assignment">Assignment (TMA)</option>
              <option value="Practical">Practical Work</option>
              <option value="ExamPrep">Exam Preparation</option>
              <option value="Revision">Revision Task</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="nios-prio" className="block text-xs text-slate-300 mb-1">
              Priority
            </label>
            <select
              id="nios-prio"
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="w-full h-10 px-2.5 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <label htmlFor="nios-due" className="block text-xs text-slate-300 mb-1">
              Deadline
            </label>
            <input
              id="nios-due"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full h-10 px-2 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white font-mono focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full h-10 px-4 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add NIOS Item</span>
            </button>
          </div>
        </div>
      </form>

      {/* NIOS Items List */}
      <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl divide-y divide-[#1E293B]">
        {filteredTasks.map((item) => {
          const isEditing = editingId === item.id;
          return (
            <div
              key={item.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-[#16223B]/40 transition-colors"
            >
              {isEditing ? (
                <div className="w-full flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 h-9 px-3 rounded bg-[#0C1424] border border-[#2B3954] text-xs text-white"
                  />
                  <input
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="h-9 px-2 rounded bg-[#0C1424] border border-[#2B3954] text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => saveEdit(item.id)}
                    className="h-9 px-3 rounded bg-[#8B5CF6] text-xs text-white font-semibold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="h-9 px-2.5 rounded bg-[#16223B] text-xs text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => toggleTaskCompletion(item.id)}
                    className="flex items-start gap-3 text-left min-w-0 flex-1 cursor-pointer"
                  >
                    <div
                      className={`mt-0.5 w-4.5 h-4.5 rounded flex items-center justify-center shrink-0 border ${
                        item.completed
                          ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white'
                          : 'bg-[#0C1424] border-[#2B3954]'
                      }`}
                    >
                      {item.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-sm font-semibold ${
                          item.completed ? 'text-slate-500 line-through' : 'text-white'
                        }`}
                      >
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-400 font-mono tabular-nums mt-0.5">
                        Type: {item.niosType === 'None' ? 'General NIOS' : item.niosType} · Priority: {item.priority} · Deadline: {item.deadline}
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      aria-label={`Edit NIOS item ${item.title}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#16223B] cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {confirmDeleteId === item.id ? (
                      <div className="flex items-center gap-1 bg-red-500/15 border border-red-500/30 px-2 py-1 rounded">
                        <button
                          type="button"
                          onClick={async () => {
                            await deleteTask(item.id);
                            setConfirmDeleteId(null);
                          }}
                          className="text-xs text-red-300 font-semibold"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs text-slate-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(item.id)}
                        aria-label={`Delete NIOS item ${item.title}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
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
    </div>
  );
};
