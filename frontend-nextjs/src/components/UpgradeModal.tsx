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
  saveSubscriptionLocally,
  hasActiveSubscription,
  getSubscriptionRemainingText,
} from '../services/subscriptionService';
import { initiateSubscriptionCheckout } from '../services/razorpayClient';
import { initiateCashfreeCheckout } from '../services/cashfreeClient';

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
  const [selectedGateway, setSelectedGateway] = useState<'cashfree' | 'razorpay'>('cashfree');
  const [isLoadingPlan, setIsLoadingPlan] = useState<PlanId | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

    const planConfig = PRICING_PLANS[planId];
    const durationDays = planConfig?.durationDays || (planId === 'trial_2days' ? 2 : planId === 'yearly' ? 365 : 30);

    const onSuccess = (result: any) => {
      setIsLoadingPlan(null);
      triggerConfetti();

      if (currentUser) {
        const updated = saveSubscriptionLocally(
          currentUser,
          result.tier,
          result.paymentId,
          result.subscriptionToken,
          result.orderId,
          result.durationDays || durationDays,
          planId as any,
          result.gateway || selectedGateway
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
        gateway: result.gateway || selectedGateway,
      });
    };

    const onError = (errMsg: string) => {
      setIsLoadingPlan(null);
      setErrorMessage(errMsg);
    };

    const onDismiss = () => {
      setIsLoadingPlan(null);
    };

    if (selectedGateway === 'cashfree') {
      await initiateCashfreeCheckout({
        planId,
        user: currentUser,
        onSuccess,
        onError,
        onDismiss,
      });
    } else {
      await initiateSubscriptionCheckout({
        planId,
        user: currentUser,
        onSuccess,
        onError,
        onDismiss,
      });
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

            {/* Gateway Selector (Cashfree Recommended vs Razorpay) */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="text-xs text-slate-400 font-medium mr-1">Payment Gateway:</span>
              <button
                type="button"
                onClick={() => setSelectedGateway('cashfree')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                  selectedGateway === 'cashfree'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-750'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Cashfree (UPI / GPay / PhonePe / Cards)</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-semibold">
                  Default
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedGateway('razorpay')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                  selectedGateway === 'razorpay'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-750'
                }`}
              >
                <span>Razorpay</span>
              </button>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-300 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Pricing Cards Grid (3 Options: 2-Day Trial ₹200 | Monthly ₹999 | Annual 20% Off ₹9,590) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* CARD 1: 2-DAY TRIAL PASS (₹200) */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-600 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      2-Day Trial Pass
                    </h3>
                    <span className="px-2.5 py-0.5 text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-md">
                      ₹100 / day
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-white">₹200</span>
                      <span className="text-slate-400 text-xs">/ 2 days (48 Hours)</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Full access to try and complete quick designs
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-6">
                    Perfect for completing a single floor plan, generating high-res renders, or trying the full platform.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span><strong>48 Hours (2 Days)</strong> Full Access</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Unlimited Multi-Floor Architecture</span>
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
                      Connecting to {selectedGateway === 'cashfree' ? 'Cashfree' : 'Razorpay'}...
                    </span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-400 fill-current" />
                      Pay ₹200 with {selectedGateway === 'cashfree' ? 'Cashfree' : 'Razorpay'}
                    </>
                  )}
                </button>
              </div>

              {/* CARD 2: MONTHLY PRO PASS (₹999) - HIGHLIGHTED */}
              <div className="relative bg-gradient-to-b from-blue-900/40 via-slate-800/90 to-slate-800/95 border-2 border-blue-500 rounded-2xl p-6 flex flex-col justify-between shadow-xl shadow-blue-500/15 hover:border-blue-400 transition-all scale-[1.02]">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  Most Popular
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4 mt-1">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      Monthly Pass
                    </h3>
                    <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-md">
                      Flexible
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-white">₹999</span>
                      <span className="text-slate-400 text-xs">/ month (30 Days)</span>
                    </div>
                    <div className="text-[11px] text-emerald-400 mt-1 font-medium">
                      All inclusive • UPI, Cards, NetBanking, EMI
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-6">
                    Full architectural power for independent designers, interior experts, and builders.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2.5 text-xs text-slate-100 font-medium">
                      <Layers className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span><strong>30 Days Full Access</strong> to all studio features</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Unlimited Multi-Floor Architecture (All levels)</span>
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
                      <span>Cloud Project Save & Share Presentation Link</span>
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
                      Connecting to {selectedGateway === 'cashfree' ? 'Cashfree' : 'Razorpay'}...
                    </span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      Pay ₹999 with {selectedGateway === 'cashfree' ? 'Cashfree' : 'Razorpay'}
                    </>
                  )}
                </button>
              </div>

              {/* CARD 3: ANNUAL PRO PASS (20% DISCOUNT - ₹9,590) */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-600 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Crown className="w-4 h-4 text-emerald-400" />
                      Annual Pass
                    </h3>
                    <span className="px-2.5 py-0.5 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-md">
                      20% OFF
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-white">₹9,590</span>
                      <span className="text-slate-400 text-xs">/ year</span>
                    </div>
                    <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
                      ₹799 / month • Save ₹2,398 / year (20% Discount)
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-6">
                    Best value for design practices and full-time professionals needing 365 days of continuous access.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span><strong>365 Days (1 Full Year)</strong> Unrestricted Access</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Save 20% compared to paying monthly</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Unlimited Multi-Floor Blueprints & Projects</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Priority 4K Cloud Raytrace Queuing</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Full Commercial Client Presentation License</span>
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
                      Connecting to {selectedGateway === 'cashfree' ? 'Cashfree' : 'Razorpay'}...
                    </span>
                  ) : (
                    <>
                      <Crown className="w-4 h-4" />
                      Pay ₹9,590 with {selectedGateway === 'cashfree' ? 'Cashfree' : 'Razorpay'}
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
                  UPI (GPay, PhonePe, Paytm), Cards, NetBanking, EMI
                </span>
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  Supported by <span className="text-sky-400 font-bold">Cashfree</span> & <span className="text-blue-400 font-bold">Razorpay</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
