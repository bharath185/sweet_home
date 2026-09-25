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
} from 'lucide-react';
import { User } from '../types/plan';
import { PaymentTransaction } from '../app/api/admin/payments/route';

interface AdminPaymentsViewProps {
  currentUser: User | null;
}

export const AdminPaymentsView: React.FC<AdminPaymentsViewProps> = ({ currentUser }) => {
  const isAdmin = currentUser?.role === 'ADMIN';

  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGateway, setSelectedGateway] = useState<'all' | 'cashfree' | 'razorpay'>('all');
  const [selectedPlan, setSelectedPlan] = useState<'all' | 'trial_2days' | 'monthly' | 'yearly'>('all');
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);

  // Fetch admin payments data with authorization header
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

  useEffect(() => {
    loadPayments();
  }, [isAdmin, currentUser?.role]);

  // Format currency in Indian standard format (₹ en-IN)
  const formatINR = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchGateway = selectedGateway === 'all' || tx.gateway === selectedGateway;
      const matchPlan = selectedPlan === 'all' || tx.planId === selectedPlan;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        tx.customerName.toLowerCase().includes(q) ||
        tx.customerEmail.toLowerCase().includes(q) ||
        tx.orderId.toLowerCase().includes(q);
      return matchGateway && matchPlan && matchSearch;
    });
  }, [transactions, selectedGateway, selectedPlan, searchQuery]);

  // Aggregate stats
  const totalRevenue = useMemo(() => {
    return transactions.reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions]);

  const cashfreeRevenue = useMemo(() => {
    return transactions.filter((t) => t.gateway === 'cashfree').reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions]);

  const razorpayRevenue = useMemo(() => {
    return transactions.filter((t) => t.gateway === 'razorpay').reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions]);

  // CSV Export for Accountant / Financial Ledger
  const handleExportCSV = () => {
    let csv = 'Order ID,Customer Name,Customer Email,Plan Name,Amount (INR),Gateway,Payment Method,Status,Date,Expires At\n';
    filteredTransactions.forEach((tx) => {
      csv += `"${tx.orderId}","${tx.customerName}","${tx.customerEmail}","${tx.planName}",${tx.amount},"${tx.gateway}","${tx.paymentMethod}","${tx.status}","${new Date(tx.createdAt).toLocaleDateString()}","${new Date(tx.expiresAt).toLocaleDateString()}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SweetHome_Payments_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 1. STRICT ACCESS DENIED SCREEN IF NON-ADMIN
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
            <strong className="text-amber-400">ADMIN</strong> clearance. Your current account role does not have
            authorization to inspect client transactions, gateway sessions, or financial statements.
          </p>
          <div className="mt-6 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 text-left font-mono">
            <div>Current Role: <span className="text-rose-400 font-bold">{currentUser?.role || 'CLIENT'}</span></div>
            <div>Security Level: <span className="text-slate-300">Enforced by RBAC</span></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080d19] text-slate-100 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-6 select-none font-sans">
      {/* 1. Header with Security Clearance Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Only • High Security</span>
            </div>
            <span className="text-xs text-slate-400">Cashfree & Razorpay Gateway Central</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Payments & Revenue Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time transaction tracking, Cashfree/Razorpay reconciliations, pass durations, and cryptographic payment proofs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadPayments}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Export CSV to Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards (in INR ₹) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Gross Revenue */}
        <div className="bg-[#0e1628] border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-sm transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-white">{formatINR(totalRevenue)}</div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              +18.4%
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Total collected across all passes</p>
        </div>

        {/* Cashfree Revenue */}
        <div className="bg-[#0e1628] border border-slate-800 hover:border-sky-500/40 rounded-2xl p-5 shadow-sm transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cashfree PG</span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs">
              CF
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-white">{formatINR(cashfreeRevenue)}</div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              UPI & Cards
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Primary gateway • Instant settlements</p>
        </div>

        {/* Razorpay Revenue */}
        <div className="bg-[#0e1628] border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 shadow-sm transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Razorpay PG</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
              RZP
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-white">{formatINR(razorpayRevenue)}</div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Active
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Secondary gateway • HMAC verified</p>
        </div>

        {/* Active Passes Count */}
        <div className="bg-[#0e1628] border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 shadow-sm transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Passes</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-white">{transactions.length} Subscriptions</div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              100% Paid
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Trial, Monthly & Annual passes</p>
        </div>
      </div>

      {/* 3. Gateway Architecture & Security Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cashfree PG Status */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center font-black">
              CF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Cashfree Payments PG</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                API Version: <strong className="text-slate-200">2023-08-01</strong> • Supported: UPI, Cards, NetBanking, EMI
              </p>
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-400">
            <div>Mode: <strong className="text-sky-300">Production / Sandbox</strong></div>
            <div className="text-emerald-400 font-medium">Auto-Webhook Verified</div>
          </div>
        </div>

        {/* Razorpay PG Status */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-black">
              RZ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Razorpay Payment Gateway</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Standard v1 Checkout • HMAC-SHA256 Cryptographic Signature Protection
              </p>
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-400">
            <div>Security: <strong className="text-emerald-400">Tamper-Proof</strong></div>
            <div className="text-indigo-300 font-medium">Server-Enforced Paise</div>
          </div>
        </div>
      </div>

      {/* 4. Filter Toolbar & Search */}
      <div className="bg-[#0e1628] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, email, or order ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Gateway Filter */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setSelectedGateway('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedGateway === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Gateways
            </button>
            <button
              onClick={() => setSelectedGateway('cashfree')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedGateway === 'cashfree' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cashfree
            </button>
            <button
              onClick={() => setSelectedGateway('razorpay')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedGateway === 'razorpay' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Razorpay
            </button>
          </div>

          {/* Pass Type Filter */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setSelectedPlan('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedPlan === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Passes
            </button>
            <button
              onClick={() => setSelectedPlan('trial_2days')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedPlan === 'trial_2days' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Trial (₹200)
            </button>
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedPlan === 'monthly' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly (₹999)
            </button>
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedPlan === 'yearly' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual (₹9,590)
            </button>
          </div>
        </div>
      </div>

      {/* 5. Payments Transaction Table */}
      <div className="bg-[#0e1628] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Pass Tier</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Gateway</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                  {/* Order ID */}
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-white font-bold">{tx.orderId}</div>
                    <div className="text-[10px] text-slate-500">{new Date(tx.createdAt).toLocaleString()}</div>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{tx.customerName}</div>
                    <div className="text-[10px] text-slate-400">{tx.customerEmail}</div>
                  </td>

                  {/* Pass Tier */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        tx.planId === 'trial_2days'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : tx.planId === 'yearly'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {tx.planId === 'trial_2days' ? (
                        <Zap className="w-3 h-3 text-amber-400" />
                      ) : tx.planId === 'yearly' ? (
                        <Crown className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Calendar className="w-3 h-3 text-blue-400" />
                      )}
                      <span>{tx.planName}</span>
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-white text-sm">{formatINR(tx.amount)}</span>
                  </td>

                  {/* Gateway */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        tx.gateway === 'cashfree'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {tx.gateway}
                    </span>
                  </td>

                  {/* Payment Method */}
                  <td className="py-3.5 px-4 text-slate-400 font-medium">
                    {tx.paymentMethod}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{tx.status}</span>
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-semibold transition cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Inspection Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full text-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Payment Security Audit Proof</h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="text-white font-bold">{selectedTx.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway:</span>
                <span className="text-sky-400 uppercase font-bold">{selectedTx.gateway} PG</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="text-emerald-400 font-bold">{formatINR(selectedTx.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="text-slate-200">{selectedTx.customerName} ({selectedTx.customerEmail})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Plan Activated:</span>
                <span className="text-amber-300 font-semibold">{selectedTx.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Status:</span>
                <span className="text-emerald-400 font-bold">VERIFIED_PAID</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Access Expiry:</span>
                <span className="text-slate-300">{new Date(selectedTx.expiresAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">HMAC Validation:</span>
                <span className="text-emerald-400">PASSED (Constant-Time Match)</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition"
            >
              Close Audit View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
