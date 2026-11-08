import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  ChapterDoc,
  ChapterPriority,
  DailyProgress,
  LectureDoc,
  NiosTaskType,
  NoteDoc,
  PriorityLevel,
  SubjectDoc,
  SubjectName,
  TaskCategory,
  TaskDoc,
  UserProfile,
} from '../types/mission';
import {
  calculateActualWatchMinutes,
  computeAnalyticsReport,
  computeDashboardSummary,
  build21DayCalendar,
  generateInitialMissionData,
  getTodayISO,
  sanitizeId,
  DashboardSummary,
  CalendarDayCell,
  AnalyticsReport,
} from '../utils/missionLogic';

interface MissionContextValue {
  user: User | null;
  isWorkspaceActive: boolean;
  authLoading: boolean;
  syncStatus: 'synced' | 'syncing' | 'local_mirror' | 'offline_error';
  authError: string | null;
  clearAuthError: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  enterLocalWorkspace: () => void;
  logoutUser: () => Promise<void>;

  todayISO: string;
  profile: UserProfile;
  subjects: SubjectDoc[];
  chapters: ChapterDoc[];
  lectures: LectureDoc[];
  tasks: TaskDoc[];
  notes: NoteDoc[];
  dailyProgressMap: Record<string, DailyProgress>;

  summary: DashboardSummary;
  calendarDays: CalendarDayCell[];
  analytics: AnalyticsReport;

  // Actions
  updateUserProfileSettings: (updates: Partial<UserProfile>) => Promise<void>;
  addChapter: (input: {
    subject: SubjectName;
    title: string;
    totalLectures: number;
    priority: ChapterPriority;
  }) => Promise<void>;
  updateChapter: (
    chapterId: string,
    updates: Partial<Pick<ChapterDoc, 'title' | 'subject' | 'totalLectures' | 'completedLectures' | 'priority'>>
  ) => Promise<void>;
  deleteChapter: (chapterId: string) => Promise<void>;

  addLecture: (input: {
    title: string;
    subject: SubjectName;
    chapterId: string;
    durationMinutes: number;
    playbackSpeed: number;
    notes: string;
  }) => Promise<void>;
  updateLecture: (
    lectureId: string,
    updates: Partial<
      Pick<
        LectureDoc,
        'title' | 'subject' | 'chapterId' | 'durationMinutes' | 'playbackSpeed' | 'notes'
      >
    >
  ) => Promise<void>;
  toggleLectureCompletion: (lectureId: string, targetDateISO?: string) => Promise<void>;
  deleteLecture: (lectureId: string) => Promise<void>;
  generateChapterLecturesBatch: (chapterId: string, count: number) => Promise<void>;

  addTask: (input: {
    title: string;
    category: TaskCategory;
    priority: PriorityLevel;
    deadline: string;
    date?: string;
    niosType?: NiosTaskType;
  }) => Promise<void>;
  updateTask: (
    taskId: string,
    updates: Partial<Pick<TaskDoc, 'title' | 'category' | 'priority' | 'deadline' | 'completed' | 'niosType'>>
  ) => Promise<void>;
  toggleTaskCompletion: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;

  addOrUpdateNote: (input: { id?: string; date: string; title: string; content: string }) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;

  resetOrRestoreMissionData: (backup?: {
    profile: UserProfile;
    chapters: ChapterDoc[];
    lectures: LectureDoc[];
    tasks: TaskDoc[];
    notes: NoteDoc[];
  }) => Promise<void>;
}

const MissionContext = createContext<MissionContextValue | null>(null);

const STORAGE_KEY_PREFIX = 'jee_mission_21_state_v1_';
const ACTIVE_SESSION_KEY = 'jee_mission_21_active_session_v1';

export const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todayISO] = useState<string>(() => getTodayISO());
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'local_mirror' | 'offline_error'>('synced');

  // Check if ?autostart=1 or existing local workspace session is active
  const [localModeActive, setLocalModeActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') return true;
      const saved = window.localStorage.getItem(ACTIVE_SESSION_KEY);
      if (saved === 'true') return true;
    }
    return true; // Default to active workspace with top auth status bar & instant persistence
  });

  const activeUid = useMemo(() => {
    if (user?.uid) return sanitizeId(user.uid);
    return 'local_aspirant_21';
  }, [user]);

  const initialSeed = useMemo(
    () =>
      generateInitialMissionData(
        activeUid,
        user?.displayName || 'Aadi (JEE Aspirant)',
        user?.email || 'aadipasso1@gmail.com',
        todayISO
      ),
    [activeUid, user?.displayName, user?.email, todayISO]
  );

  const [profile, setProfile] = useState<UserProfile>(initialSeed.profile);
  const [subjects, setSubjects] = useState<SubjectDoc[]>(initialSeed.subjects);
  const [chapters, setChapters] = useState<ChapterDoc[]>(initialSeed.chapters);
  const [lectures, setLectures] = useState<LectureDoc[]>(initialSeed.lectures);
  const [tasks, setTasks] = useState<TaskDoc[]>(initialSeed.tasks);
  const [notes, setNotes] = useState<NoteDoc[]>(initialSeed.notes);
  const [dailyProgressMap, setDailyProgressMap] = useState<Record<string, DailyProgress>>({});

  const canWriteToFirestore = Boolean(user && user.emailVerified);

  // Load from localStorage cache immediately for zero-latency boot & refresh persistence
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_PREFIX + activeUid);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.profile) setProfile(parsed.profile);
        if (Array.isArray(parsed.subjects) && parsed.subjects.length > 0) setSubjects(parsed.subjects);
        if (Array.isArray(parsed.chapters) && parsed.chapters.length > 0) setChapters(parsed.chapters);
        if (Array.isArray(parsed.lectures)) setLectures(parsed.lectures);
        if (Array.isArray(parsed.tasks)) setTasks(parsed.tasks);
        if (Array.isArray(parsed.notes)) setNotes(parsed.notes);
        if (parsed.dailyProgressMap) setDailyProgressMap(parsed.dailyProgressMap);
      } else {
        setProfile(initialSeed.profile);
        setSubjects(initialSeed.subjects);
        setChapters(initialSeed.chapters);
        setLectures(initialSeed.lectures);
        setTasks(initialSeed.tasks);
        setNotes(initialSeed.notes);
      }
    } catch (e) {
      console.warn('Failed to parse local mission cache:', e);
    }
  }, [activeUid, initialSeed]);

  // Persist to localStorage whenever state updates
  useEffect(() => {
    try {
      const payload = {
        profile,
        subjects,
        chapters,
        lectures,
        tasks,
        notes,
        dailyProgressMap,
      };
      window.localStorage.setItem(STORAGE_KEY_PREFIX + activeUid, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save local mission cache:', e);
    }
  }, [activeUid, profile, subjects, chapters, lectures, tasks, notes, dailyProgressMap]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      if (firebaseUser) {
        setLocalModeActive(true);
        window.localStorage.setItem(ACTIVE_SESSION_KEY, 'true');
      }
    });
    return () => unsub();
  }, []);

  // Bootstrap and subscribe to Firestore collections when user is authenticated & verified
  useEffect(() => {
    if (!user || !user.emailVerified) {
      setSyncStatus(user ? 'local_mirror' : 'local_mirror');
      return;
    }

    const uid = sanitizeId(user.uid);
    let isMounted = true;
    const unsubscribers: (() => void)[] = [];

    async function bootstrapAndSubscribe() {
      setSyncStatus('syncing');
      const userDocRef = doc(db, 'users', uid);

      try {
        const snap = await getDoc(userDocRef);
        if (!snap.exists()) {
          // Seed initial data into Firestore for this user
          const seed = generateInitialMissionData(
            uid,
            user?.displayName || 'JEE Aspirant',
            user?.email || 'aspirant@jeemission21.app',
            todayISO
          );
          await setDoc(userDocRef, {
            ...seed.profile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          const batch = writeBatch(db);
          for (const subj of seed.subjects) {
            const { id, ...rest } = subj;
            batch.set(doc(db, 'users', uid, 'subjects', id), {
              ...rest,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
          for (const ch of seed.chapters) {
            const { id, ...rest } = ch;
            batch.set(doc(db, 'users', uid, 'chapters', id), {
              ...rest,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
          for (const lec of seed.lectures) {
            const { id, ...rest } = lec;
            batch.set(doc(db, 'users', uid, 'lectures', id), {
              ...rest,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
          for (const t of seed.tasks) {
            const { id, ...rest } = t;
            batch.set(doc(db, 'users', uid, 'tasks', id), {
              ...rest,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
          for (const n of seed.notes) {
            const { id, ...rest } = n;
            batch.set(doc(db, 'users', uid, 'notes', id), {
              ...rest,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
          await batch.commit();
        }
      } catch (error) {
        setSyncStatus('offline_error');
        handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
      }

      if (!isMounted) return;

      // Subscribe to Profile
      unsubscribers.push(
        onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setProfile(docSnap.data() as UserProfile);
              setSyncStatus('synced');
            }
          },
          (err) => {
            setSyncStatus('offline_error');
            handleFirestoreError(err, OperationType.GET, `users/${uid}`);
          }
        )
      );

      // Subscribe to Subjects
      unsubscribers.push(
        onSnapshot(
          collection(db, 'users', uid, 'subjects'),
          (qSnap) => {
            if (!qSnap.empty) {
              setSubjects(
                qSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SubjectDoc, 'id'>) }))
              );
            }
          },
          (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/subjects`)
        )
      );

      // Subscribe to Chapters
      unsubscribers.push(
        onSnapshot(
          collection(db, 'users', uid, 'chapters'),
          (qSnap) => {
            if (!qSnap.empty) {
              setChapters(
                qSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChapterDoc, 'id'>) }))
              );
            }
          },
          (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/chapters`)
        )
      );

      // Subscribe to Lectures
      unsubscribers.push(
        onSnapshot(
          collection(db, 'users', uid, 'lectures'),
          (qSnap) => {
            setLectures(
              qSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LectureDoc, 'id'>) }))
            );
          },
          (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/lectures`)
        )
      );

      // Subscribe to Tasks
      unsubscribers.push(
        onSnapshot(
          collection(db, 'users', uid, 'tasks'),
          (qSnap) => {
            setTasks(
              qSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TaskDoc, 'id'>) }))
            );
          },
          (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/tasks`)
        )
      );

      // Subscribe to Notes
      unsubscribers.push(
        onSnapshot(
          collection(db, 'users', uid, 'notes'),
          (qSnap) => {
            setNotes(
              qSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NoteDoc, 'id'>) }))
            );
          },
          (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/notes`)
        )
      );

      // Subscribe to DailyProgress
      unsubscribers.push(
        onSnapshot(
          collection(db, 'users', uid, 'dailyProgress'),
          (qSnap) => {
            const map: Record<string, DailyProgress> = {};
            qSnap.docs.forEach((d) => {
              map[d.id] = { id: d.id, ...(d.data() as Omit<DailyProgress, 'id'>) };
            });
            setDailyProgressMap(map);
          },
          (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/dailyProgress`)
        )
      );
    }

    bootstrapAndSubscribe();

    return () => {
      isMounted = false;
      unsubscribers.forEach((u) => u());
    };
  }, [user, todayISO]);

  // Derived Telemetry
  const summary = useMemo(
    () => computeDashboardSummary(profile, chapters, lectures, todayISO),
    [profile, chapters, lectures, todayISO]
  );

  const calendarDays = useMemo(
    () => build21DayCalendar(profile, lectures, todayISO),
    [profile, lectures, todayISO]
  );

  const analytics = useMemo(
    () => computeAnalyticsReport(profile, chapters, lectures, todayISO),
    [profile, chapters, lectures, todayISO]
  );

  // Auth Actions
  const clearAuthError = useCallback(() => setAuthError(null), []);

  const loginWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      setLocalModeActive(true);
      window.localStorage.setItem(ACTIVE_SESSION_KEY, 'true');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthError(msg);
    }
  }, []);

  const loginWithEmail = useCallback(async (email: string, pass: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      setLocalModeActive(true);
      window.localStorage.setItem(ACTIVE_SESSION_KEY, 'true');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('auth/operation-not-allowed')) {
        setAuthError(
          'Email/Password sign-in is not yet enabled in your Firebase Console. Enable it in Firebase Console → Authentication → Sign-in method, or use Google Sign-In.'
        );
      } else {
        setAuthError(msg);
      }
    }
  }, []);

  const registerWithEmail = useCallback(async (name: string, email: string, pass: string) => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim().slice(0, 100) });
      }
      try {
        await sendEmailVerification(cred.user);
      } catch {
        // Ignore verification email rate limit in preview
      }
      setLocalModeActive(true);
      window.localStorage.setItem(ACTIVE_SESSION_KEY, 'true');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('auth/operation-not-allowed')) {
        setAuthError(
          'Email/Password registration is not yet enabled in your Firebase Console. Enable it in Firebase Console → Authentication → Sign-in method, or use Google Sign-In.'
        );
      } else {
        setAuthError(msg);
      }
    }
  }, []);

  const enterLocalWorkspace = useCallback(() => {
    setLocalModeActive(true);
    window.localStorage.setItem(ACTIVE_SESSION_KEY, 'true');
  }, []);

  const logoutUser = useCallback(async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setLocalModeActive(false);
    window.localStorage.setItem(ACTIVE_SESSION_KEY, 'false');
  }, []);

  // Helper to sync dailyProgress document in Firestore
  const syncDailyProgressDoc = useCallback(
    async (dateISO: string, updatedLectures: LectureDoc[], currentProfile: UserProfile) => {
      const dayLectures = updatedLectures.filter((l) => l.completed && l.completedDate === dateISO);
      const phys = dayLectures.filter((l) => l.subject === 'Physics').length;
      const chem = dayLectures.filter((l) => l.subject === 'Chemistry').length;
      const math = dayLectures.filter((l) => l.subject === 'Mathematics').length;
      const studyMinutes = dayLectures.reduce((s, l) => s + l.actualWatchMinutes, 0);
      const targetLectures =
        currentProfile.physicsDailyTarget +
        currentProfile.chemistryDailyTarget +
        currentProfile.mathDailyTarget;

      const dpDoc: DailyProgress = {
        id: dateISO,
        uid: activeUid,
        date: dateISO,
        dayNumber: 1,
        targetLectures,
        completedLectures: dayLectures.length,
        physicsCompleted: phys,
        chemistryCompleted: chem,
        mathCompleted: math,
        studyMinutes,
      };

      setDailyProgressMap((prev) => ({ ...prev, [dateISO]: dpDoc }));

      if (canWriteToFirestore) {
        const dpRef = doc(db, 'users', activeUid, 'dailyProgress', sanitizeId(dateISO));
        try {
          const snap = await getDoc(dpRef);
          const { id: _id, ...payload } = dpDoc;
          if (!snap.exists()) {
            await setDoc(dpRef, {
              ...payload,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } else {
            await updateDoc(dpRef, {
              dayNumber: payload.dayNumber,
              targetLectures: payload.targetLectures,
              completedLectures: payload.completedLectures,
              physicsCompleted: payload.physicsCompleted,
              chemistryCompleted: payload.chemistryCompleted,
              mathCompleted: payload.mathCompleted,
              studyMinutes: payload.studyMinutes,
              updatedAt: serverTimestamp(),
            });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/dailyProgress/${dateISO}`);
        }
      }
    },
    [activeUid, canWriteToFirestore]
  );

  // CRUD Mutations
  const updateUserProfileSettings = useCallback(
    async (updates: Partial<UserProfile>) => {
      const next: UserProfile = {
        ...profile,
        displayName: (updates.displayName ?? profile.displayName).trim().slice(0, 100) || 'JEE Aspirant',
        challengeStartDate: updates.challengeStartDate ?? profile.challengeStartDate,
        challengeDurationDays: Math.max(
          1,
          Math.min(365, Number(updates.challengeDurationDays ?? profile.challengeDurationDays) || 21)
        ),
        totalBacklogTarget: Math.max(
          1,
          Math.min(2000, Number(updates.totalBacklogTarget ?? profile.totalBacklogTarget) || 420)
        ),
        physicsDailyTarget: Math.max(
          0,
          Math.min(50, Number(updates.physicsDailyTarget ?? profile.physicsDailyTarget))
        ),
        chemistryDailyTarget: Math.max(
          0,
          Math.min(50, Number(updates.chemistryDailyTarget ?? profile.chemistryDailyTarget))
        ),
        mathDailyTarget: Math.max(
          0,
          Math.min(50, Number(updates.mathDailyTarget ?? profile.mathDailyTarget))
        ),
        streakCount: Math.max(0, Math.min(365, Number(updates.streakCount ?? profile.streakCount))),
      };
      setProfile(next);

      if (canWriteToFirestore) {
        try {
          await updateDoc(doc(db, 'users', activeUid), {
            displayName: next.displayName,
            challengeStartDate: next.challengeStartDate,
            challengeDurationDays: next.challengeDurationDays,
            totalBacklogTarget: next.totalBacklogTarget,
            physicsDailyTarget: next.physicsDailyTarget,
            chemistryDailyTarget: next.chemistryDailyTarget,
            mathDailyTarget: next.mathDailyTarget,
            streakCount: next.streakCount,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${activeUid}`);
        }
      }
    },
    [profile, canWriteToFirestore, activeUid]
  );

  const addChapter = useCallback(
    async (input: {
      subject: SubjectName;
      title: string;
      totalLectures: number;
      priority: ChapterPriority;
    }) => {
      const id = sanitizeId(`ch_${Date.now()}`);
      const newChapter: ChapterDoc = {
        id,
        uid: activeUid,
        subject: input.subject,
        title: input.title.trim().slice(0, 120),
        totalLectures: Math.max(0, Math.min(500, Number(input.totalLectures) || 10)),
        completedLectures: 0,
        priority: input.priority,
      };
      setChapters((prev) => [...prev, newChapter]);

      if (canWriteToFirestore) {
        try {
          const { id: _id, ...payload } = newChapter;
          await setDoc(doc(db, 'users', activeUid, 'chapters', id), {
            ...payload,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `users/${activeUid}/chapters/${id}`);
        }
      }
    },
    [activeUid, canWriteToFirestore]
  );

  const updateChapter = useCallback(
    async (
      chapterId: string,
      updates: Partial<
        Pick<ChapterDoc, 'title' | 'subject' | 'totalLectures' | 'completedLectures' | 'priority'>
      >
    ) => {
      const existing = chapters.find((c) => c.id === chapterId);
      if (!existing) return;

      const updated: ChapterDoc = {
        ...existing,
        subject: updates.subject ?? existing.subject,
        title: (updates.title ?? existing.title).trim().slice(0, 120),
        totalLectures: Math.max(
          0,
          Math.min(500, Number(updates.totalLectures ?? existing.totalLectures))
        ),
        completedLectures: Math.max(
          0,
          Math.min(500, Number(updates.completedLectures ?? existing.completedLectures))
        ),
        priority: updates.priority ?? existing.priority,
      };

      setChapters((prev) => prev.map((c) => (c.id === chapterId ? updated : c)));

      if (canWriteToFirestore) {
        try {
          await updateDoc(doc(db, 'users', activeUid, 'chapters', sanitizeId(chapterId)), {
            subject: updated.subject,
            title: updated.title,
            totalLectures: updated.totalLectures,
            completedLectures: updated.completedLectures,
            priority: updated.priority,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${activeUid}/chapters/${chapterId}`);
        }
      }
    },
    [chapters, canWriteToFirestore, activeUid]
  );

  const deleteChapter = useCallback(
    async (chapterId: string) => {
      setChapters((prev) => prev.filter((c) => c.id !== chapterId));
      if (canWriteToFirestore) {
        try {
          await deleteDoc(doc(db, 'users', activeUid, 'chapters', sanitizeId(chapterId)));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${activeUid}/chapters/${chapterId}`);
        }
      }
    },
    [canWriteToFirestore, activeUid]
  );

  const addLecture = useCallback(
    async (input: {
      title: string;
      subject: SubjectName;
      chapterId: string;
      durationMinutes: number;
      playbackSpeed: number;
      notes: string;
    }) => {
      const id = sanitizeId(`lec_${Date.now()}`);
      const ch = chapters.find((c) => c.id === input.chapterId);
      const chapterTitle = ch ? ch.title : `${input.subject} General`;
      const durationMinutes = Math.max(1, Math.min(600, Number(input.durationMinutes) || 90));
      const playbackSpeed = Math.max(0.5, Math.min(4, Number(input.playbackSpeed) || 1.5));
      const actualWatchMinutes = calculateActualWatchMinutes(durationMinutes, playbackSpeed);

      const newLecture: LectureDoc = {
        id,
        uid: activeUid,
        title: input.title.trim().slice(0, 200),
        subject: input.subject,
        chapterId: sanitizeId(input.chapterId || 'ch_general'),
        chapterTitle: chapterTitle.slice(0, 120),
        durationMinutes,
        playbackSpeed,
        actualWatchMinutes,
        completed: false,
        completedDate: '',
        notes: (input.notes || '').trim().slice(0, 2000),
      };

      setLectures((prev) => [newLecture, ...prev]);

      if (canWriteToFirestore) {
        try {
          const { id: _id, ...payload } = newLecture;
          await setDoc(doc(db, 'users', activeUid, 'lectures', id), {
            ...payload,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `users/${activeUid}/lectures/${id}`);
        }
      }
    },
    [chapters, activeUid, canWriteToFirestore]
  );

  const updateLecture = useCallback(
    async (
      lectureId: string,
      updates: Partial<
        Pick<
          LectureDoc,
          'title' | 'subject' | 'chapterId' | 'durationMinutes' | 'playbackSpeed' | 'notes'
        >
      >
    ) => {
      const existing = lectures.find((l) => l.id === lectureId);
      if (!existing) return;

      const nextChapterId = updates.chapterId ?? existing.chapterId;
      const ch = chapters.find((c) => c.id === nextChapterId);
      const durationMinutes = Math.max(
        1,
        Math.min(600, Number(updates.durationMinutes ?? existing.durationMinutes))
      );
      const playbackSpeed = Math.max(
        0.5,
        Math.min(4, Number(updates.playbackSpeed ?? existing.playbackSpeed))
      );
      const actualWatchMinutes = calculateActualWatchMinutes(durationMinutes, playbackSpeed);

      const updated: LectureDoc = {
        ...existing,
        title: (updates.title ?? existing.title).trim().slice(0, 200),
        subject: updates.subject ?? existing.subject,
        chapterId: sanitizeId(nextChapterId),
        chapterTitle: ch ? ch.title.slice(0, 120) : existing.chapterTitle,
        durationMinutes,
        playbackSpeed,
        actualWatchMinutes,
        notes: (updates.notes ?? existing.notes).trim().slice(0, 2000),
      };

      setLectures((prev) => prev.map((l) => (l.id === lectureId ? updated : l)));

      if (canWriteToFirestore) {
        try {
          await updateDoc(doc(db, 'users', activeUid, 'lectures', sanitizeId(lectureId)), {
            title: updated.title,
            subject: updated.subject,
            chapterId: updated.chapterId,
            chapterTitle: updated.chapterTitle,
            durationMinutes: updated.durationMinutes,
            playbackSpeed: updated.playbackSpeed,
            actualWatchMinutes: updated.actualWatchMinutes,
            completed: updated.completed,
            completedDate: updated.completedDate,
            notes: updated.notes,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${activeUid}/lectures/${lectureId}`);
        }
      }
    },
    [lectures, chapters, canWriteToFirestore, activeUid]
  );

  const toggleLectureCompletion = useCallback(
    async (lectureId: string, targetDateISO?: string) => {
      const existing = lectures.find((l) => l.id === lectureId);
      if (!existing) return;

      const nextCompleted = !existing.completed;
      const dateToUse = nextCompleted ? targetDateISO || todayISO : '';
      const previousDate = existing.completedDate;

      const updated: LectureDoc = {
        ...existing,
        completed: nextCompleted,
        completedDate: dateToUse,
      };

      const nextLectures = lectures.map((l) => (l.id === lectureId ? updated : l));
      setLectures(nextLectures);

      // Sync chapter completed count preventing duplicate increments
      const ch = chapters.find((c) => c.id === existing.chapterId);
      if (ch) {
        const completedInChapter = nextLectures.filter(
          (l) => l.chapterId === ch.id && l.completed
        ).length;
        const delta = nextCompleted ? 1 : -1;
        const nextChapCompleted = Math.max(
          completedInChapter,
          Math.max(0, ch.completedLectures + delta)
        );
        await updateChapter(ch.id, { completedLectures: nextChapCompleted });
      }

      if (canWriteToFirestore) {
        try {
          await updateDoc(doc(db, 'users', activeUid, 'lectures', sanitizeId(lectureId)), {
            title: updated.title,
            subject: updated.subject,
            chapterId: updated.chapterId,
            chapterTitle: updated.chapterTitle,
            durationMinutes: updated.durationMinutes,
            playbackSpeed: updated.playbackSpeed,
            actualWatchMinutes: updated.actualWatchMinutes,
            completed: updated.completed,
            completedDate: updated.completedDate,
            notes: updated.notes,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${activeUid}/lectures/${lectureId}`);
        }
      }

      await syncDailyProgressDoc(dateToUse || previousDate || todayISO, nextLectures, profile);
    },
    [lectures, chapters, todayISO, updateChapter, canWriteToFirestore, activeUid, syncDailyProgressDoc, profile]
  );

  const deleteLecture = useCallback(
    async (lectureId: string) => {
      const existing = lectures.find((l) => l.id === lectureId);
      const nextLectures = lectures.filter((l) => l.id !== lectureId);
      setLectures(nextLectures);

      if (canWriteToFirestore) {
        try {
          await deleteDoc(doc(db, 'users', activeUid, 'lectures', sanitizeId(lectureId)));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${activeUid}/lectures/${lectureId}`);
        }
      }

      if (existing?.completed && existing.completedDate) {
        await syncDailyProgressDoc(existing.completedDate, nextLectures, profile);
      }
    },
    [lectures, canWriteToFirestore, activeUid, syncDailyProgressDoc, profile]
  );

  const generateChapterLecturesBatch = useCallback(
    async (chapterId: string, count: number) => {
      const ch = chapters.find((c) => c.id === chapterId);
      if (!ch) return;
      const existingForCh = lectures.filter((l) => l.chapterId === chapterId);
      const startNum = existingForCh.length + 1;
      const toCreate = Math.max(1, Math.min(40, count));

      const createdList: LectureDoc[] = [];
      for (let i = 0; i < toCreate; i++) {
        const num = String(startNum + i).padStart(2, '0');
        const id = sanitizeId(`lec_${chapterId}_${num}_${Date.now()}_${i}`);
        createdList.push({
          id,
          uid: activeUid,
          title: `L${num}: ${ch.title} — Lecture ${startNum + i}`,
          subject: ch.subject,
          chapterId: ch.id,
          chapterTitle: ch.title,
          durationMinutes: 90,
          playbackSpeed: 1.5,
          actualWatchMinutes: 60,
          completed: false,
          completedDate: '',
          notes: `High-yield ${ch.title} lecture ${startNum + i} notes & PYQs.`,
        });
      }

      setLectures((prev) => [...createdList, ...prev]);

      if (canWriteToFirestore) {
        try {
          const batch = writeBatch(db);
          for (const lec of createdList) {
            const { id, ...payload } = lec;
            batch.set(doc(db, 'users', activeUid, 'lectures', id), {
              ...payload,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
          await batch.commit();
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/lectures`);
        }
      }
    },
    [chapters, lectures, activeUid, canWriteToFirestore]
  );

  const addTask = useCallback(
    async (input: {
      title: string;
      category: TaskCategory;
      priority: PriorityLevel;
      deadline: string;
      date?: string;
      niosType?: NiosTaskType;
    }) => {
      const id = sanitizeId(`task_${Date.now()}`);
      const newTask: TaskDoc = {
        id,
        uid: activeUid,
        title: input.title.trim().slice(0, 200),
        category: input.category,
        priority: input.priority,
        deadline: (input.deadline || todayISO).slice(0, 30),
        date: (input.date || todayISO).slice(0, 20),
        completed: false,
        isDefault: false,
        niosType: input.niosType || 'None',
      };

      setTasks((prev) => [newTask, ...prev]);

      if (canWriteToFirestore) {
        try {
          const { id: _id, ...payload } = newTask;
          await setDoc(doc(db, 'users', activeUid, 'tasks', id), {
            ...payload,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `users/${activeUid}/tasks/${id}`);
        }
      }
    },
    [activeUid, todayISO, canWriteToFirestore]
  );

  const updateTask = useCallback(
    async (
      taskId: string,
      updates: Partial<
        Pick<TaskDoc, 'title' | 'category' | 'priority' | 'deadline' | 'completed' | 'niosType'>
      >
    ) => {
      const existing = tasks.find((t) => t.id === taskId);
      if (!existing) return;

      const updated: TaskDoc = {
        ...existing,
        title: (updates.title ?? existing.title).trim().slice(0, 200),
        category: updates.category ?? existing.category,
        priority: updates.priority ?? existing.priority,
        deadline: (updates.deadline ?? existing.deadline).slice(0, 30),
        completed: updates.completed ?? existing.completed,
        niosType: updates.niosType ?? existing.niosType,
      };

      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));

      if (canWriteToFirestore) {
        try {
          await updateDoc(doc(db, 'users', activeUid, 'tasks', sanitizeId(taskId)), {
            title: updated.title,
            category: updated.category,
            priority: updated.priority,
            deadline: updated.deadline,
            date: updated.date,
            completed: updated.completed,
            isDefault: updated.isDefault,
            niosType: updated.niosType,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${activeUid}/tasks/${taskId}`);
        }
      }
    },
    [tasks, canWriteToFirestore, activeUid]
  );

  const toggleTaskCompletion = useCallback(
    async (taskId: string) => {
      const existing = tasks.find((t) => t.id === taskId);
      if (!existing) return;
      await updateTask(taskId, { completed: !existing.completed });
    },
    [tasks, updateTask]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (canWriteToFirestore) {
        try {
          await deleteDoc(doc(db, 'users', activeUid, 'tasks', sanitizeId(taskId)));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${activeUid}/tasks/${taskId}`);
        }
      }
    },
    [canWriteToFirestore, activeUid]
  );

  const addOrUpdateNote = useCallback(
    async (input: { id?: string; date: string; title: string; content: string }) => {
      const id = input.id ? sanitizeId(input.id) : sanitizeId(`note_${Date.now()}`);
      const existing = notes.find((n) => n.id === id);

      const noteDoc: NoteDoc = {
        id,
        uid: activeUid,
        date: (input.date || todayISO).slice(0, 20),
        title: input.title.trim().slice(0, 150) || 'Daily Study Reflection',
        content: input.content.trim().slice(0, 5000),
      };

      if (existing) {
        setNotes((prev) => prev.map((n) => (n.id === id ? noteDoc : n)));
      } else {
        setNotes((prev) => [noteDoc, ...prev]);
      }

      if (canWriteToFirestore) {
        try {
          const { id: _id, ...payload } = noteDoc;
          if (existing) {
            await updateDoc(doc(db, 'users', activeUid, 'notes', id), {
              date: payload.date,
              title: payload.title,
              content: payload.content,
              updatedAt: serverTimestamp(),
            });
          } else {
            await setDoc(doc(db, 'users', activeUid, 'notes', id), {
              ...payload,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/notes/${id}`);
        }
      }
    },
    [notes, activeUid, todayISO, canWriteToFirestore]
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (canWriteToFirestore) {
        try {
          await deleteDoc(doc(db, 'users', activeUid, 'notes', sanitizeId(noteId)));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${activeUid}/notes/${noteId}`);
        }
      }
    },
    [canWriteToFirestore, activeUid]
  );

  const resetOrRestoreMissionData = useCallback(
    async (backup?: {
      profile: UserProfile;
      chapters: ChapterDoc[];
      lectures: LectureDoc[];
      tasks: TaskDoc[];
      notes: NoteDoc[];
    }) => {
      const target = backup || generateInitialMissionData(
        activeUid,
        user?.displayName || 'JEE Aspirant',
        user?.email || 'aspirant@jeemission21.app',
        todayISO
      );

      setProfile({ ...target.profile, uid: activeUid });
      setChapters(target.chapters.map((c) => ({ ...c, uid: activeUid })));
      setLectures(target.lectures.map((l) => ({ ...l, uid: activeUid })));
      setTasks(target.tasks.map((t) => ({ ...t, uid: activeUid })));
      setNotes(target.notes.map((n) => ({ ...n, uid: activeUid })));

      if (canWriteToFirestore) {
        try {
          const batch = writeBatch(db);
          batch.set(doc(db, 'users', activeUid), {
            ...target.profile,
            uid: activeUid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          for (const ch of target.chapters) {
            const { id, ...rest } = ch;
            batch.set(doc(db, 'users', activeUid, 'chapters', sanitizeId(id)), {
              ...rest,
              uid: activeUid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
          for (const lec of target.lectures) {
            const { id, ...rest } = lec;
            batch.set(doc(db, 'users', activeUid, 'lectures', sanitizeId(id)), {
              ...rest,
              uid: activeUid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
          for (const t of target.tasks) {
            const { id, ...rest } = t;
            batch.set(doc(db, 'users', activeUid, 'tasks', sanitizeId(id)), {
              ...rest,
              uid: activeUid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
          for (const n of target.notes) {
            const { id, ...rest } = n;
            batch.set(doc(db, 'users', activeUid, 'notes', sanitizeId(id)), {
              ...rest,
              uid: activeUid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
          await batch.commit();
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}`);
        }
      }
    },
    [activeUid, user?.displayName, user?.email, todayISO, canWriteToFirestore]
  );

  const isWorkspaceActive = Boolean(user || localModeActive);

  return (
    <MissionContext.Provider
      value={{
        user,
        isWorkspaceActive,
        authLoading,
        syncStatus,
        authError,
        clearAuthError,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        enterLocalWorkspace,
        logoutUser,
        todayISO,
        profile,
        subjects,
        chapters,
        lectures,
        tasks,
        notes,
        dailyProgressMap,
        summary,
        calendarDays,
        analytics,
        updateUserProfileSettings,
        addChapter,
        updateChapter,
        deleteChapter,
        addLecture,
        updateLecture,
        toggleLectureCompletion,
        deleteLecture,
        generateChapterLecturesBatch,
        addTask,
        updateTask,
        toggleTaskCompletion,
        deleteTask,
        addOrUpdateNote,
        deleteNote,
        resetOrRestoreMissionData,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
};

export function useMission(): MissionContextValue {
  const ctx = useContext(MissionContext);
  if (!ctx) throw new Error('useMission must be used inside MissionProvider');
  return ctx;
}
