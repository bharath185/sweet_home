import { User } from '../types/plan';

export type PlanId = 'free' | 'pro_monthly' | 'pro_yearly' | 'enterprise_monthly' | 'enterprise_yearly';
export type FeatureKey =
  | 'multi_floor'
  | 'render_4k'
  | 'custom_obj_upload'
  | 'export_bom_csv'
  | 'commercial_license'
  | 'unlimited_projects'
  | 'pbr_materials_unlimited';

export interface PlanDetail {
  id: PlanId;
  name: string;
  badge?: string;
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  priceINR: number; // in Rupees
  period: 'month' | 'year' | 'forever';
  description: string;
  features: string[];
  highlight?: boolean;
}

export const PRICING_PLANS: Record<PlanId, PlanDetail> = {
  free: {
    id: 'free',
    name: 'Starter Studio',
    tier: 'FREE',
    priceINR: 0,
    period: 'forever',
    description: 'Perfect for exploring 3D home design & viewing floor blueprints.',
    features: [
      '1 Single Floor Blueprint drafting',
      'Full 2D & 3D Interactive Viewport',
      'Standard Furniture & Material Library',
      'Standard 1080p Viewport Snapshots',
      'BOM Quotation Viewer in INR',
    ],
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Architect Pro (Monthly)',
    badge: 'Most Flexible',
    tier: 'PRO',
    priceINR: 999,
    period: 'month',
    description: 'Complete professional toolkit for residential architects and interior designers.',
    features: [
      'Unlimited Multi-Floor Architecture (Ground, 1st, 2nd, Penthouse)',
      '4K Ultra Raytracing & Photorealistic Lighting Engine',
      'Bill of Materials (BOM) Excel / CSV Export & Official Quotes',
      'Custom 3D Model Uploads (.OBJ / .GLTF / Textures)',
      '3D Multi-Part Finish Styler (Individual Part Finishes)',
      'Commercial Presentation Mode with Automatic Doors & Collision',
      'No Watermarks on Renders & Blueprints',
    ],
    highlight: false,
  },
  pro_yearly: {
    id: 'pro_yearly',
    name: 'Architect Pro (Annual)',
    badge: 'Best Value • Save 33%',
    tier: 'PRO',
    priceINR: 7999,
    period: 'year',
    description: 'Everything in Pro with annual savings and VIP priority cloud rendering.',
    features: [
      'All Architect Pro features included',
      'Equivalent to ₹666 / month (Save ₹3,989/year)',
      'Unlimited Multi-Floor Blueprints',
      'Priority 4K Cloud Raytrace Queuing',
      'Full Commercial Client License',
      'Dedicated Email & Technical Support',
    ],
    highlight: true,
  },
  enterprise_monthly: {
    id: 'enterprise_monthly',
    name: 'Studio Enterprise',
    tier: 'ENTERPRISE',
    priceINR: 2499,
    period: 'month',
    description: 'For design studios, real estate developers, and architectural firms.',
    features: [
      'Everything in Pro Annual',
      'Multi-User Designer Collaboration & Permissions',
      'White-Label Client Presentation Portal',
      'Direct API Access & Webhooks for CRM Integration',
      'Custom 3D Model Catalog Hosting',
    ],
  },
  enterprise_yearly: {
    id: 'enterprise_yearly',
    name: 'Studio Enterprise (Annual)',
    badge: 'Save ₹9,989',
    tier: 'ENTERPRISE',
    priceINR: 19999,
    period: 'year',
    description: 'Full studio capability with dedicated enterprise support.',
    features: [
      'Everything in Studio Enterprise',
      'Dedicated Account Manager & 99.9% SLA',
      'Custom Branding & Domain Mapping',
    ],
  },
};

/**
 * Checks if a specific feature is accessible based on the user's active plan tier.
 */
export function canAccessFeature(user: User | null, feature: FeatureKey): boolean {
  // If user role is ADMIN, always allow all features
  if (user && user.role === 'ADMIN') {
    return true;
  }

  const tier = getUserSubscriptionTier(user);

  switch (feature) {
    case 'multi_floor':
    case 'render_4k':
    case 'custom_obj_upload':
    case 'export_bom_csv':
    case 'commercial_license':
    case 'pbr_materials_unlimited':
      return tier === 'PRO' || tier === 'ENTERPRISE';
    case 'unlimited_projects':
      return tier === 'PRO' || tier === 'ENTERPRISE';
    default:
      return true;
  }
}

/**
 * Resolves the effective subscription tier for the user.
 */
export function getUserSubscriptionTier(user: User | null): 'FREE' | 'PRO' | 'ENTERPRISE' {
  if (!user) return 'FREE';
  if (user.role === 'ADMIN') return 'PRO';

  if (user.subscriptionTier && user.subscriptionStatus === 'active') {
    // Check expiration if present
    if (user.subscriptionExpiresAt) {
      const expires = new Date(user.subscriptionExpiresAt).getTime();
      if (Date.now() > expires) {
        return 'FREE';
      }
    }
    return user.subscriptionTier;
  }

  // Check localStorage for verified subscription token
  if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('sweethome_sub_token');
      if (token) {
        const parts = token.split('.');
        if (parts.length === 2) {
          const payload = JSON.parse(atob(parts[0]));
          if (payload.tier && (!payload.expiresAt || Date.now() < payload.expiresAt)) {
            return payload.tier;
          }
        }
      }
    } catch (e) {
      // Ignored
    }
  }

  return 'FREE';
}

/**
 * Creates a client-side representation of verified subscription
 */
export function saveSubscriptionLocally(
  user: User,
  tier: 'PRO' | 'ENTERPRISE',
  paymentId: string,
  token: string,
  orderId?: string
): User {
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  const updated: User = {
    ...user,
    subscriptionTier: tier,
    subscriptionStatus: 'active',
    subscriptionExpiresAt: expiresAt,
    razorpayPaymentId: paymentId,
    razorpayOrderId: orderId,
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
