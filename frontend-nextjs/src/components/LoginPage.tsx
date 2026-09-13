'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Palette,
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Building2,
  Box,
  Compass,
  Database,
  Check,
  AlertCircle
} from 'lucide-react';
import { UserRole, User as UserType } from '../types/plan';

interface LoginPageProps {
  onLogin: (user: UserType) => void;
  availableUsers?: UserType[];
}

export const DEMO_ACCOUNTS = [
  {
    role: 'ADMIN' as UserRole,
    title: 'Administrator',
    badge: 'Superuser Portal',
    name: 'Admin Superuser',
    icon: ShieldCheck,
    gradient: 'from-sky-500 via-indigo-600 to-indigo-700',
    borderAccent: 'border-sky-500 ring-sky-400/20',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
    description: 'Full workspace administration, user onboarding, project management, and global catalog controls.',
    assignedPlan: 'plan-sarah-suite',
  },
  {
    role: 'DESIGNER' as UserRole,
    title: 'Interior Designer',
    badge: 'Studio Architect',
    name: 'Interior Architect',
    icon: Palette,
    gradient: 'from-indigo-500 via-purple-600 to-purple-700',
    borderAccent: 'border-indigo-500 ring-indigo-400/20',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: '2D blueprint drafting, 3D scene sculpting, custom furniture design, and photometric lighting.',
    assignedPlan: 'plan-david-villa',
  },
  {
    role: 'CLIENT' as UserRole,
    title: 'Client / Customer',
    badge: 'Virtual 3D Tour',
    name: 'Sarah Jenkins (Client)',
    icon: User,
    gradient: 'from-emerald-500 via-teal-600 to-teal-700',
    borderAccent: 'border-emerald-500 ring-emerald-400/20',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Interactive first-person walking tour, live finish customizer, elevation controls, and quote approvals.',
    assignedPlan: 'plan-sarah-suite',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, availableUsers = [] }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  // Clean empty inputs - NO autofill
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // Switch role selection WITHOUT auto-filling input fields
  const handleSelectPreset = (presetRole: UserRole) => {
    setSelectedRole(presetRole);
    setErrorMessage(null);
  };

  // Form Submit Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!cleanPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // 1. Check matching onboarded users
      const matchedCustomUser = availableUsers.find(
        (u) => u.email.toLowerCase() === cleanEmail.toLowerCase()
      );

      if (matchedCustomUser) {
        onLogin(matchedCustomUser);
        setIsLoading(false);
        return;
      }

      // 2. Role-based user login
      const generatedUser: UserType = {
        id: `u_${Date.now()}`,
        name: cleanEmail.includes('@')
          ? cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
          : cleanEmail,
        email: cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@visualrendered.io`,
        role: selectedRole,
        isOnline: true,
        assignedPlan: selectedRole === 'CLIENT' ? 'plan-sarah-suite' : 'plan-david-villa',
        createdAt: 'Just now',
      };
      onLogin(generatedUser);
      setIsLoading(false);
    }, 250);
  };

  const activeAccount = DEMO_ACCOUNTS.find((a) => a.role === selectedRole) || DEMO_ACCOUNTS[0];

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-x-hidden selection:bg-sky-500 selection:text-white">
      
      {/* Ambient Lighting & Geometric Background Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-sky-600/25 to-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[650px] h-[650px] bg-gradient-to-tl from-emerald-600/20 via-teal-600/10 to-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[140px]" />
        
        {/* Subtle Architectural Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#6366f1 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
            backgroundPosition: '0 0, 16px 16px',
          }}
        />
      </div>

      {/* Main Center Stage Container */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
        
        {/* Left Column: Brand Story, Capabilities & Role Cards */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
          
          {/* Logo & Headline */}
          <div>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-sky-300 text-xs font-bold mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Visual Rendered 3D Studio</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Architectural CAD &{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-indigo-300 to-teal-300">
                Visual Rendered 3D Tour
              </span>
            </h1>

            <p className="text-sm text-slate-300/80 mt-3 max-w-xl leading-relaxed">
              Design multi-floor architectural blueprints, render WebGL interiors, and present first-person walkthrough tours with real-time PostgreSQL synchronization.
            </p>
          </div>

          {/* 3 Role Selection Cards (Without Autofill) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              const isSelected = selectedRole === acc.role;

              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleSelectPreset(acc.role)}
                  className={`relative text-left p-4 rounded-2xl border transition-all flex flex-col justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900/90 border-sky-400 shadow-lg shadow-sky-500/10 ring-1 ring-sky-400/40'
                      : 'bg-slate-900/40 hover:bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold bg-gradient-to-br ${acc.gradient} shadow-md`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center font-bold">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-bold text-white tracking-tight">{acc.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{acc.description}</div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-slate-400 group-hover:text-sky-400 transition-colors">
                    <span>{isSelected ? 'Selected Role' : 'Select Role'}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Capabilities Footer Highlights */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/30 border border-slate-800/60">
              <Box className="w-4 h-4 text-sky-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">2D CAD & 3D WebGL</div>
                <div className="text-[10px] text-slate-400 truncate">1200% Max Zoom & Pan</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/30 border border-slate-800/60">
              <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">Virtual Walk Tour</div>
                <div className="text-[10px] text-slate-400 truncate">1.6m Proximity Doors</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/30 border border-slate-800/60">
              <Database className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">PostgreSQL Live</div>
                <div className="text-[10px] text-slate-400 truncate">Auto-Save & Revisions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Glassmorphic Login Card */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden">
            
            {/* Top Accent Gradient Line */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${activeAccount.gradient}`} />

            {/* Card Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${activeAccount.badgeBg}`}>
                  {activeAccount.badge}
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight mt-1.5">Sign In to Visual Rendered</h2>
              </div>
              
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${activeAccount.gradient} shadow-lg shadow-sky-500/20`}>
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form without Autofill */}
            <form onSubmit={handleFormSubmit} autoComplete="off" className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-sky-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Remember my session</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 bg-gradient-to-r ${activeAccount.gradient} hover:brightness-110 shadow-sky-500/25 cursor-pointer disabled:opacity-50`}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in to {activeAccount.title}...</span>
                  </>
                ) : (
                  <>
                    <span>Enter {activeAccount.title} Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Database Status Tag */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>PostgreSQL 17 Database Connected • High Availability</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
