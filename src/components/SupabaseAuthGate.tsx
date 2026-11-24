import { useState } from 'react';
import { CheckCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SupabaseAuthGateProps {
  onSuccess: () => void;
}

export function SupabaseAuthGate({ onSuccess }: SupabaseAuthGateProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || loading) return;

    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error: signUpErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signUpErr) throw signUpErr;
        setInfo('Account created! Check your email or sign in if confirmation is disabled.');
        onSuccess();
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInErr) throw signInErr;
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFB] px-4 dark:bg-[#0B0F17]">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <CheckCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="font-display text-lg font-bold text-slate-900 dark:text-white">
            TaskFlow
          </span>
        </div>

        <h1 className="mt-6 font-display text-xl font-semibold text-slate-900 dark:text-white">
          {mode === 'signin' ? 'Sign in to your workspace' : 'Create your TaskFlow account'}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Sync your tasks securely across devices with Supabase.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="auth-email"
              className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {info && (
            <p role="status" className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-10 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading
              ? 'Please wait...'
              : mode === 'signin'
                ? 'Sign In'
                : 'Create Account'}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
          {mode === 'signin' ? (
            <>
              Need an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
