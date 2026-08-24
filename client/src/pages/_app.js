import { useEffect, useState } from 'react';
import Head from 'next/head';
import { Moon, SunMedium } from 'lucide-react';
import '../styles/globals.css';
import { useAuthStore } from '../store/authStore';
import { getSocket } from '../services/socket';

const THEME_KEY = 'agentflow-theme';

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.classList.toggle('light', !isDark);
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem(THEME_KEY, theme);
  window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

function ThemeToggle() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    setTheme(storedTheme);
    applyTheme(storedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className={`fixed bottom-5 right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur transition hover:scale-105 hover:border-brand-500/60 hover:text-brand-300 ${
        theme === 'dark'
          ? 'border-slate-700 bg-slate-900/90 text-slate-100 shadow-lg shadow-slate-950/30'
          : 'border-slate-200 bg-white/90 text-slate-800 shadow-lg shadow-slate-900/10'
      }`}
      title="Toggle theme"
    >
      {theme === 'dark' ? <SunMedium className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

export default function MyApp({ Component, pageProps }) {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
    getSocket();
  }, [initializeAuth]);

  return (
    <>
      <Head>
        <title>Agentflow_AI | Multi-Agent Operations Automation | NIT CALICUT</title>
        <meta
          name="description"
          content="Enterprise-grade AI Operations Automation Platform featuring multi-agent orchestration, React Flow canvas, third-party tool integrations, and real-time execution streaming for NIT Calicut."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ThemeToggle />
      <Component {...pageProps} />
    </>
  );
}
