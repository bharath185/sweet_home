import crypto from 'crypto';

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'expired';

export interface UserPaymentRecord {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'DESIGNER' | 'CLIENT';
  payment_status: PaymentStatus;
  plan?: string | null;
  paid_at?: string | null;
  expires_at?: string | null;
  cashfree_order_id?: string | null;
  cashfree_payment_id?: string | null;
  trial_started_at?: string | null;
  trial_expires_at?: string | null;
  is_free_trial?: boolean;
  has_completed_trial?: boolean;
  updated_at?: string;
}

export interface PaymentTransactionRecord {
  id: string;
  orderId: string;
  paymentId?: string;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  planId: 'trial_2days' | 'monthly' | 'yearly' | string;
  planName: string;
  amount: number; // in INR
  gateway: 'cashfree';
  status: 'PAID' | 'REFUNDED' | 'FAILED' | 'PENDING' | 'USER_DROPPED';
  paymentMethod: string;
  createdAt: string;
  expiresAt?: string;
  rawEvent?: any;
}

export interface PendingOrder {
  orderId: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  planId: string;
  amount: number;
  createdAt: number;
}

// Global In-Memory Stores (survives warm lambdas / server lifecycle)
// Keyed by userId and email for fast O(1) resolution
const usersMap = new Map<string, UserPaymentRecord>();
const pendingOrdersMap = new Map<string, PendingOrder>();
const processedWebhookEventIds = new Set<string>();

// Pre-seed Admin Users who always have Lifetime Paid/Bypass access
const ADMIN_USERS: UserPaymentRecord[] = [
  {
    id: 'u1',
    email: 'admin@sweethome3d.io',
    name: 'Admin Superuser',
    role: 'ADMIN',
    payment_status: 'paid',
    plan: 'yearly',
    paid_at: '2026-01-01T00:00:00.000Z',
    expires_at: '2099-12-31T23:59:59.999Z',
    cashfree_order_id: 'cf_admin_bypass',
    cashfree_payment_id: 'cf_pay_admin_bypass',
  },
  {
    id: 'admin_visual',
    email: 'admin@visualrendered.io',
    name: 'Admin Superuser',
    role: 'ADMIN',
    payment_status: 'paid',
    plan: 'yearly',
    paid_at: '2026-01-01T00:00:00.000Z',
    expires_at: '2099-12-31T23:59:59.999Z',
    cashfree_order_id: 'cf_admin_bypass_2',
    cashfree_payment_id: 'cf_pay_admin_bypass_2',
  },
];

// Initialize admin records
for (const admin of ADMIN_USERS) {
  usersMap.set(admin.id.toLowerCase(), { ...admin });
  usersMap.set(admin.email.toLowerCase(), { ...admin });
}

// Transaction Ledger (initialized empty so only REAL live payments appear)
const transactions: PaymentTransactionRecord[] = [];

/**
 * Purges all non-admin test users from memory, retaining only Admin Superusers
 */
export function purgeNonAdminUsers(): { purgedCount: number; adminsRetained: number } {
  let purgedCount = 0;
  for (const [key, user] of usersMap.entries()) {
    if (user.role !== 'ADMIN') {
      usersMap.delete(key);
      purgedCount++;
    }
  }
  // Re-ensure admin users are loaded
  for (const admin of ADMIN_USERS) {
    usersMap.set(admin.id.toLowerCase(), { ...admin });
    usersMap.set(admin.email.toLowerCase(), { ...admin });
  }
  return { purgedCount, adminsRetained: ADMIN_USERS.length };
}

/**
 * Normalizes lookup key (trimmed lowercase)
 */
function normalizeKey(val?: string | null): string {
  return (val || '').trim().toLowerCase();
}

/**
 * Checks if a user's subscription or 48-hour free trial is currently active (not expired)
 */
export function isSubscriptionActive(record: UserPaymentRecord | null | undefined): boolean {
  if (!record) return false;
  if (record.role === 'ADMIN') return true;

  // 1. Genuine Paid Plan (Paid customer)
  if (record.payment_status === 'paid' && !record.is_free_trial) {
    if (!record.expires_at) return true; // Lifetime or permanent paid
    const expTime = new Date(record.expires_at).getTime();
    return !isNaN(expTime) && Date.now() < expTime;
  }

  // 2. 48-Hour Free Trial (Active window check)
  if (record.is_free_trial || record.trial_expires_at) {
    const trialExp = record.trial_expires_at ? new Date(record.trial_expires_at).getTime() : 0;
    if (trialExp > 0 && Date.now() < trialExp) {
      return true; // Trial active: studio unlocked!
    }
    // 48 hours is complete -> blocked!
    return false;
  }

  return false;
}

/**
 * Computes effective payment status taking 48-hour trial and expiration into account
 */
export function getEffectivePaymentStatus(record: UserPaymentRecord | null | undefined): PaymentStatus {
  if (!record) return 'unpaid';
  if (record.role === 'ADMIN') return 'paid';

  // Check 48-Hour Free Trial
  if (record.is_free_trial || record.trial_expires_at) {
    const trialExp = record.trial_expires_at ? new Date(record.trial_expires_at).getTime() : 0;
    if (trialExp > 0) {
      if (Date.now() < trialExp) {
        return 'paid'; // Free trial active
      } else {
        record.has_completed_trial = true;
        record.is_free_trial = false;
        record.payment_status = 'expired';
        return 'expired'; // Completed 48 hours -> blocked!
      }
    }
  }

  if (record.payment_status === 'paid') {
    if (record.expires_at) {
      const expTime = new Date(record.expires_at).getTime();
      if (!isNaN(expTime) && Date.now() >= expTime) {
        return 'expired';
      }
    }
    return 'paid';
  }
  return record.payment_status || 'unpaid';
}

/**
 * Grants or retrieves a 48-hour free trial for a user upon login
 */
export function startOrGet48HourFreeTrial(params: {
  userId?: string | null;
  email?: string | null;
  name?: string;
  role?: 'ADMIN' | 'DESIGNER' | 'CLIENT';
}): UserPaymentRecord {
  const existing = getUserPaymentStatus({ userId: params.userId, email: params.email });
  if (existing) {
    // If user already consumed their 48 hours: blocked!
    if (existing.has_completed_trial) {
      existing.payment_status = 'expired';
      return existing;
    }
    if (existing.trial_expires_at) {
      const exp = new Date(existing.trial_expires_at).getTime();
      if (Date.now() >= exp) {
        existing.has_completed_trial = true;
        existing.is_free_trial = false;
        existing.payment_status = 'expired';
        return existing;
      }
      return existing; // Still inside active 48-hour trial window
    }
    // If user already paid for a real pass
    if (existing.payment_status === 'paid' && !existing.is_free_trial) {
      return existing;
    }
  }

  // First-time login: grant 48-hour free trial!
  const trialDurationMs = 48 * 60 * 60 * 1000;
  const now = new Date();
  const trialStartedAt = now.toISOString();
  const trialExpiresAt = new Date(now.getTime() + trialDurationMs).toISOString();

  return setUserPaymentStatus({
    userId: params.userId,
    email: params.email,
    name: params.name,
    role: params.role,
    payment_status: 'paid',
    plan: 'trial_48h',
    trial_started_at: trialStartedAt,
    trial_expires_at: trialExpiresAt,
    expires_at: trialExpiresAt,
    is_free_trial: true,
  });
}

/**
 * Retrieves a user record by ID or Email
 */
export function getUserPaymentStatus(
  identifier?: { userId?: string | null; email?: string | null } | string
): UserPaymentRecord | null {
  if (!identifier) return null;

  let uId: string | undefined;
  let uEmail: string | undefined;

  if (typeof identifier === 'string') {
    if (identifier.includes('@')) {
      uEmail = identifier;
    } else {
      uId = identifier;
    }
  } else {
    uId = identifier.userId || undefined;
    uEmail = identifier.email || undefined;
  }

  if (uId && usersMap.has(normalizeKey(uId))) {
    const record = usersMap.get(normalizeKey(uId))!;
    const effective = getEffectivePaymentStatus(record);
    if (effective !== record.payment_status) {
      record.payment_status = effective;
    }
    return record;
  }

  if (uEmail && usersMap.has(normalizeKey(uEmail))) {
    const record = usersMap.get(normalizeKey(uEmail))!;
    const effective = getEffectivePaymentStatus(record);
    if (effective !== record.payment_status) {
      record.payment_status = effective;
    }
    return record;
  }

  return null;
}

/**
 * Upserts user payment status
 */
export function setUserPaymentStatus(update: {
  userId?: string | null;
  email?: string | null;
  name?: string;
  role?: 'ADMIN' | 'DESIGNER' | 'CLIENT';
  payment_status: PaymentStatus;
  plan?: string | null;
  paid_at?: string | null;
  expires_at?: string | null;
  cashfree_order_id?: string | null;
  cashfree_payment_id?: string | null;
  trial_started_at?: string | null;
  trial_expires_at?: string | null;
  is_free_trial?: boolean;
  has_completed_trial?: boolean;
}): UserPaymentRecord {
  const existing = getUserPaymentStatus({ userId: update.userId, email: update.email });
  const id = update.userId || existing?.id || `u_${Date.now()}`;
  const email = update.email || existing?.email || `${id}@user.local`;
  const role = update.role || existing?.role || (email.includes('admin') ? 'ADMIN' : 'DESIGNER');

  const record: UserPaymentRecord = {
    id,
    email,
    name: update.name || existing?.name || id,
    role,
    payment_status: update.payment_status,
    plan: update.plan !== undefined ? update.plan : (existing?.plan ?? null),
    paid_at: update.paid_at !== undefined ? update.paid_at : (existing?.paid_at ?? null),
    expires_at: update.expires_at !== undefined ? update.expires_at : (existing?.expires_at ?? null),
    cashfree_order_id: update.cashfree_order_id !== undefined ? update.cashfree_order_id : (existing?.cashfree_order_id ?? null),
    cashfree_payment_id: update.cashfree_payment_id !== undefined ? update.cashfree_payment_id : (existing?.cashfree_payment_id ?? null),
    trial_started_at: update.trial_started_at !== undefined ? update.trial_started_at : (existing?.trial_started_at ?? null),
    trial_expires_at: update.trial_expires_at !== undefined ? update.trial_expires_at : (existing?.trial_expires_at ?? null),
    is_free_trial: update.is_free_trial !== undefined ? update.is_free_trial : (existing?.is_free_trial ?? false),
    has_completed_trial: update.has_completed_trial !== undefined ? update.has_completed_trial : (existing?.has_completed_trial ?? false),
    updated_at: new Date().toISOString(),
  };

  usersMap.set(normalizeKey(id), record);
  usersMap.set(normalizeKey(email), record);

  return record;
}

/**
 * Stores pending order details so Cashfree webhook can reliably map order to user even if user closes browser
 */
export function recordPendingOrder(orderId: string, data: Omit<PendingOrder, 'orderId' | 'createdAt'>): void {
  pendingOrdersMap.set(orderId, {
    orderId,
    ...data,
    createdAt: Date.now(),
  });
}

/**
 * Gets pending order details by orderId
 */
export function getPendingOrder(orderId: string): PendingOrder | null {
  return pendingOrdersMap.get(orderId) || null;
}

/**
 * Records a transaction to the immutable ledger
 */
export function recordTransaction(tx: PaymentTransactionRecord): void {
  const existingIdx = transactions.findIndex((t) => t.orderId === tx.orderId);
  if (existingIdx >= 0) {
    transactions[existingIdx] = { ...transactions[existingIdx], ...tx };
  } else {
    transactions.unshift(tx);
  }
}

/**
 * Returns all transactions for the admin dashboard or audit log
 */
export function getTransactions(): PaymentTransactionRecord[] {
  return [...transactions];
}

/**
 * Idempotency check for Cashfree webhook events
 */
export function isWebhookProcessed(eventId: string): boolean {
  return processedWebhookEventIds.has(eventId);
}

/**
 * Marks webhook event as processed
 */
export function markWebhookProcessed(eventId: string): void {
  processedWebhookEventIds.add(eventId);
}

/**
 * Verifies Cashfree Webhook HMAC-SHA256 signature
 * Computes HMAC-SHA256 of `${timestamp}${rawBody}` using secret key and compares to x-webhook-signature
 */
export function verifyCashfreeWebhookSignature(
  rawBody: string,
  timestamp: string | null,
  signature: string | null,
  secretKey: string
): boolean {
  if (!signature || !timestamp || !secretKey) {
    return false;
  }

  try {
    const payload = `${timestamp}${rawBody}`;
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(payload);
    const expectedBase64 = hmac.digest('base64');

    const hmacHex = crypto.createHmac('sha256', secretKey);
    hmacHex.update(payload);
    const expectedHex = hmacHex.digest('hex');

    const sigBuffer = Buffer.from(signature);
    const base64Buffer = Buffer.from(expectedBase64);
    const hexBuffer = Buffer.from(expectedHex);

    if (sigBuffer.length === base64Buffer.length && crypto.timingSafeEqual(sigBuffer, base64Buffer)) {
      return true;
    }

    if (sigBuffer.length === hexBuffer.length && crypto.timingSafeEqual(sigBuffer, hexBuffer)) {
      return true;
    }

    return false;
  } catch (err) {
    console.error('Error verifying Cashfree webhook signature:', err);
    return false;
  }
}

/**
 * Generates a cryptographically signed subscription JWT token
 */
export function generateSubscriptionToken(payload: object, secret: string): string {
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');
  return `${payloadStr}.${signature}`;
}

/**
 * Validates cryptographically signed subscription JWT token
 */
export function verifySubscriptionToken(token: string, secret: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadStr, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadStr, 'base64').toString('utf8'));
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}
