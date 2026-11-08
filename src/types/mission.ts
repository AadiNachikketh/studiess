export type SubjectName = 'Physics' | 'Chemistry' | 'Mathematics';
export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type ChapterPriority = 'High' | 'Medium' | 'Low';
export type TaskCategory = 'Physics' | 'Chemistry' | 'Mathematics' | 'Revision' | 'NIOS' | 'General';
export type NiosTaskType = 'None' | 'Subject' | 'Assignment' | 'Practical' | 'ExamPrep' | 'Revision';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  challengeStartDate: string; // YYYY-MM-DD
  challengeDurationDays: number; // default 21
  totalBacklogTarget: number; // default 420
  physicsDailyTarget: number; // default 7
  chemistryDailyTarget: number; // default 7
  mathDailyTarget: number; // default 6
  streakCount: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface DailyProgress {
  id: string; // YYYY-MM-DD
  uid: string;
  date: string;
  dayNumber: number;
  targetLectures: number;
  completedLectures: number;
  physicsCompleted: number;
  chemistryCompleted: number;
  mathCompleted: number;
  studyMinutes: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SubjectDoc {
  id: string;
  uid: string;
  name: SubjectName;
  dailyTarget: number;
  totalLectures: number;
  completedLectures: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ChapterDoc {
  id: string;
  uid: string;
  subject: SubjectName;
  title: string;
  totalLectures: number;
  completedLectures: number;
  priority: ChapterPriority;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface LectureDoc {
  id: string;
  uid: string;
  title: string;
  subject: SubjectName;
  chapterId: string;
  chapterTitle: string;
  durationMinutes: number;
  playbackSpeed: number;
  actualWatchMinutes: number;
  completed: boolean;
  completedDate: string; // YYYY-MM-DD or ''
  notes: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface TaskDoc {
  id: string;
  uid: string;
  title: string;
  category: TaskCategory;
  priority: PriorityLevel;
  deadline: string; // YYYY-MM-DD
  date: string; // YYYY-MM-DD
  completed: boolean;
  isDefault: boolean;
  niosType: NiosTaskType;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface NoteDoc {
  id: string;
  uid: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type ActiveTab =
  | 'dashboard'
  | 'subjects'
  | 'lectures'
  | 'planner'
  | 'calendar'
  | 'nios'
  | 'analytics'
  | 'settings';
