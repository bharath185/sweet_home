'use client';

import React, { useState, useEffect } from 'react';
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
import { PRICING_PLANS, PlanId, PlanDetail, saveSubscriptionLocally, fetchActivePricingPlans } from '../services/subscriptionService';
import { initiateCashfreeCheckout } from '../services/cashfreeClient';
import { initiateSubscriptionCheckout as initiateRazorpayCheckout } from '../services/razorpayClient';
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
  const [pricingPlans, setPricingPlans] = useState<Record<string, PlanDetail>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('sweethome_cached_plans');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return PRICING_PLANS;
  });
  const [activeGateway, setActiveGateway] = useState<'cashfree' | 'razorpay'>('cashfree');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activePolicy, setActivePolicy] = useState<'terms' | 'privacy' | 'refund' | 'contact' | null>(null);

  useEffect(() => {
    fetchActivePricingPlans().then((live) => {
      if (live) {
        setPricingPlans({ ...live });
        try {
          localStorage.setItem('sweethome_cached_plans', JSON.stringify(live));
        } catch {}
      }
    });

    fetch('/api/payment-config')
      .then((r) => r.json())
      .then((data) => {
        if (data.plans) {
          setPricingPlans({ ...data.plans });
          try {
            localStorage.setItem('sweethome_cached_plans', JSON.stringify(data.plans));
          } catch {}
        }
        if (data.activeGateway) {
          setActiveGateway(data.activeGateway);
        }
      })
      .catch(() => {
        fetch('/api/plans')
          .then((r) => r.json())
          .then((data) => {
            if (data.plans) setPricingPlans({ ...data.plans });
            if (data.gateway?.activeGateway) setActiveGateway(data.gateway.activeGateway);
          })
          .catch(() => {});
      });
  }, []);

  const triggerConfetti = () => {
    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch {}
  };

  const handlePay = async (planId: PlanId) => {
    setErrorMessage(null);
    setIsProcessing(true);

    const planConfig = pricingPlans[planId] || PRICING_PLANS[planId];
    const durationDays = planConfig?.durationDays || (planId === 'trial_2days' ? 2 : planId === 'yearly' ? 365 : 30);

    const onPaymentSuccess = (result: {
      tier: 'TRIAL' | 'PRO' | 'ENTERPRISE';
      paymentId: string;
      subscriptionToken?: string;
      orderId?: string;
      durationDays?: number;
    }) => {
      setIsProcessing(false);
      triggerConfetti();

      const updated = saveSubscriptionLocally(
        currentUser,
        result.tier,
        result.paymentId,
        result.subscriptionToken || '',
        result.orderId,
        result.durationDays || durationDays,
        planId as any,
        activeGateway
      );
      onUserUpdated(updated);
    };

    const onPaymentError = (errMsg: string) => {
      setIsProcessing(false);
      setErrorMessage(errMsg);
    };

    const onPaymentDismiss = () => {
      setIsProcessing(false);
    };

    try {
      if (activeGateway === 'razorpay') {
        await initiateRazorpayCheckout({
          planId,
          user: currentUser,
          onSuccess: onPaymentSuccess,
          onError: onPaymentError,
          onDismiss: onPaymentDismiss,
        });
      } else {
        await initiateCashfreeCheckout({
          planId,
          user: currentUser,
          redirectTarget: '_modal',
          onSuccess: onPaymentSuccess,
          onError: onPaymentError,
          onDismiss: onPaymentDismiss,
        });
      }
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || `Error launching ${activeGateway === 'razorpay' ? 'Razorpay' : 'Cashfree'} checkout.`);
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-rose-500/20 text-indigo-300 hover:text-rose-300 text-xs font-semibold transition-colors border border-indigo-500/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out / Switch Account</span>
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
              <h3 className="font-semibold text-base text-orange-200">
                {currentUser.hasCompletedTrial || currentUser.isFreeTrial || currentUser.plan === 'trial_48h'
                  ? '48-Hour Free Trial Completed'
                  : 'Subscription Pass Expired'}
              </h3>
              <p className="text-sm text-orange-300/80 mt-1">
                {currentUser.hasCompletedTrial || currentUser.isFreeTrial || currentUser.plan === 'trial_48h'
                  ? 'Your complimentary 48-hour free trial has ended. Select an access pass below to continue drafting multi-floor blueprints, 3D walkthroughs, and project exports.'
                  : `Your pass expired ${formattedExpiry ? `on ${formattedExpiry}` : 'recently'}. Please renew your pass to regain access to multi-floor drafting, raytrace renders, and blueprints.`}
              </p>
              <div className="mt-3">
                <button
                  onClick={() => handlePay(selectedPlan)}
                  className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Upgrade to Studio Pass
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
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{pricingPlans.trial_2days?.badge || 'Quick Test'}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {pricingPlans.trial_2days?.durationDays ? `${pricingPlans.trial_2days.durationDays} Days` : '48 Hours'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{pricingPlans.trial_2days?.name || '2-Day Trial'}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">₹{pricingPlans.trial_2days?.priceINR?.toLocaleString('en-IN') ?? 2}</span>
                <span className="text-xs text-slate-400">{pricingPlans.trial_2days?.periodLabel || '/ 48 hrs'}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {pricingPlans.trial_2days?.description || 'Unrestricted 100% studio access for 48 hours. Test raytracing & exports.'}
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
              {pricingPlans.monthly?.badge || 'Most Popular'}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Professional</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                  {pricingPlans.monthly?.durationDays ? `${pricingPlans.monthly.durationDays} Days` : '30 Days'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                {pricingPlans.monthly?.name || 'Monthly Pass'}
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">₹{pricingPlans.monthly?.priceINR?.toLocaleString('en-IN') ?? 3}</span>
                <span className="text-xs text-slate-400">{pricingPlans.monthly?.periodLabel || '/ month'}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {pricingPlans.monthly?.description || 'Full uninterrupted access for interior designers and residential architects.'}
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
              {pricingPlans.yearly?.badge || 'Save 20%'}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Best Value</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  {pricingPlans.yearly?.durationDays ? `${pricingPlans.yearly.durationDays} Days` : '365 Days'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                {pricingPlans.yearly?.name || 'Annual Pass'}
                <Crown className="w-4 h-4 text-yellow-400" />
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">₹{pricingPlans.yearly?.priceINR?.toLocaleString('en-IN') ?? 4}</span>
                <span className="text-xs text-slate-400">{pricingPlans.yearly?.periodLabel || '/ year'}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {pricingPlans.yearly?.description || '365 days of full unlimited studio access.'}
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
                <span>Connecting to {activeGateway === 'razorpay' ? 'Razorpay' : 'Cashfree'}...</span>
              </>
            ) : (
              <>
                <span>
                  {status === 'expired'
                    ? 'Renew Pass'
                    : status === 'failed'
                    ? 'Retry Checkout'
                    : `Subscribe to ${pricingPlans[selectedPlan]?.name || PRICING_PLANS[selectedPlan]?.name || 'Studio Pass'}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Secured by {activeGateway === 'razorpay' ? 'Razorpay' : 'Cashfree'}
            </span>
            <span>•</span>
            <span>UPI, Cards & NetBanking</span>
            <span>•</span>
            <span>Instant Activation</span>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[10px] text-slate-500">
            <button
              type="button"
              onClick={() => setActivePolicy('terms')}
              className="hover:text-indigo-400 transition underline underline-offset-2"
            >
              Terms & Conditions
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActivePolicy('privacy')}
              className="hover:text-indigo-400 transition underline underline-offset-2"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActivePolicy('refund')}
              className="hover:text-indigo-400 transition underline underline-offset-2"
            >
              Refund Policy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActivePolicy('contact')}
              className="hover:text-indigo-400 transition underline underline-offset-2"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Policy Modal */}
      {activePolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-slate-200 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setActivePolicy(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            {activePolicy === 'terms' && (
              <div>
                <h3 className="text-base font-bold text-white mb-2">Terms & Conditions</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-2">
                  Welcome to SweetHome 3D Studio (prigenix.com). By purchasing an access pass (Trial, Monthly, or Annual), you receive a personal, non-exclusive license to utilize our cloud-based 3D architectural blueprinting, interior layout planner, and high-resolution rendering tools during your subscription period.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All floor plans and exports generated are owned by you. Subscriptions do not renew automatically; your pass simply expires at the end of the selected duration unless manually renewed.
                </p>
              </div>
            )}

            {activePolicy === 'privacy' && (
              <div>
                <h3 className="text-base font-bold text-white mb-2">Privacy Policy</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-2">
                  We respect your data privacy. SweetHome 3D Studio collects only your name and email address for account authentication and licensing pass verification.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Payment processing is securely handled end-to-end by Cashfree Payments. We do not store your credit/debit card numbers or UPI MPINs on our servers.
                </p>
              </div>
            )}

            {activePolicy === 'refund' && (
              <div>
                <h3 className="text-base font-bold text-white mb-2">Refund & Cancellation Policy</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-2">
                  We want you to be completely satisfied with SweetHome 3D Studio. If you experience technical errors or the software does not work as advertised within 48 hours of purchase, you may request a full refund.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  To request a refund, please email our support team with your Cashfree Order ID. Refunds will be processed back to the original payment source within 5-7 business days.
                </p>
              </div>
            )}

            {activePolicy === 'contact' && (
              <div>
                <h3 className="text-base font-bold text-white mb-2">Contact Us</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-2">
                  Have questions about your pass, billing, or technical features? Reach out directly:
                </p>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
                  <p><strong>Service:</strong> SweetHome 3D Studio Architecture & Design</p>
                  <p><strong>Website:</strong> https://3dstudio.prigenix.com</p>
                  <p><strong>Support Email:</strong> support@prigenix.com / bharath@prigenix.com</p>
                  <p><strong>Response Time:</strong> Within 24 Hours</p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setActivePolicy(null)}
              className="mt-5 w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
