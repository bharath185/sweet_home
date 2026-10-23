import React from 'react';
import Link from 'next/link';
import { Home, Compass, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found | DecoForge 3D Studio',
  description: 'The requested architectural floor plan or page could not be located.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans selection:bg-sky-500 selection:text-white">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-sky-400 flex items-center justify-center mb-6 shadow-xl shadow-sky-500/10">
        <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '12s' }} />
      </div>

      <span className="text-xs font-mono font-bold uppercase tracking-widest text-sky-400 mb-2">
        ERROR 404 &bull; MISSING COORDINATES
      </span>
      <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-md">
        Floor Plan Not Found
      </h1>
      <p className="mt-3 text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
        The blueprint, project file, or page you were looking for doesn't exist or may have been moved.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="mt-12 text-[11px] text-slate-600 font-mono">
        DecoForge 3D Architecture Studio
      </div>
    </div>
  );
}
