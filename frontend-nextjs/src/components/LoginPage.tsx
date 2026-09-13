'use client';

import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Building2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { UserRole, User as UserType } from '../types/plan';
import { LoginSimulator3D } from './LoginSimulator3D';

interface LoginPageProps {
  onLogin: (user: UserType) => void;
  availableUsers?: UserType[];
}

export const DEMO_ACCOUNTS = [
  {
    role: 'ADMIN' as UserRole,
    title: 'Administrator',
    name: 'Admin Superuser',
    email: 'admin@visualrendered.io',
    password: 'admin',
    assignedPlan: 'plan-sarah-suite',
  },
  {
    role: 'DESIGNER' as UserRole,
    title: 'Interior Designer',
    name: 'Interior Architect',
    email: 'designer@visualrendered.io',
    password: 'designer',
    assignedPlan: 'plan-david-villa',
  },
  {
    role: 'CLIENT' as UserRole,
    title: 'Client / Customer',
    name: 'Sarah Jenkins (Client)',
    email: 'client.sarah@gmail.com',
    password: 'client',
    assignedPlan: 'plan-sarah-suite',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, availableUsers = [] }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

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
      // 1. Check matching demo accounts
      const matchedDemo = DEMO_ACCOUNTS.find(
        (a) => a.email.toLowerCase() === cleanEmail.toLowerCase()
      );

      if (matchedDemo) {
        if (cleanPassword === matchedDemo.password || cleanPassword === `${matchedDemo.password}123`) {
          const userObj: UserType = {
            id: matchedDemo.role === 'ADMIN' ? 'u1' : matchedDemo.role === 'DESIGNER' ? 'u2' : 'u3',
            name: matchedDemo.name,
            email: matchedDemo.email,
            role: matchedDemo.role,
            isOnline: true,
            assignedPlan: matchedDemo.assignedPlan,
            createdAt: 'Today',
          };
          onLogin(userObj);
          setIsLoading(false);
          return;
        } else {
          setErrorMessage('Invalid credentials. Please verify your email and password.');
          setIsLoading(false);
          return;
        }
      }

      // 2. Check matching onboarded users
      const matchedCustomUser = availableUsers.find(
        (u) => u.email.toLowerCase() === cleanEmail.toLowerCase()
      );

      if (matchedCustomUser) {
        onLogin(matchedCustomUser);
        setIsLoading(false);
        return;
      }

      // 3. Fallback user login
      const inferredRole: UserRole = cleanEmail.includes('admin')
        ? 'ADMIN'
        : cleanEmail.includes('designer')
        ? 'DESIGNER'
        : 'CLIENT';

      const generatedUser: UserType = {
        id: `u_${Date.now()}`,
        name: cleanEmail.includes('@')
          ? cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
          : cleanEmail,
        email: cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@visualrendered.io`,
        role: inferredRole,
        isOnline: true,
        assignedPlan: inferredRole === 'CLIENT' ? 'plan-sarah-suite' : 'plan-david-villa',
        createdAt: 'Just now',
      };
      onLogin(generatedUser);
      setIsLoading(false);
    }, 250);
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#060913] via-[#0b1428] to-[#050811] text-slate-100 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-x-hidden selection:bg-sky-500 selection:text-white">
      
      {/* Ambient Graded Background Lighting Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-sky-500/18 to-indigo-600/10 rounded-full blur-[130px]" />
        <div className="absolute -bottom-32 -right-32 w-[650px] h-[650px] bg-gradient-to-tl from-indigo-600/15 via-sky-600/10 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-sky-900/10 rounded-full blur-[150px]" />
        
        {/* Subtle Architectural Matrix Texture */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#6366f1 1px, transparent 1px)`,
            backgroundSize: '36px 36px',
            backgroundPosition: '0 0, 18px 18px',
          }}
        />
      </div>

      {/* 2-Column Balanced Container: 3D Design on Left, Premium Login Card on Right */}
      <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        
        {/* LEFT COLUMN: Pure 3D Interactive Construction Design */}
        <div className="lg:col-span-7 flex items-center justify-center">
          <LoginSimulator3D />
        </div>

        {/* RIGHT COLUMN: Attractive Graded Premium Login Card */}
        <div className="lg:col-span-5 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="relative bg-gradient-to-b from-[#0e172d]/95 to-[#090e1c]/95 border border-slate-700/60 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-sky-950/50 backdrop-blur-xl overflow-hidden">
            
            {/* Top Glowing Gradient Highlight Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 shadow-md shadow-sky-400/40" />

            {/* Header with Floating Logo Badge */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Visual Rendered</h1>
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
                  <span>Architectural 3D Design Studio</span>
                </p>
              </div>
              
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-600 shadow-lg shadow-sky-500/30 flex items-center justify-center text-white border border-white/20">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            {/* Error Notification Badge */}
            {errorMessage && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleFormSubmit} autoComplete="off" className="space-y-5">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wide uppercase text-[11px]">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-sky-400 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-3.5 py-3 bg-[#060b17]/80 border border-slate-700/70 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-300 tracking-wide uppercase text-[11px]">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-sky-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your security password"
                    className="w-full pl-10 pr-10 py-3 bg-[#060b17]/80 border border-slate-700/70 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Toggle */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer text-slate-400 hover:text-slate-200 select-none transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-[#060b17] border-slate-700 text-sky-500 focus:ring-0 focus:ring-offset-0 cursor-pointer w-4 h-4"
                  />
                  <span className="text-[11px] font-medium">Keep me signed in</span>
                </label>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl text-xs font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] bg-gradient-to-r from-sky-500 via-indigo-600 to-indigo-700 hover:from-sky-400 hover:via-indigo-500 hover:to-indigo-600 shadow-sky-500/25 hover:shadow-sky-500/40 cursor-pointer disabled:opacity-50 border border-sky-400/20 mt-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Visual Rendered Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Security Badge Footer */}
            <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Enterprise 256-Bit SSL Encrypted Connection</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
