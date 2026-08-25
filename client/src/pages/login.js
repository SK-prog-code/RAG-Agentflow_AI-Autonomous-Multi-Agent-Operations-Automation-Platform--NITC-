import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { Bot, GraduationCap, Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const result = await login(email, password);
    if (result.success) {
      router.push('/dashboard');
    }
  };

  const handleDemoLogin = async () => {
    clearError();
    setEmail('operator@nitc.ac.in');
    setPassword('Password123!');
    const result = await login('operator@nitc.ac.in', 'Password123!');
    if (result.success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 selection:bg-brand-500/30 selection:text-brand-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 p-[1px] shadow-lg shadow-brand-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-brand-400">
              <Bot className="w-6 h-6" />
            </div>
          </div>
          <span className="text-xl font-extrabold tracking-tight">Agentflow<span className="text-brand-400">_AI</span></span>
        </Link>
        <div className="mt-2 flex items-center justify-center space-x-1.5 text-xs font-semibold text-emerald-400 tracking-wide uppercase">
          <GraduationCap className="w-4 h-4" />
          <span>NIT CALICUT OPERATIONS PORTAL</span>
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">Sign in to console</h2>
        <p className="mt-1 text-xs text-slate-400">
          Or{' '}
          <Link href="/register" className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-4">
            create a new operator account
          </Link>
        </p>
        <div className="mt-6 rounded-xl border border-brand-500/20 bg-brand-500/5 px-4 py-3 text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-300">For NITC students</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">
            Agentflow_AI helps you turn campus requests into organized workflows, follow progress across teams,
            and keep important updates from getting lost.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900/80 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 backdrop-blur-xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@nitc.ac.in"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-brand-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-brand-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white text-sm font-bold shadow-lg shadow-brand-500/20 transition transform active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Shortcut */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-medium transition flex items-center justify-center space-x-2"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quick Login as NIT Calicut Operator Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
