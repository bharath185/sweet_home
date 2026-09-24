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
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User } from '../types/plan';
import { PRICING_PLANS, PlanId, saveSubscriptionLocally, getUserSubscriptionTier } from '../services/subscriptionService';
import { initiateSubscriptionCheckout } from '../services/razorpayClient';

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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoadingPlan, setIsLoadingPlan] = useState<PlanId | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    tier: string;
    paymentId: string;
  } | null>(null);

  if (!isOpen) return null;

  const currentTier = getUserSubscriptionTier(currentUser);

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

    await initiateSubscriptionCheckout({
      planId,
      user: currentUser,
      onSuccess: (result) => {
        setIsLoadingPlan(null);
        triggerConfetti();

        // Update user state locally
        if (currentUser) {
          const updated = saveSubscriptionLocally(
            currentUser,
            result.tier,
            result.paymentId,
            result.subscriptionToken,
            result.orderId
          );
          if (onUserUpdated) {
            onUserUpdated(updated);
          }
        }

        setSuccessInfo({
          tier: result.tier,
          paymentId: result.paymentId,
        });
      },
      onError: (err) => {
        setIsLoadingPlan(null);
        setErrorMessage(err);
      },
      onDismiss: () => {
        setIsLoadingPlan(null);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors"
          aria-label="Close upgrade modal"
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
              Welcome to SweetHome {successInfo.tier}! 🎉
            </h2>
            <p className="mt-3 text-slate-300 max-w-md text-base leading-relaxed">
              Your payment has been cryptographically verified and your premium architectural features are now completely unlocked!
            </p>

            <div className="mt-6 p-4 bg-slate-800/80 border border-slate-700 rounded-xl text-left text-xs font-mono text-slate-300 space-y-1 w-full max-w-md">
              <div className="flex justify-between">
                <span className="text-slate-400">Payment ID:</span>
                <span className="text-emerald-400 font-semibold">{successInfo.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tier Status:</span>
                <span className="text-blue-400 font-semibold">{successInfo.tier} Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Currency:</span>
                <span>INR (₹)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Security Gateway:</span>
                <span>Razorpay HMAC-SHA256 Verified</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSuccessInfo(null);
                onClose();
              }}
              className="mt-8 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]"
            >
              Start Designing with Pro Features
            </button>
          </div>
        ) : (
          /* PRICING PLANS VIEW */
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Premium Architectural Suite
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Design Without Limits
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-300">
                {initialFeatureHighlight
                  ? `Unlock ${initialFeatureHighlight} and full professional 3D studio features.`
                  : 'Upgrade your studio for multi-floor drafting, 4K raytrace rendering, and commercial BOM exports.'}
              </p>

              {/* Billing Toggle */}
              <div className="mt-6 inline-flex items-center bg-slate-800/90 p-1.5 rounded-xl border border-slate-700">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    billingCycle === 'yearly'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Annual Billing</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/40">
                    Save 33%
                  </span>
                </button>
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-300 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* FREE CARD */}
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-600 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Starter Studio</h3>
                    <span className="px-2.5 py-1 text-[11px] font-medium bg-slate-700/50 text-slate-300 rounded-md">
                      Free Forever
                    </span>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-extrabold text-white">₹0</span>
                    <span className="text-slate-400 text-xs ml-1">/ forever</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    Perfect for 2D drafting and basic 3D walkthroughs of single-floor apartments.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>1 Single Floor Blueprint drafting</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Full 2D & 3D Interactive Viewport</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Standard Furniture & Material Library</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>BOM Quotation Viewer in INR (₹)</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-500">
                      <Lock className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                      <span>Multi-Floor additions locked</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-500">
                      <Lock className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                      <span>4K Raytracing locked</span>
                    </div>
                  </div>
                </div>

                <button
                  disabled={currentTier === 'FREE'}
                  onClick={onClose}
                  className="w-full py-2.5 px-4 bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition-colors"
                >
                  {currentTier === 'FREE' ? 'Current Plan' : 'Standard Access'}
                </button>
              </div>

              {/* PRO CARD (RECOMMENDED / MOST POPULAR) */}
              <div className="relative bg-gradient-to-b from-blue-900/40 via-slate-800/80 to-slate-800/90 border-2 border-blue-500 rounded-2xl p-6 flex flex-col justify-between shadow-xl shadow-blue-500/10 hover:border-blue-400 transition-all scale-[1.02]">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  Most Popular
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4 mt-1">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      Architect Pro
                    </h3>
                    <span className="px-2.5 py-1 text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-md">
                      {billingCycle === 'yearly' ? 'Save ₹3,989' : 'Flexible'}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-white">
                        {billingCycle === 'yearly' ? '₹7,999' : '₹999'}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {billingCycle === 'yearly' ? '/ year (₹666/mo)' : '/ month'}
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-400 mt-1 font-medium">
                      All prices in Indian Rupees (INR) + GST included
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-6">
                    Full architectural power for independent designers, interior experts, and builders.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2.5 text-xs text-slate-200 font-medium">
                      <Layers className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Unlimited Multi-Floor Architecture</strong> (Ground, 1st, 2nd, Penthouse)
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200 font-medium">
                      <Camera className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>4K Ultra Raytracing Engine</strong> with daylight sun simulation
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200 font-medium">
                      <FileSpreadsheet className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>BOM Excel & CSV Export</strong> with client-ready ₹ estimates
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Box className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>Custom 3D Model Uploads (.OBJ / .GLTF)</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>Multi-Part Color & Material Finishing</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>No watermark on blueprints or exports</span>
                    </div>
                  </div>
                </div>

                <button
                  disabled={isLoadingPlan !== null || currentTier === 'PRO'}
                  onClick={() => handleCheckout(billingCycle === 'yearly' ? 'pro_yearly' : 'pro_monthly')}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoadingPlan === (billingCycle === 'yearly' ? 'pro_yearly' : 'pro_monthly') ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connecting to Razorpay...
                    </span>
                  ) : currentTier === 'PRO' ? (
                    'Active Plan (Pro)'
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      Upgrade to Pro with Razorpay
                    </>
                  )}
                </button>
              </div>

              {/* ENTERPRISE CARD */}
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-600 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Studio Enterprise</h3>
                    <span className="px-2.5 py-1 text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded-md">
                      Firms & Teams
                    </span>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-extrabold text-white">
                      {billingCycle === 'yearly' ? '₹19,999' : '₹2,499'}
                    </span>
                    <span className="text-slate-400 text-xs ml-1">
                      {billingCycle === 'yearly' ? '/ year' : '/ month'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    For architectural agencies, interior design firms, and multi-designer teams.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Everything in Architect Pro</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Multi-user real-time designer collaboration</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>White-label client presentation links</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Dedicated Account Manager & Phone Support</span>
                    </div>
                  </div>
                </div>

                <button
                  disabled={isLoadingPlan !== null || currentTier === 'ENTERPRISE'}
                  onClick={() =>
                    handleCheckout(billingCycle === 'yearly' ? 'enterprise_yearly' : 'enterprise_monthly')
                  }
                  className="w-full py-2.5 px-4 bg-slate-700/80 hover:bg-slate-700 text-white font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoadingPlan ===
                  (billingCycle === 'yearly' ? 'enterprise_yearly' : 'enterprise_monthly') ? (
                    'Processing...'
                  ) : currentTier === 'ENTERPRISE' ? (
                    'Active Plan (Enterprise)'
                  ) : (
                    'Get Studio Enterprise'
                  )}
                </button>
              </div>
            </div>

            {/* Razorpay Trust Footer */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bank-Grade 256-Bit SSL Encryption • HMAC-SHA256 Verified</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  UPI, Cards, NetBanking, Wallets
                </span>
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  Powered by <span className="text-blue-400">Razorpay</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
