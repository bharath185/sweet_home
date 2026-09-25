import { User } from '../types/plan';
import { PlanId } from './subscriptionService';

declare global {
  interface Window {
    Cashfree?: (config: { mode: 'sandbox' | 'production' }) => any;
  }
}

export interface CashfreeCheckoutResult {
  success: boolean;
  tier: 'TRIAL' | 'PRO' | 'ENTERPRISE';
  planId: string;
  durationDays?: number;
  paymentId: string;
  orderId: string;
  gateway: 'cashfree';
  subscriptionToken: string;
  message?: string;
}

/**
 * Dynamically loads the official Cashfree JS SDK v3 from Cashfree CDN.
 */
export function loadCashfreeScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Cashfree) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Cashfree JS SDK from CDN');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export interface CreateCashfreeOrderResult {
  success: boolean;
  orderId: string;
  cfOrderId?: string;
  paymentSessionId: string;
  amount: number;
  currency: string;
  planName: string;
  tier: 'TRIAL' | 'PRO';
  durationDays: number;
  environment: string;
}

/**
 * Creates a Cashfree payment order on the server and returns the session details.
 */
export async function createCashfreeOrder(
  planId: PlanId,
  user: User | null
): Promise<CreateCashfreeOrderResult> {
  const orderRes = await fetch('/api/cashfree/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      planId,
      userId: user?.id,
      userEmail: user?.email,
      userName: user?.name,
    }),
  });

  const orderData = await orderRes.json();
  if (!orderRes.ok || !orderData.success) {
    throw new Error(orderData.error || 'Failed to create Cashfree payment order on server');
  }

  if (!orderData.paymentSessionId) {
    throw new Error('Cashfree did not return a valid payment session ID. Please verify your credentials.');
  }

  return orderData;
}

/**
 * Mounts the Cashfree checkout into a custom DOM container or modal.
 */
export async function mountCashfreeCheckout({
  paymentSessionId,
  orderId,
  planId,
  user,
  redirectTarget = '_modal',
  environment = 'SANDBOX',
  onSuccess,
  onError,
  onDismiss,
}: {
  paymentSessionId: string;
  orderId: string;
  planId: PlanId;
  user: User | null;
  redirectTarget?: any;
  environment?: string;
  onSuccess: (result: CashfreeCheckoutResult) => void;
  onError: (errorMessage: string) => void;
  onDismiss?: () => void;
}): Promise<void> {
  const scriptLoaded = await loadCashfreeScript();
  if (!scriptLoaded || typeof window.Cashfree !== 'function') {
    throw new Error('Could not load Cashfree payment SDK. Please verify your network connection.');
  }

  const cashfree = window.Cashfree({
    mode: environment === 'PRODUCTION' ? 'production' : 'sandbox',
  });

  return cashfree
    .checkout({
      paymentSessionId,
      redirectTarget,
    })
    .then(async (result: any) => {
      if (result.error) {
        onError(result.error.message || 'Cashfree payment was cancelled or failed.');
        if (onDismiss) onDismiss();
        return;
      }

      if (result.paymentDetails) {
        // Cryptographic verification on backend
        try {
          const verifyRes = await fetch('/api/cashfree/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              planId,
              userId: user?.id,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            onSuccess(verifyData);
          } else {
            onError(verifyData.error || 'Cashfree payment verification failed on server.');
          }
        } catch (verErr: any) {
          onError(verErr.message || 'Error occurred while verifying Cashfree payment.');
        }
      } else {
        if (onDismiss) onDismiss();
      }
    })
    .catch((err: any) => {
      console.error('Cashfree checkout error:', err);
      onError(err.message || 'Error opening Cashfree payment gateway.');
    });
}

/**
 * Initiates the Cashfree payment flow (convenience wrapper).
 */
export async function initiateCashfreeCheckout({
  planId,
  user,
  redirectTarget = '_modal',
  onSuccess,
  onError,
  onDismiss,
}: {
  planId: PlanId;
  user: User | null;
  redirectTarget?: any;
  onSuccess: (result: CashfreeCheckoutResult) => void;
  onError: (errorMessage: string) => void;
  onDismiss?: () => void;
}): Promise<void> {
  try {
    const orderData = await createCashfreeOrder(planId, user);
    await mountCashfreeCheckout({
      paymentSessionId: orderData.paymentSessionId,
      orderId: orderData.orderId,
      planId,
      user,
      redirectTarget,
      environment: orderData.environment,
      onSuccess,
      onError,
      onDismiss,
    });
  } catch (err: any) {
    console.error('Cashfree checkout error:', err);
    onError(err.message || 'Cashfree payment initiation failed.');
  }
}
