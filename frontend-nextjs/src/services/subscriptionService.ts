import { User } from '../types/plan';

export type PlanId = 'trial_2days' | 'monthly' | 'yearly' | 'pro_monthly' | 'pro_yearly';

export interface PlanDetail {
  id: PlanId;
  name: string;
  badge?: string;
  tier: 'TRIAL' | 'PRO' | 'ENTERPRISE';
  priceINR: number; // in Rupees
  durationDays: number;
  periodLabel: string;
  description: string;
  features: string[];
  highlight?: boolean;
}

export const PRICING_PLANS: Record<string, PlanDetail> = {
  trial_2days: {
    id: 'trial_2days',
    name: '2-Day Full Access Trial',
    badge: 'Quick Test',
    tier: 'TRIAL',
    priceINR: 2,
    durationDays: 2,
    periodLabel: 'for 2 days (48 Hours)',
    description: 'Complete unrestricted access to all studio tools, multi-floor drafting, 4K raytrace renders, and BOM quotations for 48 hours.',
    features: [
      'Full 100% Studio Access for 48 Hours',
      'Unlimited Multi-Floor Architecture Drafting',
      '4K Ultra Raytracing & Master Snapshot Exports',
      'Bill of Materials (BOM) Excel & CSV Quotations',
      'Custom 3D Model Uploads (.OBJ / .GLTF)',
      'Multi-Part Material & Finish Customizer',
      'Instant UPI, Cards & NetBanking Activation',
    ],
    highlight: false,
  },
  monthly: {
    id: 'monthly',
    name: 'Monthly Pro Pass',
    badge: 'Most Popular',
    tier: 'PRO',
    priceINR: 3,
    durationDays: 30,
    periodLabel: 'per month (30 Days)',
    description: 'Full uninterrupted studio access for professional residential architects and interior designers.',
    features: [
      'Full 100% Studio Access for 30 Days',
      'Unlimited Multi-Floor Architecture Drafting',
      '4K Ultra Raytracing & Master Snapshot Exports',
      'Bill of Materials (BOM) Excel & CSV Quotations',
      'Custom 3D Model Uploads (.OBJ / .GLTF)',
      'Multi-Part Material & Finish Customizer',
      'Save & Sync Unlimited Projects to Cloud',
      'Commercial Presentation Mode & Walkthroughs',
    ],
    highlight: true,
  },
  yearly: {
    id: 'yearly',
    name: 'Annual Pro Pass',
    badge: 'Best Value • Save 20%',
    tier: 'PRO',
    priceINR: 4,
    durationDays: 365,
    periodLabel: 'per year (365 Days)',
    description: 'Best value for design practices. 365 days of full unlimited studio access with an automatic 20% discount.',
    features: [
      'Full 100% Studio Access for 365 Days',
      'Save 20% compared to monthly billing',
      'Unlimited Multi-Floor Blueprints & Projects',
      'Priority 4K Cloud Raytrace Queuing',
      'Bill of Materials (BOM) Official Quotes',
      'Full Commercial Client Presentation License',
      'Dedicated Email & Technical Support',
    ],
    highlight: false,
  },
  // Backwards compatibility mappings
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Monthly Pro Pass',
    badge: 'Most Popular',
    tier: 'PRO',
    priceINR: 3,
    durationDays: 30,
    periodLabel: 'per month (30 Days)',
    description: 'Full studio access for architects and interior designers.',
    features: ['All studio features included for 30 days'],
  },
  pro_yearly: {
    id: 'pro_yearly',
    name: 'Annual Pro Pass',
    badge: 'Save 20%',
    tier: 'PRO',
    priceINR: 4,
    durationDays: 365,
    periodLabel: 'per year',
    description: 'Full studio access for 365 days.',
    features: ['All studio features included for 365 days with 20% discount'],
  },
};

/**
 * Fetches the live configured pricing plans from the server (/api/plans)
 */
export async function fetchActivePricingPlans(): Promise<Record<string, PlanDetail>> {
  try {
    const res = await fetch('/api/plans');
    const data = await res.json();
    if (res.ok && data.plans) {
      for (const [key, val] of Object.entries(data.plans)) {
        if (PRICING_PLANS[key]) {
          PRICING_PLANS[key] = {
            ...PRICING_PLANS[key],
            ...(val as any),
          };
        } else {
          PRICING_PLANS[key] = val as any;
        }
      }
      return PRICING_PLANS;
    }
  } catch (err) {
    console.warn('Failed to fetch dynamic pricing plans from server:', err);
  }
  return PRICING_PLANS;
}

/**
 * Checks if the user is currently on an active 48-Hour Free Trial.
 */
export function isUserOnFreeTrial(user: User | null): boolean {
  if (!user || user.role === 'ADMIN') return false;
  if (!user.isFreeTrial && !user.trialExpiresAt && user.plan !== 'trial_48h') return false;

  const trialExpStr = user.trialExpiresAt || user.subscriptionExpiresAt || user.expires_at;
  if (!trialExpStr) return false;
  const trialExp = new Date(trialExpStr).getTime();
  return !isNaN(trialExp) && Date.now() < trialExp;
}

/**
 * Checks if the user has already finished/exhausted their 48-Hour Free Trial.
 */
export function hasCompletedFreeTrial(user: User | null): boolean {
  if (!user || user.role === 'ADMIN') return false;
  if (user.hasCompletedTrial) return true;
  const trialExpStr = user.trialExpiresAt || user.subscriptionExpiresAt || user.expires_at;
  if (trialExpStr && (user.isFreeTrial || user.plan === 'trial_48h')) {
    const trialExp = new Date(trialExpStr).getTime();
    return !isNaN(trialExp) && Date.now() >= trialExp;
  }
  return false;
}

/**
 * Checks if the user has an active pass or active 48-hour free trial that has not expired.
 * Studio tools remain 100% accessible during the 48 hours or active paid subscription.
 * When the 48 hours is complete without payment, this returns false (blocks studio).
 */
export function hasActiveSubscription(user: User | null): boolean {
  if (user && user.role === 'ADMIN') {
    return true;
  }

  if (!user) {
    return false;
  }

  // 1. Check Active 48-Hour Free Trial
  if (isUserOnFreeTrial(user)) {
    return true; // Unlocked during 48-hour trial window
  }

  // If trial was started and 48 hours is now complete -> blocked unless genuine payment exists!
  if (hasCompletedFreeTrial(user) && (!user.paid_at || user.isFreeTrial)) {
    return false; // 48-hour trial is over, blocked!
  }

  // 2. Check Genuine Paid Pass (Customer paid through Cashfree/Razorpay)
  if (user.payment_status === 'paid' && !user.isFreeTrial && user.plan !== 'trial_48h') {
    const expStr = user.expires_at || user.subscriptionExpiresAt;
    if (expStr) {
      const expires = new Date(expStr).getTime();
      return !isNaN(expires) && Date.now() < expires;
    }
    return true;
  }

  // 3. Explicit non-paid statuses
  if (user.payment_status === 'unpaid' || user.payment_status === 'failed' || user.payment_status === 'expired') {
    return false;
  }

  // 4. Check user tier state
  if (user.subscriptionTier === 'PRO' || user.subscriptionTier === 'ENTERPRISE') {
    const expStr = user.subscriptionExpiresAt || user.expires_at;
    if (expStr) {
      const expires = new Date(expStr).getTime();
      return !isNaN(expires) && Date.now() < expires;
    }
    return true;
  }

  // 5. Check localStorage verified token
  if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('decofrog_sub_token') || localStorage.getItem('sweethome_sub_token');
      if (token) {
        const parts = token.split('.');
        if (parts.length === 2) {
          const payload = JSON.parse(atob(parts[0]));
          if (payload.role === 'ADMIN') return true;
          if (payload.expiresAt && Date.now() < payload.expiresAt) {
            return true;
          }
        }
      }
    } catch (e) {
      // Ignored
    }
  }

  return false;
}

/**
 * Access check: All studio features are accessible when the user has an active pass or free trial.
 */
export function canAccessFeature(user: User | null, _feature?: string): boolean {
  if (user && user.role === 'ADMIN') return true;
  return hasActiveSubscription(user);
}

/**
 * Resolves the effective subscription tier for the user.
 */
export function getUserSubscriptionTier(user: User | null): 'FREE' | 'TRIAL' | 'PRO' | 'ENTERPRISE' {
  if (!user) return 'FREE';
  if (user.role === 'ADMIN') return 'PRO';

  if (isUserOnFreeTrial(user)) {
    return 'TRIAL';
  }

  if (hasActiveSubscription(user)) {
    return user.subscriptionTier || 'PRO';
  }

  return 'FREE';
}

/**
 * Formats a clean human-readable countdown of remaining pass or trial access.
 */
export function getSubscriptionRemainingText(user: User | null): string {
  if (user && user.role === 'ADMIN') return 'Admin (Lifetime)';

  // 1. Free Trial Countdown
  if (isUserOnFreeTrial(user)) {
    const trialExpStr = user.trialExpiresAt || user.subscriptionExpiresAt || user.expires_at;
    const trialExp = trialExpStr ? new Date(trialExpStr).getTime() : 0;
    const diffMs = trialExp - Date.now();
    if (diffMs <= 0) return 'Trial Expired';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours >= 1) {
      return `${hours}h Free Trial Left • Upgrade`;
    }
    const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return `${mins}m Free Trial Left • Upgrade`;
  }

  if (hasCompletedFreeTrial(user) && (!user.paid_at || user.isFreeTrial)) {
    return 'Trial Expired (Upgrade Required)';
  }

  // 2. Paid Pass Countdown
  let expiresAt: number | null = null;
  if (user?.subscriptionExpiresAt || user?.expires_at) {
    expiresAt = new Date(user.subscriptionExpiresAt || user.expires_at!).getTime();
  } else if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('decofrog_sub_token') || localStorage.getItem('sweethome_sub_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[0]));
        if (payload.expiresAt) expiresAt = payload.expiresAt;
      }
    } catch (e) {}
  }

  if (!expiresAt) return 'No Active Pass';

  const diffMs = expiresAt - Date.now();
  if (diffMs <= 0) return 'Pass Expired';

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days >= 2) {
    return `${days} days left`;
  }
  if (days === 1) {
    const remHours = hours % 24;
    return `1 day ${remHours}h left`;
  }
  if (hours >= 1) {
    return `${hours} hours left`;
  }

  const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  return `${minutes} mins left`;
}

/**
 * Initializes and grants a 48-Hour Free Trial for a user upon login
 */
export function start48HourFreeTrialLocally(user: User): User {
  // If user already has an active trial or paid pass, preserve it
  if (user.role === 'ADMIN') return user;
  if (user.trialExpiresAt && Date.now() < new Date(user.trialExpiresAt).getTime()) {
    return user;
  }
  if (user.paid_at && !user.isFreeTrial) {
    return user;
  }

  // If user already completed trial previously
  if (user.hasCompletedTrial || (user.trialExpiresAt && Date.now() >= new Date(user.trialExpiresAt).getTime())) {
    const expiredUser: User = {
      ...user,
      hasCompletedTrial: true,
      isFreeTrial: false,
      payment_status: 'expired',
      subscriptionStatus: 'inactive',
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('decofrog_current_user', JSON.stringify(expiredUser));
    }
    return expiredUser;
  }

  // Fresh 48-Hour Free Trial!
  const trialDurationMs = 48 * 60 * 60 * 1000;
  const now = new Date();
  const trialStartedAt = now.toISOString();
  const trialExpiresAt = new Date(now.getTime() + trialDurationMs).toISOString();

  const trialUser: User = {
    ...user,
    payment_status: 'paid',
    plan: 'trial_48h',
    trialStartedAt,
    trialExpiresAt,
    expires_at: trialExpiresAt,
    subscriptionExpiresAt: trialExpiresAt,
    isFreeTrial: true,
    hasCompletedTrial: false,
    subscriptionTier: 'TRIAL',
    subscriptionStatus: 'trial',
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('decofrog_current_user', JSON.stringify(trialUser));
  }

  // Also sync asynchronously to server
  if (typeof fetch !== 'undefined') {
    fetch('/api/user/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        action: 'start_trial',
        is_free_trial: true,
        trial_started_at: trialStartedAt,
        trial_expires_at: trialExpiresAt,
      }),
    }).catch(() => {});
  }

  return trialUser;
}

/**
 * Creates a client-side representation of verified subscription with dynamic duration
 */
export function saveSubscriptionLocally(
  user: User,
  tier: 'TRIAL' | 'PRO' | 'ENTERPRISE',
  paymentId: string,
  token: string,
  orderId?: string,
  durationDays: number = 30,
  planId?: 'trial_2days' | 'monthly' | 'yearly',
  gateway: 'cashfree' | 'razorpay' = 'cashfree'
): User {
  const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
  const updated: User = {
    ...user,
    payment_status: 'paid',
    plan: planId,
    paid_at: new Date().toISOString(),
    expires_at: expiresAt,
    cashfree_order_id: gateway === 'cashfree' ? orderId : user.cashfree_order_id,
    cashfree_payment_id: gateway === 'cashfree' ? paymentId : user.cashfree_payment_id,
    subscriptionTier: tier,
    subscriptionStatus: tier === 'TRIAL' ? 'trial' : 'active',
    subscriptionExpiresAt: expiresAt,
    subscriptionPlanId: planId,
    paymentGateway: gateway,
    cashfreeOrderId: gateway === 'cashfree' ? orderId : user.cashfreeOrderId,
    razorpayPaymentId: gateway === 'razorpay' ? paymentId : user.razorpayPaymentId,
    razorpayOrderId: gateway === 'razorpay' ? orderId : user.razorpayOrderId,
    subscriptionToken: token,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('decofrog_current_user', JSON.stringify(updated));
      localStorage.setItem('decofrog_sub_token', token);
      localStorage.setItem('decofrog_payment_id', paymentId);
    } catch (e) {
      console.warn('Could not save subscription to localStorage', e);
    }
  }

  return updated;
}
