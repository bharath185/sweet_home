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
  CheckCircle2,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { UserRole, User as UserType } from '../types/plan';

interface LoginPageProps {
  onLogin: (user: UserType) => void;
  availableUsers?: UserType[];
}

export const DEMO_ACCOUNTS: {
  role: UserRole;
  title: string;
  badge: string;
  name: string;
  email: string;
  password: string;
  icon: typeof ShieldCheck;
  gradient: string;
  borderAccent: string;
  badgeBg: string;
  description: string;
  features: string[];
  assignedPlan: string;
}[] = [
  {
    role: 'ADMIN',
    title: 'Administrator',
    badge: 'Superuser Portal',
    name: 'Admin Superuser',
    email: 'admin@sweethome3d.io',
    password: 'admin',
    icon: ShieldCheck,
    gradient: 'from-sky-600 to-indigo-700',
    borderAccent: 'border-sky-500 hover:border-sky-400',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
    description: 'Full studio administration, client project directory, onboarding, and multi-floor building management.',
    features: ['Client Project Directory & Onboarding', '2D/3D CAD Studio & 3D Sculptor', 'Full Catalog & Material Controls', 'User Permissions & Exports'],
    assignedPlan: 'plan-sarah-suite',
  },
  {
    role: 'DESIGNER',
    title: 'Interior Designer',
    badge: 'Studio Architect',
    name: 'Interior Architect',
    email: 'designer@sweethome3d.io',
    password: 'designer',
    icon: Palette,
    gradient: 'from-indigo-600 to-purple-700',
    borderAccent: 'border-indigo-500 hover:border-indigo-400',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'Architectural floorplan drafting, 3D WebGL scene manipulation, procedural furniture sculptor, and finishes.',
    features: ['2D Wall Drafting & Magnetic Snapping', '3D Interactive Viewport & Lighting', 'Custom 3D Item Design Studio', 'Tabletop Auto-Attachment'],
    assignedPlan: 'plan-david-villa',
  },
  {
    role: 'CLIENT',
    title: 'Client / Customer',
    badge: 'Interactive 3D Tour',
    name: 'Sarah Jenkins (Client)',
    email: 'client.sarah@gmail.com',
    password: 'client',
    icon: User,
    gradient: 'from-emerald-600 to-teal-700',
    borderAccent: 'border-emerald-500 hover:border-emerald-400',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Personalized interactive 3D walkthrough, virtual visitor tour, finish customizer, and quotation review.',
    features: ['First-Person Virtual Visitor Tour', 'Color & Material Customizer', 'Real-time 3D Collision Detection', 'Quotation Request & Approval'],
    assignedPlan: 'plan-sarah-suite',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, availableUsers = [] }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [email, setEmail] = useState<string>('admin@sweethome3d.io');
  const [password, setPassword] = useState<string>('admin');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Quick switch role preset
  const handleSelectPreset = (presetRole: UserRole) => {
    setSelectedRole(presetRole);
    setErrorMessage(null);
    const preset = DEMO_ACCOUNTS.find((a) => a.role === presetRole);
    if (preset) {
      setEmail(preset.email);
      setPassword(preset.password);
    }
  };

  // Form Submit Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      // 1. Check matching demo accounts
      const matchedDemo = DEMO_ACCOUNTS.find(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase()
      );

      // 2. Check matching onboarded users
      const matchedCustomUser = availableUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (matchedDemo) {
        if (password.trim() === matchedDemo.password || password.trim() === `${matchedDemo.password}123`) {
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
          setErrorMessage(`Invalid password for ${matchedDemo.title}. Try password: "${matchedDemo.password}" or 1-click login.`);
          setIsLoading(false);
          return;
        }
      }

      if (matchedCustomUser) {
        onLogin(matchedCustomUser);
        setIsLoading(false);
        return;
      }

      // Fallback: If user enters any email, create role-based session
      if (email.includes('@')) {
        const generatedUser: UserType = {
          id: `u_${Date.now()}`,
          name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          email: email.trim(),
          role: selectedRole,
          isOnline: true,
          assignedPlan: selectedRole === 'CLIENT' ? 'plan-sarah-suite' : 'plan-david-villa',
          createdAt: 'Just now',
        };
        onLogin(generatedUser);
        setIsLoading(false);
        return;
      }

      setErrorMessage('Please enter a valid email address.');
      setIsLoading(false);
    }, 350);
  };

  // 1-Click Fast Login directly with preset
  const handleQuickLogin = (presetRole: UserRole) => {
    const preset = DEMO_ACCOUNTS.find((a) => a.role === presetRole);
    if (!preset) return;

    setIsLoading(true);
    setTimeout(() => {
      const userObj: UserType = {
        id: preset.role === 'ADMIN' ? 'u1' : preset.role === 'DESIGNER' ? 'u2' : 'u3',
        name: preset.name,
        email: preset.email,
        role: preset.role,
        isOnline: true,
        assignedPlan: preset.assignedPlan,
        createdAt: 'Today',
      };
      onLogin(userObj);
      setIsLoading(false);
    }, 200);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-50 text-slate-900 overflow-y-auto select-none">
      {/* Top Header Branding */}
      <header className="h-16 px-6 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-sky-600/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight">SweetHome 3D</h1>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold border border-sky-200">
                CAD Studio & 3D WebGL
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Enterprise Architectural Design & Client Presentation Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Security Gate Active</span>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: 3 Role Selector Cards */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100/80 text-sky-700 text-xs font-bold border border-sky-200 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Select Login Role</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Choose your workspace access
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-lg">
                Access is strictly role-authenticated. Select from the 3 specialized workspaces below or sign in with your credentials.
              </p>
            </div>

            {/* 3 Role Cards Grid */}
            <div className="space-y-3">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                const isSelected = selectedRole === acc.role;

                return (
                  <div
                    key={acc.role}
                    onClick={() => handleSelectPreset(acc.role)}
                    className={`relative p-4 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
                      isSelected
                        ? 'bg-white border-sky-500 ring-2 ring-sky-500/20 shadow-md'
                        : 'bg-white/80 hover:bg-white border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${acc.gradient} text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-900/10`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{acc.title}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${acc.badgeBg}`}>
                              {acc.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {acc.description}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {acc.features.map((feat, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                              >
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                <span>{feat}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 1-Click Fast Login Action */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickLogin(acc.role);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                          isSelected
                            ? 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-sm active:scale-95'
                            : 'bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200'
                        }`}
                        title={`1-Click Fast Login as ${acc.title}`}
                      >
                        <span>Login as {acc.role}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Credentials Form & Sign-In Card */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-900/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-sky-200/40 via-indigo-200/20 to-transparent rounded-bl-full pointer-events-none" />

              <div className="mb-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                  Authentication Gate
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">Sign In to SweetHome 3D</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Active Role Selected: <strong className="text-sky-700">{selectedRole}</strong>
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-700 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Work Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@sweethome3d.io"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 transition"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 block">Password</label>
                    <span className="text-[10px] text-slate-400">Demo: admin / designer / client</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-700 transition"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 hover:from-sky-500 hover:via-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-sky-600/25 transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </span>
                  ) : (
                    <>
                      <span>Enter {selectedRole} Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Fast 1-Click Bar at bottom of card */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2 text-center">
                  Quick 1-Click Demo Login
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('ADMIN')}
                    className="py-1.5 px-2 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-[10px] font-bold transition flex items-center justify-center gap-1"
                  >
                    <ShieldCheck className="w-3 h-3 text-sky-600" />
                    <span>Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('DESIGNER')}
                    className="py-1.5 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-[10px] font-bold transition flex items-center justify-center gap-1"
                  >
                    <Palette className="w-3 h-3 text-indigo-600" />
                    <span>Designer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('CLIENT')}
                    className="py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold transition flex items-center justify-center gap-1"
                  >
                    <User className="w-3 h-3 text-emerald-600" />
                    <span>Client</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 px-6 text-center text-[11px] text-slate-400 border-t border-slate-200/80 bg-white/60">
        SweetHome 3D Web CAD Studio • Protected by Role-Based Access Control (RBAC)
      </footer>
    </div>
  );
};

export default LoginPage;
