'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  Download,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Calendar,
  Crown,
  RefreshCw,
  Clock,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
  Key,
  Save,
  Settings,
  Trash2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { User } from '../types/plan';
import { PaymentTransaction } from '../app/api/admin/payments/route';

interface AdminPaymentsViewProps {
  currentUser: User | null;
  theme?: 'dark' | 'light';
}

export const AdminPaymentsView: React.FC<AdminPaymentsViewProps> = ({ currentUser, theme = 'light' }) => {
  const isAdmin = currentUser?.role === 'ADMIN';
  const isLight = theme !== 'dark';

  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'settings'>('ledger');
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<'all' | 'trial_2days' | 'monthly' | 'yearly'>('all');
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);

  // Gateway Settings State
  const [gatewaySettings, setGatewaySettings] = useState<{
    activeGateway: 'cashfree' | 'razorpay';
    environment: 'PRODUCTION' | 'SANDBOX';
    cashfreeAppId: string;
    cashfreeSecretKey: string;
    cashfreeSecretKeyMasked: string;
    isConfigured: boolean;
    razorpayKeyId: string;
    razorpayKeySecret: string;
    razorpayKeySecretMasked: string;
    isRazorpayConfigured: boolean;
  }>({
    activeGateway: 'cashfree',
    environment: 'PRODUCTION',
    cashfreeAppId: '',
    cashfreeSecretKey: '',
    cashfreeSecretKeyMasked: '',
    isConfigured: false,
    razorpayKeyId: '',
    razorpayKeySecret: '',
    razorpayKeySecretMasked: '',
    isRazorpayConfigured: false,
  });

  // Dynamic Plans Settings State
  const [plansSettings, setPlansSettings] = useState<Record<string, {
    priceINR: number;
    name: string;
    durationDays: number;
    badge?: string;
  }>>({
    trial_2days: { priceINR: 2, name: '2-Day Full Access Trial', durationDays: 2, badge: 'Quick Test' },
    monthly: { priceINR: 3, name: 'Monthly Pro Pass', durationDays: 30, badge: 'Most Popular' },
    yearly: { priceINR: 4, name: 'Annual Pro Pass', durationDays: 365, badge: 'Save 20%' },
  });

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isPurging, setIsPurging] = useState(false);

  // Fetch admin payments data
  const loadPayments = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/payments', {
        headers: {
          'x-user-role': currentUser?.role || 'CLIENT',
        },
      });
      const data = await res.json();
      if (res.ok && data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (e) {
      console.warn('Failed to fetch admin transactions:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch admin payment gateway & plans configuration
  const loadConfig = async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch('/api/admin/payment-config', {
        headers: { 'x-user-role': currentUser?.role || 'CLIENT' },
      });
      const data = await res.json();
      if (res.ok && data.config) {
        if (data.config.gateway) {
          setGatewaySettings({
            activeGateway: data.config.gateway.activeGateway || 'cashfree',
            environment: data.config.gateway.environment || 'PRODUCTION',
            cashfreeAppId: data.config.gateway.cashfreeAppId || '',
            cashfreeSecretKey: '',
            cashfreeSecretKeyMasked: data.config.gateway.cashfreeSecretKeyMasked || '',
            isConfigured: data.config.gateway.isConfigured || false,
            razorpayKeyId: data.config.gateway.razorpayKeyId || '',
            razorpayKeySecret: '',
            razorpayKeySecretMasked: data.config.gateway.razorpayKeySecretMasked || '',
            isRazorpayConfigured: data.config.gateway.isRazorpayConfigured || false,
          });
        }
        if (data.config.plans) {
          setPlansSettings(data.config.plans);
        }
      }
    } catch (e) {
      console.warn('Failed to load payment config:', e);
    }
  };

  useEffect(() => {
    loadPayments();
    loadConfig();
  }, [isAdmin, currentUser?.role]);

  // Format currency in Indian standard format (₹ en-IN)
  const formatINR = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchPlan = selectedPlan === 'all' || tx.planId === selectedPlan;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        tx.customerName.toLowerCase().includes(q) ||
        tx.customerEmail.toLowerCase().includes(q) ||
        tx.orderId.toLowerCase().includes(q);
      return matchPlan && matchSearch;
    });
  }, [transactions, selectedPlan, searchQuery]);

  // Aggregate stats
  const totalRevenue = useMemo(() => {
    return transactions.reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions]);

  // Save Gateway & Plan Pricing Settings
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/payment-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'CLIENT',
        },
        body: JSON.stringify({
          gateway: {
            activeGateway: gatewaySettings.activeGateway,
            environment: gatewaySettings.environment,
            cashfreeAppId: gatewaySettings.cashfreeAppId,
            cashfreeSecretKey: gatewaySettings.cashfreeSecretKey || undefined,
            razorpayKeyId: gatewaySettings.razorpayKeyId,
            razorpayKeySecret: gatewaySettings.razorpayKeySecret || undefined,
          },
          plans: plansSettings,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ text: 'Gateway keys and plan amounts saved successfully! Prices are live on paywall.', type: 'success' });
        loadConfig();
      } else {
        setStatusMsg({ text: data.error || 'Failed to save settings', type: 'error' });
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Error saving settings', type: 'error' });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Purge all non-admin test users
  const handlePurgeTestUsers = async () => {
    if (!confirm('Are you sure you want to purge all non-admin client accounts? Admin accounts (admin@sweethome3d.io / admin@visualrendered.io) will retain lifetime access. All regular visitors will be required to make real payments.')) {
      return;
    }
    setIsPurging(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/payment-config', {
        method: 'DELETE',
        headers: { 'x-user-role': currentUser?.role || 'CLIENT' },
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ text: data.message || 'Purged test accounts successfully!', type: 'success' });
        loadPayments();
      } else {
        setStatusMsg({ text: data.error || 'Failed to purge accounts', type: 'error' });
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Error purging accounts', type: 'error' });
    } finally {
      setIsPurging(false);
    }
  };

  // CSV Export for Ledger
  const handleExportCSV = () => {
    let csv = 'Order ID,Customer Name,Customer Email,Plan Name,Amount (INR),Gateway,Payment Method,Status,Date,Expires At\n';
    filteredTransactions.forEach((tx) => {
      csv += `"${tx.orderId}","${tx.customerName}","${tx.customerEmail}","${tx.planName}",${tx.amount},"Cashfree PG","${tx.paymentMethod}","${tx.status}","${new Date(tx.createdAt).toLocaleDateString()}","${new Date(tx.expiresAt).toLocaleDateString()}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SweetHome_Payments_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // STRICT ACCESS DENIED SCREEN IF NON-ADMIN
  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#080d19] text-slate-100 select-none">
        <div className="max-w-md w-full bg-slate-900/90 border border-rose-500/30 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-5 animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Access Restricted</h2>
          <p className="mt-2 text-xs text-slate-300 leading-relaxed">
            The <strong>Payments & Revenue Dashboard</strong> is strictly reserved for users with{' '}
            <strong className="text-amber-400">ADMIN</strong> clearance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-5 gap-3 select-none font-sans ${
      isLight ? 'bg-slate-50 text-slate-800' : 'bg-[#080d19] text-slate-100'
    }`}>
      {/* 1. Header with Clearance & Sub-Tabs */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b shrink-0 ${
        isLight ? 'border-slate-200' : 'border-slate-800'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>Real Gateway Central • {gatewaySettings.environment} MODE</span>
            </div>
          </div>
          <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            <span>Payments & Gateway Management</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub Tab Switcher */}
          <div className={`flex items-center p-1 rounded-xl border ${
            isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-slate-900 border-slate-700'
          }`}>
            <button
              onClick={() => setActiveSubTab('ledger')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'ledger'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Real Ledger ({transactions.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'settings'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Gateway & Plan Pricing</span>
            </button>
          </div>

          {activeSubTab === 'ledger' && (
            <>
              <button
                onClick={loadPayments}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
                title="Sync Transactions"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Export CSV to Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Notifications */}
      {statusMsg && (
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
          statusMsg.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? <Check className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 1: GATEWAY KEYS & DYNAMIC PLAN PRICING CONFIG    */}
      {/* ======================================================== */}
      {activeSubTab === 'settings' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
          {/* Card 1: Live Payment Gateway Keys */}
          <div className={`border rounded-2xl p-4 sm:p-5 shadow-xs ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0e1628] border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold">Payment Gateway Switcher & Credentials</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enable either Cashfree or Razorpay (one active at a time). Customer checkouts immediately route to your active gateway.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                  gatewaySettings.activeGateway === 'razorpay'
                    ? gatewaySettings.isRazorpayConfigured
                      ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                    : gatewaySettings.isConfigured
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                }`}>
                  {gatewaySettings.activeGateway === 'razorpay'
                    ? (gatewaySettings.isRazorpayConfigured ? '🟢 Razorpay Active (Live Ready)' : '🟡 Razorpay Active (Needs Keys)')
                    : (gatewaySettings.isConfigured ? '🟢 Cashfree Active (Live Ready)' : '🟡 Cashfree Active (Needs Keys)')}
                </span>
              </div>
            </div>

            {/* SECTION 1: ONE AT A TIME ACTIVE GATEWAY SELECTOR */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Active Payment Gateway (Select which gateway should process customer payments):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Cashfree Toggle Option */}
                <div
                  onClick={() => setGatewaySettings((s) => ({ ...s, activeGateway: 'cashfree' }))}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    gatewaySettings.activeGateway === 'cashfree'
                      ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 shadow-md ring-2 ring-sky-500/20'
                      : isLight
                      ? 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        gatewaySettings.activeGateway === 'cashfree' ? 'border-sky-500 bg-sky-500' : 'border-slate-400'
                      }`}>
                        {gatewaySettings.activeGateway === 'cashfree' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Cashfree Payments</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Modal checkout with UPI, Cards & NetBanking</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      gatewaySettings.activeGateway === 'cashfree'
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {gatewaySettings.activeGateway === 'cashfree' ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                </div>

                {/* Razorpay Toggle Option */}
                <div
                  onClick={() => setGatewaySettings((s) => ({ ...s, activeGateway: 'razorpay' }))}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    gatewaySettings.activeGateway === 'razorpay'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20'
                      : isLight
                      ? 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        gatewaySettings.activeGateway === 'razorpay' ? 'border-blue-500 bg-blue-500' : 'border-slate-400'
                      }`}>
                        {gatewaySettings.activeGateway === 'razorpay' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Razorpay Payments</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Checkout v1 with UPI QR, Cards & Wallets</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      gatewaySettings.activeGateway === 'razorpay'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {gatewaySettings.activeGateway === 'razorpay' ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: ENVIRONMENT SELECTOR */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Environment Mode (applies to active gateway)
              </label>
              <div className="flex items-center gap-2 max-w-md">
                <button
                  type="button"
                  onClick={() => setGatewaySettings((s) => ({ ...s, environment: 'PRODUCTION' }))}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    gatewaySettings.environment === 'PRODUCTION'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span>🔴 PRODUCTION (Live)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGatewaySettings((s) => ({ ...s, environment: 'SANDBOX' }))}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    gatewaySettings.environment === 'SANDBOX'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span>🧪 SANDBOX (Testing)</span>
                </button>
              </div>
            </div>

            {/* SECTION 3: CREDENTIALS (DUAL SECTIONS) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              {/* Cashfree Credentials Card */}
              <div className={`p-4 rounded-xl border ${
                gatewaySettings.activeGateway === 'cashfree'
                  ? 'border-sky-400/80 bg-sky-50/20 dark:bg-sky-950/10'
                  : 'border-slate-200 dark:border-slate-800 opacity-75'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <span>Cashfree API Keys</span>
                  </h4>
                  {gatewaySettings.activeGateway === 'cashfree' && (
                    <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/40 px-2 py-0.5 rounded">
                      ACTIVE GATEWAY
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Cashfree App ID (Client ID)
                    </label>
                    <input
                      type="text"
                      value={gatewaySettings.cashfreeAppId}
                      onChange={(e) => setGatewaySettings((s) => ({ ...s, cashfreeAppId: e.target.value }))}
                      placeholder="e.g. 14430251a388dbe1368bfe972915203441"
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono transition focus:outline-hidden ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
                      <span>Cashfree Secret Key</span>
                      {gatewaySettings.cashfreeSecretKeyMasked && (
                        <span className="text-[10px] font-mono text-emerald-500 font-semibold">Active: {gatewaySettings.cashfreeSecretKeyMasked}</span>
                      )}
                    </label>
                    <input
                      type="password"
                      value={gatewaySettings.cashfreeSecretKey}
                      onChange={(e) => setGatewaySettings((s) => ({ ...s, cashfreeSecretKey: e.target.value }))}
                      placeholder={gatewaySettings.cashfreeSecretKeyMasked ? 'Key configured (leave blank to keep current)' : 'cfsk_ma_prod_... paste secret key here'}
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono transition focus:outline-hidden ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Razorpay Credentials Card */}
              <div className={`p-4 rounded-xl border ${
                gatewaySettings.activeGateway === 'razorpay'
                  ? 'border-blue-400/80 bg-blue-50/20 dark:bg-blue-950/10'
                  : 'border-slate-200 dark:border-slate-800 opacity-75'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Razorpay API Keys</span>
                  </h4>
                  {gatewaySettings.activeGateway === 'razorpay' && (
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded">
                      ACTIVE GATEWAY
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Razorpay Key ID
                    </label>
                    <input
                      type="text"
                      value={gatewaySettings.razorpayKeyId}
                      onChange={(e) => setGatewaySettings((s) => ({ ...s, razorpayKeyId: e.target.value }))}
                      placeholder="e.g. rzp_live_... or rzp_test_..."
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono transition focus:outline-hidden ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
                      <span>Razorpay Key Secret</span>
                      {gatewaySettings.razorpayKeySecretMasked && (
                        <span className="text-[10px] font-mono text-emerald-500 font-semibold">Active: {gatewaySettings.razorpayKeySecretMasked}</span>
                      )}
                    </label>
                    <input
                      type="password"
                      value={gatewaySettings.razorpayKeySecret}
                      onChange={(e) => setGatewaySettings((s) => ({ ...s, razorpayKeySecret: e.target.value }))}
                      placeholder={gatewaySettings.razorpayKeySecretMasked ? 'Key configured (leave blank to keep current)' : 'Paste Razorpay secret key here'}
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono transition focus:outline-hidden ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Dynamic Plan Pricing Configuration */}
          <div className={`border rounded-2xl p-4 sm:p-5 shadow-xs ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0e1628] border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold">Plan Pricing Configuration</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Set the exact price amounts for each plan. Changes immediately display on the paywall and charge through the gateway.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Plan 1: 2-Day Trial */}
              <div className={`p-4 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase text-amber-500">Plan 1: Trial Pass</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500">
                    {plansSettings.trial_2days?.durationDays || 2} Days
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Price in INR (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="1"
                        value={plansSettings.trial_2days?.priceINR ?? 200}
                        onChange={(e) => setPlansSettings((s) => ({
                          ...s,
                          trial_2days: { ...s.trial_2days, priceINR: Number(e.target.value) }
                        }))}
                        className={`w-full pl-7 pr-3 py-1.5 rounded-lg border text-xs font-bold ${
                          isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700 text-white'
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Display Title</label>
                    <input
                      type="text"
                      value={plansSettings.trial_2days?.name || '2-Day Full Access Trial'}
                      onChange={(e) => setPlansSettings((s) => ({
                        ...s,
                        trial_2days: { ...s.trial_2days, name: e.target.value }
                      }))}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                        isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Badge Tag</label>
                    <input
                      type="text"
                      value={plansSettings.trial_2days?.badge || 'Quick Test'}
                      onChange={(e) => setPlansSettings((s) => ({
                        ...s,
                        trial_2days: { ...s.trial_2days, badge: e.target.value }
                      }))}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                        isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Plan 2: Monthly Pro */}
              <div className={`p-4 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase text-indigo-500">Plan 2: Monthly Pass</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500">
                    {plansSettings.monthly?.durationDays || 30} Days
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Price in INR (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="1"
                        value={plansSettings.monthly?.priceINR ?? 999}
                        onChange={(e) => setPlansSettings((s) => ({
                          ...s,
                          monthly: { ...s.monthly, priceINR: Number(e.target.value) }
                        }))}
                        className={`w-full pl-7 pr-3 py-1.5 rounded-lg border text-xs font-bold ${
                          isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700 text-white'
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Display Title</label>
                    <input
                      type="text"
                      value={plansSettings.monthly?.name || 'Monthly Pro Pass'}
                      onChange={(e) => setPlansSettings((s) => ({
                        ...s,
                        monthly: { ...s.monthly, name: e.target.value }
                      }))}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                        isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Badge Tag</label>
                    <input
                      type="text"
                      value={plansSettings.monthly?.badge || 'Most Popular'}
                      onChange={(e) => setPlansSettings((s) => ({
                        ...s,
                        monthly: { ...s.monthly, badge: e.target.value }
                      }))}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                        isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Plan 3: Annual Pro */}
              <div className={`p-4 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase text-emerald-500">Plan 3: Annual Pass</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">
                    {plansSettings.yearly?.durationDays || 365} Days
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Price in INR (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="1"
                        value={plansSettings.yearly?.priceINR ?? 9590}
                        onChange={(e) => setPlansSettings((s) => ({
                          ...s,
                          yearly: { ...s.yearly, priceINR: Number(e.target.value) }
                        }))}
                        className={`w-full pl-7 pr-3 py-1.5 rounded-lg border text-xs font-bold ${
                          isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700 text-white'
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Display Title</label>
                    <input
                      type="text"
                      value={plansSettings.yearly?.name || 'Annual Pro Pass'}
                      onChange={(e) => setPlansSettings((s) => ({
                        ...s,
                        yearly: { ...s.yearly, name: e.target.value }
                      }))}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                        isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Badge Tag</label>
                    <input
                      type="text"
                      value={plansSettings.yearly?.badge || 'Save 20%'}
                      onChange={(e) => setPlansSettings((s) => ({
                        ...s,
                        yearly: { ...s.yearly, badge: e.target.value }
                      }))}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                        isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-5 flex items-center justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingSettings ? 'Saving Settings...' : 'Save Gateway Keys & Plan Pricing'}</span>
              </button>
            </div>
          </div>

          {/* Card 3: Database Maintenance (Reset Test Users) */}
          <div className={`border rounded-2xl p-4 sm:p-5 shadow-xs ${
            isLight ? 'bg-rose-50/50 border-rose-200' : 'bg-rose-950/20 border-rose-900/40'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>Purge Non-Admin Test Accounts & Start Fresh</span>
                </h3>
                <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1">
                  Removes all non-admin client test accounts from memory. Admin Superusers (<code>admin@sweethome3d.io</code> and <code>admin@visualrendered.io</code>) retain permanent free access. All regular visitors will be required to make real payments.
                </p>
              </div>
              <button
                onClick={handlePurgeTestUsers}
                disabled={isPurging}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0 disabled:opacity-50 shadow-xs"
              >
                {isPurging ? 'Purging...' : 'Reset Test Accounts'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: REAL PAYMENTS LEDGER & TRANSACTIONS TABLE     */}
      {/* ======================================================== */}
      {activeSubTab === 'ledger' && (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
            {/* Total Gross Revenue */}
            <div className={`border rounded-2xl p-4 shadow-xs transition ${
              isLight ? 'bg-white border-slate-200 hover:border-amber-400' : 'bg-[#0e1628] border-slate-800 hover:border-amber-500/40'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Gross Revenue</span>
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{formatINR(totalRevenue)}</div>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Real Settled
                </span>
              </div>
            </div>

            {/* Gateway Status */}
            <div className={`border rounded-2xl p-4 shadow-xs transition ${
              isLight ? 'bg-white border-slate-200 hover:border-sky-400' : 'bg-[#0e1628] border-slate-800 hover:border-sky-500/40'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Gateway Provider</span>
                <div className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-500 flex items-center justify-center font-bold text-xs">
                  CF
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className={`text-xl font-black text-sky-500`}>Cashfree PG</div>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/20">
                  {gatewaySettings.environment}
                </span>
              </div>
            </div>

            {/* Active Subscriptions Count */}
            <div className={`border rounded-2xl p-4 shadow-xs transition ${
              isLight ? 'bg-white border-slate-200 hover:border-emerald-400' : 'bg-[#0e1628] border-slate-800 hover:border-emerald-500/40'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Verified Passes</span>
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Crown className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{transactions.length} Verified</div>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Live
                </span>
              </div>
            </div>
          </div>

          {/* Search & Plan Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer, email or order ID..."
                className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs transition focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                  isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
            </div>

            <div className="flex items-center gap-1">
              {(['all', 'trial_2days', 'monthly', 'yearly'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPlan(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition capitalize cursor-pointer ${
                    selectedPlan === p
                      ? 'bg-amber-500 text-slate-950 shadow-2xs'
                      : isLight ? 'bg-white text-slate-600 border border-slate-200' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {p === 'all' ? 'All Plans' : p === 'trial_2days' ? 'Trial' : p === 'monthly' ? 'Monthly' : 'Yearly'}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions Table or Clean Slate Message */}
          <div className={`flex-1 border rounded-2xl overflow-hidden flex flex-col shadow-xs ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0e1628] border-slate-800'
          }`}>
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold">Ledger is Clean & Ready</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  All mock records removed. As real customers purchase access passes through the payment gateway, their live transaction records, order IDs, and activation dates will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b text-[11px] font-bold uppercase tracking-wider sticky top-0 z-10 ${
                    isLight ? 'bg-slate-100/90 border-slate-200 text-slate-600' : 'bg-slate-900/90 border-slate-800 text-slate-400'
                  }`}>
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Plan</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-amber-50/20 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono text-[11px] text-sky-600 dark:text-sky-400 font-semibold">{tx.orderId}</td>
                        <td className="p-3">
                          <div className="font-bold">{tx.customerName}</div>
                          <div className="text-[10px] text-slate-400">{tx.customerEmail}</div>
                        </td>
                        <td className="p-3 font-semibold">{tx.planName}</td>
                        <td className="p-3 font-black text-emerald-600 dark:text-emerald-400">{formatINR(tx.amount)}</td>
                        <td className="p-3 text-[11px] text-slate-500">{tx.paymentMethod}</td>
                        <td className="p-3 text-[11px] text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
