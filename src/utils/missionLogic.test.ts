import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateActualWatchMinutes,
  computeDashboardSummary,
  build21DayCalendar,
  computeAnalyticsReport,
  generateInitialMissionData,
  generateCSVExport,
} from './missionLogic';

test('calculateActualWatchMinutes computes watching time accurately from duration and speed', () => {
  assert.equal(calculateActualWatchMinutes(90, 1.5), 60);
  assert.equal(calculateActualWatchMinutes(100, 2.0), 50);
  assert.equal(calculateActualWatchMinutes(120, 1.0), 120);
});

test('generateInitialMissionData preloads Organic Chemistry (32) and Physical Chemistry (47) and 8 default tasks', () => {
  const seed = generateInitialMissionData('user_test', 'Aadi', 'aadi@example.com', '2026-11-07');
  assert.equal(seed.profile.challengeDurationDays, 21);
  assert.equal(seed.profile.physicsDailyTarget, 7);
  assert.equal(seed.profile.chemistryDailyTarget, 7);
  assert.equal(seed.profile.mathDailyTarget, 6);
  assert.equal(seed.profile.totalBacklogTarget, 420);

  const organic = seed.chapters.find((c) => c.title === 'Organic Chemistry');
  const physical = seed.chapters.find((c) => c.title === 'Physical Chemistry');
  assert.ok(organic, 'Organic Chemistry chapter must exist');
  assert.ok(physical, 'Physical Chemistry chapter must exist');
  assert.equal(organic.totalLectures, 32);
  assert.equal(physical.totalLectures, 47);

  const defaultTasks = seed.tasks.filter((t) => t.isDefault);
  assert.equal(defaultTasks.length, 8);
});

test('computeDashboardSummary updates completed today, remaining today, and backlog percentage', () => {
  const seed = generateInitialMissionData('user_test', 'Aadi', 'aadi@example.com', '2026-11-07');
  // Mark 2 Chemistry lectures and 1 Physics lecture completed today
  seed.lectures[0].completed = true;
  seed.lectures[0].completedDate = '2026-11-07';
  seed.lectures[1].completed = true;
  seed.lectures[1].completedDate = '2026-11-07';
  seed.lectures[10].completed = true;
  seed.lectures[10].completedDate = '2026-11-07';

  const summary = computeDashboardSummary(seed.profile, seed.chapters, seed.lectures, '2026-11-07');
  assert.equal(summary.dailyTargetTotal, 20);
  assert.equal(summary.completedTodayTotal, 3);
  assert.equal(summary.remainingTodayTotal, 17);
  assert.equal(summary.todayCompletionPercent, 15);
  assert.equal(summary.subjectStats.Chemistry.completedToday, 2);
  assert.equal(summary.subjectStats.Chemistry.remainingToday, 5);
  assert.equal(summary.subjectStats.Physics.completedToday, 1);
  assert.equal(summary.subjectStats.Physics.remainingToday, 6);
});

test('build21DayCalendar never marks past incomplete days as completed and preserves progress across days', () => {
  const seed = generateInitialMissionData('user_test', 'Aadi', 'aadi@example.com', '2026-11-01');
  // Complete 1 lecture on Day 1 (2026-11-01), which is < 20 target
  seed.lectures[0].completed = true;
  seed.lectures[0].completedDate = '2026-11-01';

  const calendar = build21DayCalendar(seed.profile, seed.lectures, '2026-11-07');
  assert.equal(calendar.length, 21);
  // Day 1 had 1/20 lectures -> must be past_incomplete, never completed_target
  assert.equal(calendar[0].completed, 1);
  assert.equal(calendar[0].remaining, 19);
  assert.equal(calendar[0].status, 'past_incomplete');
  // Today (Day 7: 2026-11-07) is in_progress
  assert.equal(calendar[6].isToday, true);
  assert.equal(calendar[6].status, 'in_progress');
});

test('computeAnalyticsReport and generateCSVExport produce accurate metrics and valid CSV rows', () => {
  const seed = generateInitialMissionData('user_test', 'Aadi', 'aadi@example.com', '2026-11-07');
  seed.lectures[0].completed = true;
  seed.lectures[0].completedDate = '2026-11-07';

  const report = computeAnalyticsReport(seed.profile, seed.chapters, seed.lectures, '2026-11-07');
  assert.equal(report.dailySeries.length, 21);
  assert.equal(report.weeklySeries.length, 3);
  assert.equal(report.subjectDistribution.length, 3);
  assert.ok(report.predictedDaysToFinish > 0);

  const csv = generateCSVExport(seed.lectures, seed.chapters, seed.tasks);
  assert.ok(csv.includes('Organic Chemistry'));
  assert.ok(csv.includes('Physical Chemistry'));
});
