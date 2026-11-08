import React, { useState } from 'react';
import { ShieldCheck, LogIn, UserPlus, AlertCircle, X, CheckCircle2, Database } from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { firebaseConfig } from '../lib/firebase';

interface AuthGateModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  fullScreen?: boolean;
}

export const AuthGateModal: React.FC<AuthGateModalProps> = ({
  isOpen = true,
  onClose,
  fullScreen = false,
}) => {
  const {
    user,
    authError,
    clearAuthError,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    enterLocalWorkspace,
  } = useMission();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearAuthError();

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(cleanEmail, password);
      } else {
        await registerWithEmail(name.trim(), cleanEmail, password);
      }
      if (onClose) onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setFormError(null);
    clearAuthError();
    setSubmitting(true);
    try {
      await loginWithGoogle();
      if (onClose) onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const containerClass = fullScreen
    ? 'min-h-screen bg-[#080D1B] flex items-center justify-center p-4'
    : 'fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4';

  return (
    <div className={containerClass} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div className="w-full max-w-md bg-[#111A2D] border border-[#2B3954] rounded-2xl p-6 shadow-2xl relative">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close authentication modal"
            className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#16223B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/40 flex items-center justify-center text-[#8B5CF6]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 id="auth-modal-title" className="text-lg font-bold text-white font-display">
              JEE MISSION 21 Cloud Sync
            </h2>
            <p className="text-xs text-slate-400">
              Project: <span className="font-mono text-slate-300">{firebaseConfig.projectId}</span>
            </p>
          </div>
        </div>

        {user && (
          <div className="mb-4 p-3 rounded-xl bg-[#16223B] border border-emerald-500/30 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <div className="font-semibold text-white">Signed in as {user.email}</div>
              <div className="text-slate-400">
                {user.emailVerified
                  ? 'Real-time Firestore sync active across devices.'
                  : 'Email verification pending — data mirrored locally & ready to sync.'}
              </div>
            </div>
          </div>
        )}

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#0C1424] border border-[#1E293B] rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setFormError(null);
              clearAuthError();
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              mode === 'login'
                ? 'bg-[#8B5CF6] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setFormError(null);
              clearAuthError();
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              mode === 'register'
                ? 'bg-[#8B5CF6] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {(formError || authError) && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{formError || authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          {mode === 'register' && (
            <div>
              <label htmlFor="auth-name" className="block text-xs font-medium text-slate-300 mb-1">
                Student Name
              </label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aadi (JEE Aspirant)"
                className="w-full h-10 px-3 rounded-lg bg-[#0C1424] border border-[#1E293B] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-xs font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aspirant@example.com"
              className="w-full h-10 px-3 rounded-lg bg-[#0C1424] border border-[#1E293B] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full h-10 px-3 rounded-lg bg-[#0C1424] border border-[#1E293B] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-10 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            {mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In with Email</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Register with Email</span>
              </>
            )}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#1E293B]" />
          <span className="text-xs text-slate-500">or</span>
          <div className="h-px flex-1 bg-[#1E293B]" />
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={submitting}
            className="w-full h-10 rounded-lg bg-[#16223B] hover:bg-[#1E293B] border border-[#2B3954] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Database className="w-4 h-4 text-[#06B6D4]" />
            <span>Continue with Google (Verified Cloud Sync)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              enterLocalWorkspace();
              if (onClose) onClose();
            }}
            className="w-full h-9 rounded-lg border border-[#1E293B] hover:border-[#2B3954] text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Continue in Persistent Local-Mirrored Workspace
          </button>
        </div>
      </div>
    </div>
  );
};
