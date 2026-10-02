import { NextRequest, NextResponse } from 'next/server';
import {
  getUserPaymentStatus,
  isSubscriptionActive,
  verifySubscriptionToken,
  UserPaymentRecord,
} from './paymentStore';

export interface AuthGuardResult {
  allowed: boolean;
  user?: UserPaymentRecord | null;
  status: number; // 200, 402, 403, 401
  reason?: string;
  errorResponse?: {
    error: string;
    code: string;
    payment_status: string;
    requiresPayment: boolean;
    expiresAt?: string | null;
  };
}

/**
 * Checks whether the incoming request has valid paid access or admin bypass.
 * Inspects:
 *  - Authorization header (Bearer <token>)
 *  - x-user-id / x-user-email headers
 *  - x-user-role header (ADMIN)
 *  - sweethome_sub_token / sweethome_user cookie
 */
export function checkUserAccess(req: NextRequest): AuthGuardResult {
  const secretKey = process.env.CASHFREE_SECRET_KEY || 'sweethome-prod-sub-crypto-secret-key-2026';
  const subSecret = process.env.SUBSCRIPTION_JWT_SECRET || secretKey;

  // 1. Check Admin Role Headers
  const roleHeader = (req.headers.get('x-user-role') || req.headers.get('x-role') || '').toUpperCase();
  if (roleHeader === 'ADMIN') {
    return { allowed: true, status: 200 };
  }

  // 2. Check Auth Header for Bearer Token
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const payload = verifySubscriptionToken(token, subSecret);
      if (payload) {
        if (payload.role === 'ADMIN' || payload.tier === 'ADMIN') {
          return { allowed: true, status: 200 };
        }
        if (payload.expiresAt && Date.now() < payload.expiresAt) {
          return { allowed: true, status: 200 };
        }
      }
    }
  }

  // 3. Check Cookie Token
  const cookieToken = req.cookies.get('sweethome_sub_token')?.value;
  if (cookieToken) {
    const payload = verifySubscriptionToken(cookieToken, subSecret);
    if (payload && (!payload.expiresAt || Date.now() < payload.expiresAt)) {
      return { allowed: true, status: 200 };
    }
  }

  // 4. Check User ID & Email from headers or query
  const userId = req.headers.get('x-user-id') || req.nextUrl.searchParams.get('userId');
  const userEmail = req.headers.get('x-user-email') || req.nextUrl.searchParams.get('userEmail');

  if (userId || userEmail) {
    const userRecord = getUserPaymentStatus({ userId, email: userEmail });
    if (userRecord) {
      if (userRecord.role === 'ADMIN') {
        return { allowed: true, user: userRecord, status: 200 };
      }
      if (isSubscriptionActive(userRecord)) {
        return { allowed: true, user: userRecord, status: 200 };
      }

      // User exists but is unpaid or expired
      const isExpired = userRecord.payment_status === 'expired' ||
        (userRecord.expires_at && Date.now() >= new Date(userRecord.expires_at).getTime());

      const statusName = isExpired ? 'expired' : userRecord.payment_status || 'unpaid';

      return {
        allowed: false,
        user: userRecord,
        status: 402, // HTTP 402 Payment Required
        reason: isExpired
          ? 'Subscription expired. Please renew your pass to continue using SweetHome 3D Studio.'
          : 'Payment required. An active trial or pro pass is required to access this feature.',
        errorResponse: {
          error: isExpired
            ? 'Your SweetHome pass has expired. Please renew your subscription to access studio features.'
            : 'Payment required: An active pass is required to access this feature.',
          code: isExpired ? 'SUBSCRIPTION_EXPIRED' : 'PAYMENT_REQUIRED',
          payment_status: statusName,
          requiresPayment: true,
          expiresAt: userRecord.expires_at,
        },
      };
    }
  }

  // If no user context provided or user not found and not admin
  return {
    allowed: false,
    status: 402,
    reason: 'Active paid subscription required.',
    errorResponse: {
      error: 'Access restricted: Please log in with an active paid account or subscribe to unlock studio features.',
      code: 'PAYMENT_REQUIRED',
      payment_status: 'unpaid',
      requiresPayment: true,
    },
  };
}

/**
 * Middleware/Route helper: returns NextResponse error if access denied, or null if allowed.
 */
export function requirePaidAccess(req: NextRequest): NextResponse | null {
  const check = checkUserAccess(req);
  if (!check.allowed) {
    return NextResponse.json(check.errorResponse, { status: check.status });
  }
  return null;
}
