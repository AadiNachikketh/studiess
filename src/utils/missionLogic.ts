import {
  ChapterDoc,
  LectureDoc,
  NoteDoc,
  SubjectDoc,
  SubjectName,
  TaskDoc,
  UserProfile,
} from '../types/mission';

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
      totalLectures: 147,
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

  // Preload Chemistry (Organic Chemistry: 32 lectures, Physical Chemistry: 47 lectures, Inorganic Chemistry: 68 lectures)
  // Plus Physics and Mathematics chapters totaling 420 lectures
  const chapters: ChapterDoc[] = [
    {
      id: 'ch_chem_organic',
      uid,
      subject: 'Chemistry',
      title: 'Organic Chemistry',
      totalLectures: 32,
      completedLectures: 0,
      priority: 'High',
    },
    {
      id: 'ch_chem_physical',
      uid,
      subject: 'Chemistry',
      title: 'Physical Chemistry',
      totalLectures: 47,
      completedLectures: 0,
      priority: 'High',
    },
    {
      id: 'ch_chem_inorganic',
      uid,
      subject: 'Chemistry',
      title: 'Inorganic Chemistry & Coordination',
      totalLectures: 68,
      completedLectures: 0,
      priority: 'Medium',
    },
    {
      id: 'ch_phys_electro',
      uid,
      subject: 'Physics',
      title: 'Electrodynamics & Capacitance',
      totalLectures: 52,
      completedLectures: 0,
      priority: 'High',
    },
    {
      id: 'ch_phys_mech',
      uid,
      subject: 'Physics',
      title: 'Mechanics & Rotational Dynamics',
      totalLectures: 55,
      completedLectures: 0,
      priority: 'High',
    },
    {
      id: 'ch_phys_optics',
      uid,
      subject: 'Physics',
      title: 'Optics, Waves & Modern Physics',
      totalLectures: 40,
      completedLectures: 0,
      priority: 'Medium',
    },
    {
      id: 'ch_math_calc',
      uid,
      subject: 'Mathematics',
      title: 'Differential & Integral Calculus',
      totalLectures: 48,
      completedLectures: 0,
      priority: 'High',
    },
    {
      id: 'ch_math_coord',
      uid,
      subject: 'Mathematics',
      title: 'Coordinate Geometry & Vectors 3D',
      totalLectures: 42,
      completedLectures: 0,
      priority: 'High',
    },
    {
      id: 'ch_math_alg',
      uid,
      subject: 'Mathematics',
      title: 'Matrices, Complex Numbers & Probability',
      totalLectures: 36,
      completedLectures: 0,
      priority: 'Medium',
    },
  ];

  // Create actionable initial lectures across Organic Chemistry, Physical Chemistry, Physics, and Math
  const lectures: LectureDoc[] = [
    // Organic Chemistry (Part of 32-lecture syllabus)
    {
      id: 'lec_org_01',
      uid,
      title: 'L01: IUPAC Nomenclature & Structural Isomerism',
      subject: 'Chemistry',
      chapterId: 'ch_chem_organic',
      chapterTitle: 'Organic Chemistry',
      durationMinutes: 90,
      playbackSpeed: 1.5,
      actualWatchMinutes: 60,
      completed: false,
      completedDate: '',
      notes: 'Focus on bicyclic & spiro priority rules + PYQ exceptions.',
    },
    {
      id: 'lec_org_02',
      uid,
      title: 'L02: General Organic Chemistry — Inductive & Hyperconjugation',
      subject: 'Chemistry',
      chapterId: 'ch_chem_organic',
      chapterTitle: 'Organic Chemistry',
      durationMinutes: 95,
      playbackSpeed: 1.5,
      actualWatchMinutes: 63,
      completed: false,
      completedDate: '',
      notes: 'Carbocation stability order and resonance energy comparison.',
    },
    {
      id: 'lec_org_03',
      uid,
      title: 'L03: GOC — Aromaticity, Acidity & Basicity Trends',
      subject: 'Chemistry',
      chapterId: 'ch_chem_organic',
      chapterTitle: 'Organic Chemistry',
      durationMinutes: 90,
      playbackSpeed: 1.5,
      actualWatchMinutes: 60,
      completed: false,
      completedDate: '',
      notes: 'Ortho effect in benzoic acids & aniline basicity in aqueous phase.',
    },
    {
      id: 'lec_org_04',
      uid,
      title: 'L04: Stereoisomerism — Chirality, R/S & E/Z Configuration',
      subject: 'Chemistry',
      chapterId: 'ch_chem_organic',
      chapterTitle: 'Organic Chemistry',
      durationMinutes: 105,
      playbackSpeed: 1.75,
      actualWatchMinutes: 60,
      completed: false,
      completedDate: '',
      notes: 'Fischer-to-Wedge conversion and meso compounds.',
    },
    {
      id: 'lec_org_05',
      uid,
      title: 'L05: Reaction Mechanisms — SN1, SN2, E1, E2 & E1cb',
      subject: 'Chemistry',
      chapterId: 'ch_chem_organic',
      chapterTitle: 'Organic Chemistry',
      durationMinutes: 100,
      playbackSpeed: 1.5,
      actualWatchMinutes: 67,
      completed: false,
      completedDate: '',
      notes: 'Solvent effects (polar protic vs aprotic) and Saytzeff vs Hofmann.',
    },
    // Physical Chemistry (Part of 47-lecture syllabus)
    {
      id: 'lec_phychem_01',
      uid,
      title: 'L01: Mole Concept, Limiting Reagent & Eudiometry',
      subject: 'Chemistry',
      chapterId: 'ch_chem_physical',
      chapterTitle: 'Physical Chemistry',
      durationMinutes: 90,
      playbackSpeed: 1.5,
      actualWatchMinutes: 60,
      completed: false,
      completedDate: '',
      notes: 'Equivalent weight in redox & back titration numericals.',
    },
    {
      id: 'lec_phychem_02',
      uid,
      title: 'L02: Chemical Thermodynamics — First Law & Thermochemistry',
      subject: 'Chemistry',
      chapterId: 'ch_chem_physical',
      chapterTitle: 'Physical Chemistry',
      durationMinutes: 105,
      playbackSpeed: 1.5,
      actualWatchMinutes: 70,
      completed: false,
      completedDate: '',
      notes: 'Reversible vs irreversible adiabatic expansion work formulas.',
    },
    {
      id: 'lec_phychem_03',
      uid,
      title: 'L03: Ionic Equilibrium — pH of Buffers, Hydrolysis & Ksp',
      subject: 'Chemistry',
      chapterId: 'ch_chem_physical',
      chapterTitle: 'Physical Chemistry',
      durationMinutes: 110,
      playbackSpeed: 1.5,
      actualWatchMinutes: 73,
      completed: false,
      completedDate: '',
      notes: 'Henderson equation & simultaneous solubility calculations.',
    },
    {
      id: 'lec_phychem_04',
      uid,
      title: 'L04: Electrochemistry — Nernst Equation & Conductance',
      subject: 'Chemistry',
      chapterId: 'ch_chem_physical',
      chapterTitle: 'Physical Chemistry',
      durationMinutes: 95,
      playbackSpeed: 1.5,
      actualWatchMinutes: 63,
      completed: false,
      completedDate: '',
      notes: 'Kohlrausch law and Faraday electrolysis laws.',
    },
    {
      id: 'lec_phychem_05',
      uid,
      title: 'L05: Chemical Kinetics — First Order & Arrhenius Equation',
      subject: 'Chemistry',
      chapterId: 'ch_chem_physical',
      chapterTitle: 'Physical Chemistry',
      durationMinutes: 90,
      playbackSpeed: 1.5,
      actualWatchMinutes: 60,
      completed: false,
      completedDate: '',
      notes: 'Parallel & sequential reaction kinetics for JEE Advanced.',
    },
    // Physics Backlog
    {
      id: 'lec_phys_01',
      uid,
      title: 'L01: Electrostatics — Gauss Law & Electric Potential',
      subject: 'Physics',
      chapterId: 'ch_phys_electro',
      chapterTitle: 'Electrodynamics & Capacitance',
      durationMinutes: 90,
      playbackSpeed: 1.5,
      actualWatchMinutes: 60,
      completed: false,
      completedDate: '',
      notes: 'Cavity inside solid non-conducting sphere & self-energy.',
    },
    {
      id: 'lec_phys_02',
      uid,
      title: 'L02: Capacitors — Dielectric Slab Insertion & RC Circuits',
      subject: 'Physics',
      chapterId: 'ch_phys_electro',
      chapterTitle: 'Electrodynamics & Capacitance',
      durationMinutes: 95,
      playbackSpeed: 1.5,
      actualWatchMinutes: 63,
      completed: false,
      completedDate: '',
      notes: 'Transient state charge growth & heat dissipation in switches.',
    },
    {
      id: 'lec_phys_03',
      uid,
      title: 'L03: Rigid Body Dynamics — Rolling with & without Slipping',
      subject: 'Physics',
      chapterId: 'ch_phys_mech',
      chapterTitle: 'Mechanics & Rotational Dynamics',
      durationMinutes: 105,
      playbackSpeed: 1.5,
      actualWatchMinutes: 70,
      completed: false,
      completedDate: '',
      notes: 'Conservation of angular momentum about instantaneous axis.',
    },
    // Mathematics Backlog
    {
      id: 'lec_math_01',
      uid,
      title: 'L01: Definite Integration — King Property & Leibniz Rule',
      subject: 'Mathematics',
      chapterId: 'ch_math_calc',
      chapterTitle: 'Differential & Integral Calculus',
      durationMinutes: 90,
      playbackSpeed: 1.5,
      actualWatchMinutes: 60,
      completed: false,
      completedDate: '',
      notes: 'Solve 25 JEE Main + Advanced PYQs after lecture.',
    },
    {
      id: 'lec_math_02',
      uid,
      title: 'L02: Vectors & 3D Geometry — Skew Lines & Shortest Distance',
      subject: 'Mathematics',
      chapterId: 'ch_math_coord',
      chapterTitle: 'Coordinate Geometry & Vectors 3D',
      durationMinutes: 90,
      playbackSpeed: 1.5,
      actualWatchMinutes: 60,
      completed: false,
      completedDate: '',
      notes: 'Scalar triple product & projection formulas.',
    },
  ];

  // The 8 Required Default Daily Tasks + NIOS Manager items
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
      title: 'Day 1 Mission Briefing — 20 Lectures/Day Protocol',
      content:
        'Target locked: 7 Physics + 7 Chemistry + 6 Mathematics = 20 lectures/day at 1.5x–1.75x speed. Organic Chemistry (32 lectures) and Physical Chemistry (47 lectures) prioritized for week 1–2 completion.',
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
