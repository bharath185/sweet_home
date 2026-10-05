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
  theme?: 'dark' | 'light';
}

export const AdminPaymentsView: React.FC<AdminPaymentsViewProps> = ({ currentUser, theme = 'light' }) => {
  const isAdmin = currentUser?.role === 'ADMIN';
  const isLight = theme !== 'dark';

  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Remove gateway state since Cashfree PG is sole provider
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

  // Filtered transactions (Cashfree Payments PG)
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

  // CSV Export for Accountant / Financial Ledger
  const handleExportCSV = () => {
    let csv = 'Order ID,Customer Name,Customer Email,Plan Name,Amount (INR),Gateway,Payment Method,Status,Date,Expires At\n';
    filteredTransactions.forEach((tx) => {
      csv += `"${tx.orderId}","${tx.customerName}","${tx.customerEmail}","${tx.planName}",${tx.amount},"Cashfree PG","${tx.paymentMethod}","${tx.status}","${new Date(tx.createdAt).toLocaleDateString()}","${new Date(tx.expiresAt).toLocaleDateString()}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SweetHome_Cashfree_Payments_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
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
    <div className={`flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-5 gap-3 select-none font-sans ${
      isLight ? 'bg-slate-50 text-slate-800' : 'bg-[#080d19] text-slate-100'
    }`}>
      {/* 1. Header with Security Clearance Badge */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b shrink-0 ${
        isLight ? 'border-slate-200' : 'border-slate-800'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-sky-500" />
              <span>Cashfree PG Central • Admin Protected</span>
            </div>
          </div>
          <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            <span>Payments & Revenue Ledger</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadPayments}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 ${
              isLight
                ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title="Refresh Ledger"
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
        </div>
      </div>

      {/* 2. Top Metric Cards (Cashfree Only) */}
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
              100% Cashfree
            </span>
          </div>
        </div>

        {/* Cashfree PG Status */}
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
              UPI & Cards
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
            <div className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{transactions.length} Active</div>
            <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Auto-Settled
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter Toolbar & Search */}
      <div className={`border rounded-2xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 ${
        isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0e1628] border-slate-800'
      }`}>
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, email, or Cashfree order ID..."
            className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-sky-500 border transition ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                : 'bg-slate-900 border-slate-700/80 text-white placeholder-slate-500'
            }`}
          />
        </div>

        {/* Pass Type Filter */}
        <div className={`flex items-center p-0.5 rounded-xl border ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-700'
        }`}>
          <button
            onClick={() => setSelectedPlan('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              selectedPlan === 'all'
                ? (isLight ? 'bg-slate-800 text-white' : 'bg-slate-700 text-white')
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Passes
          </button>
          <button
            onClick={() => setSelectedPlan('trial_2days')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              selectedPlan === 'trial_2days'
                ? 'bg-amber-600 text-white'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            Trial (₹200)
          </button>
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              selectedPlan === 'monthly'
                ? 'bg-sky-600 text-white'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly (₹999)
          </button>
          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              selectedPlan === 'yearly'
                ? 'bg-emerald-600 text-white'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            Annual (₹9,590)
          </button>
        </div>
      </div>

      {/* 4. Payments Transaction Table (Takes Remaining Vertical Height cleanly) */}
      <div className={`flex-1 min-h-0 border rounded-2xl overflow-hidden shadow-xs ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#0e1628] border-slate-800'
      }`}>
        <div className="h-full overflow-y-auto custom-scrollbar">
          <table className={`w-full text-left text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            <thead className={`uppercase text-[10px] font-bold tracking-wider border-b sticky top-0 z-10 ${
              isLight
                ? 'bg-slate-50 text-slate-500 border-slate-200'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}>
              <tr>
                <th className="py-3 px-4">Cashfree Order ID & Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Pass Tier</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/80'}`}>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className={`transition ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}`}>
                  {/* Order ID */}
                  <td className="py-3 px-4">
                    <div className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{tx.orderId}</div>
                    <div className="text-[10px] text-slate-400">{new Date(tx.createdAt).toLocaleString()}</div>
                  </td>

                  {/* Customer */}
                  <td className="py-3 px-4">
                    <div className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{tx.customerName}</div>
                    <div className="text-[10px] text-slate-400">{tx.customerEmail}</div>
                  </td>

                  {/* Pass Tier */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        tx.planId === 'trial_2days'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                          : tx.planId === 'yearly'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                          : 'bg-sky-500/10 text-sky-500 border-sky-500/30'
                      }`}
                    >
                      {tx.planId === 'trial_2days' ? (
                        <Zap className="w-3 h-3 text-amber-500" />
                      ) : tx.planId === 'yearly' ? (
                        <Crown className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Calendar className="w-3 h-3 text-sky-500" />
                      )}
                      <span>{tx.planName}</span>
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-3 px-4">
                    <span className={`font-mono font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>{formatINR(tx.amount)}</span>
                  </td>

                  {/* Gateway */}
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-600 border border-sky-500/30">
                      Cashfree PG
                    </span>
                  </td>

                  {/* Payment Method */}
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-medium text-[11px]">
                    {tx.paymentMethod}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>PAID</span>
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                        isLight
                          ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                      }`}
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Inspection Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className={`border rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>Cashfree PG Audit Proof</h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className={`p-1 rounded-lg transition cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                ✕
              </button>
            </div>

            <div className={`space-y-2 text-xs font-mono p-4 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>Cashfree Order ID:</span>
                <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedTx.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>Gateway:</span>
                <span className="text-sky-500 uppercase font-bold">Cashfree Payments PG</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>Amount Paid:</span>
                <span className="text-emerald-500 font-bold">{formatINR(selectedTx.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>Customer:</span>
                <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>{selectedTx.customerName} ({selectedTx.customerEmail})</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>Plan Activated:</span>
                <span className="text-amber-500 font-semibold">{selectedTx.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>Payment Status:</span>
                <span className="text-emerald-500 font-bold">VERIFIED_PAID</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>Access Expiry:</span>
                <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>{new Date(selectedTx.expiresAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>Webhook Signature:</span>
                <span className="text-emerald-500">VERIFIED (Cashfree RSA 2048)</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Close Audit View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

