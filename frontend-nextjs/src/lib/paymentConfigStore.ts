import fs from 'fs';
import path from 'path';

export interface PlanConfigItem {
  id: 'trial_2days' | 'monthly' | 'yearly' | string;
  name: string;
  badge?: string;
  tier: 'TRIAL' | 'PRO';
  priceINR: number; // in INR Rupees
  durationDays: number;
  periodLabel: string;
  description: string;
  features: string[];
  highlight?: boolean;
}

export interface PaymentGatewayConfig {
  activeGateway: 'cashfree' | 'razorpay';
  environment: 'PRODUCTION' | 'SANDBOX';
  cashfreeAppId: string;
  cashfreeSecretKey: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
}

export interface FullPaymentSystemConfig {
  gateway: PaymentGatewayConfig;
  plans: Record<string, PlanConfigItem>;
  updatedAt: string;
}

const CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'payment_config.json');
const TMP_CONFIG_FILE_PATH = path.join('/tmp', 'payment_config.json');

// Default initial configuration
const DEFAULT_PLANS: Record<string, PlanConfigItem> = {
  trial_2days: {
    id: 'trial_2days',
    name: '2-Day Full Access Trial',
    badge: 'Quick Test',
    tier: 'TRIAL',
    priceINR: 2,
    durationDays: 2,
    periodLabel: 'for 2 days (48 Hours)',
    description: 'Complete unrestricted access to all studio tools, multi-floor drafting, and raytracing for 48 hours.',
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
    description: 'Best value for design practices. 365 days of full unlimited studio access with an automatic discount.',
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
};

// In-memory cache
let cachedConfig: FullPaymentSystemConfig | null = null;

function loadConfigFromDisk(): FullPaymentSystemConfig {
  // Check /tmp first for latest dynamic settings saved on serverless
  try {
    if (fs.existsSync(TMP_CONFIG_FILE_PATH)) {
      const raw = fs.readFileSync(TMP_CONFIG_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.gateway && parsed.plans) {
        return parsed;
      }
    }
  } catch (err) {
    // ignore
  }

  // Then check persistent repository config file
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const raw = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.gateway && parsed.plans) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[PaymentConfigStore] Error reading config file, falling back to defaults:', err);
  }

  // Initial default populated with environment variables if present
  const defaultGateway: PaymentGatewayConfig = {
    activeGateway: (process.env.NEXT_PUBLIC_PAYMENT_GATEWAY as any) || 'cashfree',
    environment: ((process.env.CASHFREE_ENVIRONMENT || 'PRODUCTION').toUpperCase() as any) === 'SANDBOX' ? 'SANDBOX' : 'PRODUCTION',
    cashfreeAppId: process.env.CASHFREE_APP_ID || process.env.NEXT_PUBLIC_CASHFREE_APP_ID || '',
    cashfreeSecretKey: process.env.CASHFREE_SECRET_KEY || '',
    razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  };

  const initialConfig: FullPaymentSystemConfig = {
    gateway: defaultGateway,
    plans: { ...DEFAULT_PLANS },
    updatedAt: new Date().toISOString(),
  };

  saveConfigToDisk(initialConfig);
  return initialConfig;
}

function saveConfigToDisk(config: FullPaymentSystemConfig) {
  // Attempt to write to CONFIG_FILE_PATH
  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    // Expected on read-only environments like Vercel lambdas
  }

  // Always attempt to write to /tmp on serverless environments
  try {
    const tmpDir = path.dirname(TMP_CONFIG_FILE_PATH);
    if (fs.existsSync(tmpDir)) {
      fs.writeFileSync(TMP_CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
    }
  } catch (err) {
    // ignore
  }
}

/**
 * Returns the full payment configuration (gateway keys + plans pricing)
 */
export function getPaymentSystemConfig(): FullPaymentSystemConfig {
  // Always load from disk to ensure real-time persistence across requests
  cachedConfig = loadConfigFromDisk();
  return cachedConfig;
}

/**
 * Loads configuration asynchronously from Supabase app_config table with disk fallback
 */
export async function getPaymentSystemConfigAsync(): Promise<FullPaymentSystemConfig> {
  try {
    const { getAppConfigFromDb } = await import('./supabaseDb');
    const dbConfig = await getAppConfigFromDb<FullPaymentSystemConfig>('payment_config');
    if (dbConfig && dbConfig.gateway && dbConfig.plans) {
      cachedConfig = dbConfig;
      saveConfigToDisk(dbConfig);
      return dbConfig;
    }
  } catch (err) {
    // fallback to disk or defaults
  }
  return getPaymentSystemConfig();
}

/**
 * Updates gateway keys and/or plan amounts
 */
export function updatePaymentSystemConfig(
  updates: Partial<{
    gateway: Partial<PaymentGatewayConfig>;
    plans: Record<string, Partial<PlanConfigItem>>;
  }>
): FullPaymentSystemConfig {
  const current = getPaymentSystemConfig();

  if (updates.gateway) {
    let cashfreeAppId = updates.gateway.cashfreeAppId?.trim();
    let cashfreeSecretKey = updates.gateway.cashfreeSecretKey?.trim();

    // Auto-correct if user accidentally swapped App ID and Secret Key
    // Cashfree Secret Keys start with "cfsk_ma_prod_" or "cfsk_ma_test_"
    if (cashfreeAppId && cashfreeAppId.startsWith('cfsk_') && cashfreeSecretKey && !cashfreeSecretKey.startsWith('cfsk_')) {
      const swappedAppId = cashfreeSecretKey;
      const swappedSecretKey = cashfreeAppId;
      cashfreeAppId = swappedAppId;
      cashfreeSecretKey = swappedSecretKey;
    }

    current.gateway = {
      ...current.gateway,
      ...updates.gateway,
      ...(cashfreeAppId !== undefined ? { cashfreeAppId } : {}),
      ...(cashfreeSecretKey !== undefined ? { cashfreeSecretKey } : {}),
    };
  }

  if (updates.plans) {
    for (const [planId, planUpdate] of Object.entries(updates.plans)) {
      if (current.plans[planId]) {
        current.plans[planId] = {
          ...current.plans[planId],
          ...planUpdate,
          id: planId,
        };
      } else {
        // New custom plan
        current.plans[planId] = {
          id: planId,
          name: planUpdate.name || planId,
          tier: planUpdate.tier || 'PRO',
          priceINR: planUpdate.priceINR ?? 999,
          durationDays: planUpdate.durationDays ?? 30,
          periodLabel: planUpdate.periodLabel || 'per month',
          description: planUpdate.description || 'Full studio access',
          features: planUpdate.features || ['Full studio access'],
          ...planUpdate,
        } as PlanConfigItem;
      }
    }
  }

  current.updatedAt = new Date().toISOString();
  cachedConfig = current;
  saveConfigToDisk(current);
  return current;
}

/**
 * Returns the effective live Cashfree credentials with auto-correct support
 */
export function getActiveCashfreeCredentials(): {
  appId: string;
  secretKey: string;
  environment: 'PRODUCTION' | 'SANDBOX';
  isConfigured: boolean;
} {
  const config = getPaymentSystemConfig();
  let appId =
    config.gateway.cashfreeAppId?.trim() ||
    process.env.CASHFREE_APP_ID?.trim() ||
    process.env.NEXT_PUBLIC_CASHFREE_APP_ID?.trim() ||
    '';
  let secretKey =
    config.gateway.cashfreeSecretKey?.trim() ||
    process.env.CASHFREE_SECRET_KEY?.trim() ||
    '';
  const environment = config.gateway.environment;

  // Auto-detect and fix swapped credentials
  // Cashfree secret key always has the prefix 'cfsk_'
  if (appId.startsWith('cfsk_') && !secretKey.startsWith('cfsk_')) {
    const temp = appId;
    appId = secretKey;
    secretKey = temp;
  }

  const isConfigured =
    Boolean(appId) &&
    Boolean(secretKey) &&
    !appId.includes('your_cashfree') &&
    !secretKey.includes('your_cashfree');

  return { appId, secretKey, environment, isConfigured };
}

/**
 * Returns the effective live Razorpay credentials
 */
export function getActiveRazorpayCredentials(): {
  keyId: string;
  keySecret: string;
  isConfigured: boolean;
} {
  const config = getPaymentSystemConfig();
  const keyId =
    config.gateway.razorpayKeyId?.trim() ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() ||
    process.env.RAZORPAY_KEY_ID?.trim() ||
    '';
  const keySecret =
    config.gateway.razorpayKeySecret?.trim() ||
    process.env.RAZORPAY_KEY_SECRET?.trim() ||
    '';

  const isConfigured =
    Boolean(keyId) &&
    Boolean(keySecret) &&
    !keyId.includes('YourRazorpay') &&
    !keySecret.includes('YourRazorpay');

  return { keyId, keySecret, isConfigured };
}

/**
 * Returns currently active payment gateway ('cashfree' or 'razorpay')
 */
export function getActivePaymentGateway(): 'cashfree' | 'razorpay' {
  const config = getPaymentSystemConfig();
  return config.gateway.activeGateway || 'cashfree';
}

/**
 * Returns single plan configuration by planId with fallback
 */
export function getPlanConfig(planId: string): PlanConfigItem | null {
  const config = getPaymentSystemConfig();
  // Support aliases
  const normalizedId = planId === 'pro_monthly' ? 'monthly' : planId === 'pro_yearly' ? 'yearly' : planId;
  return config.plans[normalizedId] || config.plans[planId] || null;
}

