import React, { useState } from 'react';
import {
  Download,
  Upload,
  Save,
  RotateCcw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { generateCSVExport } from '../utils/missionLogic';
import { firebaseConfig } from '../lib/firebase';

export const SettingsDataView: React.FC<{
  onOpenAuthModal: () => void;
}> = ({ onOpenAuthModal }) => {
  const {
    user,
    profile,
    chapters,
    lectures,
    tasks,
    notes,
    updateUserProfileSettings,
    resetOrRestoreMissionData,
    logoutUser,
  } = useMission();

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [challengeStartDate, setChallengeStartDate] = useState(profile.challengeStartDate);
  const [challengeDurationDays, setChallengeDurationDays] = useState(
    String(profile.challengeDurationDays)
  );
  const [totalBacklogTarget, setTotalBacklogTarget] = useState(String(profile.totalBacklogTarget));
  const [physicsDailyTarget, setPhysicsDailyTarget] = useState(String(profile.physicsDailyTarget));
  const [chemistryDailyTarget, setChemistryDailyTarget] = useState(
    String(profile.chemistryDailyTarget)
  );
  const [mathDailyTarget, setMathDailyTarget] = useState(String(profile.mathDailyTarget));

  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Sync local inputs when profile updates
  React.useEffect(() => {
    setDisplayName(profile.displayName);
    setChallengeStartDate(profile.challengeStartDate);
    setChallengeDurationDays(String(profile.challengeDurationDays));
    setTotalBacklogTarget(String(profile.totalBacklogTarget));
    setPhysicsDailyTarget(String(profile.physicsDailyTarget));
    setChemistryDailyTarget(String(profile.chemistryDailyTarget));
    setMathDailyTarget(String(profile.mathDailyTarget));
  }, [profile]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSaveMessage(null);

    if (!displayName.trim()) {
      setErrorMessage('Display name cannot be empty.');
      return;
    }

    const dur = Number(challengeDurationDays);
    const backlog = Number(totalBacklogTarget);
    const phys = Number(physicsDailyTarget);
    const chem = Number(chemistryDailyTarget);
    const math = Number(mathDailyTarget);

    if (isNaN(dur) || dur < 1 || dur > 365) {
      setErrorMessage('Challenge duration must be between 1 and 365 days.');
      return;
    }
    if (isNaN(backlog) || backlog < 1 || backlog > 2000) {
      setErrorMessage('Total backlog target must be between 1 and 2000 lectures.');
      return;
    }

    await updateUserProfileSettings({
      displayName: displayName.trim(),
      challengeStartDate,
      challengeDurationDays: dur,
      totalBacklogTarget: backlog,
      physicsDailyTarget: phys,
      chemistryDailyTarget: chem,
      mathDailyTarget: math,
    });

    setSaveMessage('Mission profile & daily targets saved to storage.');
  };

  const handleExportCSV = () => {
    const csv = generateCSVExport(lectures, chapters, tasks);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jee-mission-21-export-${profile.challengeStartDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSONBackup = () => {
    const backupPayload = {
      exportedAt: new Date().toISOString(),
      profile,
      chapters,
      lectures,
      tasks,
      notes,
    };
    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jee-mission-21-backup-${profile.challengeStartDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSONBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(String(ev.target?.result || '{}'));
        if (parsed.profile && Array.isArray(parsed.chapters) && Array.isArray(parsed.lectures)) {
          await resetOrRestoreMissionData({
            profile: parsed.profile,
            chapters: parsed.chapters,
            lectures: parsed.lectures,
            tasks: Array.isArray(parsed.tasks) ? parsed.tasks : tasks,
            notes: Array.isArray(parsed.notes) ? parsed.notes : notes,
          });
          setSaveMessage('Backup restored and synchronized!');
        } else {
          setErrorMessage('Invalid backup JSON file structure.');
        }
      } catch {
        setErrorMessage('Could not parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">
            Mission Settings, Targets & Data Export
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure daily subject lecture quotas, total backlog targets, challenge duration, CSV exports, and full JSON backups.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJSONBackup}
            className="px-4 py-2 rounded-lg bg-[#16223B] hover:bg-[#1E293B] border border-[#2B3954] text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-[#06B6D4]" />
            <span>Backup JSON</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Editable Profile & Targets Form */}
        <form
          onSubmit={handleSaveSettings}
          noValidate
          className="lg:col-span-7 bg-[#111A2D] border border-[#1E293B] rounded-2xl p-6 space-y-5"
        >
          <h2 className="text-base font-bold text-white font-display">
            Profile & Challenge Configuration
          </h2>

          {saveMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saveMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="set-name" className="block text-xs text-slate-300 mb-1">
                Student Profile Name
              </label>
              <input
                id="set-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div>
              <label htmlFor="set-start" className="block text-xs text-slate-300 mb-1">
                Challenge Start Date
              </label>
              <input
                id="set-start"
                type="date"
                value={challengeStartDate}
                onChange={(e) => setChallengeStartDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white font-mono focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div>
              <label htmlFor="set-duration" className="block text-xs text-slate-300 mb-1">
                Challenge Duration (Days)
              </label>
              <input
                id="set-duration"
                type="number"
                min={1}
                max={365}
                value={challengeDurationDays}
                onChange={(e) => setChallengeDurationDays(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white font-mono tabular-nums focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div>
              <label htmlFor="set-backlog" className="block text-xs text-slate-300 mb-1">
                Total Backlog Target (Lectures)
              </label>
              <input
                id="set-backlog"
                type="number"
                min={1}
                max={2000}
                value={totalBacklogTarget}
                onChange={(e) => setTotalBacklogTarget(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white font-mono tabular-nums focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#1E293B]">
            <h3 className="text-xs font-bold text-slate-300 mb-3">
              Daily Subject Lecture Targets (Sum:{' '}
              {(Number(physicsDailyTarget) || 0) +
                (Number(chemistryDailyTarget) || 0) +
                (Number(mathDailyTarget) || 0)}{' '}
              Lectures/Day)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="set-phys" className="block text-xs text-[#06B6D4] mb-1">
                  Physics Daily Target
                </label>
                <input
                  id="set-phys"
                  type="number"
                  min={0}
                  max={50}
                  value={physicsDailyTarget}
                  onChange={(e) => setPhysicsDailyTarget(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white font-mono tabular-nums focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div>
                <label htmlFor="set-chem" className="block text-xs text-[#F59E0B] mb-1">
                  Chemistry Daily Target
                </label>
                <input
                  id="set-chem"
                  type="number"
                  min={0}
                  max={50}
                  value={chemistryDailyTarget}
                  onChange={(e) => setChemistryDailyTarget(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white font-mono tabular-nums focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div>
                <label htmlFor="set-math" className="block text-xs text-[#10B981] mb-1">
                  Mathematics Daily Target
                </label>
                <input
                  id="set-math"
                  type="number"
                  min={0}
                  max={50}
                  value={mathDailyTarget}
                  onChange={(e) => setMathDailyTarget(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[#0C1424] border border-[#1E293B] text-xs text-white font-mono tabular-nums focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </form>

        {/* Right 5 Cols: Backup Restore, Firebase Connection Info & Account */}
        <div className="lg:col-span-5 space-y-5">
          {/* Cloud Connection & Account Panel */}
          <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-[#8B5CF6]" />
              <h2 className="text-base font-bold text-white font-display">
                Firebase Cloud & Account
              </h2>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 font-mono">
              <div>Project ID: {firebaseConfig.projectId}</div>
              <div>Account: {user ? user.email : 'Local Mirrored Mode'}</div>
              <div>
                UID: {user ? user.uid : profile.uid}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="px-4 py-2 rounded-lg bg-[#16223B] hover:bg-[#1E293B] border border-[#2B3954] text-xs font-semibold text-white cursor-pointer"
              >
                {user ? 'Switch Account' : 'Sign In / Register Cloud Account'}
              </button>

              <button
                type="button"
                onClick={logoutUser}
                className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-300 flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Account Logout</span>
              </button>
            </div>
          </div>

          {/* Data Backup Restore & Safe Reset */}
          <div className="bg-[#111A2D] border border-[#1E293B] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white font-display">
              Restore Backup or Reset Mission
            </h2>
            <p className="text-xs text-slate-400">
              Restore a previously exported JSON backup file, or reset your syllabus back to the initial Day 1 state (with confirmation).
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <label className="px-4 py-2 rounded-lg bg-[#16223B] hover:bg-[#1E293B] border border-[#2B3954] text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>Import JSON Backup</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJSONBackup}
                  className="hidden"
                />
              </label>

              {!confirmResetOpen ? (
                <button
                  type="button"
                  onClick={() => setConfirmResetOpen(true)}
                  className="px-4 py-2 rounded-lg bg-[#0C1424] hover:bg-red-500/15 border border-[#1E293B] hover:border-red-500/30 text-xs font-medium text-slate-300 hover:text-red-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Default Seed</span>
                </button>
              ) : (
                <div className="w-full p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-2">
                  <span className="text-xs text-red-200">
                    Confirm resetting all progress to Day 1 defaults?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmResetOpen(false)}
                      className="px-2.5 py-1 rounded bg-[#16223B] text-xs text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await resetOrRestoreMissionData();
                        setConfirmResetOpen(false);
                        setSaveMessage('Mission data reset to initial Day 1 defaults.');
                      }}
                      className="px-2.5 py-1 rounded bg-red-600 text-xs text-white font-semibold"
                    >
                      Confirm Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
