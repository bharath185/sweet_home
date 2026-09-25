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
    badge: 'Quick Test • ₹100/day',
    tier: 'TRIAL',
    priceINR: 200,
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
      'Instant Razorpay Activation (UPI / Cards / NetBanking)',
    ],
    highlight: false,
  },
  monthly: {
    id: 'monthly',
    name: 'Monthly Pro Pass',
    badge: 'Most Popular',
    tier: 'PRO',
    priceINR: 999,
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
    badge: 'Save 20% vs Monthly',
    tier: 'PRO',
    priceINR: 9590, // Exactly 20% discount on ₹999 * 12 (Save ₹2,398)
    durationDays: 365,
    periodLabel: 'per year (₹799 / mo)',
    description: 'Best value for design practices. 365 days of full unlimited studio access with an automatic 20% discount.',
    features: [
      'Full 100% Studio Access for 365 Days',
      'Save 20% compared to monthly billing',
      'Equivalent to just ₹799 / month',
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
    priceINR: 999,
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
    priceINR: 9590,
    durationDays: 365,
    periodLabel: 'per year',
    description: 'Full studio access for 365 days.',
    features: ['All studio features included for 365 days with 20% discount'],
  },
};

/**
 * Checks if the user has an active pass (Trial, Monthly, or Yearly) that has not expired.
 * All features are fully accessible as long as the user has an active pass.
 */
export function hasActiveSubscription(user: User | null): boolean {
  if (user && user.role === 'ADMIN') {
    return true;
  }

  // 1. Check user state
  if (user && (user.subscriptionTier === 'PRO' || user.subscriptionTier === 'TRIAL' || user.subscriptionTier === 'ENTERPRISE')) {
    if (user.subscriptionExpiresAt) {
      const expires = new Date(user.subscriptionExpiresAt).getTime();
      if (Date.now() < expires) {
        return true;
      }
      return false; // Expired
    }
    return true;
  }

  // 2. Check localStorage verified token
  if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('sweethome_sub_token');
      if (token) {
        const parts = token.split('.');
        if (parts.length === 2) {
          const payload = JSON.parse(atob(parts[0]));
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
 * Access check: All studio features are accessible when the user has an active pass.
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

  if (hasActiveSubscription(user)) {
    return user.subscriptionTier || 'PRO';
  }

  return 'FREE';
}

/**
 * Formats a clean human-readable countdown of remaining pass access.
 */
export function getSubscriptionRemainingText(user: User | null): string {
  if (user && user.role === 'ADMIN') return 'Admin (Lifetime)';

  let expiresAt: number | null = null;
  if (user?.subscriptionExpiresAt) {
    expiresAt = new Date(user.subscriptionExpiresAt).getTime();
  } else if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('sweethome_sub_token');
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
      localStorage.setItem('sweethome_current_user', JSON.stringify(updated));
      localStorage.setItem('sweethome_sub_token', token);
      localStorage.setItem('sweethome_payment_id', paymentId);
    } catch (e) {
      console.warn('Could not save subscription to localStorage', e);
    }
  }

  return updated;
}
