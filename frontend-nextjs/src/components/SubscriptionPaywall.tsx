'use client';

import React, { useState } from 'react';
import {
  Lock,
  ShieldAlert,
  Clock,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Zap,
  Crown,
  LogOut,
  ArrowRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { User, PaymentStatus } from '../types/plan';
import { PRICING_PLANS, PlanId, saveSubscriptionLocally } from '../services/subscriptionService';
import { initiateCashfreeCheckout } from '../services/cashfreeClient';
import confetti from 'canvas-confetti';

interface SubscriptionPaywallProps {
  currentUser: User;
  onUserUpdated: (updatedUser: User) => void;
  onLogout: () => void;
  onRefreshStatus: () => Promise<void>;
  status?: PaymentStatus;
  isRefreshing?: boolean;
}

export const SubscriptionPaywall: React.FC<SubscriptionPaywallProps> = ({
  currentUser,
  onUserUpdated,
  onLogout,
  onRefreshStatus,
  status = currentUser.payment_status || 'unpaid',
  isRefreshing = false,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('monthly');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const triggerConfetti = () => {
    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch {}
  };

  const handlePay = async (planId: PlanId) => {
    setErrorMessage(null);
    setIsProcessing(true);

    const planConfig = PRICING_PLANS[planId];
    const durationDays = planConfig?.durationDays || (planId === 'trial_2days' ? 2 : planId === 'yearly' ? 365 : 30);

    try {
      await initiateCashfreeCheckout({
        planId,
        user: currentUser,
        redirectTarget: '_modal',
        onSuccess: (result) => {
          setIsProcessing(false);
          triggerConfetti();

          const updated = saveSubscriptionLocally(
            currentUser,
            result.tier,
            result.paymentId,
            result.subscriptionToken,
            result.orderId,
            result.durationDays || durationDays,
            planId as any,
            'cashfree'
          );
          onUserUpdated(updated);
        },
        onError: (errMsg) => {
          setIsProcessing(false);
          setErrorMessage(errMsg);
        },
        onDismiss: () => {
          setIsProcessing(false);
        },
      });
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'Error launching Cashfree checkout.');
    }
  };

  const formattedExpiry = currentUser.expires_at || currentUser.subscriptionExpiresAt
    ? new Date(currentUser.expires_at || currentUser.subscriptionExpiresAt!).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080d19] p-4 overflow-y-auto">
      <div className="w-full max-w-4xl my-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-10 flex flex-col items-center">
        {/* Top Header & User Identity */}
        <div className="w-full flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">SweetHome 3D Studio</h2>
              <p className="text-xs text-slate-400">
                Logged in as <span className="text-indigo-400 font-medium">{currentUser.name}</span> ({currentUser.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshStatus}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors border border-slate-700"
              title="Refresh status from backend"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              <span>{isRefreshing ? 'Checking...' : 'Refresh'}</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/10 hover:text-rose-400 text-xs font-medium text-slate-400 transition-colors border border-slate-700/60"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* State Banner */}
        {status === 'pending' && (
          <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 mb-8 flex items-start gap-4 text-amber-300">
            <Clock className="w-6 h-6 shrink-0 mt-0.5 text-amber-400 animate-pulse" />
            <div className="flex-1">
              <h3 className="font-semibold text-base text-amber-200">Payment Pending Confirmation</h3>
              <p className="text-sm text-amber-300/80 mt-1">
                Your Cashfree payment is currently being confirmed by the banking network. Access will unlock automatically once confirmed.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={onRefreshStatus}
                  className="px-3.5 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-400 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Check Status Now
                </button>
                <button
                  onClick={() => handlePay(selectedPlan)}
                  className="px-3.5 py-1.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs hover:bg-slate-700 transition-colors"
                >
                  Try Different Method
                </button>
              </div>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="w-full bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 mb-8 flex items-start gap-4 text-rose-300">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1">
              <h3 className="font-semibold text-base text-rose-200">Payment Transaction Failed</h3>
              <p className="text-sm text-rose-300/80 mt-1">
                Your last payment attempt was not completed or was cancelled. Please retry to unlock the studio.
              </p>
              <div className="mt-3">
                <button
                  onClick={() => handlePay(selectedPlan)}
                  className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-500/20"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Retry Payment Now
                </button>
              </div>
            </div>
          </div>
        )}

        {status === 'expired' && (
          <div className="w-full bg-orange-500/10 border border-orange-500/30 rounded-2xl p-5 mb-8 flex items-start gap-4 text-orange-300">
            <Clock className="w-6 h-6 shrink-0 mt-0.5 text-orange-400" />
            <div className="flex-1">
              <h3 className="font-semibold text-base text-orange-200">Subscription Pass Expired</h3>
              <p className="text-sm text-orange-300/80 mt-1">
                Your pass expired {formattedExpiry ? `on ${formattedExpiry}` : 'recently'}. Please renew your pass to regain access to multi-floor drafting, raytrace renders, and blueprints.
              </p>
              <div className="mt-3">
                <button
                  onClick={() => handlePay(selectedPlan)}
                  className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Renew Pass Now
                </button>
              </div>
            </div>
          </div>
        )}

        {status === 'unpaid' && (
          <div className="text-center max-w-xl mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Lock className="w-3.5 h-3.5" />
              Subscription Required
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Unlock Full Access to SweetHome 3D Studio
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Choose an access pass to start creating multi-floor blueprints, 4K raytrace renders, and custom architectural layouts.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="w-full max-w-md bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 mb-6 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Pricing Cards Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8">
          {/* 1. Trial Pass */}
          <div
            onClick={() => setSelectedPlan('trial_2days')}
            className={`cursor-pointer relative rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
              selectedPlan === 'trial_2days'
                ? 'bg-slate-800/90 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Test</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  48 Hours
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">2-Day Trial</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">₹200</span>
                <span className="text-xs text-slate-400">/ 48 hrs</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Unrestricted 100% studio access for 48 hours. Test raytracing & exports.
              </p>
            </div>
            <ul className="mt-4 space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Multi-Floor Blueprints</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>4K Raytrace Renders</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>BOM Cost Estimations</span>
              </li>
            </ul>
          </div>

          {/* 2. Monthly Pro */}
          <div
            onClick={() => setSelectedPlan('monthly')}
            className={`cursor-pointer relative rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
              selectedPlan === 'monthly'
                ? 'bg-slate-800/90 border-indigo-500 shadow-xl shadow-indigo-500/20 ring-2 ring-indigo-500'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-[10px] font-extrabold text-white uppercase tracking-wider shadow-md">
              Most Popular
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Professional</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                  30 Days
                </span>
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                Monthly Pass
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">₹999</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Full uninterrupted access for interior designers and residential architects.
              </p>
            </div>
            <ul className="mt-4 space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Unlimited Cloud Projects</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Custom 3D Model Uploads</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Client Presentation View</span>
              </li>
            </ul>
          </div>

          {/* 3. Yearly Pass */}
          <div
            onClick={() => setSelectedPlan('yearly')}
            className={`cursor-pointer relative rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
              selectedPlan === 'yearly'
                ? 'bg-slate-800/90 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-[10px] font-extrabold text-slate-950 uppercase tracking-wider shadow-md">
              Save 20%
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Best Value</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  365 Days
                </span>
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                Annual Pass
                <Crown className="w-4 h-4 text-yellow-400" />
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">₹9,590</span>
                <span className="text-xs text-slate-400">/ year</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Equivalent to just ₹799/mo. 365 days of full unlimited studio access.
              </p>
            </div>
            <ul className="mt-4 space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>All Pro Features Included</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Priority Cloud Rendering</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Dedicated Technical Support</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full max-w-md flex flex-col items-center">
          <button
            onClick={() => handlePay(selectedPlan)}
            disabled={isProcessing}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-base shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Connecting to Cashfree...</span>
              </>
            ) : (
              <>
                <span>
                  {status === 'expired'
                    ? 'Renew Pass'
                    : status === 'failed'
                    ? 'Retry Checkout'
                    : `Subscribe to ${PRICING_PLANS[selectedPlan]?.name || 'Studio Pass'}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Secured by Cashfree
            </span>
            <span>•</span>
            <span>UPI, Cards & NetBanking</span>
            <span>•</span>
            <span>Instant Activation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
