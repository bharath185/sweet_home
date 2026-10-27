'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ConfigProvider,
  theme as antdTheme,
  Typography,
  Card,
  Badge,
  Button,
  Row,
  Col,
  Space,
  Tag,
  Alert,
  Descriptions,
} from 'antd';
import {
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

const { Title, Text, Paragraph } = Typography;

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUserUpdated?: (updatedUser: User) => void;
  initialFeatureHighlight?: string;
  theme?: 'dark' | 'light';
}

export default function UpgradeModal({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
  initialFeatureHighlight,
  theme = 'light',
}: UpgradeModalProps) {
  // Sync with application theme or document classList
  const [effectiveTheme, setEffectiveTheme] = useState<'dark' | 'light'>(theme || 'light');

  useEffect(() => {
    if (theme) {
      setEffectiveTheme(theme);
    } else if (typeof document !== 'undefined') {
      const isDocDark = document.documentElement.classList.contains('dark');
      setEffectiveTheme(isDocDark ? 'dark' : 'light');
    }
  }, [theme, isOpen]);

  const isDark = effectiveTheme === 'dark';

  const [isLoadingPlan, setIsLoadingPlan] = useState<PlanId | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pricingPlans, setPricingPlans] = useState<Record<string, PlanDetail>>({});
  const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(true);
  const [gatewayEnv, setGatewayEnv] = useState<'PRODUCTION' | 'SANDBOX'>('PRODUCTION');
  const [activeGateway, setActiveGateway] = useState<'cashfree' | 'razorpay'>('cashfree');

  useEffect(() => {
    if (isOpen) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('decofrog_cached_plans');
          localStorage.removeItem('sweethome_cached_plans');
          sessionStorage.removeItem('decofrog_cached_plans');
          sessionStorage.removeItem('sweethome_cached_plans');
        } catch {}
      }

      setIsLoadingPlans(true);
      fetch(`/api/payment-config?t=${Date.now()}`, { cache: 'no-store' })
        .then((r) => r.json())
        .then((data) => {
          if (data.plans) {
            setPricingPlans(data.plans);
          }
          if (data.activeGateway) {
            setActiveGateway(data.activeGateway);
          }
          if (data.environment) {
            setGatewayEnv(data.environment);
          }
        })
        .catch(() => {
          return fetch(`/api/plans?t=${Date.now()}`, { cache: 'no-store' })
            .then((r) => r.json())
            .then((data) => {
              if (data.plans) setPricingPlans(data.plans);
              if (data.gateway?.activeGateway) setActiveGateway(data.gateway.activeGateway);
              if (data.gateway?.environment) setGatewayEnv(data.gateway.environment);
            });
        })
        .finally(() => {
          setIsLoadingPlans(false);
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
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#4f46e5',
          borderRadius: 16,
          fontFamily: 'inherit',
          colorBgContainer: isDark ? '#141824' : '#ffffff',
          colorBgElevated: isDark ? '#1a1f2e' : '#ffffff',
        },
      }}
    >
      <Modal
        open={isOpen}
        onCancel={onClose}
        width={980}
        centered
        footer={null}
        destroyOnClose
        className="upgrade-access-modal"
        styles={{
          body: {
            maxHeight: 'calc(90vh - 30px)',
            overflowY: 'auto',
            padding: '20px 24px',
          },
        }}
      >
        {successInfo ? (
          /* SUCCESS STATE */
          <div className="py-8 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/10">
              <Crown className="w-10 h-10" />
            </div>
            <Title level={2} style={{ marginBottom: 8, fontWeight: 800 }}>
              Pass Activated Successfully! 🎉
            </Title>
            <Paragraph type="secondary" className="max-w-md text-sm leading-relaxed" style={{ marginBottom: 24 }}>
              Your <strong>{successInfo.planName}</strong> is now active for the next{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">{successInfo.durationDays} days</strong>. All studio features,
              multi-floor architecture, 4K raytracing, and BOM exports are 100% unlocked!
            </Paragraph>

            <Card
              size="small"
              className={`w-full max-w-md text-left mb-6 font-mono text-xs ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
              styles={{ body: { padding: '16px' } }}
            >
              <Descriptions
                column={1}
                size="small"
                items={[
                  {
                    key: 'pid',
                    label: <span className="font-sans text-slate-500">Payment ID</span>,
                    children: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{successInfo.paymentId}</span>,
                  },
                  {
                    key: 'gw',
                    label: <span className="font-sans text-slate-500">Gateway</span>,
                    children: <Tag color="blue" bordered={false}>{successInfo.gateway.toUpperCase()}</Tag>,
                  },
                  {
                    key: 'dur',
                    label: <span className="font-sans text-slate-500">Duration</span>,
                    children: <span className="font-semibold">{successInfo.durationDays} Days Full Access</span>,
                  },
                  {
                    key: 'curr',
                    label: <span className="font-sans text-slate-500">Currency</span>,
                    children: 'INR (₹)',
                  },
                  {
                    key: 'sec',
                    label: <span className="font-sans text-slate-500">Security</span>,
                    children: 'HMAC-SHA256 Cryptographically Verified',
                  },
                ]}
              />
            </Card>

            <Button
              type="primary"
              size="large"
              onClick={() => {
                setSuccessInfo(null);
                onClose();
              }}
              className="px-8 font-semibold shadow-md shadow-indigo-500/25"
            >
              Continue Designing in 3D Studio
            </Button>
          </div>
        ) : (
          /* PASS PRICING VIEW */
          <div className="space-y-4">
            {/* Compact, Sleek Header */}
            <div className="text-center max-w-xl mx-auto">
              <Title
                level={3}
                style={{
                  margin: '0 0 3px 0',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                }}
              >
                Select Your Access Pass
              </Title>
              <Text type="secondary" className="text-xs block">
                All features 100% unlocked on every pass • Choose your access duration
              </Text>

              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
                <Tag
                  color="success"
                  bordered={false}
                  className="font-semibold text-xs py-0.5 inline-flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>All Features Included</span>
                </Tag>
                {isActive && (
                  <Tag color="processing" bordered={false} className="font-semibold text-xs py-0.5">
                    {remainingText}
                  </Tag>
                )}
                <Tag
                  bordered={false}
                  className={`text-[11px] py-0.5 font-medium ${
                    isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse" />
                  {activeGateway === 'razorpay' ? 'Razorpay Secure' : 'Cashfree'}
                </Tag>
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <Alert
                type="error"
                showIcon
                message={errorMessage}
                closable
                onClose={() => setErrorMessage(null)}
              />
            )}

            {/* Dynamic Pricing Cards Grid */}
            <Row gutter={[16, 16]} align="stretch">
              {/* CARD 1: TRIAL PASS */}
              <Col xs={24} md={8}>
                <Card
                  hoverable
                  className={`h-full flex flex-col justify-between transition-all duration-200 rounded-2xl ${
                    isDark
                      ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                  }`}
                  styles={{
                    body: {
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'between',
                      height: '100%',
                      padding: '22px 20px',
                    },
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Text strong className="text-base flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-500" />
                        {pricingPlans.trial_2days?.name || '2-Day All-Access Pass'}
                      </Text>
                      <Tag color="gold" bordered={false} className="font-bold text-[10px]">
                        {pricingPlans.trial_2days?.badge || 'Quick Test'}
                      </Tag>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-baseline gap-1">
                        {isLoadingPlans ? (
                          <span className="inline-block w-24 h-8 bg-slate-700/40 rounded animate-pulse" />
                        ) : (
                          <span className="text-3xl font-extrabold tracking-tight">
                            ₹{pricingPlans.trial_2days?.priceINR !== undefined ? pricingPlans.trial_2days.priceINR.toLocaleString('en-IN') : '...'}
                          </span>
                        )}
                        <Text type="secondary" className="text-xs">
                          {pricingPlans.trial_2days?.periodLabel || 'for 2 days (48 Hours)'}
                        </Text>
                      </div>
                      <Text className="text-[11px] text-amber-600 dark:text-amber-400 block mt-0.5 font-semibold">
                        One-time payment • No auto-recurring charges
                      </Text>
                    </div>

                    <Text type="secondary" className="text-xs block mb-5 leading-relaxed">
                      100% unrestricted studio access to all drafting, raytracing, and BOM quotation tools for 48 hours.
                    </Text>

                    <div className="space-y-2.5 mb-6 text-xs">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>
                          <strong>{pricingPlans.trial_2days?.durationDays || 2} Days All-Access</strong> to 100% of features
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Unlimited Multi-Floor Architecture Drafting</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>4K Ultra Raytracing & High-Res Snapshots</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Bill of Materials (BOM) Excel/CSV Cost Quotes</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Custom 3D Model Uploads (.OBJ / .GLTF)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Cloud Project Save & Sync Across Devices</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Commercial Client Presentation License</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="large"
                    block
                    loading={isLoadingPlan === 'trial_2days'}
                    disabled={isLoadingPlan !== null || isLoadingPlans}
                    onClick={() => handleCheckout('trial_2days')}
                    icon={<Zap className="w-4 h-4 text-amber-500 fill-current" />}
                    className={`font-bold text-xs mt-auto rounded-xl ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                        : 'bg-slate-900 hover:bg-slate-800 text-white border-none shadow-sm'
                    }`}
                  >
                    {isLoadingPlans
                      ? 'Loading Pass...'
                      : `Pay ₹${pricingPlans.trial_2days?.priceINR !== undefined ? pricingPlans.trial_2days.priceINR.toLocaleString('en-IN') : '...'}`}
                  </Button>
                </Card>
              </Col>

              {/* CARD 2: MONTHLY PRO PASS (MOST POPULAR) */}
              <Col xs={24} md={8}>
                <Badge.Ribbon
                  text={
                    <span className="flex items-center gap-1 font-bold text-[11px]">
                      <Crown className="w-3 h-3" />
                      {pricingPlans.monthly?.badge || 'Most Popular'}
                    </span>
                  }
                  color="#4f46e5"
                >
                  <Card
                    hoverable
                    className={`h-full flex flex-col justify-between transition-all duration-200 rounded-2xl border-2 border-indigo-500 shadow-lg shadow-indigo-500/10 ${
                      isDark ? 'bg-gradient-to-b from-indigo-950/30 to-slate-900/60' : 'bg-gradient-to-b from-indigo-50/60 to-white'
                    }`}
                    styles={{
                      body: {
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'between',
                        height: '100%',
                        padding: '22px 20px',
                      },
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3 mt-1">
                        <Text strong className="text-base flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                          <Calendar className="w-4 h-4" />
                          {pricingPlans.monthly?.name || 'Monthly All-Access Pass'}
                        </Text>
                        <Tag color="indigo" bordered={false} className="font-bold text-[10px]">
                          {pricingPlans.monthly?.durationDays || 30} Days
                        </Tag>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-baseline gap-1">
                          {isLoadingPlans ? (
                            <span className="inline-block w-24 h-8 bg-indigo-500/30 rounded animate-pulse" />
                          ) : (
                            <span className="text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">
                              ₹{pricingPlans.monthly?.priceINR !== undefined ? pricingPlans.monthly.priceINR.toLocaleString('en-IN') : '...'}
                            </span>
                          )}
                          <Text type="secondary" className="text-xs">
                            {pricingPlans.monthly?.periodLabel || 'per month (30 Days)'}
                          </Text>
                        </div>
                        <Text className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-semibold">
                          All inclusive • UPI, Cards, NetBanking
                        </Text>
                      </div>

                      <Text type="secondary" className="text-xs block mb-5 leading-relaxed">
                        100% unrestricted studio access to all drafting, raytracing, and BOM quotation tools for 30 days.
                      </Text>

                      <div className="space-y-2.5 mb-6 text-xs">
                        <div className="flex items-start gap-2">
                          <Layers className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          <span>
                            <strong>{pricingPlans.monthly?.durationDays || 30} Days All-Access</strong> to 100% of features
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>Unlimited Multi-Floor Architecture Drafting</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>4K Ultra Raytracing & High-Res Snapshots</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>Bill of Materials (BOM) Excel/CSV Cost Quotes</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>Custom 3D Model Uploads (.OBJ / .GLTF)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>Cloud Project Save & Sync Across Devices</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>Commercial Client Presentation License</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="primary"
                      size="large"
                      block
                      loading={isLoadingPlan === 'monthly'}
                      disabled={isLoadingPlan !== null || isLoadingPlans}
                      onClick={() => handleCheckout('monthly')}
                      icon={<Zap className="w-4 h-4 fill-current" />}
                      className="font-bold text-xs mt-auto rounded-xl shadow-md shadow-indigo-500/25 bg-indigo-600 hover:bg-indigo-500 border-none"
                    >
                      {isLoadingPlans
                        ? 'Loading Pass...'
                        : `Pay ₹${pricingPlans.monthly?.priceINR !== undefined ? pricingPlans.monthly.priceINR.toLocaleString('en-IN') : '...'} with ${activeGateway === 'razorpay' ? 'Razorpay' : 'Cashfree'}`}
                    </Button>
                  </Card>
                </Badge.Ribbon>
              </Col>

              {/* CARD 3: ANNUAL PRO PASS */}
              <Col xs={24} md={8}>
                <Badge.Ribbon
                  text={
                    <span className="font-bold text-[11px]">
                      {pricingPlans.yearly?.badge || 'Best Value • Save 20%'}
                    </span>
                  }
                  color="#059669"
                >
                  <Card
                    hoverable
                    className={`h-full flex flex-col justify-between transition-all duration-200 rounded-2xl ${
                      isDark
                        ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                    }`}
                    styles={{
                      body: {
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'between',
                        height: '100%',
                        padding: '22px 20px',
                      },
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3 mt-1">
                        <Text strong className="text-base flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <Crown className="w-4 h-4" />
                          {pricingPlans.yearly?.name || 'Annual All-Access Pass'}
                        </Text>
                        <Tag color="success" bordered={false} className="font-bold text-[10px]">
                          365 Days
                        </Tag>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-baseline gap-1">
                          {isLoadingPlans ? (
                            <span className="inline-block w-24 h-8 bg-slate-700/40 rounded animate-pulse" />
                          ) : (
                            <span className="text-3xl font-extrabold tracking-tight">
                              ₹{pricingPlans.yearly?.priceINR !== undefined ? pricingPlans.yearly.priceINR.toLocaleString('en-IN') : '...'}
                            </span>
                          )}
                          <Text type="secondary" className="text-xs">
                            {pricingPlans.yearly?.periodLabel || 'per year (365 Days)'}
                          </Text>
                        </div>
                        <Text className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-semibold">
                          Best value • Continuous 365-day access
                        </Text>
                      </div>

                      <Text type="secondary" className="text-xs block mb-5 leading-relaxed">
                        100% unrestricted studio access to all drafting, raytracing, and BOM quotation tools for 365 days.
                      </Text>

                      <div className="space-y-2.5 mb-6 text-xs">
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>
                            <strong>{pricingPlans.yearly?.durationDays || 365} Days All-Access</strong> to 100% of features
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>Unlimited Multi-Floor Architecture Drafting</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>4K Ultra Raytracing & High-Res Snapshots</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>Bill of Materials (BOM) Excel/CSV Cost Quotes</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>Custom 3D Model Uploads (.OBJ / .GLTF)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>Cloud Project Save & Sync Across Devices</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>Commercial Client Presentation License</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="primary"
                      size="large"
                      block
                      loading={isLoadingPlan === 'yearly'}
                      disabled={isLoadingPlan !== null || isLoadingPlans}
                      onClick={() => handleCheckout('yearly')}
                      icon={<Crown className="w-4 h-4" />}
                      className="font-bold text-xs mt-auto rounded-xl bg-emerald-600 hover:bg-emerald-500 border-none shadow-md shadow-emerald-600/20"
                    >
                      {isLoadingPlans
                        ? 'Loading Pass...'
                        : `Pay ₹${pricingPlans.yearly?.priceINR !== undefined ? pricingPlans.yearly.priceINR.toLocaleString('en-IN') : '...'}`}
                    </Button>
                  </Card>
                </Badge.Ribbon>
              </Col>
            </Row>

            {/* Payment Trust Footer */}
            <div
              className={`pt-4 border-t flex flex-wrap items-center justify-between gap-4 text-xs ${
                isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Bank-Grade 256-Bit SSL Encryption • HMAC-SHA256 Cryptographic Verification</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-indigo-500" />
                  UPI (GPay, PhonePe, Paytm), Cards, NetBanking
                </span>
                <span className="font-semibold">
                  Secure Checkout
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </ConfigProvider>
  );
}
