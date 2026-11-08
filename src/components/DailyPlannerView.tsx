import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Trash2,
  Edit3,
  StickyNote,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { PriorityLevel, TaskCategory, TaskDoc } from '../types/mission';

export const DailyPlannerView: React.FC = () => {
  const {
    todayISO,
    tasks,
    notes,
    addTask,
    updateTask,
    toggleTaskCompletion,
    deleteTask,
    addOrUpdateNote,
    deleteNote,
  } = useMission();

  // Filter daily planner tasks (non-NIOS specific or default daily tasks including NIOS studies)
  const plannerTasks = tasks.filter((t) => t.niosType === 'None');
  const completedCount = plannerTasks.filter((t) => t.completed).length;
  const completionPct =
    plannerTasks.length > 0 ? Math.round((completedCount / plannerTasks.length) * 100) : 0;

  // New Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('Physics');
  const [taskPriority, setTaskPriority] = useState<PriorityLevel>('High');
  const [taskDeadline, setTaskDeadline] = useState(todayISO);
  const [taskError, setTaskError] = useState<string | null>(null);

  // Edit Task State
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState<PriorityLevel>('High');
  const [editTaskDeadline, setEditTaskDeadline] = useState(todayISO);
  const [confirmDeleteTaskId, setConfirmDeleteTaskId] = useState<string | null>(null);

  // Daily Note Form State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteError, setNoteError] = useState<string | null>(null);
  const [confirmDeleteNoteId, setConfirmDeleteNoteId] = useState<string | null>(null);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaskError(null);
    if (!taskTitle.trim()) {
      setTaskError('Task description is required.');
      return;
    }
    await addTask({
      title: taskTitle.trim(),
      category: taskCategory,
      priority: taskPriority,
      deadline: taskDeadline || todayISO,
      date: todayISO,
      niosType: 'None',
    });
    setTaskTitle('');
  };

  const startEditTask = (t: TaskDoc) => {
    setEditingTaskId(t.id);
    setEditTaskTitle(t.title);
    setEditTaskPriority(t.priority);
    setEditTaskDeadline(t.deadline);
  };

  const saveEditTask = async (id: string) => {
    if (!editTaskTitle.trim()) return;
    await updateTask(id, {
      title: editTaskTitle.trim(),
      priority: editTaskPriority,
      deadline: editTaskDeadline,
    });
    setEditingTaskId(null);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setNoteError(null);
    if (!noteTitle.trim() && !noteContent.trim()) {
      setNoteError('Please enter a note title or reflection content.');
      return;
    }
    await addOrUpdateNote({
      date: todayISO,
      title: noteTitle.trim() || `Study Log — ${todayISO}`,
      content: noteContent.trim(),
    });
    setNoteTitle('');
    setNoteContent('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Daily Completion Meter */}
      <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">
            Daily Mission Planner & Study Reflections
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Includes your 8 default daily JEE & NIOS protocol tasks plus custom high-priority targets.
          </p>
        </div>

        <div className="bg-[#16223B] border border-[#2B3954] rounded-xl px-5 py-3 flex items-center gap-4 shrink-0">
          <div>
            <div className="text-xs text-slate-400">Daily Task Completion</div>
            <div className="text-xl font-extrabold text-white font-mono tabular-nums">
              {completedCount} / {plannerTasks.length} ({completionPct}%)
            </div>
          </div>
          <div className="w-24 h-2 bg-[#0C1424] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] transition-all duration-200"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Task Management System */}
        <div className="lg:col-span-7 space-y-5">
          {/* Add Custom Task Form */}
          <form
            onSubmit={handleAddTask}
            noValidate
            className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-5 space-y-3.5"
          >
            <h2 className="text-sm font-bold text-white font-display">
              Add Custom Daily Task
            </h2>

            {taskError && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{taskError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5">
                <label htmlFor="task-title" className="block text-xs text-slate-300 mb-1">
                  Task Title
                </label>
                <input
                  id="task-title"
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g., Solve 30 Electrochemistry PYQs"
                  className="w-full h-10 px-3 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="task-cat" className="block text-xs text-slate-300 mb-1">
                  Category
                </label>
                <select
                  id="task-cat"
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
                  className="w-full h-10 px-2.5 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Revision">Revision</option>
                  <option value="NIOS">NIOS</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="task-prio" className="block text-xs text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  id="task-prio"
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as PriorityLevel)}
                  className="w-full h-10 px-2 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="task-due" className="block text-xs text-slate-300 mb-1">
                  Deadline
                </label>
                <input
                  id="task-due"
                  type="date"
                  value={taskDeadline}
                  onChange={(e) => setTaskDeadline(e.target.value)}
                  className="w-full h-10 px-2 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white font-mono focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task to Planner</span>
            </button>
          </form>

          {/* Tasks List */}
          <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl divide-y divide-[#1E293B]">
            {plannerTasks.map((task) => {
              const isEditing = editingTaskId === task.id;
              return (
                <div
                  key={task.id}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-[#16223B]/40 transition-colors"
                >
                  {isEditing ? (
                    <div className="w-full flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={editTaskTitle}
                        onChange={(e) => setEditTaskTitle(e.target.value)}
                        className="flex-1 h-9 px-3 rounded bg-[#0C1424] border border-[#2B3954] text-xs text-white"
                      />
                      <select
                        value={editTaskPriority}
                        onChange={(e) => setEditTaskPriority(e.target.value as PriorityLevel)}
                        className="h-9 px-2 rounded bg-[#0C1424] border border-[#2B3954] text-xs text-white"
                      >
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                      <input
                        type="date"
                        value={editTaskDeadline}
                        onChange={(e) => setEditTaskDeadline(e.target.value)}
                        className="h-9 px-2 rounded bg-[#0C1424] border border-[#2B3954] text-xs text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => saveEditTask(task.id)}
                        className="h-9 px-3 rounded bg-[#8B5CF6] text-xs text-white font-semibold flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTaskId(null)}
                        className="h-9 px-2.5 rounded bg-[#16223B] text-xs text-slate-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleTaskCompletion(task.id)}
                        className="flex items-start gap-3 text-left min-w-0 flex-1 cursor-pointer"
                      >
                        <div
                          className={`mt-0.5 w-4.5 h-4.5 rounded flex items-center justify-center shrink-0 border transition-colors ${
                            task.completed
                              ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white'
                              : 'bg-[#0C1424] border-[#2B3954]'
                          }`}
                        >
                          {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <div
                            className={`text-sm font-semibold ${
                              task.completed ? 'text-slate-500 line-through' : 'text-white'
                            }`}
                          >
                            {task.title}
                          </div>
                          <div className="text-xs text-slate-400 font-mono tabular-nums mt-0.5">
                            {task.category} · {task.priority} Priority · Due {task.deadline}
                            {task.isDefault ? ' · Default Protocol' : ''}
                          </div>
                        </div>
                      </button>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditTask(task)}
                          aria-label={`Edit task ${task.title}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#16223B] cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {confirmDeleteTaskId === task.id ? (
                          <div className="flex items-center gap-1 bg-red-500/15 border border-red-500/30 px-2 py-1 rounded">
                            <button
                              type="button"
                              onClick={async () => {
                                await deleteTask(task.id);
                                setConfirmDeleteTaskId(null);
                              }}
                              className="text-xs text-red-300 font-semibold"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteTaskId(null)}
                              className="text-xs text-slate-400"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteTaskId(task.id)}
                            aria-label={`Delete task ${task.title}`}
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

        {/* Right 5 Cols: Daily Notes & Study Journal */}
        <div className="lg:col-span-5 space-y-5">
          <form
            onSubmit={handleSaveNote}
            noValidate
            className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-5 space-y-3.5"
          >
            <div className="flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-[#06B6D4]" />
              <h2 className="text-sm font-bold text-white font-display">
                Add Daily Study Note
              </h2>
            </div>

            {noteError && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                {noteError}
              </div>
            )}

            <div>
              <label htmlFor="note-title" className="block text-xs text-slate-300 mb-1">
                Note Heading
              </label>
              <input
                id="note-title"
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="e.g., GOC Inductive & Mesomeric Summary"
                className="w-full h-10 px-3 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div>
              <label htmlFor="note-content" className="block text-xs text-slate-300 mb-1">
                Daily Notes & Formula Log
              </label>
              <textarea
                id="note-content"
                rows={4}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write key formulas, mistake log from DPP/PYQs, or tomorrow's priority adjustments..."
                className="w-full p-3 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <button
              type="submit"
              className="w-full h-10 rounded-lg bg-[#16223B] hover:bg-[#8B5CF6] border border-[#2B3954] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Save Daily Note
            </button>
          </form>

          {/* Saved Notes List */}
          <div className="space-y-3">
            {notes.map((n) => (
              <div
                key={n.id}
                className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white font-display">{n.title}</h3>
                    <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                      {n.date}
                    </span>
                  </div>

                  {confirmDeleteNoteId === n.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteNote(n.id);
                          setConfirmDeleteNoteId(null);
                        }}
                        className="text-xs text-red-400 font-semibold"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteNoteId(null)}
                        className="text-xs text-slate-400"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteNoteId(n.id)}
                      aria-label={`Delete note ${n.title}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {n.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
