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

/**
 * Initiates the Cashfree payment flow (UPI, Cards, NetBanking, Wallets).
 */
export async function initiateCashfreeCheckout({
  planId,
  user,
  onSuccess,
  onError,
  onDismiss,
}: {
  planId: PlanId;
  user: User | null;
  onSuccess: (result: CashfreeCheckoutResult) => void;
  onError: (errorMessage: string) => void;
  onDismiss?: () => void;
}): Promise<void> {
  try {
    // 1. Request secure order & payment session creation from backend
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

    // 2. Handle Simulation Mode (for sandbox testing before live keys are configured)
    if (orderData.isTestMode) {
      const verifyRes = await fetch('/api/cashfree/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderData.orderId,
          planId,
          userId: user?.id,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        onSuccess(verifyData);
        return;
      } else {
        throw new Error(verifyData.error || 'Cashfree sandbox verification failed');
      }
    }

    // 3. Live Cashfree Modal Flow via JS SDK v3
    const scriptLoaded = await loadCashfreeScript();
    if (!scriptLoaded || typeof window.Cashfree !== 'function') {
      throw new Error('Could not load Cashfree payment SDK. Please verify your network connection.');
    }

    const cashfree = window.Cashfree({
      mode: orderData.environment === 'PRODUCTION' ? 'production' : 'sandbox',
    });

    cashfree
      .checkout({
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: '_modal',
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
                orderId: orderData.orderId,
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
        console.error('Cashfree checkout modal error:', err);
        onError(err.message || 'Error opening Cashfree payment gateway.');
      });
  } catch (err: any) {
    console.error('Cashfree checkout error:', err);
    onError(err.message || 'Cashfree payment initiation failed.');
  }
}
