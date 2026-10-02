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
  gateway: 'cashfree' | 'razorpay';
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

// Transaction Ledger (initialized with seed transactions for dashboard)
const transactions: PaymentTransactionRecord[] = [
  {
    id: 'tx_cf_101',
    orderId: 'cf_trial_m9023_8ab12',
    customerName: 'Karan Sharma',
    customerEmail: 'karan.sharma@designstudio.in',
    planId: 'trial_2days',
    planName: '2-Day Studio Trial Pass',
    amount: 200,
    gateway: 'cashfree',
    status: 'PAID',
    paymentMethod: 'UPI (Google Pay)',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 46 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tx_cf_102',
    orderId: 'cf_month_m8911_33ef1',
    customerName: 'Ananya Verma',
    customerEmail: 'ananya@vermaarchitects.com',
    planId: 'monthly',
    planName: 'Monthly Studio Pass',
    amount: 999,
    gateway: 'cashfree',
    status: 'PAID',
    paymentMethod: 'UPI (PhonePe)',
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 29 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tx_rzp_103',
    orderId: 'order_rzp_98412_a8bc',
    customerName: 'Vikramaditya Rao',
    customerEmail: 'v.rao@urbanspaces.in',
    planId: 'yearly',
    planName: 'Annual Studio Pass (20% Off)',
    amount: 9590,
    gateway: 'razorpay',
    status: 'PAID',
    paymentMethod: 'HDFC NetBanking',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 363 * 24 * 3600 * 1000).toISOString(),
  },
];

/**
 * Normalizes lookup key (trimmed lowercase)
 */
function normalizeKey(val?: string | null): string {
  return (val || '').trim().toLowerCase();
}

/**
 * Checks if a user's subscription is currently active (not expired)
 */
export function isSubscriptionActive(record: UserPaymentRecord | null | undefined): boolean {
  if (!record) return false;
  if (record.role === 'ADMIN') return true;
  if (record.payment_status !== 'paid') return false;
  if (!record.expires_at) return true; // Lifetime or permanent paid
  const expTime = new Date(record.expires_at).getTime();
  return !isNaN(expTime) && Date.now() < expTime;
}

/**
 * Computes effective payment status taking expiration into account
 */
export function getEffectivePaymentStatus(record: UserPaymentRecord | null | undefined): PaymentStatus {
  if (!record) return 'unpaid';
  if (record.role === 'ADMIN') return 'paid';
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
