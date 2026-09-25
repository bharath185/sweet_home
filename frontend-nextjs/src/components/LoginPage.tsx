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
  User as UserIcon,
  Palette,
  CheckCircle2,
  Gift,
  Sparkles
} from 'lucide-react';
import { UserRole, User as UserType } from '../types/plan';
import { LoginSimulator3D } from './LoginSimulator3D';
import { saveSubscriptionLocally } from '../services/subscriptionService';

interface LoginPageProps {
  onLogin: (user: UserType) => void;
  availableUsers?: UserType[];
  onSignUp?: (user: UserType) => void;
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

interface RegisteredAccountRecord {
  user: UserType;
  passwordHash: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, availableUsers = [], onSignUp }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign In States
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // Sign Up States
  const [signUpName, setSignUpName] = useState<string>('');
  const [signUpEmail, setSignUpEmail] = useState<string>('');
  const [signUpPassword, setSignUpPassword] = useState<string>('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState<string>('');
  const [showSignUpPassword, setShowSignUpPassword] = useState<boolean>(false);
  const [signUpRole, setSignUpRole] = useState<'DESIGNER' | 'CLIENT'>('DESIGNER');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);

  // Feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Helper to retrieve registered accounts from localStorage
  const getStoredRegisteredUsers = (): RegisteredAccountRecord[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('sweethome_registered_users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // 1. Handle Sign In
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

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

      // 2. Check previously registered accounts in localStorage
      const registered = getStoredRegisteredUsers();
      const matchedRegistered = registered.find(
        (r) => r.user.email.toLowerCase() === cleanEmail.toLowerCase()
      );

      if (matchedRegistered) {
        if (matchedRegistered.passwordHash === cleanPassword) {
          onLogin(matchedRegistered.user);
          setIsLoading(false);
          return;
        } else {
          setErrorMessage('Invalid password for this registered account.');
          setIsLoading(false);
          return;
        }
      }

      // 3. Check matching onboarded users
      const matchedCustomUser = availableUsers.find(
        (u) => u.email.toLowerCase() === cleanEmail.toLowerCase()
      );

      if (matchedCustomUser) {
        onLogin(matchedCustomUser);
        setIsLoading(false);
        return;
      }

      // 4. Default fallback user login
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

  // 2. Handle Sign Up
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = signUpName.trim();
    const cleanEmail = signUpEmail.trim().toLowerCase();
    const cleanPassword = signUpPassword.trim();
    const cleanConfirm = signUpConfirmPassword.trim();

    if (!cleanName || cleanName.length < 2) {
      setErrorMessage('Please enter your full name (minimum 2 characters).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (cleanPassword !== cleanConfirm) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please accept the Terms of Service to create your studio account.');
      return;
    }

    // Check if account already exists
    const isDemoExisting = DEMO_ACCOUNTS.some((a) => a.email.toLowerCase() === cleanEmail);
    const registered = getStoredRegisteredUsers();
    const isRegisteredExisting = registered.some((r) => r.user.email.toLowerCase() === cleanEmail);

    if (isDemoExisting || isRegisteredExisting) {
      setErrorMessage('An account with this email already exists. Please switch to Sign In.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Create user record with complimentary 2-Day Trial pass initialized
      const trialDurationDays = 2;
      const trialExpiresAt = new Date(Date.now() + trialDurationDays * 24 * 3600 * 1000).toISOString();

      let createdUser: UserType = {
        id: `u_${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        role: signUpRole,
        isOnline: true,
        assignedPlan: signUpRole === 'CLIENT' ? 'plan-sarah-suite' : 'plan-david-villa',
        createdAt: 'Just now',
        subscriptionTier: 'TRIAL',
        subscriptionStatus: 'trial',
        subscriptionExpiresAt: trialExpiresAt,
        subscriptionPlanId: 'trial_2days',
        paymentGateway: 'cashfree',
      };

      // Activate 2-day trial locally
      createdUser = saveSubscriptionLocally(
        createdUser,
        'TRIAL',
        `welcome_trial_${Date.now()}`,
        `tok_welcome_${Date.now()}`,
        `cf_trial_${Date.now()}`,
        trialDurationDays,
        'trial_2days',
        'cashfree'
      );

      // Store in registered users list in localStorage
      try {
        const updatedRegistered = [...registered, { user: createdUser, passwordHash: cleanPassword }];
        localStorage.setItem('sweethome_registered_users', JSON.stringify(updatedRegistered));
      } catch (err) {
        console.warn('Could not persist registered user', err);
      }

      setSuccessMessage('Account created successfully! Preparing your 3D Studio...');

      setTimeout(() => {
        setIsLoading(false);
        if (onSignUp) {
          onSignUp(createdUser);
        } else {
          onLogin(createdUser);
        }
      }, 500);
    }, 400);
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#0c1527] via-[#13223f] to-[#09101f] text-slate-100 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-x-hidden selection:bg-sky-500 selection:text-white">
      
      {/* Sophisticated Graded Ambient Lighting Spheres */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-sky-500/20 to-indigo-600/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-32 -right-32 w-[650px] h-[650px] bg-gradient-to-tl from-indigo-600/20 via-sky-600/15 to-transparent rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-sky-900/15 rounded-full blur-[160px]" />
        
        {/* Subtle Architectural Dot Matrix Texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1.5px, transparent 1.5px), radial-gradient(#818cf8 1.5px, transparent 1.5px)`,
            backgroundSize: '36px 36px',
            backgroundPosition: '0 0, 18px 18px',
          }}
        />
      </div>

      {/* 2-Column Balanced Container: 3D Design on Left, Auth Card on Right */}
      <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        
        {/* LEFT COLUMN: Pure 3D Interactive Construction Design */}
        <div className="lg:col-span-7 flex items-center justify-center">
          <LoginSimulator3D />
        </div>

        {/* RIGHT COLUMN: Attractive Graded Slate Auth Card */}
        <div className="lg:col-span-5 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="relative bg-gradient-to-b from-[#111e38]/95 to-[#0b1426]/95 border border-slate-700/70 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-black/40 backdrop-blur-xl overflow-hidden">
            
            {/* Top Glowing Gradient Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 shadow-md shadow-sky-400/30" />

            {/* Header with Floating Logo Badge */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Visual Rendered</h1>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
                  <span>Architectural 3D Design Studio</span>
                </p>
              </div>
              
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-600 shadow-lg shadow-sky-500/25 flex items-center justify-center text-white border border-white/20">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            {/* Segmented Auth Mode Switcher (Sign In vs Create Account) */}
            <div className="flex bg-[#080f1e]/90 p-1 rounded-2xl border border-slate-700/60 mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'signin'
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'signup'
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Notification Badge */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Notification Badge */}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* MODE 1: SIGN IN FORM */}
            {authMode === 'signin' ? (
              <form onSubmit={handleSignInSubmit} autoComplete="off" className="space-y-4">
                {/* Quick 1-Click Demo Logins */}
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Quick Demo Logins
                    </span>
                    <span className="text-[10px] text-sky-400 font-semibold">1-Click Fill</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {DEMO_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.role}
                        type="button"
                        onClick={() => {
                          setEmail(acc.email);
                          setPassword(acc.password);
                          setErrorMessage(null);
                        }}
                        className="px-2 py-1.5 rounded-lg bg-[#0e1628] hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-slate-700/60 text-[11px] font-semibold transition truncate flex items-center justify-center gap-1"
                        title={`Fill ${acc.title} credentials`}
                      >
                        {acc.role === 'ADMIN' ? '🛡️ Admin' : acc.role === 'DESIGNER' ? '🎨 Designer' : '👤 Client'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wide uppercase text-[11px]">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-sky-400 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#080f1e]/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
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
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your security password"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#080f1e]/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-inner"
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

                {/* Keep me signed in */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200 select-none transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-[#080f1e] border-slate-700 text-sky-500 focus:ring-0 focus:ring-offset-0 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-[11px] font-medium">Keep me signed in</span>
                  </label>
                </div>

                {/* Submit Sign In CTA */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl text-xs font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] bg-gradient-to-r from-sky-500 via-indigo-600 to-indigo-700 hover:from-sky-400 hover:via-indigo-500 hover:to-indigo-600 shadow-sky-500/25 hover:shadow-sky-500/40 cursor-pointer disabled:opacity-50 mt-1"
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

                <p className="text-center text-xs text-slate-400 pt-2">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMessage(null);
                    }}
                    className="text-sky-400 hover:text-sky-300 font-bold underline transition"
                  >
                    Create one for free
                  </button>
                </p>
              </form>
            ) : (
              /* MODE 2: SIGN UP FORM */
              <form onSubmit={handleSignUpSubmit} autoComplete="off" className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 tracking-wide uppercase text-[11px]">
                    Full Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-sky-400 transition-colors">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full pl-10 pr-3.5 py-2 bg-[#080f1e]/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 tracking-wide uppercase text-[11px]">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-sky-400 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full pl-10 pr-3.5 py-2 bg-[#080f1e]/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Account Role Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 tracking-wide uppercase text-[11px]">
                    I want to use the studio as
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSignUpRole('DESIGNER')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        signUpRole === 'DESIGNER'
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                          : 'bg-[#080f1e]/80 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Palette className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Designer / Architect</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                        2D CAD Floorplanner & 3D WebGL Studio
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSignUpRole('CLIENT')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        signUpRole === 'CLIENT'
                          ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-sm'
                          : 'bg-[#080f1e]/80 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Client / Homeowner</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                        3D Virtual Tour & Material Customizer
                      </p>
                    </button>
                  </div>
                </div>

                {/* Password & Confirm Password side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 tracking-wide uppercase text-[11px]">
                      Password
                    </label>
                    <div className="relative group">
                      <input
                        type={showSignUpPassword ? 'text' : 'password'}
                        required
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        className="w-full px-3 py-2 bg-[#080f1e]/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-300 tracking-wide uppercase text-[11px]">
                        Confirm
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="text-[10px] text-slate-400 hover:text-slate-200 transition"
                      >
                        {showSignUpPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <div className="relative group">
                      <input
                        type={showSignUpPassword ? 'text' : 'password'}
                        required
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-3 py-2 bg-[#080f1e]/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                {/* Complimentary Trial Pass Badge */}
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[11px] leading-tight">
                    <strong>Welcome Bonus:</strong> Free <strong>2-Day Full Access Trial Pass</strong> activated on signup!
                  </span>
                </div>

                {/* Terms agreement checkbox */}
                <div className="flex items-center gap-2 text-xs pt-0.5">
                  <input
                    type="checkbox"
                    id="terms-check"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="rounded bg-[#080f1e] border-slate-700 text-sky-500 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                  />
                  <label htmlFor="terms-check" className="text-[11px] text-slate-400 cursor-pointer select-none">
                    I agree to the Terms of Service & Privacy Policy
                  </label>
                </div>

                {/* Submit Sign Up CTA */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl text-xs font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 hover:from-emerald-400 hover:via-teal-500 hover:to-indigo-500 shadow-emerald-500/25 hover:shadow-emerald-500/40 cursor-pointer disabled:opacity-50 mt-1"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Account & Provisioning Studio...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                      <span>Create Account & Start 48h Free Trial</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-400 pt-1">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setErrorMessage(null);
                    }}
                    className="text-sky-400 hover:text-sky-300 font-bold underline transition"
                  >
                    Sign in here
                  </button>
                </p>
              </form>
            )}

            {/* Security Badge Footer */}
            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Enterprise 256-Bit SSL Encrypted Connection</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
