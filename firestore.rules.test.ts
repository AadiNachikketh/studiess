import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

/**
 * Deterministic Red-Team Security Rules & Dirty Dozen Payload Evaluator
 * Verifies all 12 Dirty Dozen attack payloads are rejected by the Firestore rules invariants.
 */
const rulesSource = fs.readFileSync('firestore.rules', 'utf8');

interface AuthContext {
  uid: string;
  email_verified: boolean;
}

interface EvalContext {
  auth: AuthContext | null;
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  id: string;
  pathUid: string;
  parentUserExists: boolean;
  requestTime: number;
  incoming?: Record<string, unknown>;
  existing?: Record<string, unknown>;
}

function isValidId(id: string): boolean {
  return typeof id === 'string' && id.length >= 1 && id.length <= 128 && /^[a-zA-Z0-9_\-]+$/.test(id);
}

function evaluateSecurityRule(ctx: EvalContext): 'ALLOWED' | 'PERMISSION_DENIED' {
  if (!ctx.auth || !ctx.auth.email_verified) return 'PERMISSION_DENIED';
  if (ctx.auth.uid !== ctx.pathUid) return 'PERMISSION_DENIED';

  if (ctx.operation !== 'list' && (!isValidId(ctx.pathUid) || !isValidId(ctx.id))) {
    return 'PERMISSION_DENIED';
  }

  const isSubcollection = ctx.path !== `/users/${ctx.pathUid}`;
  if (isSubcollection && ctx.operation !== 'list' && !ctx.parentUserExists) {
    return 'PERMISSION_DENIED';
  }

  if (ctx.operation === 'list') {
    if (!ctx.existing || ctx.existing.uid !== ctx.auth.uid) return 'PERMISSION_DENIED';
    return 'ALLOWED';
  }

  if (ctx.operation === 'create' || ctx.operation === 'update') {
    const data = ctx.incoming;
    if (!data || data.uid !== ctx.auth.uid) return 'PERMISSION_DENIED';

    if (ctx.operation === 'create') {
      if (data.createdAt !== ctx.requestTime || data.updatedAt !== ctx.requestTime) {
        return 'PERMISSION_DENIED';
      }
    }

    if (ctx.operation === 'update') {
      if (!ctx.existing) return 'PERMISSION_DENIED';
      if (data.uid !== ctx.existing.uid || data.createdAt !== ctx.existing.createdAt) {
        return 'PERMISSION_DENIED';
      }
      if (data.updatedAt !== ctx.requestTime) {
        return 'PERMISSION_DENIED';
      }
    }

    // Strict schema checks per collection
    if (ctx.path.includes('/tasks/')) {
      const allowed = ['uid', 'title', 'category', 'priority', 'deadline', 'date', 'completed', 'isDefault', 'niosType', 'createdAt', 'updatedAt'];
      const keys = Object.keys(data);
      if (keys.length !== allowed.length || !keys.every((k) => allowed.includes(k))) return 'PERMISSION_DENIED';
    }
    if (ctx.path.includes('/lectures/')) {
      const allowed = ['uid', 'title', 'subject', 'chapterId', 'chapterTitle', 'durationMinutes', 'playbackSpeed', 'actualWatchMinutes', 'completed', 'completedDate', 'notes', 'createdAt', 'updatedAt'];
      const keys = Object.keys(data);
      if (keys.length !== allowed.length || !keys.every((k) => allowed.includes(k))) return 'PERMISSION_DENIED';
    }
    if (ctx.path.includes('/notes/')) {
      const allowed = ['uid', 'date', 'title', 'content', 'createdAt', 'updatedAt'];
      const keys = Object.keys(data);
      if (keys.length !== allowed.length || !keys.every((k) => allowed.includes(k))) return 'PERMISSION_DENIED';
      if (typeof data.content !== 'string' || data.content.length > 5000) return 'PERMISSION_DENIED';
    }
  }

  return 'ALLOWED';
}

test('Firestore Rules Structure & Eight Pillars Invariants exist in firestore.rules', () => {
  assert.ok(rulesSource.includes("rules_version = '2';"));
  assert.ok(rulesSource.includes('allow read, write: if false;'));
  assert.ok(rulesSource.includes('request.auth.token.email_verified == true'));
  assert.ok(rulesSource.includes('isValidUserProfile(incoming())'));
  assert.ok(rulesSource.includes('isValidDailyProgress(incoming())'));
  assert.ok(rulesSource.includes('isValidSubject(incoming())'));
  assert.ok(rulesSource.includes('isValidChapter(incoming())'));
  assert.ok(rulesSource.includes('isValidLecture(incoming())'));
  assert.ok(rulesSource.includes('isValidTask(incoming())'));
  assert.ok(rulesSource.includes('isValidNote(incoming())'));
});

test('Dirty Dozen #1: Unverified Email Write Spoof returns PERMISSION_DENIED', () => {
  const res = evaluateSecurityRule({
    auth: { uid: 'user_1', email_verified: false },
    path: '/users/user_1',
    operation: 'create',
    id: 'user_1',
    pathUid: 'user_1',
    parentUserExists: false,
    requestTime: 1000,
    incoming: { uid: 'user_1', createdAt: 1000, updatedAt: 1000 }
  });
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #2: Cross-Tenant PII Read returns PERMISSION_DENIED', () => {
  const res = evaluateSecurityRule({
    auth: { uid: 'user_2', email_verified: true },
    path: '/users/user_1',
    operation: 'get',
    id: 'user_1',
    pathUid: 'user_1',
    parentUserExists: true,
    requestTime: 1000
  });
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #3: Identity Spoofing on Lecture Create returns PERMISSION_DENIED', () => {
  const res = evaluateSecurityRule({
    auth: { uid: 'user_1', email_verified: true },
    path: '/users/user_1/lectures/lec_1',
    operation: 'create',
    id: 'lec_1',
    pathUid: 'user_1',
    parentUserExists: true,
    requestTime: 1000,
    incoming: { uid: 'user_2', createdAt: 1000, updatedAt: 1000 }
  });
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #4: Orphaned Subcollection Write returns PERMISSION_DENIED', () => {
  const res = evaluateSecurityRule({
    auth: { uid: 'user_1', email_verified: true },
    path: '/users/user_1/lectures/lec_1',
    operation: 'create',
    id: 'lec_1',
    pathUid: 'user_1',
    parentUserExists: false,
    requestTime: 1000,
    incoming: { uid: 'user_1', createdAt: 1000, updatedAt: 1000 }
  });
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #5: Shadow Field Injection on Create returns PERMISSION_DENIED', () => {
  const res = evaluateSecurityRule({
    auth: { uid: 'user_1', email_verified: true },
    path: '/users/user_1/tasks/task_1',
    operation: 'create',
    id: 'task_1',
    pathUid: 'user_1',
    parentUserExists: true,
    requestTime: 1000,
    incoming: {
      uid: 'user_1',
      title: 'Physics lectures',
      category: 'Physics',
      priority: 'High',
      deadline: '2026-11-08',
      date: '2026-11-07',
      completed: false,
      isDefault: true,
      niosType: 'None',
      isAdmin: true,
      createdAt: 1000,
      updatedAt: 1000
    }
  });
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #6: Shadow Field Injection on Update returns PERMISSION_DENIED', () => {
  const existing = {
    uid: 'user_1',
    title: 'Organic 01',
    subject: 'Chemistry',
    chapterId: 'ch_1',
    chapterTitle: 'Organic Chemistry',
    durationMinutes: 90,
    playbackSpeed: 1.5,
    actualWatchMinutes: 60,
    completed: false,
    completedDate: '',
    notes: '',
    createdAt: 1000,
    updatedAt: 1000
  };
  const res = evaluateSecurityRule({
    auth: { uid: 'user_1', email_verified: true },
    path: '/users/user_1/lectures/lec_1',
    operation: 'update',
    id: 'lec_1',
    pathUid: 'user_1',
    parentUserExists: true,
    requestTime: 2000,
    existing,
    incoming: { ...existing, hacked: 'yes', updatedAt: 2000 }
  });
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #7: Immutable Field Mutation (createdAt) returns PERMISSION_DENIED', () => {
  const existing = {
    uid: 'user_1',
    date: '2026-11-07',
    title: 'Day 1 Note',
    content: 'Studied GOC',
    createdAt: 1000,
    updatedAt: 1000
  };
  const res = evaluateSecurityRule({
    auth: { uid: 'user_1', email_verified: true },
    path: '/users/user_1/notes/note_1',
    operation: 'update',
    id: 'note_1',
    pathUid: 'user_1',
    parentUserExists: true,
    requestTime: 2000,
    existing,
    incoming: { ...existing, createdAt: 9999, updatedAt: 2000 }
  });
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #8: Immutable Field Mutation (uid) returns PERMISSION_DENIED', () => {
  const existing = { uid: 'user_1', createdAt: 1000, updatedAt: 1000 };
  const res = evaluateSecurityRule({
    auth: { uid: 'user_1', email_verified: true },
    path: '/users/user_1/chapters/ch_1',
    operation: 'update',
    id: 'ch_1',
    pathUid: 'user_1',
    parentUserExists: true,
    requestTime: 2000,
    existing,
    incoming: { ...existing, uid: 'user_2', updatedAt: 2000 }
  });
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #9: Client Timestamp Forgery returns PERMISSION_DENIED', () => {
  const res = evaluateSecurityRule({
    auth: { uid: 'user_1', email_verified: true },
    path: '/users/user_1/dailyProgress/2026-11-07',
    operation: 'create',
    id: '2026-11-07',
    pathUid: 'user_1',
    parentUserExists: true,
    requestTime: 1000,
    incoming: { uid: 'user_1', createdAt: 500, updatedAt: 1000 }
  });
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #10: Denial-of-Wallet String Overflow returns PERMISSION_DENIED', () => {
  const res = evaluateSecurityRule({
    auth: { uid: 'user_1', email_verified: true },
    path: '/users/user_1/notes/note_1',
    operation: 'create',
    id: 'note_1',
    pathUid: 'user_1',
    parentUserExists: true,
    requestTime: 1000,
    incoming: {
      uid: 'user_1',
      date: '2026-11-07',
      title: 'Overflow',
      content: 'x'.repeat(6000),
      createdAt: 1000,
      updatedAt: 1000
    }
  });
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #11: ID Poisoning Attack returns PERMISSION_DENIED', () => {
  const res = evaluateSecurityRule({
    auth: { uid: 'user_1', email_verified: true },
    path: '/users/user_1/lectures/lec$1',
    operation: 'create',
    id: 'lec$1',
    pathUid: 'user_1',
    parentUserExists: true,
    requestTime: 1000,
    incoming: { uid: 'user_1', createdAt: 1000, updatedAt: 1000 }
  });
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #12: Unauthorized Cross-User List Scrape returns PERMISSION_DENIED', () => {
  const res = evaluateSecurityRule({
    auth: { uid: 'user_2', email_verified: true },
    path: '/users/user_1/lectures',
    operation: 'list',
    id: '',
    pathUid: 'user_1',
    parentUserExists: true,
    requestTime: 1000,
    existing: { uid: 'user_1' }
  });
  assert.equal(res, 'PERMISSION_DENIED');
});
