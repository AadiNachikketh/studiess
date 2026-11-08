import {
  ChapterDoc,
  LectureDoc,
  NoteDoc,
  SubjectDoc,
  SubjectName,
  TaskDoc,
  UserProfile,
} from '../types/mission';
import {
  buildDronaInitialChaptersAndLectures,
  DRONA_CHAPTER_BLUEPRINTS,
} from './dronaSyllabus';

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysISO(dateISO: string, days: number): string {
  const [y, m, d] = dateISO.split('-').map(Number);
  const dt = new Date(Date.UTC(y, (m || 1) - 1, (d || 1) + days));
  const ry = dt.getUTCFullYear();
  const rm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const rd = String(dt.getUTCDate()).padStart(2, '0');
  return `${ry}-${rm}-${rd}`;
}

export function diffDaysISO(startISO: string, endISO: string): number {
  const [y1, m1, d1] = startISO.split('-').map(Number);
  const [y2, m2, d2] = endISO.split('-').map(Number);
  const t1 = Date.UTC(y1, (m1 || 1) - 1, d1 || 1);
  const t2 = Date.UTC(y2, (m2 || 1) - 1, d2 || 1);
  return Math.floor((t2 - t1) / (1000 * 60 * 60 * 24));
}

export function calculateActualWatchMinutes(durationMinutes: number, playbackSpeed: number): number {
  const safeDuration = Math.max(1, Math.min(600, Number(durationMinutes) || 90));
  const safeSpeed = Math.max(0.5, Math.min(4, Number(playbackSpeed) || 1));
  return Math.max(1, Math.round(safeDuration / safeSpeed));
}

export function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120) || 'id_default';
}

export interface SubjectStats {
  subject: SubjectName;
  dailyTarget: number;
  completedToday: number;
  remainingToday: number;
  totalBacklog: number;
  completedTotal: number;
  remainingBacklog: number;
  completionPercent: number;
  todayPercent: number;
}

export interface DashboardSummary {
  currentDayNumber: number;
  challengeDurationDays: number;
  dailyTargetTotal: number;
  completedTodayTotal: number;
  remainingTodayTotal: number;
  todayCompletionPercent: number;
  totalBacklogLectures: number;
  completedTotalLectures: number;
  remainingBacklogLectures: number;
  overallCompletionPercent: number;
  totalStudyHours: number;
  todayStudyMinutes: number;
  streakDays: number;
  subjectStats: Record<SubjectName, SubjectStats>;
}

export function computeDashboardSummary(
  profile: UserProfile,
  chapters: ChapterDoc[],
  lectures: LectureDoc[],
  todayISO: string
): DashboardSummary {
  const dayOffset = diffDaysISO(profile.challengeStartDate, todayISO);
  const currentDayNumber = Math.max(1, Math.min(profile.challengeDurationDays, dayOffset + 1));

  const subjects: SubjectName[] = ['Physics', 'Chemistry', 'Mathematics'];
  const dailyTargets: Record<SubjectName, number> = {
    Physics: profile.physicsDailyTarget,
    Chemistry: profile.chemistryDailyTarget,
    Mathematics: profile.mathDailyTarget,
  };

  const subjectStats = {} as Record<SubjectName, SubjectStats>;

  let completedTodayTotal = 0;
  let completedTotalLectures = 0;
  let totalChapterBacklogSum = 0;

  for (const subj of subjects) {
    const subjChapters = chapters.filter((c) => c.subject === subj);
    const subjLectures = lectures.filter((l) => l.subject === subj);
    const completedSubjLectures = subjLectures.filter((l) => l.completed);
    const completedTodaySubj = completedSubjLectures.filter((l) => l.completedDate === todayISO).length;

    // Total subject backlog is the max of chapter totals sum or tracked lectures count
    const chapterPlannedSum = subjChapters.reduce((acc, c) => acc + c.totalLectures, 0);
    const chapterCompletedSum = subjChapters.reduce((acc, c) => acc + c.completedLectures, 0);

    const totalSubjBacklog = Math.max(chapterPlannedSum, subjLectures.length);
    const completedSubjTotal = Math.max(chapterCompletedSum, completedSubjLectures.length);
    const remainingSubjBacklog = Math.max(0, totalSubjBacklog - completedSubjTotal);

    const target = dailyTargets[subj];
    const remainingToday = Math.max(0, target - completedTodaySubj);

    totalChapterBacklogSum += totalSubjBacklog;
    completedTodayTotal += completedTodaySubj;
    completedTotalLectures += completedSubjTotal;

    subjectStats[subj] = {
      subject: subj,
      dailyTarget: target,
      completedToday: completedTodaySubj,
      remainingToday,
      totalBacklog: totalSubjBacklog,
      completedTotal: completedSubjTotal,
      remainingBacklog: remainingSubjBacklog,
      completionPercent:
        totalSubjBacklog > 0
          ? Math.min(100, Math.round((completedSubjTotal / totalSubjBacklog) * 1000) / 10)
          : 0,
      todayPercent:
        target > 0 ? Math.min(100, Math.round((completedTodaySubj / target) * 100)) : 0,
    };
  }

  const dailyTargetTotal =
    profile.physicsDailyTarget + profile.chemistryDailyTarget + profile.mathDailyTarget;
  const remainingTodayTotal = Math.max(0, dailyTargetTotal - completedTodayTotal);
  const todayCompletionPercent =
    dailyTargetTotal > 0
      ? Math.min(100, Math.round((completedTodayTotal / dailyTargetTotal) * 100))
      : 0;

  const totalBacklogLectures = Math.max(profile.totalBacklogTarget, totalChapterBacklogSum);
  const remainingBacklogLectures = Math.max(0, totalBacklogLectures - completedTotalLectures);
  const overallCompletionPercent =
    totalBacklogLectures > 0
      ? Math.min(100, Math.round((completedTotalLectures / totalBacklogLectures) * 1000) / 10)
      : 0;

  const completedLecturesList = lectures.filter((l) => l.completed);
  const totalWatchMinutes = completedLecturesList.reduce(
    (sum, l) => sum + (l.actualWatchMinutes || calculateActualWatchMinutes(l.durationMinutes, l.playbackSpeed)),
    0
  );
  const todayStudyMinutes = completedLecturesList
    .filter((l) => l.completedDate === todayISO)
    .reduce(
      (sum, l) => sum + (l.actualWatchMinutes || calculateActualWatchMinutes(l.durationMinutes, l.playbackSpeed)),
      0
    );

  // Calculate study streak from consecutive active days up to todayISO
  const activeDates = new Set(
    completedLecturesList.map((l) => l.completedDate).filter((d) => Boolean(d))
  );
  let computedStreak = 0;
  let cursor = todayISO;
  if (!activeDates.has(cursor)) {
    const yesterday = addDaysISO(todayISO, -1);
    if (activeDates.has(yesterday)) {
      cursor = yesterday;
    }
  }
  while (activeDates.has(cursor)) {
    computedStreak++;
    cursor = addDaysISO(cursor, -1);
  }
  const streakDays = Math.max(profile.streakCount || 0, computedStreak);

  return {
    currentDayNumber,
    challengeDurationDays: profile.challengeDurationDays,
    dailyTargetTotal,
    completedTodayTotal,
    remainingTodayTotal,
    todayCompletionPercent,
    totalBacklogLectures,
    completedTotalLectures,
    remainingBacklogLectures,
    overallCompletionPercent,
    totalStudyHours: Math.round((totalWatchMinutes / 60) * 10) / 10,
    todayStudyMinutes,
    streakDays,
    subjectStats,
  };
}

export interface CalendarDayCell {
  dayNumber: number;
  date: string;
  target: number;
  completed: number;
  remaining: number;
  completionPercent: number;
  physicsCompleted: number;
  chemistryCompleted: number;
  mathCompleted: number;
  studyMinutes: number;
  status: 'completed_target' | 'in_progress' | 'upcoming' | 'past_incomplete';
  isToday: boolean;
}

export function build21DayCalendar(
  profile: UserProfile,
  lectures: LectureDoc[],
  todayISO: string
): CalendarDayCell[] {
  const duration = Math.max(1, profile.challengeDurationDays || 21);
  const dailyTarget =
    (profile.physicsDailyTarget || 7) +
    (profile.chemistryDailyTarget || 7) +
    (profile.mathDailyTarget || 6);

  const cells: CalendarDayCell[] = [];
  for (let i = 0; i < duration; i++) {
    const date = addDaysISO(profile.challengeStartDate, i);
    const dayLectures = lectures.filter((l) => l.completed && l.completedDate === date);
    const physicsCompleted = dayLectures.filter((l) => l.subject === 'Physics').length;
    const chemistryCompleted = dayLectures.filter((l) => l.subject === 'Chemistry').length;
    const mathCompleted = dayLectures.filter((l) => l.subject === 'Mathematics').length;
    const completed = dayLectures.length;
    const remaining = Math.max(0, dailyTarget - completed);
    const completionPercent =
      dailyTarget > 0 ? Math.min(100, Math.round((completed / dailyTarget) * 100)) : 0;
    const studyMinutes = dayLectures.reduce((acc, l) => acc + l.actualWatchMinutes, 0);

    const isToday = date === todayISO;
    const isPast = diffDaysISO(date, todayISO) > 0;
    // Never automatically mark incomplete days as completed
    let status: CalendarDayCell['status'] = 'upcoming';
    if (completed >= dailyTarget && dailyTarget > 0) {
      status = 'completed_target';
    } else if (isToday) {
      status = 'in_progress';
    } else if (isPast) {
      status = 'past_incomplete';
    }

    cells.push({
      dayNumber: i + 1,
      date,
      target: dailyTarget,
      completed,
      remaining,
      completionPercent,
      physicsCompleted,
      chemistryCompleted,
      mathCompleted,
      studyMinutes,
      status,
      isToday,
    });
  }

  return cells;
}

export interface AnalyticsReport {
  dailySeries: {
    dayLabel: string;
    date: string;
    completed: number;
    target: number;
    Physics: number;
    Chemistry: number;
    Mathematics: number;
    studyHours: number;
  }[];
  weeklySeries: {
    week: string;
    completed: number;
    target: number;
    completionRate: number;
  }[];
  subjectDistribution: {
    subject: SubjectName;
    completed: number;
    remaining: number;
    total: number;
    percent: number;
  }[];
  totalStudyHours: number;
  averageLecturesPerDay: number;
  predictedDaysToFinish: number;
  predictedCompletionDate: string;
  onTrackFor21Days: boolean;
}

export function computeAnalyticsReport(
  profile: UserProfile,
  chapters: ChapterDoc[],
  lectures: LectureDoc[],
  todayISO: string
): AnalyticsReport {
  const calendar = build21DayCalendar(profile, lectures, todayISO);
  const summary = computeDashboardSummary(profile, chapters, lectures, todayISO);

  const dailySeries = calendar.map((c) => ({
    dayLabel: `D${c.dayNumber}`,
    date: c.date,
    completed: c.completed,
    target: c.target,
    Physics: c.physicsCompleted,
    Chemistry: c.chemistryCompleted,
    Mathematics: c.mathCompleted,
    studyHours: Math.round((c.studyMinutes / 60) * 10) / 10,
  }));

  const weeklySeries = [0, 1, 2].map((wIdx) => {
    const slice = calendar.slice(wIdx * 7, (wIdx + 1) * 7);
    const completed = slice.reduce((acc, c) => acc + c.completed, 0);
    const target = slice.reduce((acc, c) => acc + c.target, 0);
    return {
      week: `Week ${wIdx + 1} (D${wIdx * 7 + 1}-D${Math.min(calendar.length, (wIdx + 1) * 7)})`,
      completed,
      target,
      completionRate: target > 0 ? Math.min(100, Math.round((completed / target) * 100)) : 0,
    };
  });

  const subjects: SubjectName[] = ['Physics', 'Chemistry', 'Mathematics'];
  const subjectDistribution = subjects.map((s) => {
    const st = summary.subjectStats[s];
    return {
      subject: s,
      completed: st.completedTotal,
      remaining: st.remainingBacklog,
      total: st.totalBacklog,
      percent: st.completionPercent,
    };
  });

  const elapsedDays = Math.max(1, summary.currentDayNumber);
  const averageLecturesPerDay =
    Math.round((summary.completedTotalLectures / elapsedDays) * 10) / 10;

  const effectiveVelocity =
    averageLecturesPerDay > 0 ? averageLecturesPerDay : summary.dailyTargetTotal || 20;
  const predictedDaysToFinish =
    summary.remainingBacklogLectures > 0
      ? Math.ceil(summary.remainingBacklogLectures / effectiveVelocity)
      : 0;
  const predictedCompletionDate = addDaysISO(todayISO, predictedDaysToFinish);
  const remainingChallengeDays = Math.max(0, profile.challengeDurationDays - summary.currentDayNumber + 1);
  const onTrackFor21Days = predictedDaysToFinish <= remainingChallengeDays;

  return {
    dailySeries,
    weeklySeries,
    subjectDistribution,
    totalStudyHours: summary.totalStudyHours,
    averageLecturesPerDay,
    predictedDaysToFinish,
    predictedCompletionDate,
    onTrackFor21Days,
  };
}

export function getNextDronaLecturesForChapter(
  ch: ChapterDoc,
  existingCount: number,
  count: number,
  uid: string
): LectureDoc[] {
  const bp = DRONA_CHAPTER_BLUEPRINTS.find((b) => b.id === ch.id);
  const toCreate = Math.max(1, Math.min(40, count));
  const createdList: LectureDoc[] = [];

  for (let i = 0; i < toCreate; i++) {
    const zeroIdx = existingCount + i;
    const seqNum = zeroIdx + 1;
    const numStr = String(seqNum).padStart(2, '0');
    const id = sanitizeId(`lec_${ch.id}_${numStr}_${Date.now()}_${i}`);
    const tpl = bp?.sampleLectures[zeroIdx];

    if (tpl) {
      createdList.push({
        id,
        uid,
        title: `${tpl.code}: ${tpl.title}`,
        subject: ch.subject,
        chapterId: ch.id,
        chapterTitle: ch.title,
        durationMinutes: tpl.durationMinutes || 90,
        playbackSpeed: 1.5,
        actualWatchMinutes: 60,
        completed: false,
        completedDate: '',
        notes: `${tpl.notes} (Scheduled: ${tpl.scheduledDate})`,
      });
    } else {
      createdList.push({
        id,
        uid,
        title: `L${numStr}: ${ch.title} — Drona 2.0 Lecture ${seqNum}`,
        subject: ch.subject,
        chapterId: ch.id,
        chapterTitle: ch.title,
        durationMinutes: 90,
        playbackSpeed: 1.5,
        actualWatchMinutes: 60,
        completed: false,
        completedDate: '',
        notes: bp
          ? `Drona JEE 2.0 (${bp.dateRange}): ${bp.subtopicsSummary}`
          : `High-yield ${ch.title} lecture ${seqNum} notes & PYQs.`,
      });
    }
  }

  return createdList;
}

export interface InitialSeedBundle {
  profile: UserProfile;
  subjects: SubjectDoc[];
  chapters: ChapterDoc[];
  lectures: LectureDoc[];
  tasks: TaskDoc[];
  notes: NoteDoc[];
}

export function generateInitialMissionData(
  uid: string,
  displayName: string,
  email: string,
  todayISO: string
): InitialSeedBundle {
  const profile: UserProfile = {
    uid,
    displayName: (displayName || 'JEE Aspirant').slice(0, 100),
    email: (email || 'aspirant@jeemission21.app').slice(0, 254),
    challengeStartDate: todayISO,
    challengeDurationDays: 21,
    totalBacklogTarget: 420,
    physicsDailyTarget: 7,
    chemistryDailyTarget: 7,
    mathDailyTarget: 6,
    streakCount: 1,
  };

  const subjects: SubjectDoc[] = [
    {
      id: 'subj_physics',
      uid,
      name: 'Physics',
      dailyTarget: 7,
      totalLectures: 147,
      completedLectures: 0,
    },
    {
      id: 'subj_chemistry',
      uid,
      name: 'Chemistry',
      dailyTarget: 7,
      totalLectures: 111,
      completedLectures: 0,
    },
    {
      id: 'subj_mathematics',
      uid,
      name: 'Mathematics',
      dailyTarget: 6,
      totalLectures: 126,
      completedLectures: 0,
    },
  ];

  // Preload official Drona JEE 2.0 2027 (Mission JEET) syllabus chapters, lectures & test milestones
  const dronaSeed = buildDronaInitialChaptersAndLectures(uid);
  const chapters: ChapterDoc[] = dronaSeed.chapters;
  const lectures: LectureDoc[] = dronaSeed.lectures;

  // The 8 Required Default Daily Tasks + Drona JEE 2.0 Test Milestones + NIOS Manager items
  const tasks: TaskDoc[] = [
    {
      id: 'task_def_phys_lec',
      uid,
      title: 'Physics lectures (Daily Target: 7)',
      category: 'Physics',
      priority: 'Critical',
      deadline: todayISO,
      date: todayISO,
      completed: false,
      isDefault: true,
      niosType: 'None',
    },
    {
      id: 'task_def_chem_lec',
      uid,
      title: 'Chemistry lectures (Daily Target: 7)',
      category: 'Chemistry',
      priority: 'Critical',
      deadline: todayISO,
      date: todayISO,
      completed: false,
      isDefault: true,
      niosType: 'None',
    },
    {
      id: 'task_def_math_lec',
      uid,
      title: 'Mathematics lectures (Daily Target: 6)',
      category: 'Mathematics',
      priority: 'Critical',
      deadline: todayISO,
      date: todayISO,
      completed: false,
      isDefault: true,
      niosType: 'None',
    },
    {
      id: 'task_def_phys_qp',
      uid,
      title: 'Physics question practice (45 problems)',
      category: 'Physics',
      priority: 'High',
      deadline: todayISO,
      date: todayISO,
      completed: false,
      isDefault: true,
      niosType: 'None',
    },
    {
      id: 'task_def_chem_dpp',
      uid,
      title: 'Chemistry DPP (Organic + Physical sheets)',
      category: 'Chemistry',
      priority: 'High',
      deadline: todayISO,
      date: todayISO,
      completed: false,
      isDefault: true,
      niosType: 'None',
    },
    {
      id: 'task_def_math_pyq',
      uid,
      title: 'Mathematics PYQs (2019–2025 Timed Drill)',
      category: 'Mathematics',
      priority: 'High',
      deadline: todayISO,
      date: todayISO,
      completed: false,
      isDefault: true,
      niosType: 'None',
    },
    {
      id: 'task_def_formula_rev',
      uid,
      title: 'Formula revision (Active recall 30 mins)',
      category: 'Revision',
      priority: 'Medium',
      deadline: todayISO,
      date: todayISO,
      completed: false,
      isDefault: true,
      niosType: 'None',
    },
    {
      id: 'task_def_nios_studies',
      uid,
      title: 'NIOS studies (Board alignment & TMA check)',
      category: 'NIOS',
      priority: 'Medium',
      deadline: todayISO,
      date: todayISO,
      completed: false,
      isDefault: true,
      niosType: 'None',
    },
    ...dronaSeed.milestoneTasks,
    // Preloaded NIOS Manager items across Subject, Assignment, Practical, ExamPrep, Revision
    {
      id: 'task_nios_subj_phys',
      uid,
      title: 'NIOS Physics (312) — Senior Secondary Syllabus Mapping',
      category: 'NIOS',
      priority: 'High',
      deadline: addDaysISO(todayISO, 10),
      date: todayISO,
      completed: false,
      isDefault: false,
      niosType: 'Subject',
    },
    {
      id: 'task_nios_subj_chem',
      uid,
      title: 'NIOS Chemistry (313) — Core Module Chapters 1–18',
      category: 'NIOS',
      priority: 'High',
      deadline: addDaysISO(todayISO, 12),
      date: todayISO,
      completed: false,
      isDefault: false,
      niosType: 'Subject',
    },
    {
      id: 'task_nios_subj_math',
      uid,
      title: 'NIOS Mathematics (311) — Calculus & Vectors Module',
      category: 'NIOS',
      priority: 'High',
      deadline: addDaysISO(todayISO, 14),
      date: todayISO,
      completed: false,
      isDefault: false,
      niosType: 'Subject',
    },
    {
      id: 'task_nios_tma_1',
      uid,
      title: 'Tutor Marked Assignment (TMA) — Physics (312) Submission',
      category: 'NIOS',
      priority: 'Critical',
      deadline: addDaysISO(todayISO, 5),
      date: todayISO,
      completed: false,
      isDefault: false,
      niosType: 'Assignment',
    },
    {
      id: 'task_nios_tma_2',
      uid,
      title: 'Tutor Marked Assignment (TMA) — Chemistry (313) PDF Upload',
      category: 'NIOS',
      priority: 'Critical',
      deadline: addDaysISO(todayISO, 6),
      date: todayISO,
      completed: false,
      isDefault: false,
      niosType: 'Assignment',
    },
    {
      id: 'task_nios_prac_1',
      uid,
      title: 'Physics & Chemistry Lab Manual Practical Record Book (15 Experiments)',
      category: 'NIOS',
      priority: 'High',
      deadline: addDaysISO(todayISO, 9),
      date: todayISO,
      completed: false,
      isDefault: false,
      niosType: 'Practical',
    },
    {
      id: 'task_nios_exam_1',
      uid,
      title: 'NIOS 3-Year Previous Board Question Paper Simulation',
      category: 'NIOS',
      priority: 'High',
      deadline: addDaysISO(todayISO, 15),
      date: todayISO,
      completed: false,
      isDefault: false,
      niosType: 'ExamPrep',
    },
    {
      id: 'task_nios_rev_1',
      uid,
      title: 'NIOS Descriptive Derivations & Marking Scheme Revision',
      category: 'NIOS',
      priority: 'Medium',
      deadline: addDaysISO(todayISO, 18),
      date: todayISO,
      completed: false,
      isDefault: false,
      niosType: 'Revision',
    },
  ];

  const notes: NoteDoc[] = [
    {
      id: 'note_day_01',
      uid,
      date: todayISO,
      title: 'Drona JEE 2.0 2027 (Mission JEET) — 21-Day Backlog Protocol',
      content:
        'Official Drona JEE 2.0 2027 Batch Planner synced: Organic Chemistry (32 lectures: IUPAC 6, Isomerism 8, GOC 9, Hydrocarbons 7, Purification/Env 2), Physical Chemistry (47 lectures: Mole Concept 10, Atomic Structure 7, Gaseous State 6, Thermodynamics 8, Redox 3, Chemical Eq 5, Ionic Eq 8), Inorganic Chemistry (32 lectures), Physics (147 lectures) & Mathematics (126 lectures). Daily Target: 7 Physics + 7 Chemistry + 6 Math = 20 lectures/day.',
    },
  ];

  return {
    profile,
    subjects,
    chapters,
    lectures,
    tasks,
    notes,
  };
}

export function generateCSVExport(
  lectures: LectureDoc[],
  chapters: ChapterDoc[],
  tasks: TaskDoc[]
): string {
  const escapeCSV = (val: string | number | boolean) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines: string[] = [];
  lines.push('SECTION,ID,TITLE,SUBJECT_OR_CATEGORY,CHAPTER_OR_TYPE,DURATION_OR_PRIORITY,SPEED,WATCH_MINUTES,STATUS,DATE,NOTES');

  for (const ch of chapters) {
    lines.push(
      [
        'CHAPTER',
        ch.id,
        ch.title,
        ch.subject,
        'Syllabus Chapter',
        ch.priority,
        '-',
        '-',
        `${ch.completedLectures}/${ch.totalLectures}`,
        '-',
        '',
      ]
        .map(escapeCSV)
        .join(',')
    );
  }

  for (const lec of lectures) {
    lines.push(
      [
        'LECTURE',
        lec.id,
        lec.title,
        lec.subject,
        lec.chapterTitle,
        lec.durationMinutes,
        `${lec.playbackSpeed}x`,
        lec.actualWatchMinutes,
        lec.completed ? 'Completed' : 'Pending',
        lec.completedDate || '-',
        lec.notes,
      ]
        .map(escapeCSV)
        .join(',')
    );
  }

  for (const t of tasks) {
    lines.push(
      [
        t.niosType !== 'None' ? `NIOS_${t.niosType.toUpperCase()}` : 'TASK',
        t.id,
        t.title,
        t.category,
        t.niosType,
        t.priority,
        '-',
        '-',
        t.completed ? 'Completed' : 'Pending',
        t.deadline || t.date,
        '',
      ]
        .map(escapeCSV)
        .join(',')
    );
  }

  return lines.join('\n');
}
