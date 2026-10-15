'use client';

import React, { useState } from 'react';
import {
  X,
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Crown,
  Layers,
  Camera,
  FileSpreadsheet,
  Box,
  AlertCircle,
  Clock,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User } from '../types/plan';
import {
  PRICING_PLANS,
  PlanId,
  PlanDetail,
  saveSubscriptionLocally,
  hasActiveSubscription,
  getSubscriptionRemainingText,
  fetchActivePricingPlans,
} from '../services/subscriptionService';
import { initiateCashfreeCheckout } from '../services/cashfreeClient';
import { initiateSubscriptionCheckout as initiateRazorpayCheckout } from '../services/razorpayClient';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUserUpdated?: (updatedUser: User) => void;
  initialFeatureHighlight?: string;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
  initialFeatureHighlight,
}: UpgradeModalProps) {
  const [isLoadingPlan, setIsLoadingPlan] = useState<PlanId | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pricingPlans, setPricingPlans] = useState<Record<string, PlanDetail>>(PRICING_PLANS);
  const [gatewayEnv, setGatewayEnv] = useState<'PRODUCTION' | 'SANDBOX'>('PRODUCTION');
  const [activeGateway, setActiveGateway] = useState<'cashfree' | 'razorpay'>('cashfree');

  React.useEffect(() => {
    if (isOpen) {
      fetchActivePricingPlans().then((live) => {
        if (live) setPricingPlans({ ...live });
      });

      fetch('/api/payment-config')
        .then((r) => r.json())
        .then((data) => {
          if (data.plans) {
            setPricingPlans({ ...data.plans });
          }
          if (data.activeGateway) {
            setActiveGateway(data.activeGateway);
          }
          if (data.environment) {
            setGatewayEnv(data.environment);
          }
        })
        .catch(() => {
          fetch('/api/plans')
            .then((r) => r.json())
            .then((data) => {
              if (data.plans) setPricingPlans({ ...data.plans });
              if (data.gateway?.activeGateway) setActiveGateway(data.gateway.activeGateway);
              if (data.gateway?.environment) setGatewayEnv(data.gateway.environment);
            })
            .catch(() => {});
        });
    }
  }, [isOpen]);

  const [successInfo, setSuccessInfo] = useState<{
    tier: string;
    planName: string;
    durationDays: number;
    paymentId: string;
    gateway: 'cashfree' | 'razorpay';
    paymentMethod?: string;
  } | null>(null);

  if (!isOpen) return null;

  const isActive = hasActiveSubscription(currentUser);
  const remainingText = getSubscriptionRemainingText(currentUser);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // Ignored
    }
  };

  const handleCheckout = async (planId: PlanId) => {
    setErrorMessage(null);
    setIsLoadingPlan(planId);

    const planConfig = pricingPlans[planId] || PRICING_PLANS[planId];
    const durationDays = planConfig?.durationDays || (planId === 'trial_2days' ? 2 : planId === 'yearly' ? 365 : 30);

    const onPaymentSuccess = (result: {
      tier: 'TRIAL' | 'PRO' | 'ENTERPRISE';
      paymentId: string;
      subscriptionToken?: string;
      orderId?: string;
      durationDays?: number;
    }) => {
      setIsLoadingPlan(null);
      triggerConfetti();

      if (currentUser) {
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
        if (onUserUpdated) {
          onUserUpdated(updated);
        }
      }

      setSuccessInfo({
        tier: result.tier,
        planName: planConfig?.name || 'Studio Access Pass',
        durationDays: result.durationDays || durationDays,
        paymentId: result.paymentId,
        gateway: activeGateway,
      });
    };

    const onPaymentError = (errMsg: string) => {
      setIsLoadingPlan(null);
      setErrorMessage(errMsg);
    };

    const onPaymentDismiss = () => {
      setIsLoadingPlan(null);
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
      setIsLoadingPlan(null);
      setErrorMessage(err.message || `Failed to initialize ${activeGateway === 'razorpay' ? 'Razorpay' : 'Cashfree'} payment.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[94vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-slate-100 flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
          aria-label="Close pass modal"
        >
          <X className="w-5 h-5" />
        </button>

        {successInfo ? (
          /* SUCCESS STATE */
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center my-auto">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <Crown className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Pass Activated Successfully! 🎉
            </h2>
            <p className="mt-3 text-slate-300 max-w-md text-base leading-relaxed">
              Your <strong>{successInfo.planName}</strong> is now active for the next{' '}
              <strong className="text-emerald-400">{successInfo.durationDays} days</strong>. All studio features,
              multi-floor architecture, 4K raytracing, and BOM exports are 100% unlocked!
            </p>

            <div className="mt-6 p-4 bg-slate-800/80 border border-slate-700 rounded-2xl text-left text-xs font-mono text-slate-300 space-y-1.5 w-full max-w-md">
              <div className="flex justify-between">
                <span className="text-slate-400">Payment ID:</span>
                <span className="text-emerald-400 font-semibold">{successInfo.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gateway:</span>
                <span className="text-sky-400 font-semibold uppercase">{successInfo.gateway} Payments</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pass Duration:</span>
                <span className="text-blue-400 font-semibold">{successInfo.durationDays} Days Full Access</span>
              </div>
              {successInfo.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Method:</span>
                  <span className="text-amber-400 font-semibold">{successInfo.paymentMethod}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Currency:</span>
                <span>INR (₹)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Security:</span>
                <span>HMAC-SHA256 Cryptographically Verified</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSuccessInfo(null);
                onClose();
              }}
              className="mt-8 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              Continue Designing in 3D Studio
            </button>
          </div>
        ) : (
          /* PASS PRICING VIEW */
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                SweetHome 3D Studio Access
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Select Your Access Pass
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-300">
                {initialFeatureHighlight
                  ? `To access ${initialFeatureHighlight}, activate a flexible pass below.`
                  : 'All passes include 100% full access to every tool and capability. No locked features.'}
              </p>

              {/* Universal Inclusion Banner */}
              <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Multi-Floor CAD • 4K Raytracing • BOM Quotation Export • Custom 3D Models in all passes</span>
              </div>

              {isActive && (
                <div className="mt-3 text-xs text-blue-300 font-medium">
                  Current Status: <span className="font-bold text-white">{remainingText}</span>
                </div>
              )}
            </div>

            {/* Exclusive Payment Gateway Badge: Cashfree */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="px-4 py-2 rounded-2xl bg-[#0f172a] border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-2.5 shadow-md shadow-purple-500/10">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
                <span>Cashfree Payments</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border ${
                  gatewayEnv === 'PRODUCTION'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {gatewayEnv === 'PRODUCTION' ? 'Live Production' : 'Developer Sandbox'}
                </span>
                <span className="text-[11px] text-slate-400">
                  • Instant UPI, Cards & NetBanking
                </span>
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-300 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Dynamic Pricing Cards Grid (All amounts synchronized with Admin Config) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* CARD 1: TRIAL PASS */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-600 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      {pricingPlans.trial_2days?.name || '2-Day Trial Pass'}
                    </h3>
                    <span className="px-2.5 py-0.5 text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-md">
                      {pricingPlans.trial_2days?.badge || 'Quick Test'}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-white">
                        ₹{pricingPlans.trial_2days?.priceINR?.toLocaleString('en-IN') ?? 2}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {pricingPlans.trial_2days?.periodLabel || '/ 2 days (48 Hours)'}
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-400/90 mt-1 font-medium">
                      One-time payment • No auto-recurring charges
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-6">
                    {pricingPlans.trial_2days?.description || 'Perfect for a quick walkthrough, exploring all features, or rapid project creation.'}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span><strong>{pricingPlans.trial_2days?.durationDays || 2} Days Full Access</strong> to all features</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Multi-Floor Architecture Drafting</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>4K Ultra Raytracing Snapshots</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>BOM Quotation & Cost Export in INR (₹)</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Custom 3D Models & Part Color Finishing</span>
                    </div>
                  </div>
                </div>

                <button
                  disabled={isLoadingPlan !== null}
                  onClick={() => handleCheckout('trial_2days')}
                  className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-sm transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoadingPlan === 'trial_2days' ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connecting to {activeGateway === 'razorpay' ? 'Razorpay' : 'Cashfree'}...
                    </span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-400 fill-current" />
                      Pay ₹{pricingPlans.trial_2days?.priceINR?.toLocaleString('en-IN') ?? 2} with {activeGateway === 'razorpay' ? 'Razorpay' : 'Cashfree'}
                    </>
                  )}
                </button>
              </div>

              {/* CARD 2: MONTHLY PRO PASS */}
              <div className="relative bg-gradient-to-b from-blue-900/40 via-slate-800/90 to-slate-800/95 border-2 border-blue-500 rounded-2xl p-6 flex flex-col justify-between shadow-xl shadow-blue-500/15 hover:border-blue-400 transition-all scale-[1.02]">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  {pricingPlans.monthly?.badge || 'Most Popular'}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4 mt-1">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      {pricingPlans.monthly?.name || 'Monthly Pass'}
                    </h3>
                    <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-md">
                      {pricingPlans.monthly?.durationDays || 30} Days
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-white">
                        ₹{pricingPlans.monthly?.priceINR?.toLocaleString('en-IN') ?? 3}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {pricingPlans.monthly?.periodLabel || '/ month (30 Days)'}
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-400 mt-1 font-medium">
                      All inclusive • UPI, Cards, NetBanking
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-6">
                    {pricingPlans.monthly?.description || 'Full architectural power for independent designers, interior experts, and builders.'}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2.5 text-xs text-slate-100 font-medium">
                      <Layers className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span><strong>{pricingPlans.monthly?.durationDays || 30} Days Full Access</strong> to all features</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Unlimited Multi-Floor Architecture Drafting</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Camera className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>4K Ultra Raytracing & Master Snapshot Engine</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <FileSpreadsheet className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>BOM Excel & CSV Export with client quotes</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Box className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>Custom 3D Model Uploads (.OBJ / .GLTF)</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>Cloud Project Save & Sync Across Devices</span>
                    </div>
                  </div>
                </div>

                <button
                  disabled={isLoadingPlan !== null}
                  onClick={() => handleCheckout('monthly')}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoadingPlan === 'monthly' ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connecting to {activeGateway === 'razorpay' ? 'Razorpay' : 'Cashfree'}...
                    </span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      Pay ₹{pricingPlans.monthly?.priceINR?.toLocaleString('en-IN') ?? 3} with {activeGateway === 'razorpay' ? 'Razorpay' : 'Cashfree'}
                    </>
                  )}
                </button>
              </div>

              {/* CARD 3: ANNUAL PRO PASS */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-600 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Crown className="w-4 h-4 text-emerald-400" />
                      {pricingPlans.yearly?.name || 'Annual Pass'}
                    </h3>
                    <span className="px-2.5 py-0.5 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-md">
                      {pricingPlans.yearly?.badge || 'Save 20%'}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-white">
                        ₹{pricingPlans.yearly?.priceINR?.toLocaleString('en-IN') ?? 4}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {pricingPlans.yearly?.periodLabel || '/ year (365 Days)'}
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
                      Best value • Continuous 365-day access
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-6">
                    {pricingPlans.yearly?.description || 'Best value for design practices and full-time professionals needing 365 days of continuous access.'}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span><strong>{pricingPlans.yearly?.durationDays || 365} Days</strong> Unrestricted Access</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Priority 4K Cloud Raytrace Queuing</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Unlimited Multi-Floor Blueprints & Projects</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Full Commercial Client Presentation License</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Dedicated Technical & Email Support</span>
                    </div>
                  </div>
                </div>

                <button
                  disabled={isLoadingPlan !== null}
                  onClick={() => handleCheckout('yearly')}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoadingPlan === 'yearly' ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connecting to {activeGateway === 'razorpay' ? 'Razorpay' : 'Cashfree'}...
                    </span>
                  ) : (
                    <>
                      <Crown className="w-4 h-4" />
                      Pay ₹{pricingPlans.yearly?.priceINR?.toLocaleString('en-IN') ?? 4} with {activeGateway === 'razorpay' ? 'Razorpay' : 'Cashfree'}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Payment Trust Footer */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bank-Grade 256-Bit SSL Encryption • HMAC-SHA256 Cryptographic Verification</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  UPI (GPay, PhonePe, Paytm), Cards, NetBanking
                </span>
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  Powered by <span className="text-sky-400 font-bold">{activeGateway === 'razorpay' ? 'Razorpay Secure' : 'Cashfree Payments'}</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
