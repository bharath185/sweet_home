import { User } from '../types/plan';
import { PlanId } from './subscriptionService';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface CheckoutResult {
  success: boolean;
  tier: 'TRIAL' | 'PRO' | 'ENTERPRISE';
  planId: string;
  durationDays?: number;
  paymentId: string;
  orderId: string;
  subscriptionToken: string;
  message?: string;
}

/**
 * Loads the official Razorpay Checkout v1 script dynamically.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay checkout script from CDN');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Initiates Razorpay checkout flow with end-to-end security verification.
 */
export async function initiateSubscriptionCheckout({
  planId,
  user,
  onSuccess,
  onError,
  onDismiss,
}: {
  planId: PlanId;
  user: User | null;
  onSuccess: (result: CheckoutResult) => void;
  onError: (errorMessage: string) => void;
  onDismiss?: () => void;
}): Promise<void> {
  try {
    // 1. Request secure order creation from our backend
    const orderRes = await fetch('/api/razorpay/create-order', {
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
      throw new Error(orderData.error || 'Failed to initiate order on server');
    }

    if (!orderData.keyId) {
      throw new Error('Razorpay Key ID is not configured. Please add NEXT_PUBLIC_RAZORPAY_KEY_ID in Vercel.');
    }

    // 2. Official Razorpay Modal Flow via Checkout v1
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Could not load Razorpay payment gateway. Please check your internet connection.');
    }

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'SweetHome 3D Studio',
      description: `${orderData.planName} Plan Activation`,
      order_id: orderData.orderId,
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
      },
      theme: {
        color: '#2563EB', // Blue-600
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        try {
          // Cryptographic verification on server
          const verifyRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              planId,
              userId: user?.id,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            onSuccess(verifyData);
          } else {
            onError(verifyData.error || 'Payment verification failed on server.');
          }
        } catch (verErr: any) {
          onError(verErr.message || 'Error occurred while verifying payment.');
        }
      },
      modal: {
        ondismiss: () => {
          if (onDismiss) onDismiss();
        },
      },
    };

    const rzpInstance = new window.Razorpay(options);
    rzpInstance.on('payment.failed', (failResponse: any) => {
      onError(failResponse.error?.description || 'Payment was declined or failed.');
    });
    rzpInstance.open();
  } catch (err: any) {
    console.error('Checkout error:', err);
    onError(err.message || 'Payment initiation failed.');
  }
}
