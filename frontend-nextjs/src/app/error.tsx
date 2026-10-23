'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App runtime error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans selection:bg-rose-500 selection:text-white">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-6 shadow-xl shadow-rose-500/10">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-400 mb-2">
        STUDIO SYSTEM EXCEPTION
      </span>
      <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight max-w-md">
        Something Went Wrong
      </h1>
      <p className="mt-3 text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
        An unexpected error occurred while rendering the studio interface. Your local designs and blueprints remain safely preserved.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => reset()}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reload Studio</span>
        </button>
        <Link
          href="/"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="mt-12 text-[11px] text-slate-600 font-mono">
        DecoForge 3D Recovery Safe Mode
      </div>
    </div>
  );
}
