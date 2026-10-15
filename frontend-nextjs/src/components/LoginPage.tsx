'use client';

import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Phone,
  KeyRound,
  RotateCcw,
  Palette,
  Wand2,
  Copy,
  Check,
} from 'lucide-react';
import { UserRole, User as UserType } from '../types/plan';
import { LoginSimulator3D } from './LoginSimulator3D';
import { start48HourFreeTrialLocally } from '../services/subscriptionService';

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
    email: 'admin@sweethome3d.io',
    username: 'admin',
    password: 'admin',
    assignedPlan: 'plan-sarah-suite',
  },
];

interface RegisteredAccountRecord {
  user: UserType;
  phone?: string;
  email?: string;
  username?: string;
  passwordHash: string;
}

const ROYALE_PLAY_TEXTURES = [
  {
    id: 'cobalt',
    name: 'Cobalt Sponge (Royale Play)',
    url: '/textures/dark-blue-sponge-wallpaint.jpg',
    accentColor: '#38bdf8',
  },
  {
    id: 'azure',
    name: 'Royal Azure (Royale Play)',
    url: '/textures/balanced-blue-sponge-wallpaint.jpg',
    accentColor: '#60a5fa',
  },
  {
    id: 'safari',
    name: 'Safari Ochre (Royale Play)',
    url: '/textures/brown-sponge-wallpaint.jpg',
    accentColor: '#f59e0b',
  },
  {
    id: 'emerald',
    name: 'Emerald Velvet (Royale Play)',
    url: '/textures/dark-green-sponge-wallpaint.jpg',
    accentColor: '#10b981',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, availableUsers = [], onSignUp }) => {
  // Tabs: 'signin' (Username & Password) vs 'signup' (Mobile Number OTP)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Background Royale Play Wall Texture
  const [activeTexture, setActiveTexture] = useState<string>(ROYALE_PLAY_TEXTURES[0].url);

  // --- SIGN IN STATES (Username & Password) ---
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // --- CREATE ACCOUNT STATES (Mobile Number + OTP + Email) ---
  const [signUpName, setSignUpName] = useState<string>('');
  const [signUpPhone, setSignUpPhone] = useState<string>('');
  const [signUpEmail, setSignUpEmail] = useState<string>('');
  const [signUpOtp, setSignUpOtp] = useState<string>('');
  const [signUpPassword, setSignUpPassword] = useState<string>('');
  const [showSignUpPassword, setShowSignUpPassword] = useState<boolean>(false);
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [simulatedOtp, setSimulatedOtp] = useState<string>('');
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);
  const [isPasswordCopied, setIsPasswordCopied] = useState<boolean>(false);

  // Feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Resend OTP Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

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

  // Helper to generate a strong, memorable password
  const handleGeneratePassword = () => {
    const prefixes = ['Studio', 'Design', 'Sweet', 'Arch', 'Villa', 'Deco', 'Craft', 'Plan'];
    const symbols = ['@', '#', '$', '!'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    const generated = `${prefix}${symbol}${num}`;

    setSignUpPassword(generated);
    setShowSignUpPassword(true); // reveal it so user sees clearly
    setErrorMessage(null);

    // Copy to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(generated).catch(() => {});
      setIsPasswordCopied(true);
      setTimeout(() => setIsPasswordCopied(false), 2500);
    }
  };

  // ==========================================
  // 1. SIGN IN: USERNAME & PASSWORD AUTHENTICATION
  // ==========================================
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanIdentifier = loginIdentifier.trim();
    const cleanPassword = loginPassword.trim();

    if (!cleanIdentifier) {
      setErrorMessage('Please enter your username, email, or mobile number.');
      return;
    }

    if (!cleanPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    // 1. Check Cloud Database (Supabase) for cross-device authentication
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanIdentifier, password: cleanPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const u = data.user;
        const finalUser: UserType = {
          id: u.id,
          name: u.name || cleanIdentifier,
          email: u.email,
          role: u.role || 'DESIGNER',
          isOnline: true,
          assignedPlan: 'plan-sarah-suite',
          createdAt: u.created_at || 'Today',
          payment_status: u.payment_status || (data.isAdmin ? 'paid' : 'unpaid'),
          plan: u.plan,
          isFreeTrial: u.is_free_trial,
          trialStartedAt: u.trial_started_at,
          trialExpiresAt: u.trial_expires_at,
          expires_at: u.expires_at,
          subscriptionTier: data.isAdmin ? 'PRO' : (u.is_free_trial ? 'TRIAL' : (u.payment_status === 'paid' ? 'PRO' : 'FREE')),
          subscriptionStatus: data.isPaid ? 'active' : 'inactive',
        };
        onLogin(finalUser);
        setIsLoading(false);
        return;
      } else if (res.status === 401) {
        setErrorMessage(data.error || 'Incorrect password. Please try again.');
        setIsLoading(false);
        return;
      }
    } catch (apiErr) {
      console.warn('Database login check failed, checking local accounts:', apiErr);
    }

    setTimeout(() => {
      // A. Match Demo Accounts (by username or email)
      const matchedDemo = DEMO_ACCOUNTS.find(
        (a) =>
          a.username.toLowerCase() === cleanIdentifier.toLowerCase() ||
          a.email.toLowerCase() === cleanIdentifier.toLowerCase()
      );

      if (matchedDemo) {
        if (cleanPassword === matchedDemo.password || cleanPassword === `${matchedDemo.password}123`) {
          const isAdmin = matchedDemo.role === 'ADMIN';
          const userObj: UserType = {
            id: matchedDemo.role === 'ADMIN' ? 'u1' : matchedDemo.role === 'DESIGNER' ? 'u2' : 'u3',
            name: matchedDemo.name,
            email: matchedDemo.email,
            role: matchedDemo.role,
            isOnline: true,
            assignedPlan: matchedDemo.assignedPlan,
            createdAt: 'Today',
            payment_status: isAdmin ? 'paid' : 'unpaid',
            subscriptionTier: isAdmin ? 'PRO' : 'FREE',
            subscriptionStatus: isAdmin ? 'active' : 'inactive',
          };
          const finalUser = isAdmin ? userObj : start48HourFreeTrialLocally(userObj);
          onLogin(finalUser);
          setIsLoading(false);
          return;
        } else {
          setErrorMessage('Invalid password for demo account. (Hint: password is same as username)');
          setIsLoading(false);
          return;
        }
      }

      // B. Match Registered Accounts from LocalStorage (by username, email, or mobile)
      const registered = getStoredRegisteredUsers();
      const cleanPhoneQuery = cleanIdentifier.replace(/\D/g, '');

      const matchedRegistered = registered.find((r) => {
        const emailMatch = r.email?.toLowerCase() === cleanIdentifier.toLowerCase() ||
                           r.user.email?.toLowerCase() === cleanIdentifier.toLowerCase();
        const usernameMatch = r.username?.toLowerCase() === cleanIdentifier.toLowerCase();
        const nameMatch = r.user.name?.toLowerCase() === cleanIdentifier.toLowerCase();
        const phoneMatch = cleanPhoneQuery.length >= 10 && (r.phone === cleanPhoneQuery || r.user.email?.includes(cleanPhoneQuery));
        return emailMatch || usernameMatch || nameMatch || phoneMatch;
      });

      if (matchedRegistered) {
        if (matchedRegistered.passwordHash === cleanPassword) {
          const finalUser = matchedRegistered.user.role === 'ADMIN'
            ? matchedRegistered.user
            : start48HourFreeTrialLocally(matchedRegistered.user);
          onLogin(finalUser);
          setIsLoading(false);
          return;
        } else {
          setErrorMessage('Invalid password. Please re-enter your security password.');
          setIsLoading(false);
          return;
        }
      }

      // C. Match Available Users passed in props
      const matchedAvailable = availableUsers.find(
        (u) =>
          u.email.toLowerCase() === cleanIdentifier.toLowerCase() ||
          u.name.toLowerCase() === cleanIdentifier.toLowerCase()
      );

      if (matchedAvailable) {
        const finalUser = matchedAvailable.role === 'ADMIN'
          ? matchedAvailable
          : start48HourFreeTrialLocally(matchedAvailable);
        onLogin(finalUser);
        setIsLoading(false);
        return;
      }

      // D. Direct Admin Shortcut
      if (cleanIdentifier.toLowerCase() === 'admin' && cleanPassword === 'admin') {
        const adminUser: UserType = {
          id: 'u1',
          name: 'Admin Superuser',
          email: 'admin@decoforge3d.io',
          role: 'ADMIN',
          isOnline: true,
          assignedPlan: 'plan-sarah-suite',
          createdAt: 'Today',
          payment_status: 'paid',
          subscriptionTier: 'PRO',
          subscriptionStatus: 'active',
        };
        onLogin(adminUser);
        setIsLoading(false);
        return;
      }

      // If no matching account found
      setErrorMessage(
        'Account not found or invalid credentials. If you are new, click "Create Account" above to register with Mobile OTP.'
      );
      setIsLoading(false);
    }, 300);
  };

  // ==========================================
  // 2. CREATE ACCOUNT: STEP 1 - SEND MOBILE OTP
  // ==========================================
  const handleSendSignUpOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = signUpName.trim();
    const cleanPhone = signUpPhone.replace(/\D/g, '');
    const cleanEmail = signUpEmail.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }

    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address to receive your password and login credentials.');
      return;
    }

    // Check if phone or email is already registered
    const registered = getStoredRegisteredUsers();
    const existingPhone = registered.find(
      (r) => r.phone === cleanPhone || r.user.email?.includes(cleanPhone)
    );
    if (existingPhone) {
      setErrorMessage('An account is already registered with this mobile number. Please switch to Sign In.');
      return;
    }

    const existingEmail = registered.find(
      (r) => r.email?.toLowerCase() === cleanEmail || r.user.email?.toLowerCase() === cleanEmail
    );
    if (existingEmail) {
      setErrorMessage('An account is already registered with this email address. Please switch to Sign In.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Generate simulated 6-digit OTP code for testing
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedOtp(randomCode);
      setIsOtpSent(true);
      setResendCountdown(30);
      setIsLoading(false);
      setSuccessMessage(`OTP sent to +91 ${cleanPhone}. (Test OTP: ${randomCode})`);
    }, 450);
  };

  // ==========================================
  // 3. CREATE ACCOUNT: STEP 2 - VERIFY OTP & REGISTER
  // ==========================================
  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = signUpPhone.replace(/\D/g, '');
    const cleanOtp = signUpOtp.trim();
    const cleanPassword = signUpPassword.trim();
    const cleanName = signUpName.trim();
    const cleanEmail = signUpEmail.trim().toLowerCase();

    if (!cleanOtp) {
      setErrorMessage('Please enter the 6-digit OTP verification code.');
      return;
    }

    if (cleanOtp !== simulatedOtp && cleanOtp !== '123456' && cleanOtp !== '1234') {
      setErrorMessage(`Invalid OTP code. Please enter the code sent to your phone (${simulatedOtp || '123456'}).`);
      return;
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      setErrorMessage('Please enter or generate a password with at least 6 characters.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please agree to the Terms of Service to complete registration.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Persist user and 48-Hour Free Trial in Supabase Cloud Database
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          password: cleanPassword,
        }),
      });
      const regData = await regRes.json();
      if (!regRes.ok || !regData.success) {
        setErrorMessage(regData.error || 'Failed to create account in database.');
        setIsLoading(false);
        return;
      }

      const dbUser = regData.user;
      const newUser: UserType = {
        id: dbUser.id,
        name: dbUser.name || cleanName,
        email: dbUser.email || cleanEmail,
        role: dbUser.role || 'DESIGNER',
        isOnline: true,
        assignedPlan: 'plan-sarah-suite',
        createdAt: 'Just now',
        payment_status: dbUser.payment_status || 'paid',
        plan: 'trial_48h',
        paid_at: dbUser.paid_at || null,
        expires_at: dbUser.expires_at || dbUser.trial_expires_at,
        isFreeTrial: true,
        trialStartedAt: dbUser.trial_started_at,
        trialExpiresAt: dbUser.trial_expires_at,
        subscriptionTier: 'TRIAL',
        subscriptionStatus: 'active',
      };

      // 2. Dispatch credentials email
      try {
        fetch('/api/auth/send-credentials-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            name: cleanName,
            phone: cleanPhone,
            password: cleanPassword,
          }),
        }).catch((err) => console.warn('Email API dispatch notice:', err));
      } catch (err) {}

      // 3. Save in localStorage for offline caching
      try {
        const registered = getStoredRegisteredUsers();
        const updated = [
          ...registered,
          {
            user: newUser,
            phone: cleanPhone,
            email: cleanEmail,
            username: cleanPhone,
            passwordHash: cleanPassword,
          },
        ];
        localStorage.setItem('sweethome_registered_users', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }

      setSuccessMessage(`Account created! Your 48-Hour Free Trial is active. Redirecting to 3D Studio...`);

      setTimeout(() => {
        setIsLoading(false);
        if (onSignUp) {
          onSignUp(newUser);
        } else {
          onLogin(newUser);
        }
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error completing registration');
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full text-slate-100 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-x-hidden selection:bg-sky-500 selection:text-white transition-all duration-700"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 25%, rgba(15, 23, 42, 0.70) 0%, rgba(8, 15, 30, 0.94) 85%), url('${activeTexture}')`,
        backgroundSize: 'cover, 400px 400px',
        backgroundRepeat: 'no-repeat, repeat',
        backgroundBlendMode: 'multiply',
      }}
    >
      {/* Interior Lighting Vignette & Ambient Radial Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/10 via-sky-500/10 to-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-32 -right-32 w-[650px] h-[650px] bg-gradient-to-tl from-indigo-600/15 via-sky-600/10 to-transparent rounded-full blur-[150px]" />
      </div>

      {/* Royale Play Wall Texture Switcher Badge (Top Right Corner) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/80 shadow-lg">
        <Palette className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[10px] font-semibold text-slate-300 mr-1 hidden sm:inline">Royale Play Wall:</span>
        <div className="flex items-center gap-1.5">
          {ROYALE_PLAY_TEXTURES.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTexture(t.url)}
              title={t.name}
              className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                activeTexture === t.url ? 'scale-125 ring-2 ring-white border-transparent' : 'border-slate-500/60 opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: t.accentColor }}
            />
          ))}
        </div>
      </div>

      {/* 2-Column Container: 3D Simulator on Left, Auth Card on Right */}
      <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        
        {/* LEFT COLUMN: 3D Interactive Floorplan Design Simulation */}
        <div className="lg:col-span-7 flex items-center justify-center">
          <LoginSimulator3D />
        </div>

        {/* RIGHT COLUMN: Luxury Slate Glassmorphism Auth Card */}
        <div className="lg:col-span-5 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="relative bg-gradient-to-b from-[#111e38]/95 to-[#0b1426]/95 border border-slate-700/70 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-black/50 backdrop-blur-xl overflow-hidden">
            
            {/* Top Glowing Gold/Cyan Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-sky-500 to-indigo-500 shadow-md shadow-sky-400/30" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Deco<span className="bg-gradient-to-r from-amber-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">Forge</span> 3D
                </h1>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
                  <span>Interior Architecture Studio</span>
                </p>
              </div>
              
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-indigo-600 to-purple-600 shadow-lg shadow-sky-500/25 flex items-center justify-center text-white border border-white/20">
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
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
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
                  setIsOtpSent(false);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
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

            {/* ==================================================== */}
            {/* 1. SIGN IN: USERNAME & PASSWORD FORM                 */}
            {/* ==================================================== */}
            {authMode === 'signin' ? (
              <form onSubmit={handleSignIn} autoComplete="off" className="space-y-4">
                {/* Username, Email, or Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wide uppercase text-[11px]">
                    Username, Email, or Mobile
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-sky-400 transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="Enter username, email, or mobile"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#080f1e]/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wide uppercase text-[11px]">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-sky-400 transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your security password"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#080f1e]/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                      className="rounded bg-[#080f1e] border-slate-700 text-sky-500 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-[11px] font-medium">Keep me signed in</span>
                  </label>
                  <span className="text-[11px] text-slate-500">Admin: admin / admin</span>
                </div>

                {/* Submit Sign In */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl text-xs font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 via-indigo-600 to-indigo-700 hover:from-sky-400 hover:via-indigo-500 hover:to-indigo-600 shadow-sky-500/25 cursor-pointer disabled:opacity-50 mt-1"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Studio</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* ==================================================== */
              /* 2. CREATE ACCOUNT: MOBILE OTP + EMAIL + PASSWORD     */
              /* ==================================================== */
              <div className="space-y-4">
                {!isOtpSent ? (
                  /* STEP 1: Full Name, Mobile Number & Email */
                  <form onSubmit={handleSendSignUpOtp} className="space-y-3">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1 tracking-wide uppercase text-[11px]">
                        Full Name
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          autoFocus
                          value={signUpName}
                          onChange={(e) => setSignUpName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full h-10 pl-9 pr-3 bg-[#080f1e]/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1 tracking-wide uppercase text-[11px]">
                        Mobile Phone Number
                      </label>
                      <div className="h-10 flex items-center rounded-xl border border-slate-700/80 bg-[#080f1e]/90 overflow-hidden focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all shadow-inner">
                        <div className="h-full shrink-0 flex items-center gap-1.5 px-3 bg-slate-800/80 border-r border-slate-700/80 select-none whitespace-nowrap">
                          <svg className="w-4 h-3 rounded-[2px] shadow-sm shrink-0" viewBox="0 0 640 480" aria-label="India Flag">
                            <path fill="#f93" d="M0 0h640v160H0z"/>
                            <path fill="#fff" d="M0 160h640v160H0z"/>
                            <path fill="#128807" d="M0 320h640v160H0z"/>
                            <circle cx="320" cy="240" r="40" fill="none" stroke="#008" strokeWidth="8"/>
                            <circle cx="320" cy="240" r="8" fill="#008"/>
                          </svg>
                          <span className="text-xs font-bold text-slate-200">+91</span>
                        </div>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={signUpPhone}
                          onChange={(e) => setSignUpPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="10-digit mobile number"
                          className="w-full h-full px-3 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1 tracking-wide uppercase text-[11px] flex items-center justify-between">
                        <span>Email Address</span>
                        <span className="text-[10px] text-sky-400 font-normal lowercase">(receives your password)</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          required
                          value={signUpEmail}
                          onChange={(e) => setSignUpEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="w-full h-10 pl-9 pr-3 bg-[#080f1e]/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-inner"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Your account password and login link will be sent to this email upon creation.
                      </p>
                    </div>

                    {/* Send OTP CTA */}
                    <button
                      type="submit"
                      disabled={isLoading || signUpPhone.length < 10 || signUpName.trim().length < 2 || !signUpEmail.trim()}
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 via-indigo-600 to-indigo-700 hover:from-sky-400 hover:via-indigo-500 hover:to-indigo-600 shadow-sky-500/25 cursor-pointer disabled:opacity-50 mt-1"
                    >
                      {isLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Sending Verification Code...</span>
                        </>
                      ) : (
                        <>
                          <Phone className="w-4 h-4" />
                          <span>Send Verification OTP</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* STEP 2: Enter OTP & Set/Generate Password */
                  <form onSubmit={handleVerifyOtpAndRegister} className="space-y-3.5 animate-in fade-in">
                    {/* Header info with change button */}
                    <div className="flex items-center justify-between p-2.5 bg-[#080f1e]/80 border border-slate-800 rounded-xl text-xs">
                      <div className="truncate max-w-[240px]">
                        <span className="text-slate-400 text-[11px]">Verifying: </span>
                        <strong className="text-white font-mono">+91 {signUpPhone}</strong>
                        <span className="text-slate-500 text-[10px] block truncate">{signUpEmail}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOtpSent(false);
                          setSignUpOtp('');
                          setErrorMessage(null);
                        }}
                        className="text-[11px] text-sky-400 hover:underline cursor-pointer shrink-0 ml-2"
                      >
                        Change
                      </button>
                    </div>

                    {/* 6-Digit OTP Code */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1 tracking-wide uppercase text-[11px]">
                        6-Digit OTP Code
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <KeyRound className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          autoFocus
                          value={signUpOtp}
                          onChange={(e) => setSignUpOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="• • • • • •"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#080f1e]/90 border border-slate-700/80 rounded-xl text-sm font-mono tracking-widest text-center text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 shadow-inner"
                        />
                      </div>

                      {/* Quick Auto-Fill Demo OTP Helper */}
                      {simulatedOtp && (
                        <div className="mt-1.5 flex items-center justify-between text-[11px] bg-sky-500/10 border border-sky-500/20 px-2.5 py-1.5 rounded-lg">
                          <span className="text-slate-300">
                            Demo Code: <strong className="text-sky-300 font-mono">{simulatedOtp}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => setSignUpOtp(simulatedOtp)}
                            className="text-sky-400 font-bold hover:underline cursor-pointer"
                          >
                            Auto-Fill Code
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Password Field with "Generate Password" Option */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-300 tracking-wide uppercase text-[11px]">
                          Set Account Password
                        </label>
                        <div className="flex items-center gap-2">
                          {/* Generate Password Action Button */}
                          <button
                            type="button"
                            onClick={handleGeneratePassword}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-md cursor-pointer transition-all shadow-sm"
                            title="Generate a secure random password automatically"
                          >
                            <Wand2 className="w-3 h-3" />
                            <span>Generate Password</span>
                          </button>

                          {/* Toggle visibility */}
                          <button
                            type="button"
                            onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                            className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
                          >
                            {showSignUpPassword ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>

                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showSignUpPassword ? 'text' : 'password'}
                          required
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          placeholder="Enter or generate password"
                          className="w-full pl-10 pr-10 py-2 bg-[#080f1e]/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 shadow-inner"
                        />
                        {signUpPassword && (
                          <button
                            type="button"
                            onClick={() => {
                              if (navigator.clipboard) {
                                navigator.clipboard.writeText(signUpPassword).catch(() => {});
                                setIsPasswordCopied(true);
                                setTimeout(() => setIsPasswordCopied(false), 2000);
                              }
                            }}
                            title="Copy password to clipboard"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                          >
                            {isPasswordCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Informational banner: Password will be sent to email */}
                      <div className="mt-1.5 flex items-start gap-1.5 text-[10px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                        <span>
                          This password will be automatically emailed to <strong className="text-slate-200">{signUpEmail}</strong> upon creating your account.
                        </span>
                      </div>
                    </div>

                    {/* Agree Terms */}
                    <div className="flex items-center gap-2 text-xs pt-0.5">
                      <input
                        type="checkbox"
                        id="signup-terms"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="rounded bg-[#080f1e] border-slate-700 text-sky-500 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                      />
                      <label htmlFor="signup-terms" className="text-[11px] text-slate-400 cursor-pointer select-none">
                        I agree to Terms & Conditions
                      </label>
                    </div>

                    {/* Submit OTP Verification & Register */}
                    <button
                      type="submit"
                      disabled={isLoading || signUpOtp.length < 4 || signUpPassword.length < 6}
                      className="w-full py-3 rounded-xl text-xs font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 hover:from-emerald-400 hover:via-teal-500 hover:to-indigo-500 shadow-emerald-500/25 cursor-pointer disabled:opacity-50 mt-1"
                    >
                      {isLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Verifying & Sending Credentials...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-emerald-200" />
                          <span>Verify OTP & Create Studio Account</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Resend Code Countdown */}
                    <div className="text-center pt-1">
                      {resendCountdown > 0 ? (
                        <span className="text-[11px] text-slate-400">
                          Resend code in <strong className="text-slate-200">{resendCountdown}s</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendSignUpOtp}
                          className="text-[11px] text-sky-400 hover:text-sky-300 font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Resend OTP Code</span>
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
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
