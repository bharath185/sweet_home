'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  CheckCircle2,
  Clock,
  Calendar,
  Download,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Crown,
  Receipt,
  AlertCircle,
  FileText,
  Printer,
} from 'lucide-react';
import { User } from '../types/plan';

export interface UserOrder {
  id: string;
  orderId: string;
  paymentId?: string;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  planId: string;
  planName: string;
  amount: number;
  gateway: 'cashfree' | 'razorpay' | string;
  status: 'PAID' | 'REFUNDED' | 'FAILED' | 'PENDING' | string;
  paymentMethod?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface ActiveSubscriptionInfo {
  plan: string;
  planName: string;
  planDuration?: string;
  status: string;
  amount: number;
  currency: string;
  gateway: string;
  orderId: string;
  paymentId?: string;
  paidAt: string;
  expiresAt?: string;
  isFreeTrial?: boolean;
  isActive?: boolean;
}

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  theme?: 'dark' | 'light';
  onUpgrade?: () => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  theme = 'dark',
  onUpgrade,
}) => {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [activeSub, setActiveSub] = useState<ActiveSubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<UserOrder | null>(null);

  const isDark = theme === 'dark';

  const fetchOrders = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const orderIdParam = currentUser.cashfree_order_id || (currentUser as any).razorpayOrderId || '';
      const planParam = currentUser.plan || '';
      const roleParam = currentUser.role || '';
      const nameParam = currentUser.name || '';
      const res = await fetch(
        `/api/user/orders?userId=${encodeURIComponent(currentUser.id)}&email=${encodeURIComponent(currentUser.email || '')}&orderId=${encodeURIComponent(orderIdParam)}&plan=${encodeURIComponent(planParam)}&role=${encodeURIComponent(roleParam)}&name=${encodeURIComponent(nameParam)}`
      );
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        setActiveSub(data.activeSubscription || null);
      }
    } catch (err) {
      console.warn('Failed to load user orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchOrders();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
      setCopiedOrderId(id);
      setTimeout(() => setCopiedOrderId(null), 2000);
    }
  };

  // Format expiration cleanly: Date + exact time + relative remaining
  const formatExpiration = (expiresAtStr?: string) => {
    if (!expiresAtStr) return null;
    try {
      const expDate = new Date(expiresAtStr);
      const now = new Date();
      const diffMs = expDate.getTime() - now.getTime();

      const dateFormatted = expDate.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timeFormatted = expDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      if (diffMs <= 0) {
        return { text: `Expired on ${dateFormatted}`, isExpired: true };
      }

      const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
      const minsLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      const remainingText =
        hoursLeft > 24
          ? `${Math.ceil(hoursLeft / 24)} days remaining`
          : hoursLeft > 0
          ? `${hoursLeft}h ${minsLeft}m remaining`
          : `${minsLeft} mins remaining`;

      return {
        text: `Valid until ${dateFormatted} at ${timeFormatted} (${remainingText})`,
        isExpired: false,
      };
    } catch {
      return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col border overflow-hidden transition-all ${
          isDark
            ? 'bg-[#0f172a] border-slate-800 text-slate-100 shadow-black/80'
            : 'bg-white border-slate-200 text-slate-800 shadow-slate-300/60'
        }`}
      >
        {/* Top Accent Gradient Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-sky-500 to-indigo-600 shadow-md shadow-sky-500/20" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-inherit">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Orders & Purchase History
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Verified
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {currentUser?.email || 'Logged in user'} • Active Pass & GST Invoices
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchOrders}
              disabled={isLoading}
              title="Refresh ledger"
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
          {/* Active Subscription Status Banner - EASY TO UNDERSTAND & CLEAR */}
          {activeSub && (
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isDark
                  ? 'bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border-indigo-500/30 shadow-md'
                  : 'bg-gradient-to-br from-indigo-50/90 via-white to-sky-50/90 border-indigo-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-400">
                        Current Active Pass
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{activeSub.status}</span>
                      </span>
                      {activeSub.planDuration && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          {activeSub.planDuration}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold mt-1 text-slate-900 dark:text-white">
                      {activeSub.planName}
                    </h3>
                    <p className={`text-xs mt-0.5 flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <span>Order ID:</span>
                      <code className="font-mono text-indigo-400 text-[11px] font-bold">{activeSub.orderId}</code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(activeSub.orderId, 'active_sub')}
                        className="text-slate-400 hover:text-white cursor-pointer"
                        title="Copy Order ID"
                      >
                        {copiedOrderId === 'active_sub' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </p>
                  </div>
                </div>

                <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-700/50">
                  <div className="text-left sm:text-right">
                    <span className="text-xl sm:text-2xl font-black text-emerald-400">
                      {activeSub.amount > 0 ? `₹${activeSub.amount}` : 'Free Access'}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      {activeSub.amount > 0 ? 'Full Studio Access' : 'Complimentary Pass'}
                    </span>
                  </div>

                  {activeSub.expiresAt && (() => {
                    const expInfo = formatExpiration(activeSub.expiresAt);
                    if (!expInfo) return null;
                    return (
                      <span className={`text-[11px] mt-1.5 flex items-center gap-1 font-medium ${
                        expInfo.isExpired ? 'text-rose-400' : 'text-sky-300 dark:text-sky-400'
                      }`}>
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{expInfo.text}</span>
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Orders Table & History List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>Verified Transaction Ledger ({orders.length})</span>
              </h3>
              {onUpgrade && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onUpgrade();
                  }}
                  className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Renew / Upgrade Pass</span>
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                <span className="text-xs text-slate-400">Loading order history from secure ledger...</span>
              </div>
            ) : orders.length === 0 ? (
              <div
                className={`py-10 px-4 rounded-2xl border text-center space-y-2 ${
                  isDark ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold">No Past Payment Orders Found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  You are currently using DecoFrog 3D Studio. When you purchase a 24-Hour Pass or Pro Plan, your verified invoice and order receipt will be recorded here.
                </p>
                {onUpgrade && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onUpgrade();
                    }}
                    className="mt-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-300" />
                    <span>Get 24-Hour Pass (₹51)</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {orders.map((ord) => {
                  const isCopied = copiedOrderId === ord.orderId;
                  const isPaid = ord.status === 'PAID';

                  return (
                    <div
                      key={ord.orderId || ord.id}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isDark
                          ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isPaid
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {isPaid ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              {ord.planName}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                isPaid
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 flex-wrap">
                            <span className="flex items-center gap-1 font-mono text-[10.5px]">
                              <span>{ord.orderId}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(ord.orderId, ord.orderId)}
                                title="Copy Order ID"
                                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                              >
                                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {new Date(ord.createdAt).toLocaleDateString([], {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            <span>•</span>
                            <span className="capitalize text-slate-400 font-medium">
                              {ord.gateway || 'Online'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80">
                        <div className="text-left sm:text-right">
                          <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                            {ord.amount > 0 ? `₹${ord.amount}` : 'Free Trial'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {ord.paymentMethod || (ord.amount > 0 ? 'UPI / Card / NetBanking' : 'Free Trial Access')}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(ord)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                            isDark
                              ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                              : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <Receipt className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-inherit flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>256-Bit SSL Encrypted • GST Compliant Invoices</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-white'
                : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            Close
          </button>
        </div>

        {/* Child Receipt Invoice Modal - CLEAR, DETAILED TAX INVOICE */}
        {selectedReceipt && (
          <div className="absolute inset-0 z-60 bg-black/85 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in">
            <div
              className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl relative space-y-4 ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 border-b border-inherit pb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Official Tax Invoice & Receipt
                  </h4>
                  <p className="text-[11px] text-slate-400">DecoFrog 3D Architectural Studio</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Order Reference:</span>
                  <span className="font-mono text-indigo-400 font-semibold">{selectedReceipt.orderId}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Date & Time:</span>
                  <span>
                    {new Date(selectedReceipt.createdAt).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Customer Email:</span>
                  <span>{selectedReceipt.customerEmail || currentUser?.email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Plan Description:</span>
                  <span className="font-bold">{selectedReceipt.planName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Payment Gateway:</span>
                  <span className="uppercase font-semibold">{selectedReceipt.gateway || 'Online'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Transaction Status:</span>
                  <span className="text-emerald-400 font-bold uppercase">{selectedReceipt.status}</span>
                </div>

                {/* Pricing Breakdown */}
                {selectedReceipt.amount > 0 ? (
                  <>
                    <div className="flex justify-between py-1 text-slate-400">
                      <span>Base Plan Fee:</span>
                      <span>₹{(selectedReceipt.amount / 1.18).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-slate-400 border-b border-slate-800/60">
                      <span>GST (18% Included):</span>
                      <span>₹{(selectedReceipt.amount - selectedReceipt.amount / 1.18).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 text-base font-extrabold border-t border-slate-700">
                      <span>Total Amount Paid:</span>
                      <span className="text-emerald-400">₹{selectedReceipt.amount}.00</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between py-2 text-base font-extrabold border-t border-slate-700">
                    <span>Total Amount:</span>
                    <span className="text-emerald-400">₹0 (Free Trial Pass)</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') window.print();
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-slate-300"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
