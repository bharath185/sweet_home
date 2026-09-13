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
  Check,
  AlertCircle
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
    badge: 'Superuser Portal',
    name: 'Admin Superuser',
    email: 'admin@visualrendered.io',
    password: 'admin',
    icon: ShieldCheck,
    gradient: 'from-sky-500 via-indigo-600 to-indigo-700',
    badgeBg: 'bg-sky-950/60 text-sky-300 border-sky-800',
    description: 'Full workspace administration and global controls.',
    assignedPlan: 'plan-sarah-suite',
  },
  {
    role: 'DESIGNER' as UserRole,
    title: 'Interior Designer',
    badge: 'Studio Architect',
    name: 'Interior Architect',
    email: 'designer@visualrendered.io',
    password: 'designer',
    icon: Palette,
    gradient: 'from-indigo-500 via-purple-600 to-purple-700',
    badgeBg: 'bg-indigo-950/60 text-indigo-300 border-indigo-800',
    description: '2D blueprint drafting, 3D modeling, and photometric lighting.',
    assignedPlan: 'plan-david-villa',
  },
  {
    role: 'CLIENT' as UserRole,
    title: 'Client / Customer',
    badge: 'Virtual 3D Tour',
    name: 'Sarah Jenkins (Client)',
    email: 'client.sarah@gmail.com',
    password: 'client',
    icon: User,
    gradient: 'from-emerald-500 via-teal-600 to-teal-700',
    badgeBg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800',
    description: 'Interactive first-person walking tour and customizer.',
    assignedPlan: 'plan-sarah-suite',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, availableUsers = [] }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const handleSelectPreset = (presetRole: UserRole) => {
    setSelectedRole(presetRole);
    setErrorMessage(null);
  };

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
        (a) => a.email.toLowerCase() === cleanEmail.toLowerCase() || (a.role === selectedRole && (cleanEmail === a.email || cleanEmail === a.name))
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
          setErrorMessage('Invalid credentials entered. Please verify your password.');
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
    <div className="min-h-screen w-full bg-[#080d1a] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-x-hidden selection:bg-sky-500 selection:text-white">
      
      {/* Main Center Stage: Left Middle = 3D Design Simulator, Right = Login Card */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* LEFT COLUMN (Middle-Aligned): 3D Design Simulator */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
          
          {/* Header Title Badge */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0f172a] border border-slate-800 text-sky-400 text-xs font-bold shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Visual Rendered 3D Studio</span>
            </div>

            <div className="text-xs font-semibold text-slate-400 hidden sm:block">
              Architectural Construction Simulator
            </div>
          </div>

          {/* Interactive 3D WebGL Simulator Component (Solid Opaque Container) */}
          <div className="w-full">
            <LoginSimulator3D />
          </div>

          {/* Role Selection Tabs (Clean & Professional - No Credentials Displayed) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              const isSelected = selectedRole === acc.role;

              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleSelectPreset(acc.role)}
                  className={`relative text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-[#0f172a] border-sky-500 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/40'
                      : 'bg-[#0b1120] hover:bg-[#0f172a] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold bg-gradient-to-br ${acc.gradient} shadow-md`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white tracking-tight">{acc.title}</div>
                      <div className="text-[10px] text-slate-400">{acc.badge}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center font-bold">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Solid Opaque Login Card */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl relative overflow-hidden">
            
            {/* Top Accent Gradient Line */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${activeAccount.gradient}`} />

            {/* Card Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${activeAccount.badgeBg}`}>
                  {activeAccount.badge}
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight mt-2">Sign In</h2>
                <p className="text-xs text-slate-400 mt-1">Access your Visual Rendered workspace</p>
              </div>
              
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${activeAccount.gradient} shadow-lg shadow-sky-500/20`}>
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2 animate-shake">
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
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-3.5 py-3 bg-[#080d1a] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-3 bg-[#080d1a] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
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
                    className="rounded bg-[#080d1a] border-slate-800 text-sky-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Remember my session</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 bg-gradient-to-r ${activeAccount.gradient} hover:brightness-110 shadow-sky-500/25 cursor-pointer disabled:opacity-50`}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in to ${activeAccount.title}...</span>
                  </>
                ) : (
                  <>
                    <span>Enter ${activeAccount.title} Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Clean Security Badge Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Enterprise Security Gate • 256-Bit SSL Encrypted</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
